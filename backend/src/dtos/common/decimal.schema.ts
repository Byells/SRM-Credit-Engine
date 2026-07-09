import { z } from "zod";

export const decimalPositivoSchema = z
  .string()
  .regex(/^\d+(\.\d+)?$/, "Deve ser um número decimal válido (ex: 100.50)")
  .refine((val) => Number(val) > 0, "Deve ser um valor maior que zero");

export const decimalNaoNegativoSchema = z
  .string()
  .regex(/^\d+(\.\d+)?$/, "Deve ser um número decimal válido (ex: 100.50)")
  .refine((val) => Number(val) >= 0, "Deve ser um valor maior ou igual a zero");
