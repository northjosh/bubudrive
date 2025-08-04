import { JSONFile } from "lowdb/node";
import { Low } from "lowdb";

export interface File {
  id: string;
  name: string;
  size: number;
  owner: string;
  folder: Folder;
  lastModified: number;
}

export interface Folder {
  id: string;
  name: string;
  owner: string;
  path: string;
}

export interface User {
  name: string;
  username: string;
  password: string;
}

export interface SharedFolder {
  folderName: string;
  sharedWith: string[];
}

export const defaultData = {
  folders: [] as Folder[],
  users: [] as User[],
  sharedFolders: [] as SharedFolder[],
  files: [] as File[],
};

export type Database = typeof defaultData;
