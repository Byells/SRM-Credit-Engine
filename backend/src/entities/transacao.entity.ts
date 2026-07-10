import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Cedente } from "./cedente.entity";
import { TipoRecebivel } from "./tipoRecebivel.entity";
import { Moeda } from "./moeda.entity";
import { StatusTransacao } from "../enums/statusTransacao.enum";

@Entity("tb_transacoes")
export class Transacao {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "cedente_id" })
  cedenteId!: number;

  @ManyToOne(() => Cedente)
  @JoinColumn({ name: "cedente_id" })
  cedente!: Cedente;

  @Column({ name: "produto_id" })
  produtoId!: number;

  @ManyToOne(() => TipoRecebivel)
  @JoinColumn({ name: "produto_id" })
  produto!: TipoRecebivel;

  @Column({ name: "moeda_titulo_id" })
  moedaTituloId!: number;

  @ManyToOne(() => Moeda)
  @JoinColumn({ name: "moeda_titulo_id" })
  moedaTitulo!: Moeda;

  @Column({ name: "moeda_pagamento_id" })
  moedaPagamentoId!: number;

  @ManyToOne(() => Moeda)
  @JoinColumn({ name: "moeda_pagamento_id" })
  moedaPagamento!: Moeda;

  @Column({ name: "valor_face", type: "decimal", precision: 15, scale: 2 })
  valorFace!: string;

  @Column({
    name: "valor_liquido",
    type: "decimal",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  valorLiquido!: string | null;

  @Column({
    name: "taxa_base_aplicada",
    type: "decimal",
    precision: 7,
    scale: 4,
  })
  taxaBaseAplicada!: string;

  @Column({ name: "spread_aplicado", type: "decimal", precision: 5, scale: 4 })
  spreadAplicado!: string;

  @Column({
    name: "fator_cambio_aplicado",
    type: "decimal",
    precision: 18,
    scale: 6,
    default: "1.000000",
  })
  fatorCambioAplicado!: string;

  @Column({ name: "prazo_meses", type: "int" })
  prazoMeses!: number;

  @Column({
    type: "varchar",
    length: 20,
    default: StatusTransacao.PENDENTE,
  })
  status!: StatusTransacao;

  @Column({ name: "data_transacao", type: "timestamp" })
  dataTransacao!: Date;

  @Column({ name: "data_liquidacao", type: "timestamp", nullable: true })
  dataLiquidacao!: Date | null;

  @Column({ name: "hash_auditoria", type: "varchar", length: 64 })
  hashAuditoria!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
