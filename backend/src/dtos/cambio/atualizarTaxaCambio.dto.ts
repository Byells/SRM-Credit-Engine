import { z } from "zod";
import { decimalPositivoSchema } from "../common/decimal.schema";

export const atualizarTaxaCambioSchema = z
  .object({
    moedaOrigemId: z.number().int().positive(),
    moedaDestinoId: z.number().int().positive(),
    valorTaxa: decimalPositivoSchema,
  })
  .refine((data) => data.moedaOrigemId !== data.moedaDestinoId, {
    message: "moedaOrigemId e moedaDestinoId devem ser diferentes",
    path: ["moedaDestinoId"],
  });

export type AtualizarTaxaCambioDTO = z.infer<typeof atualizarTaxaCambioSchema>;
