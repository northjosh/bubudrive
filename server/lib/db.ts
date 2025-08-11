import { User } from "./auth";
import { Folder } from "./folder";
import { File } from "./file";

export const defaultData = {
  folders: [] as Folder[],
  users: [] as User[],
  files: [] as File[],
};

export type Database = typeof defaultData;
