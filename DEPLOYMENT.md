# Deployment Guide: Analog App on Cloudflare

This app supports dual-stack deployment: Node.js/Docker locally for development, and Cloudflare Pages/Workers for production.

## Architecture

### Local Development (Node.js + SQLite + Docker)
- **Runtime**: Node.js 22 in Docker
- **Database**: SQLite (local file: `prisma/dev.db`)
- **File Storage**: Local filesystem (`public/files/`)
- **Built with**: `vite build` → Nitro preset `node-server`

### Production (Cloudflare Workers + D1 + R2)
- **Runtime**: Cloudflare Pages Functions (Workers)
- **Database**: Cloudflare D1 (SQLite)
- **File Storage**: Cloudflare R2
- **Built with**: `vite build -c vite.cloudflare.config.ts` → Nitro preset `cloudflare_pages`

## Local Development Workflow

### Prerequisites
- Node.js >= 20.19.1
- Docker & Docker Compose
- `@prisma/adapter-better-sqlite3` (included in dependencies)

### Start Development Server

```bash
# Install dependencies
npm install

# Start Docker container with dev environment
docker compose up -d

# Access app at http://localhost:5173
```

### Database Operations (Local)

```bash
# Create a new migration
npx prisma migrate dev --name <migration_name>

# Seed database
npm run seed

# View database in Prisma Studio
npx prisma studio
```

### Stop Development

```bash
docker compose down
```

## Cloudflare Deployment Workflow

### Prerequisites
- Wrangler CLI: `npm install -g wrangler` (or use `npx wrangler`)
- Cloudflare account with Pages and Workers enabled
- D1 databases created in Cloudflare dashboard
- R2 bucket created for file uploads

### Configure Wrangler

Update `wrangler.jsonc`:
- Replace `example.com` with your actual domain
- Set correct `BETTER_AUTH_URL` and `VITE_AUTH_URL` for production
- Ensure D1 database names and R2 bucket names match your Cloudflare setup

### Build for Cloudflare

```bash
# Build app for Cloudflare Pages/Workers
npm run build:cf

# Output: dist/analog/ (ready for deployment)
```

### Test Cloudflare Build Locally

```bash
# Start Wrangler dev server (simulates Workers environment)
npm run dev:cf

# Access at http://localhost:8787
# D1 queries run against local D1 database (.wrangler/state/)
# R2 uploads write to local R2 mock
```

### Deploy to Cloudflare

```bash
# Build and deploy in one command
npm run cf:deploy

# Or manually:
npm run build:cf
wrangler deploy

# Migrations run automatically during deployment
# Check status at Cloudflare dashboard
```

### Post-Deployment

1. **Verify D1 Migration**
   ```bash
   wrangler d1 execute leadgen --remote --command "SELECT COUNT(*) FROM sqlite_master;"
   ```

2. **Test API Endpoints**
   - All `/api/*` routes should work with D1 backend
   - File uploads write to R2

3. **Monitor Logs**
   ```bash
   wrangler tail
   ```

## Environment Variables

### Local (Docker)
Defined in `.env`:
```
DATABASE_URL=file:./prisma/dev.db
BETTER_AUTH_URL=http://localhost:5173
VITE_AUTH_URL=http://localhost:5173
```

### Production (Cloudflare)
Defined in `wrangler.jsonc` under `[env.production]`:
```
BETTER_AUTH_URL=https://yourdomain.com
VITE_AUTH_URL=https://yourdomain.com
```

## Database Differences: D1 vs SQLite

### D1 Limitations (Production)
- ❌ No transactions (`$transaction` not supported)
- ❌ No lazy loading (use `.include()` for relations)
- ⚠️ Connection pooling limited by Workers execution time

### Best Practices for D1 Queries
```typescript
// ✅ DO: Eager load relations
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { sessions: true, accounts: true }
});

// ❌ DON'T: Lazy load relations (doesn't work in Workers)
const user = await prisma.user.findUnique({ where: { id: userId } });
const sessions = await user.sessions(); // Error in Workers!
```

## File Upload Handling

### Local Upload
- Files saved to `public/files/`
- Accessible at `http://localhost:5173/files/{filename}`

### Cloudflare R2 Upload
- Files uploaded to R2 bucket
- Accessible via R2 public URL (configure in Cloudflare dashboard)
- URL pattern: `https://r2.yourdomain.com/r2/{filename}`

The `file-upload.ts` utility automatically detects the runtime and uses the appropriate storage backend.

## Troubleshooting

### Local Development
**Issue**: `PrismaClient needs adapter-better-sqlite3`
- Solution: Run `npm install` to install dependencies

**Issue**: Port 5173 already in use
- Solution: Change port in `vite.config.ts` or kill process on port 5173

### Cloudflare Deployment
**Issue**: `D1 not found` error
- Solution: Verify D1 database name in `wrangler.jsonc` matches Cloudflare dashboard

**Issue**: R2 upload fails
- Solution: Ensure R2 bucket is configured in `wrangler.jsonc` with correct binding name

**Issue**: Auth sessions not persisting
- Solution: Verify D1 schema includes required tables; check `prisma/schema.prisma`

## Scaling Considerations

### D1 Limits
- Free tier: 5GB storage, 100K read units/day
- Pro tier: Unlimited storage, pay-per-use

### R2 Limits
- Free tier: 10GB/month egress, first 10GB uploads free
- Pay-per-use beyond free tier

### Query Optimization
- Minimize queries per request (batch queries when possible)
- Use database indexes for frequently queried fields
- Avoid N+1 queries (use `.include()` strategically)

## Support

For issues with:
- **Analog/Angular**: [Analog Docs](https://analogjs.org)
- **Cloudflare Workers**: [Workers Docs](https://developers.cloudflare.com/workers/)
- **D1**: [D1 Docs](https://developers.cloudflare.com/d1/)
- **R2**: [R2 Docs](https://developers.cloudflare.com/r2/)
