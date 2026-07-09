import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CORS_ORIGIN } from "./config.js";
import { statsRouter } from "./routes/statsRoutes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.use(cors({ origin: CORS_ORIGIN }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  app.use("/api", statsRouter);

  // In production the backend serves the built frontend from one port.
  const frontendDist = join(__dirname, "..", "..", "frontend", "dist");
  if (existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get("*", (_req, res) => {
      res.sendFile(join(frontendDist, "index.html"));
    });
  }

  return app;
}
