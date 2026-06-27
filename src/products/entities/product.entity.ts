import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('producto') // Así se llamará la tabla en pgAdmin
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column()
  descripcion!: string;

  @Column({ type: 'int' })
  stock!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio!: number;
}