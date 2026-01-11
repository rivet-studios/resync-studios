# RIVET Studios - Ready to Deploy

Your GitHub repo is created and ready: **https://github.com/sharkyowlskv-lab/resync-studios**

---

## STEP 1: Push Code to GitHub

Run these commands in order:

```bash
cd /home/runner/workspace
git remote remove origin
git remote add origin https://github.com/sharkyowlskv-lab/resync-studios.git
git branch -M main
git push -u origin main
```

After these commands complete, your code will be on GitHub.

---

## STEP 2: Prepare Your Credentials

Before deploying, you need:

### Discord OAuth Credentials
Go to **Discord Developer Portal** (discord.com/developers/applications)
- Find your application
- Copy: **Client ID**
- Copy: **Client Secret**

### Generate Session Secret
Run this once and copy the result:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### PostgreSQL Database
Choose ONE option:

**Option A: Use Neon (Free, Recommended)**
1. Go to **neon.tech**
2. Sign up with GitHub
3. Create a new project
4. Copy the connection string (looks like: `postgresql://user:password@host/database`)

**Option B: Platform-provided Postgres**
- Render and Railway both offer free PostgreSQL
- Set up during deployment (see below)

---

## STEP 3: Deploy to Render.com

1. Go to **render.com**
2. Click **New** → **Web Service**
3. Select **Connect a repository** → Choose `resync-studios`
4. Fill in:
   - **Name:** `resync-studios`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start`

5. Go to **Environment** tab and add these variables:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=[PASTE YOUR POSTGRESQL URL HERE]
DISCORD_CLIENT_ID=[PASTE YOUR DISCORD CLIENT ID HERE]
DISCORD_CLIENT_SECRET=[PASTE YOUR DISCORD CLIENT SECRET HERE]
SESSION_SECRET=[PASTE YOUR GENERATED SESSION SECRET HERE]
DISCORD_CALLBACK_URL=https://resync-studios.onrender.com/auth/discord/callback
```

6. Click **Deploy**

7. After deployment succeeds, go to Discord Developer Portal:
   - Go to your app's **OAuth2** settings
   - Click **Add Redirect**
   - Add: `https://resync-studios.onrender.com/auth/discord/callback`
   - Save

8. Visit your app: `https://resync-studios.onrender.com`

---

## STEP 4: Deploy to Railway.com (Alternative)

1. Go to **railway.app**
2. Click **New Project** → **Deploy from GitHub repo**
3. Select `resync-studios`

4. Railway will start building. While it builds:
   - Click **Add Service** → **PostgreSQL** (creates free database)
   - Railway auto-generates `DATABASE_URL`

5. Go to **Variables** tab and add:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=[Railway will auto-fill this if you added PostgreSQL]
DISCORD_CLIENT_ID=[PASTE YOUR DISCORD CLIENT ID HERE]
DISCORD_CLIENT_SECRET=[PASTE YOUR DISCORD CLIENT SECRET HERE]
SESSION_SECRET=[PASTE YOUR GENERATED SESSION SECRET HERE]
DISCORD_CALLBACK_URL=https://[YOUR-RAILWAY-URL].up.railway.app/auth/discord/callback
```

(Replace `[YOUR-RAILWAY-URL]` with the URL shown in Railway dashboard)

6. After deployment, go to Discord Developer Portal:
   - Go to your app's **OAuth2** settings
   - Click **Add Redirect**
   - Add your Railway callback URL
   - Save

7. Visit your app at the Railway URL shown in dashboard

---

## TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Build fails | Check logs in platform dashboard - usually missing DATABASE_URL |
| "Not Found" page | Verify build completed - check logs for `dist` folder |
| Discord login fails | Verify callback URL matches exactly in Discord settings |
| 500 errors | Check DATABASE_URL is correct and database is accessible |
| Can't connect to database | Test connection string format: `postgresql://user:password@host:5432/database` |

---

## WHAT YOU NEED TO FILL IN

Before deploying, you need these 4 things:

1. **DATABASE_URL** - From Neon or platform
   - Format: `postgresql://user:password@host:5432/database`

2. **DISCORD_CLIENT_ID** - From Discord Developer Portal
   - 18 digits like: `1428644505317412884`

3. **DISCORD_CLIENT_SECRET** - From Discord Developer Portal
   - Long string of characters

4. **SESSION_SECRET** - Generated with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

Once you have these 4 items, paste them into your platform's environment variables and deploy!

---

## VERIFICATION CHECKLIST

After deployment:
- [ ] App loads at your URL
- [ ] See Discord login page
- [ ] Click Discord login button (may ask for permissions)
- [ ] Redirects back to app after login
- [ ] No errors in browser console

Done! Your RIVET Studios platform is live! 🚀
