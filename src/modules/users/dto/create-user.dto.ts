import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Nombre de usuario' })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre no debe estar vacío' })
  nombre!: string;

  @ApiProperty({ description: 'Correo electrónico' })
  @IsEmail({}, { message: 'El formato debe ser de correo válido' })
  @IsNotEmpty({ message: 'El correo no debe estar vacío' })
  email!: string;

  @ApiProperty({ description: 'Contraseña de usuario' })
  @MinLength(6, { message: 'La contraseña debe tener como mínimo 6 caracteres' })
  @IsString({ message: 'La contraseña debe ser una cadena' })
  password!: string;
}