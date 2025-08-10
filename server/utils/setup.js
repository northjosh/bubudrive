import * as fs from  "fs"
import * as crypto from "crypto"

const jwtSecret = crypto.randomBytes(64).toString("hex");


const envPath = ".env";
if (!fs.existsSync(envPath)) {
  const envContent = `JWT_SECRET=${jwtSecret}\n`;
  fs.writeFileSync(envPath, envContent);
  console.log(" Created .env.local file with JWT_SECRET");
} else {
  console.log(".env file already exists");
}


const dbPath = "db.json";
if (!fs.existsSync(dbPath)) {
  const dbContent = {
    folders: [],
    users: [],
    sharedFolders: [],
    files: [],
  };
  fs.writeFileSync(dbPath, JSON.stringify(dbContent, null, 2));
  console.log("Created db.json with initial data");
} else {
  console.log(" db.json already exists");
}

console.log(" Setup complete! You can now start your server.");
