import { TRPCError } from "@trpc/server";
import { db } from "../server";
import { Folder } from "./folder";
import fs from "fs-extra";
import { logger } from "../utils/logger";

export const accessSchema = ["read", "write"] as const;
export type Access = (typeof accessSchema)[number];

export interface File {
  type: "file";
  id: string;
  name: string;
  size: number;
  owner: string;
  folder: string;
  lastModified: number;
  permissions: {
    [userId: string]: Access;
  };
}

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
  return db.data.files.filter((f: File) => f.folder === folder.id);
};

export async function deletefiles(filesIds: string[], userId: string) {
  await db.read();

  filesIds.forEach((fileId) => {
    const file = db.data.files.find((f) => f.id == fileId);
    if (!file) {
      throw new Error("File not Found");
    }

    if (!canDelete(file, userId)) {
      throw new Error(`You don't have permission to delete ${file.name}`);
    }

    fs.remove(`../../../bubu/${file.name}`, (error) => {
      if (error) logger.error(`${new Date().toISOString()}: ${error}`);
      logger.info(`${new Date().toISOString()}: file ${file.name} deleted by ${userId} `);
    });

    db.data.files = db.data.files.filter((f) => f.id !== file.id);
  });

  await db.write();
}

export async function deleteFilesFromFolder(folderId: string, userId: string) {
  await db.read();

  const files = db.data.files.filter((f) => f.folder === folderId);

  if (!files || files.length === 0) {
    return;
  }

  files.forEach((file) => {
    if (!canDelete(file, userId)) {
      throw new Error(`You don't have permission to delete ${file.name}`);
    }

    fs.remove(`../../../bubu/${file.name}`, (error) => {
      if (error) logger.error(`${new Date().toISOString()}: ${error}`);

      logger.info(`${new Date().toISOString()}: file deleted by ${userId} `);
    });
  });
}

export async function share(
  entity: File | Folder,
  userId: string,
  access: Access
) {
  await db.read();
  const collection = entity.type == "file" ? db.data.files : db.data.folders;

  const item = collection.find((i) => i.id === entity.id);
  if (!item) throw new Error(`${entity.type} with id ${entity.id} not found`);
  item.permissions = {};

  if (
    item.permissions[userId] === "read" ||
    item.permissions[userId] == "write"
  )
    return;

  item.permissions[userId] = access;

  await db.write();
}

export function canAccess(entity: File | Folder, userId: string) {
  return (
    entity.owner == userId ||
    entity.permissions[userId] === "write" ||
    entity.permissions[userId] === "read"
  );
}

export function canModify(entity: File | Folder, userId: string) {
  return entity.owner === userId || entity.permissions[userId] === "write";
}

export function canDelete(entity: File | Folder, userId: string) {
  return entity.owner === userId || entity.permissions[userId] === "write";
}
