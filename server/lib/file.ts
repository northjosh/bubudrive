import { TRPCError } from "@trpc/server";
import { db } from "../lib/db";
import { Folder } from "./folder";
import fs from "fs-extra";
import { logger } from "../utils/logger";
import path from "path";
import { AuthorizationError, NotFoundError, ValidationError } from "./errors";
import { getSafeFilePath } from "../utils/multer";

// Re-export shared types
export type { File, Access, accessSchema } from "../../shared/types";
import type { File, Access } from "../../shared/types";

// Remove hardcoded folder path - using getSafeFilePath from multer config instead

export const getAllFiles = (ownerId: string) => {
  if (!ownerId || typeof ownerId !== 'string') {
    throw new ValidationError('Valid owner ID is required');
  }
  
  return db.data.files
    .filter((f) => canAccess(f, ownerId))
    .map(sanitizeFile); // Don't expose internal data
};

// Helper function to remove sensitive data from file objects
function sanitizeFile(file: File): Partial<File> {
  return {
    id: file.id,
    name: file.name,
    size: file.size,
    lastModified: file.lastModified,
    type: file.type,
    folder: file.folder
  };
}

export const getFilesFromFolder = (folderId: string, ownerId: string) => {
  if (!folderId || typeof folderId !== 'string') {
    throw new ValidationError('Valid folder ID is required');
  }
  
  if (!ownerId || typeof ownerId !== 'string') {
    throw new ValidationError('Valid owner ID is required');
  }
  
  const folder = db.data.folders.find((f: Folder) => f.id === folderId);
  if (!folder) {
    throw new NotFoundError('Folder not found');
  }
  
  // Check if user has access to the folder
  if (!canAccess(folder, ownerId)) {
    throw new AuthorizationError('Access denied to folder');
  }
  
  return db.data.files
    .filter((f: File) => f.folder === folder.id && canAccess(f, ownerId))
    .map(sanitizeFile);
};

export async function deletefiles(fileIds: string[], userId: string) {
  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    throw new ValidationError('Valid file IDs array is required');
  }
  
  if (!userId || typeof userId !== 'string') {
    throw new ValidationError('Valid user ID is required');
  }
  
  await db.read();

  const filesToDelete: File[] = [];
  const errors: string[] = [];

  // Validate all files first before deleting any
  for (const fileId of fileIds) {
    if (!fileId || typeof fileId !== 'string') {
      errors.push(`Invalid file ID: ${fileId}`);
      continue;
    }
    
    const file = db.data.files.find((f) => f.id === fileId);
    if (!file) {
      errors.push(`File not found: ${fileId}`);
      continue;
    }

    if (!canDelete(file, userId)) {
      errors.push(`Access denied to delete: ${file.name}`);
      continue;
    }
    
    filesToDelete.push(file);
  }
  
  if (errors.length > 0) {
    throw new AuthorizationError(`Delete operation failed: ${errors.join(', ')}`);
  }

  // Delete files from filesystem and database
  for (const file of filesToDelete) {
    try {
      const safeFilePath = getSafeFilePath(file.id);
      
      // Check if file exists before trying to delete
      if (await fs.pathExists(safeFilePath)) {
        await fs.remove(safeFilePath);
      }
      
      logger.info(`File deleted: ${file.name} by user ${userId}`);
    } catch (error) {
      logger.error(`Failed to delete file ${file.name}: ${error}`);
      throw new Error(`Failed to delete file: ${file.name}`);
    }

    // Remove from database
    db.data.files = db.data.files.filter((f) => f.id !== file.id);
  }

  await db.write();
}

export async function deleteFilesFromFolder(folderId: string, userId: string) {
  if (!folderId || typeof folderId !== 'string') {
    throw new ValidationError('Valid folder ID is required');
  }
  
  if (!userId || typeof userId !== 'string') {
    throw new ValidationError('Valid user ID is required');
  }
  
  await db.read();

  const files = db.data.files.filter((f) => f.folder === folderId);

  if (!files || files.length === 0) {
    return;
  }

  // Extract file IDs and use the secure delete function
  const fileIds = files.map(f => f.id);
  await deletefiles(fileIds, userId);
}

export async function share(
  entity: File | Folder,
  userIds: string[],
  access: Access
) {
  if (!entity || !entity.id || !entity.type) {
    throw new ValidationError('Valid entity is required');
  }
  
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new ValidationError('Valid user IDs array is required');
  }
  
  if (!access || !['read', 'write'].includes(access)) {
    throw new ValidationError('Access must be "read" or "write"');
  }
  
  await db.read();
  const collection = entity.type === "file" ? db.data.files : db.data.folders;

  const item = collection.find((i) => i.id === entity.id);
  if (!item) {
    throw new NotFoundError(`${entity.type} with id ${entity.id} not found`);
  }

  // Validate all user IDs exist
  for (const userId of userIds) {
    if (!userId || typeof userId !== 'string') {
      throw new ValidationError(`Invalid user ID: ${userId}`);
    }
    
    const userExists = db.data.users.find(u => u.id === userId);
    if (!userExists) {
      throw new NotFoundError(`User not found: ${userId}`);
    }
  }

  userIds.forEach((userId) => {
    // Only update if user doesn't already have equal or higher permissions
    const currentAccess = item.permissions[userId];
    if (currentAccess === 'write') {
      return; // Write access is higher than read, don't downgrade
    }
    if (currentAccess === 'read' && access === 'read') {
      return; // Same level, no change needed
    }
    
    item.permissions[userId] = access;
    logger.info(`Shared ${entity.type} ${entity.id} with user ${userId} (${access} access)`);
  });

  await db.write();
}

export function canAccess(entity: File | Folder, userId: string): boolean {
  if (!entity || !userId) {
    return false;
  }
  
  return (
    entity.owner === userId ||
    entity.permissions[userId] === "write" ||
    entity.permissions[userId] === "read"
  );
}

export function canModify(entity: File | Folder, userId: string): boolean {
  if (!entity || !userId) {
    return false;
  }
  
  return entity.owner === userId || entity.permissions[userId] === "write";
}

export function canDelete(entity: File | Folder, userId: string): boolean {
  if (!entity || !userId) {
    return false;
  }
  
  return entity.owner === userId || entity.permissions[userId] === "write";
}
