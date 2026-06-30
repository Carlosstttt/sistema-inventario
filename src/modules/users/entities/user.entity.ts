import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ unique: true, length: 150 })
  email!: string;

  @Column({ select: false }) // Evita que la contraseña se filtre en las consultas por defecto
  password!: string;

  @Column({ default: 'empleado' }) // 'admin' o 'empleado' para el negocio pequeño
  rol!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  telefono!:string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}