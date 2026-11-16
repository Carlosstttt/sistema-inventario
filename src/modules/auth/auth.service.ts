import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../users/entities/user.entity';
import { Persona } from '../persona/entities/persona.entity';
import { MailService } from './mail.service';

interface RegistroIntento {
  intentos: number;
  bloqueadoHasta: number | null;
}

interface CodigoRecuperacion {
  codigo: string;
  expiraEn: number;
}

@Injectable()
export class AuthService {
  private intentosLogin = new Map<string, RegistroIntento>();
  private codigosRecuperacion = new Map<string, CodigoRecuperacion>();

  private readonly MAX_INTENTOS = 3;
  private readonly TIEMPO_BLOQUEO_MS = 2 * 60 * 1000; // 2 minutos
  private readonly EXPIRACION_CODIGO_MS = 15 * 60 * 1000; // 15 minutos

  constructor(
    private jwtService: JwtService,
    private mailService: MailService,
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,
    @Inject('PERSONA_REPOSITORY')
    private readonly personaRepository: Repository<Persona>,
  ) {}

  async register(registerDto: RegisterAuthDto) {
    const emailNormalizado = registerDto.email.trim().toLowerCase();
    const cedulaLimpia = registerDto.identificacion.trim();

    const existeEmail = await this.userRepository.findOne({
      where: { email: emailNormalizado },
    });
    if (existeEmail) {
      throw new BadRequestException('El correo electrónico ya está registrado.');
    }

    const existeCedula = await this.personaRepository.findOne({
      where: { identificacion: cedulaLimpia },
    });
    if (existeCedula) {
      throw new BadRequestException('El número de cédula ya está registrado.');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const nuevoUsuario = this.userRepository.create({
      nombre: `${registerDto.nombres.trim()} ${registerDto.apellidos.trim()}`,
      email: emailNormalizado,
      password: hashedPassword,
      telefono: registerDto.telefono || undefined,
    });
    const usuarioGuardado = await this.userRepository.save(nuevoUsuario);

    const nuevaPersona = this.personaRepository.create({
      nombres: registerDto.nombres.trim(),
      apellidos: registerDto.apellidos.trim(),
      identificacion: cedulaLimpia,
      telefono: registerDto.telefono || undefined,
      user: usuarioGuardado,
    });
    await this.personaRepository.save(nuevaPersona);

    // Enviar correo de bienvenida
    await this.mailService.enviarCorreoBienvenida(
      usuarioGuardado.email,
      usuarioGuardado.nombre,
    );

    return {
      mensaje: 'Usuario registrado correctamente. Revisa tu correo electrónico.',
      usuario: {
        id: usuarioGuardado.id,
        nombre: usuarioGuardado.nombre,
        email: usuarioGuardado.email,
        identificacion: cedulaLimpia,
      },
    };
  }

  async login(credenciales: LoginAuthDto) {
    const identificador = credenciales.identificador.trim().toLowerCase();
    const ahora = Date.now();

    const registro = this.intentosLogin.get(identificador);
    if (registro?.bloqueadoHasta && ahora < registro.bloqueadoHasta) {
      const segundosRestantes = Math.ceil((registro.bloqueadoHasta - ahora) / 1000);
      throw new HttpException(
        {
          message: `Demasiados intentos fallidos. Reintenta en ${segundosRestantes} segundos.`,
          segundosRestantes,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (registro?.bloqueadoHasta && ahora >= registro.bloqueadoHasta) {
      this.intentosLogin.delete(identificador);
    }

    const usuario = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.persona', 'persona')
      .addSelect('user.password')
      .where('LOWER(user.email) = :identificador', { identificador })
      .orWhere('persona.identificacion = :identificador', { identificador })
      .getOne();

    const passwordValida =
      usuario && (await bcrypt.compare(credenciales.password, usuario.password));

    if (!usuario || !passwordValida) {
      this.registrarFallo(identificador);
      const estadoActual = this.intentosLogin.get(identificador)!;

      if (estadoActual.bloqueadoHasta) {
        const segundosRestantes = Math.ceil((estadoActual.bloqueadoHasta - Date.now()) / 1000);
        throw new HttpException(
          {
            message: `Has superado el límite de ${this.MAX_INTENTOS} intentos. Cuenta bloqueada temporalmente.`,
            segundosRestantes,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      const restantes = this.MAX_INTENTOS - estadoActual.intentos;
      throw new UnauthorizedException(
        `Credenciales incorrectas. Te quedan ${restantes} ${restantes === 1 ? 'intento' : 'intentos'}.`,
      );
    }

    if (!usuario.isActive) {
      throw new UnauthorizedException('Tu usuario está inactivo. Contacta al administrador.');
    }

    this.intentosLogin.delete(identificador);

    const payload = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
    };

    const token = this.jwtService.sign(payload);
    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        identificacion: usuario.persona?.identificacion || null,
        rol: usuario.rol,
      },
    };
  }

  async solicitarRecuperacion(dto: ForgotPasswordDto) {
    const emailNormalizado = dto.email.trim().toLowerCase();
    const usuario = await this.userRepository.findOne({
      where: { email: emailNormalizado },
    });

    if (!usuario) {
      throw new NotFoundException('No existe ninguna cuenta asociada a ese correo electrónico.');
    }

    // Generar código aleatorio de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    this.codigosRecuperacion.set(emailNormalizado, {
      codigo,
      expiraEn: Date.now() + this.EXPIRACION_CODIGO_MS,
    });

    await this.mailService.enviarCodigoRecuperacion(
      usuario.email,
      usuario.nombre,
      codigo,
    );

    return {
      mensaje: 'Te hemos enviado un código de verificación a tu correo electrónico.',
    };
  }

  async restablecerPassword(dto: ResetPasswordDto) {
    const emailNormalizado = dto.email.trim().toLowerCase();
    const registroCodigo = this.codigosRecuperacion.get(emailNormalizado);

    if (!registroCodigo) {
      throw new BadRequestException('No has solicitado un código de recuperación o ya fue usado.');
    }

    if (Date.now() > registroCodigo.expiraEn) {
      this.codigosRecuperacion.delete(emailNormalizado);
      throw new BadRequestException('El código ha expirado. Solicita uno nuevo.');
    }

    if (registroCodigo.codigo !== dto.codigo.trim()) {
      throw new BadRequestException('El código de verificación es incorrecto.');
    }

    const usuario = await this.userRepository.findOne({
      where: { email: emailNormalizado },
      relations: {'persona': true},
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    usuario.password = await bcrypt.hash(dto.nuevaPassword, 10);
    await this.userRepository.save(usuario);

    // Limpiar código usado y cualquier bloqueo previo por intentos fallidos
    this.codigosRecuperacion.delete(emailNormalizado);
    this.intentosLogin.delete(emailNormalizado);
    if (usuario.persona?.identificacion) {
      this.intentosLogin.delete(usuario.persona.identificacion);
    }

    return {
      mensaje: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.',
    };
  }

  private registrarFallo(identificador: string) {
    const actual = this.intentosLogin.get(identificador) || {
      intentos: 0,
      bloqueadoHasta: null,
    };

    actual.intentos += 1;

    if (actual.intentos >= this.MAX_INTENTOS) {
      actual.bloqueadoHasta = Date.now() + this.TIEMPO_BLOQUEO_MS;
    }

    this.intentosLogin.set(identificador, actual);
  }
}