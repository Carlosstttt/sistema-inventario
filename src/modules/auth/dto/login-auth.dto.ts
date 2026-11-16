import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { User } from '../interfaces/user.interface';

export class LoginAuthDto implements User {
  @IsString({ message: 'El correo o cédula debe ser texto' })
  @IsNotEmpty({ message: 'El correo electrónico o cédula es obligatorio' })
  identificador!: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}