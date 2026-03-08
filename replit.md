# RIVET Studios Platform - Development Notes

## Project Overview
Full-featured gaming community platform for RIVET Studios with Discord/email authentication, VIP subscriptions, forums, blog, store, marketplace, user profiles, comprehensive rank system, moderation tools, ban/appeal system, and Stripe payment processing.

## Current Status (March 08, 2026)
- ✅ Core authentication (Discord, Email/Password, Roblox linking)
- ✅ Comprehensive user rank system (40+ ranks)
- ✅ Landing page with hero, stats counter, and features grid
- ✅ Blog functionality (admin-only posting)
- ✅ Forums with categories and threading
- ✅ User profiles with redesigned layout and badges
- ✅ VIP subscription system with 4 tiers
- ✅ Store page with product catalog, categories, badges, and clickable product cards
- ✅ Product detail page with Buy Now (Stripe) and Add to Cart functionality
- ✅ Marketplace page for community product submissions
- ✅ Product badges: Community Provided (grey), Featured (blue), LIMITED EDITION (golden), VERIFIED (green)
- ✅ Operations Manager product review and badge assignment
- ✅ User reporting system with ReportDialog component
- ✅ Ban management (issue/lift bans via ModCP)
- ✅ Appeal system for banned users
- ✅ Policies hub aggregating all legal documents
- ✅ Settings page with full functionality across all tabs
- ✅ Stripe payment integration with checkout, portal, and webhooks
- ✅ Professional navigation header with search
- ✅ AdminCP with live stats, user management, announcements, site settings, reports
- ✅ ModCP with real activity feed, user search for bans, duration options, status filtering
- ✅ Live announcement management system
- ✅ Support page with FAQ and contact form
- ✅ Projects showcase page
- ✅ Site offline mode (toggle from AdminCP)
- ✅ Staff Directory
- ✅ Scroll position fixed on navigation (ScrollToTop component)
- ✅ Legal and policy pages centered and optimized for readability
- ✅ Public access to forums, blogs, store, subscriptions (no login required to view)

### Staff Case Detail Page (March 2026):
- **Route**: `/modcp/case/:type/:id` — dedicated page for viewing report/appeal/ban details
- **Component**: `client/src/pages/case-detail.tsx` — shows full case info, status badge, moderator notes, action buttons
- **Auth**: Same staff rank gate as `/modcp` applied in `App.tsx`
- **ModCP Links**: "View Case" links on report and appeal cards in ModCP navigate to case detail page
- **Actions**: Mark reviewed/dismissed/action taken for reports; approve/deny for appeals; lift ban for active bans
- **Notes**: Staff can add moderator/review notes when taking action

### Ban Wall (March 2026):
- **Component**: `client/src/components/ban-wall.tsx` — blocks banned users from all pages except `/appeals`
- **Integration**: Wraps Router in `App.tsx`; queries `/api/bans/my` when user is logged in
- **Display**: Shows ban reason, date, duration, and link to appeal

### Site Offline Mode (March 2026):
- **Public Endpoint**: `GET /api/site-status` — returns offline status without auth
- **OfflineGate Component**: Wraps all routes in App.tsx, checks status every 30s
- **Admin Bypass**: Company Director, Operations Manager, Team Member, Developer, Staff Internal Affairs, isAdmin, @resyncstudios.com emails can bypass offline mode
- **Maintenance Page**: Shows custom offline message with professional design

### UI Overhaul (March 2026):
- **Landing Page**: Full dark theme redesign with radial gradients, semantic tokens, consistent Card/Badge components
- **Forums**: Improved category sidebar with counts, thread cards with avatars/views/timestamps, skeleton loading
- **Store**: Better category cards with icons, improved product grid, semantic theme tokens
- **Blog**: Search and category filtering, improved featured post card, author cards, better post creation dialog
- **Dashboard**: Welcome header with avatar, quick stats row, quick action buttons, improved card layouts
- **AdminCP**: System health indicators, user rank breakdown, inline rank editing, better activity feed
- **ModCP**: Clickable stat cards, attention banner, confirmation dialogs for bans/appeals, more duration options
- **Profiles**: Larger avatar with staff indicator, profile stats grid, linked accounts section, recent activity feed
- **Case Detail**: Fixed type matching bug (lowercase URLs now work), fixed getStatusColor switch cases
- **Appeals**: Fixed filter values to use Title Case matching database enum

## Recent Additions

### Global Search (March 2026):
- **API Route**: `GET /api/search?q=:query&type=:type` — searches across members, forum topics, products, blog posts
- **SearchDialog**: Fully functional with debounced input, filter buttons, grouped results, click-to-navigate
- **Keyboard Shortcut**: `Cmd+K` / `Ctrl+K` opens search dialog

### Discord Bot Role Sync (March 2026):
- **Role Mapping**: `RANK_TO_ROLE` map in `server/discord-bot.ts` uses env vars (`DISCORD_ROLE_*`) for rank-to-Discord-role mapping
- **Auto-sync**: When admin changes a user's rank via `/api/admin/users/:id/rank`, Discord roles are updated automatically
- **Nickname Sync**: Discord nickname also updated on rank change
- **Function**: `updateDiscordRoles(discordId, newRank, oldRank)` exported from `server/discord-bot.ts`

### Report Buttons (March 2026):
- **Forum Threads**: Report button on thread OP and each reply (only visible when logged in, hidden for own posts)
- **User Profiles**: Report button in profile header (only visible for other users' profiles)
- **ReportDialog**: Pre-existing component now wired into thread.tsx and user.tsx

### Roblox Account Linking (March 2026):
- **Verification Flow**: Enter username → server looks up via Roblox API → generates verification code → user adds to Roblox profile description → server verifies
- **API Routes**: `POST /api/roblox/start-verification`, `POST /api/roblox/verify`, `POST /api/roblox/unlink`
- **Settings UI**: Roblox card in Integrations tab shows link/unlink buttons, inline verification form with code copy
- **Uses Roblox public API**: `users.roblox.com/v1/users/search` and `users.roblox.com/v1/users/:id`

### Policy Management:
- **Policies Table**: New `policies` table with slug, title, content (HTML), updatedBy, updatedAt
- **API Routes**: `GET /api/policies`, `GET /api/policies/:slug`, `PUT /api/policies/:slug` (Operations Manager+ only)
- **AdminCP Policies Tab**: List of all 8 policies with edit/customize buttons, HTML content editor, save to DB
- **PolicyWrapper Component**: Wraps each policy page; loads DB content if available, falls back to hardcoded content
- **Access Control**: Operations Manager, Company Director, admins, and @resyncstudios.com emails can edit policies

### VIP Badge & Lifetime Gradient:
- **VIP Badge**: Replaced text/icon gradient badges with CDN image badge (`VipBadge` component renders the holographic VIP image)
- **Lifetime Username Gradient**: Users with `Lifetime` rank get gold-to-blue gradient (`#FFBF00` to `#00BFFF`) applied to their username display in: profile page, forum threads, forum home thread list, and header dropdown
- **rankConfig**: Centralized rank configuration in `user-rank-badge.tsx` with `isGradient` and `gradient` properties for Lifetime and VIP ranks


### AdminCP Expansion:
- **Live Stats Dashboard**: Total members, forum posts, active bans, pending reports — all from real database counts via `GET /api/admin/stats` (auto-refreshes every 30s)
- **Real Activity Feed**: Combined feed of latest bans, reports, and appeals via `GET /api/admin/activity`
- **User Management Tab**: Search users, view user list, change user ranks with full rank selector dropdown
- **Platform Settings Tab**: Toggle offline mode with switch, edit offline message, view platform overview stats
- **Announcements Tab**: Full create form (title, content, category, image URL), list/delete existing announcements
- **System Reports Tab**: View all reports with status badges
- **Emergency Mode**: One-click offline mode button on dashboard

### ModCP Expansion:
- **Live Dashboard**: Real combined activity feed replacing placeholder, showing latest bans/reports/appeals
- **User Search for Bans**: Search-as-you-type user lookup instead of raw ID input, select from dropdown results
- **Ban Duration Options**: 1 day, 7 days, 30 days, permanent — with computed expiration dates
- **Reports Filtering**: Filter by status (All, Pending, Reviewed, Dismissed, Action Taken)
- **Appeals Filtering**: Filter by status (All, Pending, Approved, Denied)

### Settings Expansion:
- **Billing Tab**: Shows VIP tier, Stripe subscription status, manage subscription via Stripe portal
- **Orders Tab**: Payment history from database with date, description, amount, status
- **Payment Methods Tab**: Link to Stripe customer portal for card management
- **Downloads Tab**: Shows user's submitted/owned products
- **Discounts Tab**: Proper empty state layout

### Stripe Integration:
- **stripe-replit-sync**: Non-blocking initialization on startup (schema, webhook, backfill)
- **Routes**: GET /api/stripe/products, POST /api/stripe/checkout, POST /api/stripe/portal, GET /api/stripe/subscription
- **Webhook**: Registered BEFORE express.json() middleware for raw body handling

### UI Simplification (March 2026):
- Reduced global `--radius` from `0.75rem` to `0.5rem` for cleaner, less bubbly corners
- Replaced all `rounded-3xl`, `rounded-[2.5rem]`, `rounded-[2rem]` with `rounded-xl` across all pages
- Store page fully redesigned to match reactstudios.com reference: gradient category cards, featured product image overlays, 4-column product grid
- Header dropdown and sidebar items use `rounded-xl` instead of `rounded-2xl`

### Design System:
- **Color Palette**: Dark theme throughout (`#050505` backgrounds, `#121212` cards, white text).
- **Typography**: Inter (font-sans), with semibold/medium weights throughout (no font-black/900).
- **Logo**: Clean inline SVG without container box, displayed directly in header and footer.
- **Components**: Redesigned AdminCP, ModCP, and Settings using professional dark sidebar layout.
- **Corner Radius**: `--radius: 0.5rem` globally; `rounded-xl` max for cards/panels (no rounded-3xl).

## Database Schema
- Users (with VIP tier, Discord/Roblox linking, user ranks, isAdmin, isModerator, stripeCustomerId, stripeSubscriptionId)
- Products (marketplace submissions with badges and review status)
- Bans (active ban records with reason, duration, prior rank)
- Appeals (ban appeal submissions with review status)
- Reports (user/content reports with status tracking)
- Announcements (live-edited by admins with categories)
- Payments (tracks card charges with status)
- Site Settings (offline mode, custom message)
- Forums (categories, threads, replies)

## API Routes Summary
- **Admin**: GET /api/admin/stats, GET /api/admin/activity, GET /api/admin/users, GET /api/admin/search-users, POST /api/admin/assign-rank, PATCH /api/admin/users/:id/rank, PATCH /api/admin/site-settings, GET /api/admin/site-settings, POST /api/admin/set-user-password, POST /api/admin/assign-subscription, POST /api/admin/announcements, DELETE /api/admin/announcements/:id
- **Products**: GET /api/products, GET /api/products/all (ops), GET /api/products/my, POST /api/products, PATCH /api/products/:id/review, PATCH /api/products/:id/badges
- **Bans**: GET /api/bans, GET /api/bans/my, POST /api/bans, DELETE /api/bans/:id
- **Appeals**: GET /api/appeals, GET /api/appeals/my, POST /api/appeals, PATCH /api/appeals/:id
- **Reports**: GET /api/reports, GET /api/reports/my, POST /api/reports, PATCH /api/reports/:id
- **Payments**: GET /api/payments/my
- **Stripe**: GET /api/stripe/publishable-key, GET /api/stripe/products, POST /api/stripe/checkout, POST /api/stripe/product-checkout, POST /api/stripe/portal, GET /api/stripe/subscription
- **Search**: GET /api/search?q=:query&type=:type
- **Roblox**: POST /api/roblox/start-verification, POST /api/roblox/verify, POST /api/roblox/unlink

## Deployment
- Configured for deployment on Render
- Domain: resyncstudios.com
