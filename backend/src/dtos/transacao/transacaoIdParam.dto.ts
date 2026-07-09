import { z } from "zod";

export const transacaoIdParamSchema = z.object({
  id: z.coerce.number().int().positive("id deve ser um inteiro positivo"),
});

export type TransacaoIdParamDTO = z.infer<typeof transacaoIdParamSchema>;
