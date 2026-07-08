import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("tb_taxas_base")
export class TaxaBase {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 50 })
  nome!: string;

  @Column({ type: "decimal", precision: 7, scale: 4 })
  valor!: string;

  @Column({ name: "data_vigencia", type: "timestamp" })
  dataVigencia!: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
