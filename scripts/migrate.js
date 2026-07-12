import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { listLocalDatabases } from '@prisma/adapter-d1';

const message = process.argv[2];
if (!message) {
  console.error('Please provide a migration name. Example: npm db:migrate:create add_users');
  process.exit(1);
}

const DB_BINDING = 'DB'; 
const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');
const TEMP_SCHEMA_PATH = path.join(process.cwd(), 'prisma', 'temp_local_schema.prisma');

try {
  // 1. Ensure the root migrations directory exists
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
  }

  // 2. Locate the local D1 SQLite file using the official Prisma utility
  const localDbs = await listLocalDatabases({
    wranglerConfigPath: path.join(process.cwd(), 'wrangler.toml'),
  });

  // Find the database matching our binding or name
  const targetDb = localDbs.find(db => db.binding === DB_BINDING || db.name === DB_BINDING) || localDbs[0];

  let fromFlag = '--from-empty';

  if (targetDb && fs.existsSync(targetDb.path)) {
    // 3. Create a temporary schema file pointing directly to Wrangler's SQLite file
    const tempSchemaContent = `
datasource db {
  provider = "sqlite"
  url      = "file:${targetDb.path.replace(/\\/g, '/')}"
}
    `.trim();
    
    fs.writeFileSync(TEMP_SCHEMA_PATH, tempSchemaContent);
    fromFlag = `--from-schema ${TEMP_SCHEMA_PATH}`;
  } else {
    console.log('No local D1 database file found yet. Diffing from an empty state...');
  }

  // 4. Create the blank migration file inside ./migrations
  console.log(`Creating migration schema for: "${message}"...`);
  execSync(`npx wrangler d1 migrations create ${DB_BINDING} "${message}" --env production`, { stdio: 'inherit' });

  // 5. Find the freshest .sql file generated in ./migrations
  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql'));
  if (files.length === 0) {
    throw new Error('No migration files found in ./migrations after running wrangler.');
  }
  
  const latestFile = files.sort().pop();
  const filePath = path.join(MIGRATIONS_DIR, latestFile);

  // 6. Generate the schema diff from Prisma and append it directly
  console.log(`Appending Prisma schema diff into: ./migrations/${latestFile}`);
  execSync(`npx prisma migrate diff ${fromFlag} --to-schema ./prisma/schema.prisma --script >> "${filePath}"`, { stdio: 'inherit' });

  console.log('✅ Migration generated and synced successfully inside ./migrations!');
} catch (error) {
  console.error('❌ Migration generation failed:', error.message);
  process.exit(1);
} finally {
  // Clean up the temporary schema if it was created
  if (fs.existsSync(TEMP_SCHEMA_PATH)) {
    fs.unlinkSync(TEMP_SCHEMA_PATH);
  }
}