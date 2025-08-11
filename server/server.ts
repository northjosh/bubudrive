/// <reference path="./types/express.d.ts" />
import express, { Request, Response } from "express";
import { appRouter, createContext } from "./trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import { ROOT_DIR, upload } from "./utils/multer";
import { Database } from "./lib/db";
import { v4 } from "uuid";
import path from "path";
import "dotenv/config";
import cors from "cors";

import { JSONFile } from "lowdb/node";
import { Low } from "lowdb";
import { logger } from "./utils/logger";
import { authenticate, User } from "./lib/auth";
import { Folder, getFolderFromRequest, } from "./lib/folder";
import { canAccess, File } from "./lib/file";


export const defaultData = {
  folders: [] as Folder[],
  users: [] as User[],
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

app.post("/files", authenticate, upload.array("files"), async (req, res) => {
  const folder = getFolderFromRequest(req, res);
  const files = req.files as Express.Multer.File[];
  const user = req.user;

  const response = [];

  for (const file of files) {

    const newFile: File = {
      type: 'file',
      name: file.originalname,
      id: v4(),
      size: file.size,
      owner: user!.id,
      folder: folder?.id!,
      permissions: {},
      lastModified: Date.now(),
    };

    db.data.files.push(newFile);
    response.push(newFile);
  }

  await db.write();

  res.status(201).json(response);
});

app.get("/:folder/:file", authenticate, async (req, res) => {
  const filename = req.params["file"];
  const folderId = req.params["folder"];
  const user = req.user!

  const file = db.data.files.find(
    (f: File) => f.folder === folderId && f.id === filename
  );

  if (!file) {
    res.status(404).json("Not Found");
    return null;
  }

  if(!canAccess(file, user.id)){
    res.sendStatus(401).json("You don't have access to this file.")
    return
  }

  res.sendFile(filename, {
    root: path.join(path.resolve("."), ROOT_DIR),
    headers: { "Content-Disposition": "attachment; filename=" + filename },
  });
});

const startServer = async () => {
  await db.read();
  app.listen(9000, () => {
    console.log(`🚀 Server is running on http://localhost:9000`);
  });
};

startServer();
