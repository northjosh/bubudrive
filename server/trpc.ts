import { initTRPC, TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { File, Folder } from "./lib/db";
import { logger } from "./utils/logger";

import { v4 } from "uuid";
import { z } from "zod/v4";
import { verifyJwt, fetchUserFromToken, signup, login } from "./lib/auth";
import { db } from "./server";
import { createFolder, deleteFolder, getAllFolders, getFolder } from "./lib/folder";
import { getAllFiles, getFilesFromFolder } from "./lib/file";

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

export const loggerMiddleware = t.middleware(
  async ({ path, type, next, ctx }) => {
    const userId = ctx.user?.id ?? "anonymous";
    logger.info(`${Date.now()} ${type} ${path} - User: ${userId}`);
    return next();
  }
);

export const procedure = t.procedure.use(loggerMiddleware);

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
