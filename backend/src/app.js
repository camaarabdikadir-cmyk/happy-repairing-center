import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();
app.use(cors()); // Wuxuu oggolaanayaa dhammaan Frontend-yada
app.use(express.json());

app.get("/", (_, res) => res.json({ ok: true, service: "Happy Repairing API" }));
app.use("/api", routes);

export default app;