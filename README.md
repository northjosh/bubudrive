# Bubudrive - File Storage System

A secure file storage system with user authentication, built with React, tRPC, and Express.

## Features

- 🔐 **User Authentication**: Sign up, login, and logout functionality
- 📁 **File Management**: Upload, download, and organize files
- 📂 **Folder Management**: Create and manage folders
- 🔒 **Secure**: JWT-based authentication with bcrypt password hashing
- 👤 **User Isolation**: Each user can only access their own files and folders

## Quick Start

### 1. Install Dependencies

```bash
# Install workspace dependencies
pnpm install

# Install server dependencies
cd server && pnpm install

# Install client dependencies
cd ../client && pnpm install
```

### 2. Setup Environment

```bash
cd server
pnpm run setup
```

This will create:

- `.env` file with a secure JWT secret
- `db.json` file with initial database structure

### 3. Start the Development Servers

```bash
# Terminal 1: Start the server
cd server && pnpm dev

# Terminal 2: Start the client
cd client && pnpm dev
```

The application will be available at:

- **Client**: http://localhost:5173
- **Server**: http://localhost:9000

## Authentication Flow

### 1. **Sign Up**

- Navigate to `/login`
- Click "Don't have an account? Sign up"
- Enter username and password
- Account is created and you're automatically logged in

### 2. **Login**

- Navigate to `/login`
- Enter your username and password
- JWT token is stored in localStorage
- You're redirected to the main dashboard

### 3. **Protected Routes**

- All file/folder operations require authentication
- JWT token is automatically sent with each request
- Unauthenticated users are redirected to login

### 4. **Logout**

- Click the logout button in the top navigation
- Token is removed from localStorage
- You're redirected to login

## API Endpoints

### Public Endpoints

- `POST /trpc/signup` - Create a new account
- `POST /trpc/login` - Authenticate user

### Protected Endpoints (require authentication)

- `GET /trpc/getAllFolders` - Get user's folders
- `POST /trpc/createFolder` - Create a new folder
- `DELETE /trpc/deleteFolder` - Delete a folder
- `GET /trpc/getFilesFromFolder` - Get files in a folder
- `POST /files` - Upload files to a folder
- `GET /:folder/:file` - Download a file

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **User Isolation**: Users can only access their own data
- **Input Validation**: Zod schema validation
- **CORS Protection**: Configured for local development

## Database Structure

The system uses a simple JSON database (`db.json`) with the following structure:

```json
{
  "users": [
    {
      "id": "uuid",
      "username": "string",
      "password": "hashed-string"
    }
  ],
  "folders": [
    {
      "id": "uuid",
      "name": "string",
      "owner": "user-id",
      "path": "string"
    }
  ],
  "files": [
    {
      "id": "uuid",
      "name": "string",
      "size": "number",
      "owner": "user-id",
      "folder": "folder-object",
      "lastModified": "timestamp"
    }
  ]
}
```

## Development

### Adding New Protected Routes

1. Use the `protectedProcedure` in your tRPC router
2. Access user context via `ctx.user`
3. Always validate user ownership of resources

### File Upload

Files are stored in the `uploads/` directory and referenced in the database. The system supports:

- Multiple file uploads
- File size tracking
- Owner association
- Folder organization

## Production Considerations

- Replace the JSON database with a proper database (PostgreSQL, MongoDB)
- Use environment variables for all secrets
- Implement proper file storage (AWS S3, Google Cloud Storage)
- Add rate limiting and additional security measures
- Use HTTPS in production
- Implement proper error handling and logging
