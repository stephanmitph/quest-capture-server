import express from "express";
import cors from "cors";
import { getCollections } from "../../shared/file-storage";

export function createApiServer() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(cors());

  // Healthcheck endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Collection endpoints
  app.get("/api/collections", async (req, res) => {
    try {
      const collections = (await getCollections()).map((collection) => { delete collection["videos"]; return collection });

      res.json(collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
      res.status(500).json({ success: false, error: "Failed to fetch collections" });
    }
  });

  return app;
}