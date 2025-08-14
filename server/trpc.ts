import { initTRPC, TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { logger } from "./utils/logger";
import { z } from "zod/v4";
import { fetchUserFromToken, signup, login } from "./lib/auth";
import {
  createFolder,
  deleteFolder,
  getAllFolders,
  getFolder,
} from "./lib/folder";
import {
  getAllFiles,
  getFilesFromFolder,
  share,
  deletefiles,
} from "./lib/file";
import { ZSignUpSchema, ZUserSchema } from "./types/auth.type";
import { db } from "./server";

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
    logger.info(
      `${new Date().toISOString()} ${type} ${path} - User: ${userId}`
    );
    return next();
  }
);

export const procedure = t.procedure.use(loggerMiddleware);

export const protectedProcedure = procedure.use(async ({ ctx, next }) => {
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
    .input(ZSignUpSchema)
    .output(ZUserSchema)
    .mutation(async ({ input }) => {
      const user = await signup(input);
      if (!user) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already exists",
        });
      }
      return { ...user, success: true };
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
        folderId: z.string(),
      })
    )
    .query(({ input, ctx }) => getFolder(input)),

  getAllFiles: protectedProcedure.query(({ ctx }) => getAllFiles(ctx.user.id)),
  getFilesFromFolder: protectedProcedure
    .input(
      z.object({
        folderId: z.string(),
      })
    )
    .query(({ input, ctx }) =>
      getFilesFromFolder(input.folderId, ctx.user!.id)
    ),
  shareFolder: protectedProcedure
    .input(
      z.object({
        folderId: z.string(),
        targetUserId: z.string(),
        access: z.enum(["read", "write"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { folderId, targetUserId, access } = input;
      const folder = getFolder({ folderId });

      if (!folder) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Folder not found" });
      }

      if (folder.owner !== ctx.user!.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only folder owner can share folders",
        });
      }

      await share(folder, targetUserId, access);

      return { success: true, message: "Folder shared successfully" };
    }),

  shareFile: protectedProcedure
    .input(
      z.object({
        fileId: z.string(),
        targetUserId: z.string(),
        access: z.enum(["read", "write"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { fileId, targetUserId, access } = input;
      const file = db.data.files.find((f) => f.id === fileId);

      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
      }

      if (file.owner !== ctx.user!.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only file owner can share files",
        });
      }

      await share(file, targetUserId, access);
      return { success: true, message: "File shared successfully" };
    }),

  deleteFiles: protectedProcedure
    .input(
      z.object({
        fileIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await deletefiles(input.fileIds, ctx.user!.id);
      return { success: true, message: "Files deleted successfully" };
    }),

  createFolder: protectedProcedure
    .input(
      z.object({
        folderId: z.string().min(5),
      })
    )
    .mutation(({ input, ctx }) => createFolder(input.folderId, ctx.user!.id)),

  deleteFolder: protectedProcedure
    .input(
      z.object({
        folderId: z.string().min(5),
      })
    )
    .mutation(({ input, ctx }) => deleteFolder(input.folderId, ctx.user!.id)),
});

export type AppRouter = typeof appRouter;
