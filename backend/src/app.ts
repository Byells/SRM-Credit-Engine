import express, { Express } from "express";
import { AppDataSource, databaseInitialize } from "./config/db.config";

export default class App {
  public app: Express;
  public port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;

    this.middlewares();
    this.healthCheck();
  }

  private middlewares(): void {
    this.app.use(express.json());
  }

  private healthCheck(): void {
    this.app.get("/health", (req, res) => {
      res.status(200).send("Credit Engine está funcionando normalmente");
    });
  }

  public async listen() {
    try {
      await databaseInitialize();
      this.app.listen(this.port, async () => {
        console.log(`Credit Engine está online em: ${this.port}`);
      });
    } catch (error) {
      console.error("Credit Engine encontrou problemas para ligar:", error);
    }
  }
}
