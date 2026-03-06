# RIVET Studios Platform - Development Notes

## Project Overview
Full-featured gaming community platform for RIVET Studios with Discord/email authentication, VIP subscriptions, forums, blog, store, marketplace, user profiles, comprehensive rank system, moderation tools, and ban/appeal system.

## Current Status (March 06, 2026)
- ✅ Core authentication (Discord, Email/Password, Roblox linking)
- ✅ Comprehensive user rank system (40+ ranks)
- ✅ Landing page with hero, stats counter, and features grid
- ✅ Blog functionality (admin-only posting)
- ✅ Forums with categories and threading
- ✅ User profiles with redesigned layout and badges
- ✅ VIP subscription system with 4 tiers
- ✅ Store page with product catalog, categories, and badges
- ✅ Marketplace page for community product submissions
- ✅ Product badges: Community Provided (grey), Featured (blue), LIMITED EDITION (golden), VERIFIED (green)
- ✅ Operations Manager product review and badge assignment
- ✅ User reporting system with ReportDialog component
- ✅ Ban management (issue/lift bans via ModCP)
- ✅ Appeal system for banned users
- ✅ Policies hub aggregating all legal documents
- ✅ Settings page with profile image URL, multiline signature, DOB, theme/layout preferences, delete account
- ✅ Settings Integrations tab with Sync Accounts, Roblox/Discord cards with connected dates
- ✅ Change password functionality
- ✅ Discounts tab placeholder
- ✅ Professional navigation header with search
- ✅ AdminCP and ModCP with sidebar-based dark layout
- ✅ ModCP tabs: Dashboard, Ban Management, Reports, Appeals
- ✅ Live announcement management system
- ✅ Support page with FAQ and contact form
- ✅ Projects showcase page
- ✅ Site offline mode
- ✅ Staff Directory
- ✅ Scroll position fixed on navigation (ScrollToTop component)
- ✅ Legal and policy pages centered and optimized for readability
- ✅ Public access to forums, blogs, store, subscriptions (no login required to view)

## Recent Additions

### Marketplace & Products:
- **Products Table**: New `products` table with fields for name, description, price (cents), category, badges, and review status.
- **Marketplace Page**: Users can submit products for review; Operations Managers approve/deny and assign badges.
- **Store Page**: Rebuilt to display approved products with category browsing, featured/limited sections, and badge display.
- **Product Badges**: Grey "Community Provided", blue "Featured", golden yellow "LIMITED EDITION", green "VERIFIED".

### Moderation & Safety:
- **Ban System**: `bans` table tracks active bans with reason, issuer, and duration. Creating a ban auto-sets user rank to "Banned".
- **Appeal System**: `appeals` table lets banned users submit appeals. Staff can approve (auto-lifts ban) or deny with notes.
- **Report Dialog**: Reusable `ReportDialog` component for reporting users, threads, replies, or products.
- **ModCP Overhaul**: Functional tabs for Dashboard, Ban Management (issue/lift), Reports (review/dismiss/action), Appeals (approve/deny).
- **Report Status Updates**: PATCH `/api/reports/:id` for staff to update report status with moderator notes.

### Infrastructure & Bug Fixes:
- **Forum Fix**: Fixed category selection in "Create Thread" page. Fixed form schema to omit server-only fields.
- **Admin Panel**: Fixed React hooks-after-returns violation that caused blank screen crash.
- **AdminCP**: Added missing lucide-react icon imports that caused render crash.
- **Blog/News**: Added `GET /api/blog/:id` backend route, fixed missing imports in news.tsx.
- **Public Access**: Forums, blogs, store, subscriptions, and news are all accessible without login.
- **Layout Fix**: Removed duplicate `container mx-auto` wrapper from App.tsx Router; each page now manages its own container/centering consistently.
- **ScrollToTop**: Component implemented and rendered at App level to reset scroll position on navigation.
- **CSS Optimization**: Removed duplicate `scroll-behavior: smooth` from body (kept on html only), removed `transition-colors duration-300` from body to reduce layout lag.

### Dashboard & Cases:
- **Dashboard Redesign**: 2x2 grid layout with Top Rated Products (red cart icon), Latest Blog Posts (green signal icon), Trending Topics (orange flame icon), Your Moderation Cases (blue gavel icon).
- **My Cases Page**: `/my-cases` page showing user's submitted reports and appeals with status tracking, staff responses, and outcome notes.
- **Landing CTA**: "Join The Community" → /onboarding (or "My Dashboard" → /dashboard if logged in), "Browse Store" → /store.

### Deprecated Pages Removed:
- **Groups/Clans**, **Builds**, **Chat** pages removed from routing and deleted.

### Design System:
- **Color Palette**: Dark theme throughout (`#050505` backgrounds, `#121212` cards, white text).
- **Typography**: Inter (font-sans), with semibold/medium weights throughout (no font-black/900).
- **Logo**: Clean inline SVG without container box, displayed directly in header and footer.
- **Components**: Redesigned AdminCP, ModCP, and Settings Integrations using a professional dark sidebar layout.

## Database Schema
- Users (with VIP tier, Discord/Roblox linking, user ranks, isAdmin, isModerator)
- Products (marketplace submissions with badges and review status)
- Bans (active ban records with reason and duration)
- Appeals (ban appeal submissions with review status)
- Reports (user/content reports with status tracking)
- Announcements (live-edited by admins)
- Payments (tracks card charges with status)
- Site Settings (offline mode, custom message)
- Forums (categories, threads, replies)
- ~~Groups/Clans, Chat, Builds~~ (deprecated and removed)

## API Routes Summary
- **Products**: GET /api/products, GET /api/products/all (ops), GET /api/products/my, POST /api/products, PATCH /api/products/:id/review, PATCH /api/products/:id/badges
- **Bans**: GET /api/bans, GET /api/bans/my, POST /api/bans, DELETE /api/bans/:id
- **Appeals**: GET /api/appeals, GET /api/appeals/my, POST /api/appeals, PATCH /api/appeals/:id
- **Reports**: GET /api/reports, GET /api/reports/my, POST /api/reports, PATCH /api/reports/:id

## Deployment
- Configured for deployment on Render
- Domain: resyncstudios.com
