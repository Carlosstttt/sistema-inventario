import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { CategoriaService } from './categoria.service';
import { CategoriaController } from './categoria.controller';
import { Type } from 'class-transformer';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria])],
  controllers: [CategoriaController],
  providers: [CategoriaService],
  exports: [TypeOrmModule],
})
export class CategoriaModule {}
