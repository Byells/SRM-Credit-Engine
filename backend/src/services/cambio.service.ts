import { Service, Inject } from "typedi";
import { DataSource } from "typeorm";
import { TaxaCambio } from "../entities/taxaCambio.entity";
import { AtualizarTaxaCambioDTO } from "../dtos/cambio/atualizarTaxaCambio.dto";

@Service()
export class CambioService {
  constructor(@Inject("dataSource") private dataSource: DataSource) {}

  async atualizarTaxa(dto: AtualizarTaxaCambioDTO): Promise<TaxaCambio> {
    const repository = this.dataSource.getRepository(TaxaCambio);
    const novaTaxa = repository.create({
      moedaOrigemId: dto.moedaOrigemId,
      moedaDestinoId: dto.moedaDestinoId,
      valorTaxa: dto.valorTaxa,
      dataTaxa: new Date(),
    });
    return repository.save(novaTaxa);
  }
}
