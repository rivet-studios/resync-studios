# RIVET Studios Platform - Development Notes

## Overview
The RIVET Studios Platform is a comprehensive gaming community platform designed to offer a rich, integrated experience for users. It features Discord and email authentication, a robust VIP subscription system, interactive forums, a blog, an e-commerce store and marketplace, detailed user profiles with a multi-tiered rank system, and extensive moderation tools including a ban and appeal system. The platform aims to foster community engagement, facilitate content sharing, and provide a streamlined payment experience through Stripe integration. The project's ambition is to create a dynamic and self-sustaining online hub for the RIVET Studios community.

## User Preferences
I prefer detailed explanations for complex features.
I want iterative development with regular updates.
Please ask for confirmation before making any major architectural changes or deleting significant portions of code.
I prefer clean, readable code with consistent formatting.
I like to be informed about the implications of design choices on performance and scalability.

## System Architecture
The platform supports both light and dark themes (dark default) with semantic CSS tokens (`bg-card`, `bg-background`, `text-foreground`, etc.) defined in `index.css`. Light mode variables are in the `.light` class, dark mode is the `:root` default. The UI uses the Inter font family, Core UI components like Card and Badge are consistently applied. The global `--radius` is set to `0.5rem`, with `rounded-xl` as the maximum corner radius for a cleaner aesthetic. Navigation supports two user-selectable layouts: **Sidebar** (`AppSidebar` + `SidebarProvider` from shadcn) with grouped sections (Platform, Account, Store, Support, Staff) and a collapsible trigger, or **Header** (`AppHeader`) with a sticky top bar, nav dropdowns, and a mobile hamburger sheet. The preference is stored in `localStorage` (`resync-nav-layout`) via the `useNavigationLayout` hook, with cross-component and cross-tab sync. Users toggle between them in Settings → Appearance → Navigation Style. The theme toggle is in the sidebar header / header bar. Hardcoded hex colors (`bg-[#121212]`, `border-[#1e1e1e]`) have been replaced with semantic tokens across most pages.

Key features and their technical implementations include:
- **Authentication**: Supports Discord OAuth (`/api/auth/discord`), Email/Password with forgot/reset password flow (via Resend email from `support@resyncstudios.com`), and Roblox account linking with a verification flow using the Roblox API. Sensitive fields (`password`, `passwordResetToken`, `passwordResetExpires`, `twoFactorSecret`, `twoFactorBackupCodes`) are stripped from all public API responses. TOTP-based 2FA is supported (setup, verify, disable, validate endpoints). Backup codes (8 hex codes) are generated on enable.
- **Two-Factor Authentication**: TOTP 2FA via `otplib` + `qrcode`. Endpoints: `POST /api/auth/2fa/setup` (generates secret + QR), `POST /api/auth/2fa/verify` (confirms + generates backup codes), `POST /api/auth/2fa/disable` (requires code), `POST /api/auth/2fa/validate` (login-time validation). DB columns: `two_factor_secret`, `two_factor_enabled`, `two_factor_backup_codes` on users table. UI in Settings → Security tab.
- **Profile Image Upload**: Users can upload avatar images via file upload (multer, `POST /api/users/profile/avatar`) or paste a URL. Uploaded files go to `uploads/avatars/` and are served statically at `/uploads/`. Max file size 5MB. Supported formats: JPEG, PNG, GIF, WebP.
- **User Management**: Features a comprehensive rank system with over 40 ranks, VIP subscriptions across 4 tiers, and a staff directory. Discord role and nickname synchronization are automatically managed upon rank changes.
- **Content Management**:
    - **Forums**: Supports categories, threading, and staff moderation tools (pin, lock, delete, move, edit).
    - **Blog**: Admin-only posting with search and category filtering.
    - **Announcements**: Live management system for platform-wide notifications.
    - **Policies**: Dynamic policy management with a `policies` table, allowing Operations Managers to edit HTML content via AdminCP, with fallbacks to hardcoded content.
- **E-commerce**:
    - **Store**: Product catalog with categories, badges (Community Provided, Featured, LIMITED EDITION, VERIFIED), and Stripe integration for `Buy Now` and `Add to Cart` functionality.
    - **VIP Checkout**: Subscriptions page (`/store/subscriptions`) directly creates Stripe Checkout Sessions via `POST /api/stripe/checkout` with `tierId` mapping to Stripe Price IDs (configurable via `STRIPE_PRICE_BRONZE`, `STRIPE_PRICE_DIAMOND`, `STRIPE_PRICE_FOUNDERS` env vars). Success/cancel redirects back to subscriptions page.
    - **Marketplace**: Tabbed dashboard (My Products, Submit Product, Review Queue) with stats cards (Total Products, Approved, Pending, Total Sales). API endpoint `GET /api/marketplace/stats` provides seller dashboard data.
    - **Product Badges**: Operations Managers review products and assign badges.
    - **Stripe Product Sync**: When a marketplace product is approved, a corresponding Stripe Product and Price are automatically created. The `stripeProductId` and `stripePriceId` are stored in the `products` table. Product checkout uses the stored Stripe Price when available.
- **Moderation System**:
    - **Reports**: User reporting system for content and profiles with a `ReportDialog` component.
    - **Bans**: Management through ModCP, including a `Ban Wall` component that restricts banned users to the appeals page.
    - **Appeals**: System for banned users to appeal decisions.
    - **Audit Log**: `moderation_logs` table automatically logs various moderation actions.
    - **Warnings**: `warnings` table for issuing and tracking user warnings with severity levels.
    - **Staff Notes**: `staff_notes` table for internal notes on user profiles.
    - **Staff Tools**: Dedicated "Staff Tools" section on user profiles for quick actions, warning history, staff notes, and moderation history.
    - **Case Detail Page**: Centralized page (`/modcp/case/:type/:id`) for viewing and managing reports, appeals, and bans.
    - **Forum Staff Tools**: API endpoints and UI elements for staff to moderate threads and replies.
- **Admin/Mod Control Panels**: Redesigned with professional dark sidebar layouts.
    - **AdminCP**: Features live stats, user management (including rank changes), announcements, site settings (e.g., offline mode toggle), and system reports. Includes an "Emergency Mode" for one-click offline activation.
    - **ModCP**: Provides a live activity feed, user search for ban/warning issuance, ban duration options, and filtering for reports and appeals.
- **Global Search**: `SearchDialog` with debounced input, type filtering, and grouped results, accessible via `Cmd+K`/`Ctrl+K`.
- **Offline Mode**: A configurable site-wide offline mode with Admin bypass capabilities and a custom maintenance page.
- **Design System**: Global design consistency achieved through semantic tokens, `VipBadge` component for VIP members, and VIP-priority username coloring (Lifetime=animated gold-cyan gradient, Founders=holographic rainbow, Diamond=diamond gradient, Bronze=bronze gradient, fallback to rank color). Profile rank badges ordered: VIP > Community > Staff.
- **Advanced Staff Tools**:
    - **ModCP**: Users at Risk dashboard card, ban reason templates dropdown, report priority indicators, warning escalation path display, escalation tracker tab.
    - **AdminCP**: Role change history sub-tab, bulk user rank change actions, quick banner announcements, account age distribution stats, staff activity card, user quick-view info panel.
    - **Case Detail**: Related cases section showing other reports/appeals/bans for the same user.

- **Authorization Helpers**: Server-side `isAdminUser()` and `isForumStaff()` functions centralize access control checks. Client-side `canAccessAdminCP()` and `canAccessModCP()` helpers in `App.tsx` mirror server logic (including `additionalRanks` checks). Both sides check the same admin ranks: Developer, Staff Internal Affairs, Team Member, Staff Department Director, Operations Manager, Company Director.
- **Wake Gateway**: `WakeGateway` component wraps the main app, polling `GET /api/health` every 2.5s until backend confirms readiness (`{ ok: true }`). Shows a branded RS loading screen during server wake-up (Render cold starts). Backend tracks readiness via `markServerReady()` in `server/index.ts`, set after DB, routes, and Vite/static serving are initialized. Includes retry + bypass buttons after 18s timeout.
- **Error Handling**: `ErrorBoundary` component wraps the Router, keyed by pathname so route-specific crashes reset on navigation. Prevents blank white screens from unhandled render errors.
- **Scroll Management**: `ScrollToTop` component scrolls to top on route changes. CSS `scroll-behavior: auto` (not `smooth`) to avoid scrolling lag.
- **Platform Status Page**: `/status` page with real-time service health checks (Platform API, Database, Authentication, Forums, Moderation, Payments). Auto-refreshes every 30s. Backend: `GET /api/platform-status` checks DB connectivity, Stripe availability, and maintenance mode.
- **Changelog Page**: `/changelog` page showing platform updates grouped by month with category badges (Feature, Improvement, Bugfix, Platform Update). Admin users can create and delete entries. Backend: `GET /api/changelog`, `POST /api/admin/changelog`, `DELETE /api/admin/changelog/:id`. Data stored in `changelog_entries` table.
- **Security Info Endpoint**: `GET /api/auth/security-info` returns account security overview (password set, linked accounts, active sessions, 2FA status).
- **FAQ System**: `/faq` page with accordion UI, search, category filtering. Admin CRUD via dialog. Backend: `GET /api/faq`, `POST /api/admin/faq`, `PATCH /api/admin/faq/:id`, `DELETE /api/admin/faq/:id`. Data stored in `faq_entries` table.
- **Notifications System**: `/notifications` page with mark-read functionality. Backend: `GET /api/notifications`, `GET /api/notifications/unread-count`, `POST /api/notifications/mark-read`, `POST /api/notifications`. Data stored in `notifications` table.
- **Activity Feed**: `/activity` page showing platform activity with typed icons. Backend: `GET /api/activity-feed`, `POST /api/activity-feed`. Data stored in `activity_feed` table.
- **Analytics Dashboard**: AdminCP → Analytics tab with user growth metrics (today/week/month), VIP distribution, rank distribution, forum/product/report counts, and a 30-day signup bar chart. Backend: `GET /api/admin/analytics`.
- **Direct Messaging**: `/messages` page with conversation list and message thread view. DB table: `direct_messages`. Backend: `GET /api/messages` (conversations), `GET /api/messages/:userId` (thread), `POST /api/messages` (send), `GET /api/messages/unread-count`.
- **Reputation & Achievements**: User reputation points earned from platform activity. 12 seeded achievements (First Post, Helping Hand, etc.). DB tables: `achievement_definitions`, `user_achievements`. Backend: `GET /api/achievements`, `GET /api/users/:id/reputation`, `POST /api/admin/achievements/grant`. AdminCP tab for achievement management.
- **Content Reactions**: Like/react to forum posts and content. DB table: `reactions`. Backend: `POST /api/reactions/toggle`, `GET /api/reactions/:targetType/:targetId`.
- **Forum Polls**: Create polls within forum threads. DB table: `forum_polls`. Backend: `POST /api/forums/polls`, `GET /api/forums/polls/:threadId`, `POST /api/forums/polls/:pollId/vote`.
- **Bookmarks**: Bookmark forum threads and content. DB table: `bookmarks`. Backend: `POST /api/bookmarks/toggle`, `GET /api/bookmarks`.
- **Referral System**: `/referrals` page with unique referral codes. DB columns: `referral_code`, `referred_by` on users. Backend: `GET /api/referrals/code`, `POST /api/referrals/apply`.
- **Profile Customization**: Profile banner/cover image upload (`POST /api/users/profile/banner`, max 10MB). Banners display on profile page. Featured badge selection. Upload dir: `uploads/banners/`.
- **Scheduled Announcements**: Announcements can be scheduled for future publishing. `scheduled_for` column on `announcements` table. Auto-publisher runs every 60s to publish scheduled items.
- **Rate Limiting**: In-memory rate limiter on auth endpoints: login (10/15min), signup (5/hr), forgot-password (3/15min).
- **Admin Audit Log**: `audit_log` table with `GET /api/admin/audit-log` endpoint. AdminCP tab shows filterable system event trail with action, target, details, IP, timestamps.
- **Enhanced Dashboard**: Dashboard stats cards include Reputation, Achievements/Badges, Products, Threads, Blog Posts, Cases, and unread Messages counts.
- **Navigation**: Sidebar and header both include Community section (Messages, Activity Feed, Notifications, Achievements, Referrals) for logged-in users.

## External Dependencies
- **Discord**: Used for authentication and role synchronization via a Discord bot. The bot auto-discovers guild roles by matching role names (no manual role ID env vars needed). Role sync is bidirectional: Discord role changes update platform ranks, and platform rank changes update Discord roles. Nickname/display name and avatar changes in Discord are synced to user profiles. The bot also syncs roles/profile on each Discord OAuth login. Fail-safe: rank is only updated when mapped roles are found (prevents accidental demotions). Admin endpoints: `GET /api/admin/discord-status` shows mapping status, `POST /api/admin/discord-sync/:userId` triggers manual sync.
- **Roblox API**: Used for account linking and verification.
- **Stripe**: Integrated for payment processing, VIP subscriptions, product purchases, customer portal management, and webhooks.
- **Render**: The platform is configured for deployment on Render.