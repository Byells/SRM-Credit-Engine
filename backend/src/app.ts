import express, { Express } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { databaseInitialize } from "./config/db.config";
import routes from "./routes";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler.middleware";
import swaggerDocument from "./swagger.json";

export default class App {
  public app: Express;
  public port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;

    this.middlewares();
    this.documentation();
    this.healthCheck();
    this.routes();
    this.exceptionHandler();
  }

  private middlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private documentation(): void {
    this.app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }

  private healthCheck(): void {
    this.app.get("/health", (req, res) => {
      res.status(200).send("Credit Engine está funcionando normalmente");
    });
  }

  private routes(): void {
    this.app.use("/", routes);
  }

  private exceptionHandler(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  public async listen() {
    try {
      await databaseInitialize();
      this.app.listen(this.port, () => {
        console.log(`Credit Engine está online na porta: ${this.port}`);
        console.log(
          `Documentação Swagger disponível em: http://localhost:${this.port}/docs`,
        );
      });
    } catch (error) {
      console.error("Credit Engine encontrou problemas para ligar:", error);
    }
  }
}
