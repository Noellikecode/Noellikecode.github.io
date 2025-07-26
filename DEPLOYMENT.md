# Deployment Guide for Speech Access Map

## Quick Start
Your application is built and ready to deploy! The `build/` folder contains:
- `build/public/` - Frontend static files
- `build/server.js` - Backend server

## Platform Options

### 1. Vercel (Recommended for simplicity)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```
- Automatic HTTPS
- Global CDN
- Easy custom domains
- **Setup**: Add DATABASE_URL in Vercel dashboard

### 2. Railway (Great for full-stack apps)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```
- Automatic PostgreSQL database
- Built-in monitoring
- **Setup**: Database created automatically

### 3. Render (Free tier available)
```bash
# Connect your GitHub repo to Render
# Use the render.yaml configuration
```
- Free PostgreSQL database
- Automatic SSL
- **Setup**: Connect GitHub repo in Render dashboard

### 4. Fly.io (Global edge deployment)
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
fly deploy
```
- Global edge locations
- Built-in load balancing
- **Setup**: Add PostgreSQL via `fly postgres create`

### 5. DigitalOcean App Platform
```bash
# Connect GitHub repo in DO dashboard
# Use railway.toml settings
```
- Managed databases
- Auto-scaling
- **Setup**: Create app in DO dashboard

### 6. Docker Deployment (Any cloud)
```bash
# Build image
docker build -t speech-access-map .

# Run locally
docker run -p 8080:8080 -e DATABASE_URL="your_db_url" speech-access-map
```

## Database Setup
You'll need a PostgreSQL database. Most platforms offer managed databases:

**Connection String Format:**
```
postgresql://username:password@host:port/database_name
```

**Required Environment Variables:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `NODE_ENV=production`

## Custom Domain
Most platforms support custom domains for the National Stuttering Association website:
1. Add your domain in the platform dashboard
2. Update your DNS to point to the platform's servers
3. SSL certificates are usually automatic

## Performance Notes
- App includes 5,950 authentic speech therapy centers
- Optimized for low-processor devices
- Built-in caching and performance optimizations
- Conservative AI insights with proper disclaimers

## Support
Choose the platform that best fits your needs. Railway and Vercel are the easiest to get started with.