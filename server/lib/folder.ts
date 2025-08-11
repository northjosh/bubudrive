import { TRPCError } from "@trpc/server";
import { v4 } from "uuid";
import { db } from "../server";
import { Folder, File } from "./db";
import { Request, Response } from "express";

export const createFolder = async (name: string, ownerId: string) => {
  const folder: Folder = {
    id: v4(),
    name: name,
    owner: ownerId,
    path: name,
  };

  db.data.folders.push(folder);
  await db.write();
  return folder;
};

export const deleteFolder = (foldername: string, ownerId: string) => {
  const folder = db.data.folders.find(
    (f: Folder) => f.name === foldername && f.owner === ownerId
  );
  if (!folder) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Folder not found" });
  }
  db.data.files = db.data.files.filter((f: File) => f.folder !== folder);
  db.data.folders = db.data.folders.filter((f: Folder) => f.id !== folder.id);
  db.write();
};

export const getFolder = ({ foldername }: { foldername: string }) => {
  const folder = db.data.folders.find((f: Folder) => f.name == foldername);
  return folder;
};

export const getAllFolders = (ownerId: string) => {
  return db.data.folders.filter((f) => f.owner === ownerId);
};

export function getFolderFromRequest(req: Request, res: Response) {
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
