import { TRPCError } from "@trpc/server";
import { v4 } from "uuid";
import { db } from "../server";
import { Access, canDelete, deleteFilesFromFolder, File } from "./file";
import { Request, Response } from "express";

export interface Folder {
  type: "folder";
  id: string;
  name: string;
  owner: string;
  path: string;
  permissions: {
    [userId: string]: Access;
  };
}

export const createFolder = async (name: string, ownerId: string) => {
  const folder: Folder = {
    type: "folder",
    id: v4(),
    name: name,
    owner: ownerId,
    path: name,
    permissions: {},
  };

  db.data.folders.push(folder);
  await db.write();
  return folder;
};

export const deleteFolder = (folderId: string, userId: string) => {
  const folder = db.data.folders.find((f: Folder) => f.name === folderId);
  if (!folder) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Folder not found" });
  }
  if (!canDelete(folder, userId))
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You dont have permission to delete this folder",
    });

  deleteFilesFromFolder(folder.id, userId);

  db.data.files = db.data.files.filter((f: File) => f.folder !== folder.id);
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
