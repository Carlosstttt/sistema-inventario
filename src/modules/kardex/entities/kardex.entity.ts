import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity'; // Ajusta a tu entidad de usuarios

@Entity('kardex_movimientos')
export class Kardex {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'varchar', length: 20 })
  tipo_movimiento!: 'ENTRADA' | 'SALIDA' | 'AJUSTE'; 
  // ENTRADA = Compra, SALIDA = Venta, AJUSTE = Inventario roto o corregido

  @Column({ type: 'varchar', length: 255 })
  motivo!: string; // Ej: "Compra a proveedor", "Venta Nro #102", "Producto caducado"

  @Column({ type: 'int' })
  cantidad!: number; // Cuántas unidades se movieron

  @CreateDateColumn({ type: 'timestamp' })
  fecha!: Date;

  // A qué producto afecta este movimiento
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product!: Product;

  // Qué usuario (empleado, admin) hizo este movimiento
  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  usuario!: User;
}