const fs = require("fs");
const file = "wrangler.json";
const rawData = fs.readFileSync(file, "utf8");

// Strip comments to safely parse JSONC
// const cleanJson = rawData.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "$1");
// Using JSON
const config = JSON.parse(rawData);

// Inject the new Database ID from the step environment
config.env.production.d1_databases[0].database_id = 'process.env.DB_ID';
config.env.production.d1_databases[0].database_name = 'process.env.PAGES_PROJECT_NAME';

config.env.production.r2_buckets[0].bucket_name = 'process.env.PAGES_PROJECT_NAME';

// Inject the missing production secrets/vars
config.env.production.vars.BETTER_AUTH_SECRET = 'process.env.BETTER_AUTH_SECRET';
config.env.production.vars.BETTER_AUTH_URL = 'process.env.BETTER_AUTH_URL';
config.env.production.vars.STRIPE_SECRET_KEY = 'process.env.STRIPE_SECRET_KEY';
config.env.production.vars.STRIPE_PRICE_ID = 'process.env.STRIPE_PRICE_ID';
config.env.production.vars.STRIPE_WEBHOOK_SECRET = 'process.env.STRIPE_WEBHOOK_SECRET';

// Write back standard clean JSON
fs.writeFileSync(file, JSON.stringify(config, null, 2), "utf8");
console.log("wrangler.json successfully updated.");