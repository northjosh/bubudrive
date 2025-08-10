import { TRPCError } from "@trpc/server";
import { db } from "../server";
import { Folder, File } from "./db";

export const getAllFiles = (ownerId: string) => {
    return db.data.files.filter((f) => f.owner == ownerId);
  };
  
  export const getFilesFromFolder = (foldername: string, ownerId: string) => {
    const folder = db.data.folders.find(
      (f: Folder) => f.name == foldername && f.owner === ownerId
    );
    if (!folder) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Folder not found" });
    }
    return db.data.files.filter((f: File) => f.folder.id === folder.id);
  };