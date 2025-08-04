import { initTRPC, TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { File, Folder } from "./db";
import { db } from "./server";
import { v4 } from "uuid";
import { z } from "zod/v4";

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({});

type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure;

const createFolder = async (name: string) => {
  const folder: Folder = {
    id: v4(),
    name: name,
    owner: "system",
    path: name,
  };

  db.data.folders.push(folder);
  await db.write();
  return folder;
};

const deleteFolder = (foldername: string) => {
  const folder = db.data.folders.find((f: Folder) => f.name === foldername);
  if (!folder) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Folder not found" });
  }
  db.data.files = db.data.files.filter((f: File) => f.folder !== folder);
  db.write();
};

const getFolder = ({ foldername }: { foldername: string }) => {
  const folder = db.data.folders.find((f: Folder) => f.name == foldername);
  return folder;
};

const getAllFolders = () => {
  return db.data.folders;
};

const getAllFiles = () => {
  return db.data.files;
};

const getFilesFromFolder = (foldername: string) => {
  const folder = db.data.folders.find((f: Folder) => f.name == foldername);

  if (!folder) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Folder not found" });
  }
  return db.data.files.filter((f: File) => f.folder.id === folder.id);
};

export const appRouter = router({
  hello: procedure.query((opts) => "ola trpC!"),
  getAllFolders: procedure.query(() => getAllFolders()),
  getFolder: procedure
    .input(
      z.object({
        foldername: z.string(),
      })
    )
    .query((opts) => getFolder(opts.input)),
  getAllFiles: procedure.query(() => getAllFiles()),
  getFilesFromFolder: procedure
    .input(
      z.object({
        foldername: z.string(),
      })
    )
    .query(({ input }) => getFilesFromFolder(input.foldername)),
  createFolder: procedure
    .input(
      z.object({
        foldername: z.string().min(5),
      })
    )
    .mutation((opts) => createFolder(opts.input.foldername)),
});

export type AppRouter = typeof appRouter;
