import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.error";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      erro: err.message,
    });
  }

  console.error("[ERRO NÃO TRATADO]", err);
  return res.status(500).json({
    erro: "Erro interno no servidor. Tente novamente mais tarde.",
  });
}

export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({
    erro: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
}
