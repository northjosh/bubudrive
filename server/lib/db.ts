import { User } from "./auth";
import { Folder } from "./folder";
import { File } from "./file";
import { Low } from 'lowdb'
import  {JSONFile}  from 'lowdb/node'
import fs from 'fs'
import path from 'path'
import { getConfig, validateEnv } from '../config/env'


validateEnv();


export const defaultData = {
  folders: [] as Folder[],
  users: [] as User[],
  files: [] as File[],
  version: '1.0.0', // Add versioning for future migrations
  createdAt: Date.now(),
  lastBackup: null as number | null,
};

export type Database = typeof defaultData;

class SecureDatabase {
  private db: Low<Database>;
  private backupInterval: NodeJS.Timeout | null = null;
  private readonly BACKUP_INTERVAL = 24 * 60 * 60 * 1000; 
  
  constructor() {
    const config = getConfig();
    const dbFile = path.resolve(config.DATABASE_FILE);

    const dbDir = path.dirname(dbFile);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    const adapter = new JSONFile<Database>(dbFile);
    this.db = new Low(adapter, defaultData);
    
    this.setupBackupSchedule();
  }
  
  async init(): Promise<void> {
    try {
      await this.db.read();
      
      if (!this.db.data) {
        this.db.data = { ...defaultData };
        await this.db.write();
      }
 
      if (!this.db.data.version) {
        this.db.data.version = '1.0.0';
      }
      
      if (!this.db.data.createdAt) {
        this.db.data.createdAt = Date.now();
      }
      
      if (!this.db.data.folders) {
        this.db.data.folders = [];
      }
      
      if (!this.db.data.users) {
        this.db.data.users = [];
      }
      
      if (!this.db.data.files) {
        this.db.data.files = [];
      }
      
      await this.db.write();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error('Database initialization failed');
    }
  }
  
  get data(): Database {
    if (!this.db.data) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db.data;
  }
  
  async read(): Promise<void> {
    try {
      await this.db.read();
    } catch (error) {
      console.error('Database read error:', error);
      throw new Error('Failed to read database');
    }
  }
  
  async write(): Promise<void> {
    try {
      await this.db.write();
    } catch (error) {
      console.error('Database write error:', error);
      throw new Error('Failed to write database');
    }
  }
  
  async backup(): Promise<void> {
    try {
      const config = getConfig();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.resolve(`${config.DATABASE_FILE}.backup.${timestamp}`);
      
      fs.copyFile(path.resolve(config.DATABASE_FILE), backupFile, () =>{  console.log(`Database backup created: ${backupFile}`);});
      
      this.db.data!.lastBackup = Date.now();
      await this.db.write();
      
      console.log(`Database backup created: ${backupFile}`);
    } catch (error) {
      console.error('Database backup failed:', error);
    }
  }
  
  private setupBackupSchedule(): void {
    if (getConfig().NODE_ENV === 'production') {
      this.backupInterval = setInterval(() => {
        this.backup().catch(console.error);
      }, this.BACKUP_INTERVAL);
    }
  }
  
  async cleanup(): Promise<void> {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }
  }
  

  findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }
  
  findUserByUsername(username: string): User | undefined {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }
  
  findFileById(id: string): File | undefined {
    return this.data.files.find(f => f.id === id);
  }
  
  findFolderById(id: string): Folder | undefined {
    return this.data.folders.find(f => f.id === id);
  }
  
  getFilesByOwner(ownerId: string): File[] {
    return this.data.files.filter(f => f.owner === ownerId);
  }
  
  getFoldersByOwner(ownerId: string): Folder[] {
    return this.data.folders.filter(f => f.owner === ownerId);
  }
}

// Export singleton instance
export const db = new SecureDatabase();

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('Gracefully shutting down database...');
  await db.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Gracefully shutting down database...');
  await db.cleanup();
  process.exit(0);
});
