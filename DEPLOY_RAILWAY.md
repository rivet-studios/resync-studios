# Deploying to Railway.com

## Prerequisites
- GitHub account with your code pushed (using the GitHub integration)
- Discord OAuth credentials (Client ID & Secret)
- PostgreSQL database URL or Railway's built-in Postgres

## Step-by-Step Deployment

### 1. Create a New Project on Railway
1. Go to **railway.app** → Sign in with GitHub
2. Click **Create New Project**
3. Select **Deploy from GitHub repo**
4. Choose your repository
5. Railway will auto-detect Node.js and start deployment

### 2. Configure Build & Start Commands
In Railway project settings:
- **Build Command:** `npm run build`
- **Start Command:** `npm run start`

### 3. Add Environment Variables
Click **Variables** tab and add all of these:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/dbname
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
SESSION_SECRET=generate-a-random-string-here
DISCORD_CALLBACK_URL=https://your-railway-url.up.railway.app/auth/discord/callback
```

**To generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Set Up PostgreSQL Database
Option A (Recommended): Use Neon (free tier)
- Go to **neon.tech** → Sign up
- Create a new project → Copy connection string
- Paste as `DATABASE_URL` in Railway variables

Option B: Use Railway's Built-in PostgreSQL
1. In Railway project, click **Add Service** → **PostgreSQL**
2. Railway auto-generates `DATABASE_URL` variable
3. Verify it appears in your variables

### 5. Update Discord OAuth Redirect URI
1. Go to Discord Developer Portal → Your App
2. Under **OAuth2** → **Redirects**, add:
   ```
   https://your-railway-url.up.railway.app/auth/discord/callback
   ```
   Replace `your-railway-url` with your actual Railway URL (shown in Railway dashboard)

### 6. Deploy
- Railway auto-deploys when you push to GitHub
- Watch deployment progress in Railway dashboard
- Once "Deployment Successful", visit your URL

### Finding Your Railway URL
- In Railway dashboard, click on your Web Service
- Look for the **Public URL** in the **Deployments** tab
- Format is usually: `https://projectname-production-xxxx.up.railway.app`

### Troubleshooting
- **Build fails:** Check build logs in Railway dashboard
- **"Not Found" errors:** Verify `npm run build` completed (check `dist` folder in logs)
- **500 errors:** Verify `DATABASE_URL` environment variable is set correctly
- **Discord login fails:** Verify `DISCORD_CALLBACK_URL` matches Discord settings exactly
- **Port issues:** Railway auto-assigns PORT env var - make sure your app uses `process.env.PORT` (it does)

---

**Your live app will be at:** `https://projectname-production-xxxx.up.railway.app`
