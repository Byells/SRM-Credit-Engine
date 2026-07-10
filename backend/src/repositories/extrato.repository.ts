import { Service, Inject } from "typedi";
import { Knex } from "knex";
import { ExtratoQueryDTO } from "../dtos/extrato/extratoQuery.dto";

export interface ExtratoItem {
  id: number;
  cedenteNome: string;
  produtoNome: string;
  moedaTituloCodigo: string;
  moedaPagamentoCodigo: string;
  valorFace: string;
  valorLiquido: string | null;
  status: string;
  dataTransacao: Date;
  dataLiquidacao: Date | null;
}

export interface ExtratoResultado {
  data: ExtratoItem[];
  total: number;
  page: number;
  pageSize: number;
}

@Service()
export class ExtratoRepository {
  constructor(@Inject("knex") private knex: Knex) {}

  async buscar(filtros: ExtratoQueryDTO): Promise<ExtratoResultado> {
    // Query base compartilhada entre a busca dos dados e a contagem total —
    // evita duplicar a lógica de filtros em dois lugares diferentes.
    const queryBase = this.knex("tb_transacoes as t")
      .join("tb_cedentes as c", "t.cedente_id", "c.id")
      .join("tb_tipos_recebiveis as p", "t.produto_id", "p.id")
      .join("tb_moedas as mt", "t.moeda_titulo_id", "mt.id")
      .join("tb_moedas as mp", "t.moeda_pagamento_id", "mp.id")
      .whereBetween("t.data_transacao", [filtros.dataInicio, filtros.dataFim])
      .modify((qb) => {
        if (filtros.cedenteId) {
          qb.andWhere("t.cedente_id", filtros.cedenteId);
        }
        if (filtros.moedaPagamentoId) {
          qb.andWhere("t.moeda_pagamento_id", filtros.moedaPagamentoId);
        }
        if (filtros.status) {
          qb.andWhere("t.status", filtros.status);
        }
      });

    const [{ total }] = await queryBase
      .clone()
      .count<{ total: string }[]>("t.id as total");

    const linhas = await queryBase
      .clone()
      .select([
        "t.id as id",
        "c.nome as cedenteNome",
        "p.nome as produtoNome",
        "mt.codigo as moedaTituloCodigo",
        "mp.codigo as moedaPagamentoCodigo",
        "t.valor_face as valorFace",
        "t.valor_liquido as valorLiquido",
        "t.status as status",
        "t.data_transacao as dataTransacao",
        "t.data_liquidacao as dataLiquidacao",
      ])
      .orderBy("t.data_transacao", "desc")
      .limit(filtros.pageSize)
      .offset((filtros.page - 1) * filtros.pageSize);

    return {
      data: linhas as ExtratoItem[],
      total: Number(total),
      page: filtros.page,
      pageSize: filtros.pageSize,
    };
  }
}
