import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

type FonteValidacao = "body" | "query";

export function validate(schema: ZodType, fonte: FonteValidacao = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req[fonte]);

    if (!resultado.success) {
      return res.status(400).json({
        erro: "Dados inválidos",
        detalhes: resultado.error.issues.map((issue) => ({
          campo: issue.path.join("."),
          mensagem: issue.message,
        })),
      });
    }

    req[fonte] = resultado.data;
    next();
  };
}
