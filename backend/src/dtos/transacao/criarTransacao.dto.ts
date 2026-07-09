import { z } from "zod";
import { decimalPositivoSchema } from "../common/decimal.schema";

export const criarTransacaoSchema = z.object({
  cedenteId: z
    .number()
    .int()
    .positive("cedenteId deve ser um inteiro positivo"),
  produtoId: z
    .number()
    .int()
    .positive("produtoId deve ser um inteiro positivo"),
  moedaTituloId: z
    .number()
    .int()
    .positive("moedaTituloId deve ser um inteiro positivo"),
  moedaPagamentoId: z
    .number()
    .int()
    .positive("moedaPagamentoId deve ser um inteiro positivo"),
  valorFace: decimalPositivoSchema,
  prazoMeses: z
    .number()
    .int()
    .positive("prazoMeses deve ser um inteiro positivo"),
});

export type CriarTransacaoDTO = z.infer<typeof criarTransacaoSchema>;
