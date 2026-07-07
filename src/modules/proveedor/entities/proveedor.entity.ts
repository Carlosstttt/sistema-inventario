import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity'; // Ajusta la ruta a tu entidad Producto

@Entity('proveedores')
export class Proveedor {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'varchar', length: 150 })
  razon_social!: string; // Nombre de la empresa o distribuidora

  @Column({ type: 'varchar', length: 20, unique: true })
  ruc_o_dni!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  contacto_nombre!: string; // Nombre de la persona que te atiende (ej: "Juan de Bimbo")

  // Un proveedor puede surtir muchos productos en tu inventario
  @OneToMany(() => Product, (producto) => producto.proveedor)
  product!: Product[];
}