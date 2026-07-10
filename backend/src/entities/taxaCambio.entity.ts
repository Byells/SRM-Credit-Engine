import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Moeda } from "./moeda.entity";

@Entity("tb_taxas_cambio")
export class TaxaCambio {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "moeda_origem_id" })
  moedaOrigemId!: number;

  @ManyToOne(() => Moeda)
  @JoinColumn({ name: "moeda_origem_id" })
  moedaOrigem!: Moeda;

  @Column({ name: "moeda_destino_id" })
  moedaDestinoId!: number;

  @ManyToOne(() => Moeda)
  @JoinColumn({ name: "moeda_destino_id" })
  moedaDestino!: Moeda;

  @Column({ name: "valor_taxa", type: "decimal", precision: 18, scale: 6 })
  valorTaxa!: string;

  @Column({ name: "data_taxa", type: "timestamp" })
  dataTaxa!: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
