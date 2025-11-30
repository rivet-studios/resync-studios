# Deploying to Render.com

## Prerequisites
- GitHub account with your code pushed (using the GitHub integration)
- Discord OAuth credentials (Client ID & Secret)
- PostgreSQL database URL (from Neon or Render's built-in Postgres)

## Step-by-Step Deployment

### 1. Create a New Web Service on Render
1. Go to **render.com** → Sign in with GitHub
2. Click **New** → **Web Service**
3. Select **Connect a repository** → Choose your repo
4. Configure:
   - **Name:** `resync-studios` (or your preferred name)
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start`
   - **Instance Type:** Free (starter)

### 2. Add Environment Variables
In Render dashboard, go to **Environment** section and add:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/dbname
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
SESSION_SECRET=generate-a-random-string-here
DISCORD_CALLBACK_URL=https://your-render-url.onrender.com/auth/discord/callback
```

**To generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Create PostgreSQL Database
Option A (Recommended): Use Neon (free tier)
- Go to **neon.tech** → Sign up
- Create a new project → Copy connection string
- Paste as `DATABASE_URL` in Render environment

Option B: Use Render's PostgreSQL
- In Render, create a new PostgreSQL database
- Copy the connection string to `DATABASE_URL`

### 4. Update Discord OAuth Redirect URI
1. Go to Discord Developer Portal → Your App
2. Under **OAuth2** → **Redirects**, add:
   ```
   https://your-render-url.onrender.com/auth/discord/callback
   ```
   Replace `your-render-url` with your actual Render URL

### 5. Deploy
- Render will automatically deploy when you push to GitHub
- Check deployment status in Render dashboard
- Once "Deploy Successful" appears, visit your URL

### Troubleshooting
- **Build fails:** Check logs in Render dashboard
- **500 errors:** Verify `DATABASE_URL` is correct and database is accessible
- **"Not Found" on home page:** Check that build completed and `dist` files exist
- **Discord login fails:** Verify `DISCORD_CALLBACK_URL` matches exactly in Discord settings

---

**Your live app will be at:** `https://resync-studios.onrender.com` (or your custom name)
