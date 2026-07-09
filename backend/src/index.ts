import "reflect-metadata";
import { config } from "dotenv";
config();
import "./dependencies";
import App from "./app";

const port = Number(process.env.PORT);

const app = new App(port);

app.listen();
