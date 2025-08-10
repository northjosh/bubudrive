import express, { Request, Response } from "express";
import { appRouter, createContext } from "./trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import { ROOT_DIR, upload } from "./utils/multer";
import { Database, File, Folder, SharedFolder, User } from "./lib/db";
import { v4 } from "uuid";
import path from "path";
import "dotenv/config";
import cors from "cors";

import { JSONFile } from "lowdb/node";
import { Low } from "lowdb";
import { logger } from "./utils/logger";

export const defaultData = {
  folders: [] as Folder[],
  users: [] as User[],
  sharedFolders: [] as SharedFolder[],
  files: [] as File[],
};

export const db = new Low<Database>(new JSONFile("db.json"), defaultData);

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/express", express.json());
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ path, error }) {
      logger.error(`trPC Failed on ${path ?? " "}: ${error.message}`);
    },
  })
);

app.post("/files", upload.array("files"), async (req, res) => {
  const folder = getFolder(req, res);
  const files = req.files as Express.Multer.File[];
  const response = [];

  for (const file of files) {
    const newFile: File = {
      name: file.originalname,
      id: v4(),
      size: file.size,
      owner: "system",
      folder: folder!,
      lastModified: Date.now(),
    };

    db.data.files.push(newFile);
    response.push(newFile);
  }

  await db.write();

  res.status(201).json(response);
});

app.get("/:folder/:file", async (req, res) => {
  const filename = req.params["file"];
  const foldername = req.params["folder"];

  const file = db.data.files.find(
    (f: File) => f.folder.name === foldername && f.name === filename
  );

  if (!file) {
    res.status(404).json("Not Found");
    return null;
  }

  res.sendFile(filename, {
    root: path.join(path.resolve("."), ROOT_DIR),
    headers: { "Content-Disposition": "attachment; filename=" + filename },
  });
});

function getFolder(req: Request, res: Response) {
  const folderName = req.query["folder"];
  if (!folderName || typeof folderName !== "string") {
    return null;
  }
  const folder = db.data.folders.find((f: Folder) => f.name === folderName);
  if (!folder) {
    res.status(400).send("Folder not found.");
    return null;
  }
  return folder;
}
const startServer = async () => {
  await db.read();
  app.listen(9000, () => {
    console.log(`🚀 Server is running on http://localhost:9000`);
  });
};

startServer();
