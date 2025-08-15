# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

Bubudrive is a secure file storage system with a **monorepo architecture** using pnpm workspaces:

- **client/**: Preact-based frontend with TypeScript, Vite, TanStack Router, and tRPC
- **server/**: Express backend with TypeScript, tRPC, and JSON file database
- **shared/**: Common type definitions used by both client and server

### Key Technologies
- **Frontend**: Preact, TanStack Query/Router, Tailwind CSS, Radix UI
- **Backend**: Express, tRPC, lowdb (JSON database), JWT authentication
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Storage**: Local filesystem with multer for uploads
- **Type Safety**: Zod schemas for validation across client/server boundary

### Authentication Architecture
- JWT tokens stored in localStorage on client
- `protectedProcedure` middleware on server for authenticated routes
- User context automatically provided to protected procedures via `ctx.user`
- All file/folder operations require authentication and enforce user ownership

### Database Structure
Uses lowdb with `db.json` containing:
- **users**: id, username, hashed password
- **folders**: id, name, owner, path, permissions
- **files**: id, name, size, owner, folder reference, lastModified, permissions

### tRPC Router Organization
Main procedures in `server/trpc.ts`:
- **Auth**: signup, login
- **Folders**: getAllFolders, getFolder, createFolder, deleteFolder, shareFolder
- **Files**: getAllFiles, getFilesFromFolder, shareFile, deleteFiles
- **Users**: searchUsers, getUserById, fetchUsers

## Development Commands

### Setup
```bash
# Install all workspace dependencies
pnpm install

# Setup server environment (creates .env and db.json)
cd server && pnpm run setup
```

### Development
```bash
# Start both client and server in development
pnpm dev  # Starts server dev mode
# In separate terminal:
cd client && pnpm dev
```

### Build & Production
```bash
# Build client
pnpm run build:client  # or cd client && pnpm build

# Build server  
pnpm run build:server  # or cd server && pnpm build

# Build both
pnpm run build

# Start production server
pnpm start  # or cd server && pnpm start
```

### Development Ports
- **Client**: http://localhost:5173 (Vite dev server)
- **Server**: http://localhost:9000 (Express server)
- **tRPC endpoint**: http://localhost:9000/trpc

### Linting & Type Checking
```bash
# Client
cd client && pnpm lint      # Run ESLint
cd client && pnpm format    # Run Prettier
cd client && pnpm typecheck # TypeScript checking

# Server  
cd server && pnpm lint      # Run ESLint
cd server && pnpm format    # Run Prettier
cd server && pnpm typecheck # TypeScript checking
```

## Important Implementation Details

### File Upload Flow
1. Client uploads via `/files` Express endpoint (not tRPC due to multipart/form-data)
2. Multer processes files and stores in `uploads/` directory
3. File metadata saved to database with user ownership
4. Files associated with folders via folder ID

### User Isolation
- All database queries filter by user ID from JWT context
- Users can only access their own files/folders plus shared resources
- Sharing system uses permissions object on files/folders

### Type Safety
- Shared types in `shared/types.ts` used by both client and server
- Zod schemas in `server/types/auth.type.ts` for validation
- tRPC provides end-to-end type safety from server to client

### Routing
- Client uses TanStack Router with file-based routing in `src/routes/`
- Protected routes check for authentication via `useAuth` hook
- Route tree generated automatically in `routeTree.gen.ts`

### Component Organization
- **UI Components**: `src/components/ui/` - Radix-based design system components
- **Dialogs**: `src/components/dialogs/` - Modal dialogs for actions (create, delete, share)
- **Hooks**: `src/hooks/` - Custom hooks including `useAuth`, `useFile`, `use-context-menu`
- **Utils**: Utility functions in `src/utils/` and `src/lib/`

### Error Handling
- tRPC procedures throw `TRPCError` with specific codes (UNAUTHORIZED, NOT_FOUND, CONFLICT)
- Client-side errors handled via TanStack Query error states
- Server logging via Winston in `utils/logger.ts`

### Testing
```bash
# Client
cd client && pnpm test          # Run tests
cd client && pnpm test:ui       # Run tests with UI
cd client && pnpm test:coverage # Run with coverage

# Server
cd server && pnpm test          # Run tests  
cd server && pnpm test:coverage # Run with coverage
```

## Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure httpOnly cookies (not localStorage)
- **Password Hashing**: bcrypt with 12 salt rounds
- **Input Validation**: Comprehensive Zod schemas for all inputs
- **Environment Validation**: Required secrets validation at startup
- **User Isolation**: Strict ownership and permission checks

### File Security
- **File Type Validation**: Whitelist of allowed MIME types and extensions
- **File Size Limits**: 10MB maximum per file, 10 files per upload
- **Path Traversal Protection**: Sanitized filenames and safe path handling
- **Access Control**: Owner and permission-based file access
- **Secure Headers**: Content-Type and X-Content-Type-Options set properly

### Database Security
- **Input Sanitization**: All database queries use validated inputs
- **Error Handling**: Centralized error system with proper HTTP codes
- **Data Minimization**: Password hashes never returned in API responses
- **Automated Backups**: Daily database backups in production