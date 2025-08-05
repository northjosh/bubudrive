import { initTRPC, TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { File, Folder, db } from "./db";
import { v4 } from "uuid";
import { z } from "zod/v4";
import { verifyJwt, fetchUserFromToken, signup, login } from "./auth";

export const createContext = async ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  let user = null;

  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    user = await fetchUserFromToken(token);
  }

  return {
    user,
    req,
    res,
  };
};

type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

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

export const appRouter = router({
  hello: procedure.query((opts) => "ola trpC!"),

  signup: procedure
    .input(
      z.object({
        username: z.string().min(3),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const user = await signup(input);
      if (!user) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already exists",
        });
      }
      return { success: true, user: { id: user.id, username: user.username } };
    }),

  login: procedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await login(input);
      if (typeof result === "string") {
        throw new TRPCError({ code: "UNAUTHORIZED", message: result });
      }
      if (!result) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }
      return { token: result };
    }),

  getAllFolders: protectedProcedure.query(({ ctx }) =>
    getAllFolders(ctx.user!.id)
  ),

  getFolder: protectedProcedure
    .input(
      z.object({
        foldername: z.string(),
      })
    )
    .query(({ input, ctx }) => getFolder(input)),

  getAllFiles: protectedProcedure.query(({ ctx }) => getAllFiles(ctx.user.id)),

  getFilesFromFolder: protectedProcedure
    .input(
      z.object({
        foldername: z.string(),
      })
    )
    .query(({ input, ctx }) =>
      getFilesFromFolder(input.foldername, ctx.user!.id)
    ),

  createFolder: protectedProcedure
    .input(
      z.object({
        foldername: z.string().min(5),
      })
    )
    .mutation(({ input, ctx }) => createFolder(input.foldername, ctx.user!.id)),

  deleteFolder: protectedProcedure
    .input(
      z.object({
        foldername: z.string().min(5),
      })
    )
    .mutation(({ input, ctx }) => deleteFolder(input.foldername, ctx.user!.id)),
});

export type AppRouter = typeof appRouter;
