import express, { Request, Response } from "express";
import { appRouter, createContext } from "./trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import { upload } from "./multer";
import { db, File } from "./db";
import { v4 } from "uuid";

const app = express();
app.use(express.json());

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);


app.post("/files", upload.array("files"), async (req, res) => {
  const folder = getFolder(req, res);
  const files = req.files as Express.Multer.File[];
  const fileNames = files.map((f) => f.originalname);

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

function getFolder(req: Request, res: Response) {
  const folderName = req.query["folder"];
  if (!folderName || typeof folderName !== "string") {
    res.status(400).send("Folder name is required");
    return null;
  }
  const folder = db.data.folders.find((f) => f.name === folderName);
  if (!folder) {
    res.status(400).send("Folder not found.");
    return null;
  }
  return folder;
}

(async () => {
  await db.read();
  db.data ||= {
    folders: [],
    users: [],
    sharedFolders: [],
    files: [],
  };

  app.listen(5000, () => {
    console.log("We up! tRPCCCC");
  });
})();
