# Deployment Checklist

Use this checklist before deploying to Render or Railway.

## Code Preparation ✅
- [x] All code committed to GitHub
- [x] Build script works: `npm run build`
- [x] Production start works: `npm run start`
- [x] dist/ folder generated and contains:
  - [x] dist/index.cjs (server bundle)
  - [x] dist/public/index.html (React app)
  - [x] dist/public/assets/ (CSS & JS)

## Discord OAuth Setup ✅
- [ ] Have Discord Client ID
- [ ] Have Discord Client Secret
- [ ] Know your deployment URL from Render/Railway
- [ ] Add OAuth Redirect URL to Discord settings:
  ```
  https://your-deployed-app-url/auth/discord/callback
  ```

## Database Setup ✅
- [ ] Create PostgreSQL database (Neon or platform provider)
- [ ] Have DATABASE_URL connection string ready
- [ ] Format: `postgresql://user:password@host:5432/database`

## Environment Variables ✅
Before deploying, have ready:
- `NODE_ENV` = `production`
- `PORT` = `5000`
- `DATABASE_URL` = your connection string
- `DISCORD_CLIENT_ID` = from Discord Developer Portal
- `DISCORD_CLIENT_SECRET` = from Discord Developer Portal
- `SESSION_SECRET` = generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `DISCORD_CALLBACK_URL` = matches Discord OAuth settings

## Deployment Steps

### For Render.com:
1. Connect GitHub repo
2. Set Build: `npm run build`
3. Set Start: `npm run start`
4. Add all environment variables
5. Deploy → Wait for success

### For Railway.com:
1. Connect GitHub repo
2. Set Build: `npm run build`
3. Set Start: `npm run start`
4. Add PostgreSQL service (or use Neon)
5. Add all environment variables
6. Deploy → Watch for success

## Post-Deployment Testing

After deployment succeeds:
- [ ] Visit your live URL
- [ ] See Discord login page load
- [ ] Try Discord login flow
- [ ] Check browser console for errors
- [ ] Verify API responds: `/api/auth/user` should return 401 (expected)

## If Something Goes Wrong

1. **Check platform logs** - Both Render and Railway show build/runtime logs
2. **Verify environment variables** - Make sure all are set
3. **Check DATABASE_URL** - Most common issue
4. **Verify Discord callback URL** - Must match exactly
5. **Check PORT** - App listens on 5000 by default

---

**Good luck! Your app is production-ready.** 🚀
