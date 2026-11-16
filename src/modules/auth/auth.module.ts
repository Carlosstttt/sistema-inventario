import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PersonaModule } from '../persona/persona.module';
import { ConfigModule } from '../../config/config.module';
import { MailService } from './mail.service';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PersonaModule,
    JwtModule.register({
      secret: 'MI CODIGO SECRETO',
      signOptions: { expiresIn: '4h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, MailService],
  exports: [AuthService],
})
export class AuthModule {}