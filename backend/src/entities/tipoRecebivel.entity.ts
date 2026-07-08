import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("tb_tipos_recebiveis")
export class TipoRecebivel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 45 })
  nome!: string;

  @Column({ type: "decimal", precision: 5, scale: 4 })
  spread!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
