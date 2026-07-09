import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

type FonteValidacao = "body" | "query" | "params";

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

    // Alguns campos do request (ex: `query`) podem ser getters/read-only em certos
    // ambientes. Em vez de sobrescrever a propriedade inteira, copie os valores
    // validados para o objeto existente quando possível. Isso evita erro:
    // "Cannot set property query of #<IncomingMessage> which has only a getter".
    const target = (req as any)[fonte];
    if (target && typeof target === "object") {
      Object.assign(target, resultado.data);
    } else {
      // Se não for um objeto (ex.: body inicialmente undefined), faça atribuição direta.
      (req as any)[fonte] = resultado.data;
    }
    next();
  };
}
