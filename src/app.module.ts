import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './modules/products/products.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriaModule } from './modules/categoria/categoria.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { PersonaModule } from './modules/persona/persona.module';
import { RoleModule } from './modules/role/role.module';
import { ClienteModule } from './modules/cliente/cliente.module';
import { PedidoModule } from './modules/pedido/pedido.module';
import { ProveedorModule } from './modules/proveedor/proveedor.module';
import { KardexModule } from './modules/kardex/kardex.module';

@Module({
  imports: [
    DatabaseModule,      
    AuthModule,
    UsersModule,
    CategoriaModule,
    ProductsModule,
    ConfigModule,
    PersonaModule,
    RoleModule,
    ClienteModule,
    PedidoModule,
    ProveedorModule,
    KardexModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
