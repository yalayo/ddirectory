# D Directory - Cloudflare Deployment Guide

This guide walks you through deploying D Directory to Cloudflare Workers with D2 database support.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Cloudflare API Token**: Create one in your Cloudflare dashboard

## Step 1: Setup Cloudflare D2 Database

1. **Install Wrangler** (if not already installed):
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Create D2 Database**:
   ```bash
   wrangler d2 create d-directory-db
   ```
   
   This will output a database ID. Copy this ID and update `wrangler.toml`:
   ```toml
   [[d2_databases]]
   binding = "DB"
   database_name = "d-directory-db"
   database_id = "YOUR_DATABASE_ID_HERE"
   ```

4. **Deploy Database Schema**:
   ```bash
   wrangler d2 execute d-directory-db --file=./migrations/001_initial_schema.sql
   ```

## Step 2: Configure Environment Variables

1. **Set Cloudflare Secrets**:
   ```bash
   # Set session secret
   wrangler secret put SESSION_SECRET
   # Enter a secure random string when prompted
   
   # Set any other required secrets
   wrangler secret put OTHER_SECRET_NAME
   ```

2. **Update wrangler.toml** with your database ID from Step 1.

## Step 3: Build for Production

1. **Build the application**:
   ```bash
   npm run build
   ```
   
   This creates:
   - `dist/static/` - Frontend build
   - `dist/worker/index.js` - Cloudflare Worker

## Step 4: Deploy to Cloudflare

1. **Deploy using Wrangler**:
   ```bash
   npm run deploy
   # or
   wrangler deploy
   ```

2. **Your app will be available** at:
   ```
   https://d-directory.your-subdomain.workers.dev
   ```

## Step 5: GitHub Actions Automation (Optional)

The repository includes a GitHub Actions workflow for automated deployment:

1. **Add GitHub Secrets**:
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Add secret: `CLOUDFLARE_API_TOKEN`

2. **The workflow will automatically**:
   - Build the application
   - Deploy the D2 schema
   - Deploy to Cloudflare Workers
   - Trigger on pushes to `main` branch

## Step 6: Custom Domain (Optional)

1. **Add custom domain** in Cloudflare dashboard:
   - Workers & Pages → d-directory → Settings → Triggers
   - Add custom domain

2. **Configure DNS** to point to your Workers domain.

## Architecture Overview

### Cloudflare Workers Runtime
- **Entry Point**: `server/cloudflare-index.ts`
- **Routes**: `server/cloudflare-routes.ts`
- **Database**: Cloudflare D2 via `server/d2-storage.ts`

### Database Layer
- **D2 Storage**: Full SQL database with relationships
- **Migration Scripts**: Automated schema deployment
- **Type Safety**: TypeScript interfaces for all entities

### Frontend Assets
- **Static Files**: Served from Cloudflare Workers
- **SPA Routing**: Client-side routing with fallback

## Development vs Production

### Development (Current)
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL or in-memory storage
- **Port**: localhost:5000

### Production (Cloudflare)
- **Runtime**: Cloudflare Workers (V8 isolates)
- **Database**: Cloudflare D2 (SQLite-compatible)
- **Domain**: your-app.workers.dev

## Troubleshooting

### Common Issues

1. **Database ID Error**:
   - Ensure `database_id` in `wrangler.toml` matches your D2 database
   - Run `wrangler d2 list` to see your databases

2. **Build Errors**:
   - Check Node.js version (requires 18+)
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

3. **Authentication Issues**:
   - Verify `SESSION_SECRET` is set: `wrangler secret list`
   - Check CORS settings in production

4. **Database Connection**:
   - Verify D2 database exists: `wrangler d2 list`
   - Check migration status: `wrangler d2 execute d-directory-db --command="SELECT name FROM sqlite_master WHERE type='table';"`

### Logs and Debugging

1. **View Worker Logs**:
   ```bash
   wrangler tail
   ```

2. **Test Database Connection**:
   ```bash
   wrangler d2 execute d-directory-db --command="SELECT COUNT(*) FROM contractors;"
   ```

3. **Local Development with D2**:
   ```bash
   wrangler dev --local --persist
   ```

## Cost Estimation

### Cloudflare Workers
- **Free Tier**: 100,000 requests/day
- **Paid Plan**: $5/month for 10M requests

### Cloudflare D2
- **Free Tier**: 5GB storage, 25M row reads/month
- **Paid Plan**: $0.75/GB storage, $1/1M reads

### Expected Usage
- **Small Business Directory**: Likely within free tiers
- **Growing Platform**: ~$10-20/month estimated

## Support

For deployment issues:
1. Check Cloudflare Workers documentation
2. Review Wrangler CLI documentation
3. Check project issues on GitHub

## Security Considerations

1. **Environment Variables**: Never commit secrets to repository
2. **API Keys**: Use Cloudflare's secret management
3. **CORS**: Configure properly for production domain
4. **Rate Limiting**: Consider implementing for API endpoints

---

## Quick Deploy Commands

```bash
# Full deployment from scratch
npm install
wrangler login
wrangler d2 create d-directory-db
# Update wrangler.toml with database ID
wrangler d2 execute d-directory-db --file=./migrations/001_initial_schema.sql
wrangler secret put SESSION_SECRET
npm run build
wrangler deploy
```