import { z } from "zod";

export const extratoQuerySchema = z
  .object({
    dataInicio: z.coerce.date({
      error: () => ({ message: "dataInicio inválida (use YYYY-MM-DD)" }),
    }),
    dataFim: z.coerce.date({
      error: () => ({ message: "dataFim inválida (use YYYY-MM-DD)" }),
    }),
    cedenteId: z.coerce.number().int().positive().optional(),
    moedaPagamentoId: z.coerce.number().int().positive().optional(),
    status: z.enum(["PENDENTE", "LIQUIDADA", "CANCELADA"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce
      .number()
      .int()
      .positive()
      .max(100, "pageSize máximo é 100")
      .default(20),
  })
  .refine((data) => data.dataInicio <= data.dataFim, {
    message: "dataInicio não pode ser posterior a dataFim",
    path: ["dataInicio"],
  });

export type ExtratoQueryDTO = z.infer<typeof extratoQuerySchema>;
