import express from "express";
import cors from "cors";
import { getCollections, getCollectionById, createCollection } from "../../shared/file-storage";

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
      const collections = (await getCollections()).map((collection) => delete collection["videos"]);

      res.json({
        success: true,
        data: collections,
      });
    } catch (error) {
      console.error("Error fetching collections:", error);
      res.status(500).json({ success: false, error: "Failed to fetch collections" });
    }
  });

  app.get("/api/collections/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const collection = await getCollectionById(id);

      if (!collection) {
        res.status(404).json({ success: false, error: "Collection not found" });
        return;
      }

      res.json({
        success: true,
        data: collection,
      });
    } catch (error) {
      console.error("Error fetching collection:", error);
      res.status(500).json({ success: false, error: "Failed to fetch collection" });
    }
  });

  return app;
}