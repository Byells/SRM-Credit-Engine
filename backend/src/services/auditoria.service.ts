import { Service } from "typedi";
import { createHash } from "crypto";

@Service()
export class AuditoriaService {
  gerarHash(dados: Record<string, unknown>): string {
    const payload = JSON.stringify(dados);
    return createHash("sha256").update(payload).digest("hex");
  }
}
