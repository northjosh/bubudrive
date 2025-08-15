import { initTRPC, TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { logger } from "./utils/logger";
import { toTRPCError } from "./lib/errors";
import { getTokenFromCookies, setAuthCookie, clearAuthCookie } from "./lib/cookie-auth";
import { z } from "zod/v4";
import {
  fetchUserFromToken,
  signup,
  login,
  searchUsers,
  getUserById,
  getAllUsers,
} from "./lib/auth";
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
import { 
  ZSignUpSchema, 
  ZUserSchema, 
  ZLoginSchema,
  ZCreateFolderSchema,
  ZDeleteFolderSchema,
  ZGetFolderSchema,
  ZDeleteFilesSchema,
  ZGetFilesFromFolderSchema,
  ZShareFolderSchema,
  ZShareFileSchema,
  ZSearchUsersSchema,
  ZGetUserByIdSchema
} from "./types/auth.type";
import { db } from "./lib/db";

export const createContext = async ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  let user = null;

  // Try to get token from cookies first, then fall back to Authorization header
  let token = getTokenFromCookies(req.cookies || {});
  
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
  
  if (token) {
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
      try {
        const user = await signup(input);
        if (!user) {
          throw new TRPCError({ 
            code: "CONFLICT", 
            message: "Username already exists" 
          });
        }
        return { ...user, success: true };
      } catch (error) {
        throw toTRPCError(error);
      }
    }),
  login: procedure
    .input(ZLoginSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const token = await login(input);

        if (!token) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }
        // Set httpOnly cookie
        setAuthCookie(ctx.res, token);
        
        return { success: true, message: 'Login successful' };
      } catch (error) {
        throw toTRPCError(error);
      }
    }),

  getAllFolders: protectedProcedure.query(({ ctx }) =>
    getAllFolders(ctx.user!.id)
  ),
  getFolder: protectedProcedure
    .input(ZGetFolderSchema)
    .query(({ input, ctx }) => getFolder(input)),

  getAllFiles: protectedProcedure.query(({ ctx }) => getAllFiles(ctx.user.id)),
  getFilesFromFolder: protectedProcedure
    .input(ZGetFilesFromFolderSchema)
    .query(({ input, ctx }) =>
      getFilesFromFolder(input.folderId, ctx.user!.id)
    ),
  shareFolder: protectedProcedure
    .input(ZShareFolderSchema)
    .mutation(async ({ input, ctx }) => {
      const { folderId, targetUserIds, access } = input;
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

      await share(folder, targetUserIds, access);

      return { success: true, message: "Folder shared successfully" };
    }),

  shareFile: protectedProcedure
    .input(ZShareFileSchema)
    .mutation(async ({ input, ctx }) => {
      const { fileId, targetUserIds, access } = input;
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

      await share(file, targetUserIds, access);
      return { success: true, message: "File shared successfully" };
    }),

  deleteFiles: protectedProcedure
    .input(ZDeleteFilesSchema)
    .mutation(async ({ input, ctx }) => {
      await deletefiles(input.fileIds, ctx.user!.id);
      return { success: true, message: "Files deleted successfully" };
    }),

  createFolder: protectedProcedure
    .input(ZCreateFolderSchema)
    .mutation(({ input, ctx }) => createFolder(input.folderId, ctx.user!.id)),

  deleteFolder: protectedProcedure
    .input(ZDeleteFolderSchema)
    .mutation(({ input, ctx }) => deleteFolder(input.folderId, ctx.user!.id)),

  searchUsers: protectedProcedure
    .input(ZSearchUsersSchema)
    .query(({ input }) => searchUsers(input.query)),

  getUserById: protectedProcedure
    .input(ZGetUserByIdSchema)
    .query(({ input }) => getUserById(input.id)),
  fetchUsers: protectedProcedure.output(z.array(ZUserSchema)).query(() => getAllUsers()),
  logout: procedure
    .mutation(async ({ ctx }) => {
      clearAuthCookie(ctx.res);
      return { success: true, message: 'Logout successful' };
    }),
  me: protectedProcedure
    .query(({ ctx }) => {
      return { id: ctx.user.id, username: ctx.user.username };
    }),
});

export type AppRouter = typeof appRouter;
