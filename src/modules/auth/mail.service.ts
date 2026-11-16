import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class MailService {
  constructor(private configService: ConfigService) {}

  private crearTransporter() {
    const user = this.configService.get('MAIL_USER');
    const pass = this.configService.get('MAIL_PASS');

    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user,
        pass,
      },
    });
  }

  async enviarCorreoBienvenida(email: string, nombre: string) {
    try {
      const transporter = this.crearTransporter();
      const user = this.configService.get('MAIL_USER');

      await transporter.sendMail({
        from: `"Sistema de Inventario" <${user}>`,
        to: email,
        subject: '¡Bienvenido! Tu cuenta ha sido creada exitosamente',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #3B82F6;">¡Hola, ${nombre}!</h2>
            <p>Tu cuenta en el <strong>Sistema de Inventario</strong> ha sido creada correctamente.</p>
            <p>Ya puedes iniciar sesión utilizando tu <strong>correo electrónico</strong> o tu <strong>número de cédula</strong>.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Error enviando correo de bienvenida:', error);
    }
  }

  async enviarCodigoRecuperacion(email: string, nombre: string, codigo: string) {
    try {
      const transporter = this.crearTransporter();
      const user = this.configService.get('MAIL_USER');

      await transporter.sendMail({
        from: `"Sistema de Inventario" <${user}>`,
        to: email,
        subject: 'Código de recuperación de contraseña',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #3B82F6;">Recuperación de Contraseña</h2>
            <p>Hola <strong>${nombre}</strong>, recibimos una solicitud para restablecer tu contraseña.</p>
            <p>Usa el siguiente código de verificación (válido por <strong>15 minutos</strong>):</p>
            <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #111827; border-radius: 8px; margin: 20px 0;">
              ${codigo}
            </div>
            <p style="color: #666; font-size: 13px;">Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Error enviando correo de recuperación:', error);
      throw new InternalServerErrorException(
        'No se pudo enviar el correo de recuperación. Verifica la configuración SMTP.',
      );
    }
  }
}