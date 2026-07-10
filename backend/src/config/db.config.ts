import "reflect-metadata";
import knex from "knex";
import { DataSource } from "typeorm";
import { Container } from "typedi";
import { TaxaBase } from "../entities/taxaBase.entity";
import { TaxaCambio } from "../entities/taxaCambio.entity";
import { TipoRecebivel } from "../entities/tipoRecebivel.entity";
import { Transacao } from "../entities/transacao.entity";
import { Moeda } from "../entities/moeda.entity";
import { Cedente } from "../entities/cedente.entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [Cedente, Moeda, TaxaBase, TaxaCambio, TipoRecebivel, Transacao],
});

export const knexClient = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  pool: { min: 2, max: 10 },
});

Container.set("dataSource", AppDataSource);
Container.set("knex", knexClient);

export async function databaseInitialize(): Promise<void> {
  await AppDataSource.initialize();
}
