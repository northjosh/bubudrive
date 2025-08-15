// Shared type definitions that can be used by both client and server

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

export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt?: number;
}
