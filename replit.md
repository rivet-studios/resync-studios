# RIVET Studios Platform - Compressed Development Notes

## Overview
The RIVET Studios Platform is a comprehensive gaming community platform providing an integrated experience for users. It features Discord and email authentication, a VIP subscription system, interactive forums, a blog, an e-commerce store and marketplace, detailed user profiles with a multi-tiered rank system, and extensive moderation tools including a ban and appeal system. The platform aims to foster community engagement, facilitate content sharing, and streamline payments through Stripe integration, creating a dynamic and self-sustaining online hub for the RIVET Studios community.

## User Preferences
I prefer detailed explanations for complex features.
I want iterative development with regular updates.
Please ask for confirmation before making any major architectural changes or deleting significant portions of code.
I prefer clean, readable code with consistent formatting.
I like to be informed about the implications of design choices on performance and scalability.

## System Architecture
The platform supports both light and dark themes (dark default) with semantic CSS tokens. It uses the Inter font family and consistent Core UI components. Users can select between a **Sidebar** or **Header** navigation layout, with the preference stored locally and synced. The theme toggle is readily accessible.

Key features and technical implementations include:
- **Authentication**: Discord OAuth, Email/Password with reset flow (via Resend), and Roblox account linking. Supports TOTP-based 2FA with backup codes. Sensitive user data is excluded from public API responses.
- **User Management**: A comprehensive rank system with over 40 ranks, VIP subscriptions across 4 tiers, and a staff directory. Includes Discord role and nickname synchronization.
- **Content Management**: Forums with moderation, admin-only blog posting, live announcements, and dynamic policy management with AdminCP editing. Policies are structured as Policies → Legal & Policies → individual document pages. New pages: Subscription Services Agreement (`/subscription-agreement`) and EU/UK Consumer Withdrawal Rights (`/eu-withdrawal`). `PolicyDocument` component provides clean breadcrumb + document header layout; `PolicyWrapper` fetches DB-stored overrides from AdminCP or falls back to static content.
- **E-commerce**: Product catalog with categories, badges, and Stripe integration for purchases and VIP subscriptions. Marketplace supports seller dashboards, product submission, review queues, and automatic Stripe product/price creation for approved items.
- **Moderation System**: User reporting, ban management (ModCP, Ban Wall, appeals), audit logging, warnings, staff notes, and dedicated staff tools on user profiles. Centralized case detail pages for reports, appeals, and bans.
- **Admin/Mod Control Panels**: Redesigned interfaces with live stats, user management, site settings (e.g., offline mode, emergency mode), and system reports. ModCP includes activity feeds and filtered report/appeal queues.
- **Global Search**: `SearchDialog` with debounced input, type filtering, and grouped results.
- **Offline Mode**: Configurable site-wide offline mode with Admin bypass.
- **Design System**: Global consistency through semantic tokens, VIP-priority username coloring, and ordered profile rank badges.
- **Advanced Staff Tools**: Enhanced ModCP (Users at Risk, ban reason templates, report priority, warning escalation) and AdminCP (role change history, bulk user rank changes, quick announcements, analytics, user quick-view).
- **Authorization**: Server-side and client-side helpers for access control to AdminCP and ModCP.
- **Wake Gateway**: Component to manage server cold starts, polling for backend readiness and displaying a loading screen.
- **Error Handling**: `ErrorBoundary` component prevents blank screens from render errors.
- **Scroll Management**: `ScrollToTop` component on route changes, using `scroll-behavior: auto`.
- **Platform Status Page**: Real-time service health checks, configurable by admins.
- **Product Reviews & Ratings**: Users can rate and review products.
- **Free Products**: Support for publishing products with a $0 price, bypassing Stripe integration.
- **Changelog**: Page displaying platform updates, with admin CRUD capabilities.
- **Security Info**: Endpoint providing an account security overview.
- **FAQ System**: Accordion UI with search and category filtering, admin CRUD.
- **Notifications**: In-app notification system with mark-read functionality.
- **Activity Feed**: Page showing platform activity.
- **Analytics Dashboard**: AdminCP dashboard with user growth, VIP/rank distribution, and content statistics.
- **Direct Messaging**: Private messaging system with conversation lists and message threads.
- **Reputation & Achievements**: User reputation points and seeded achievements.
- **Content Reactions**: Ability to like/react to forum posts and content.
- **Forum Polls**: Creation of polls within forum threads.
- **Bookmarks**: Bookmarking functionality for forum threads and content.
- **Referral System**: Unique referral codes for users.
- **Profile Customization**: User profile banner/cover image uploads.
- **Scheduled Announcements**: Announcements can be scheduled for future publishing.
- **Rate Limiting**: In-memory rate limiting on authentication endpoints.
- **Admin Audit Log**: Filterable system event log for administrators.
- **Enhanced Dashboard**: User dashboards displaying reputation, achievements, and content counts.
- **Navigation**: Community section included in both sidebar and header for logged-in users.
- **Verified Checkmark System**: Admin-only user verification (similar to Roblox). `isVerified` boolean on users table. `VerifiedBadge` component renders blue checkmark image inline next to usernames across profile, forums, messages, and admin panels. AdminCP quick-view has Verify/Unverify button. Backend: `PATCH /api/admin/users/:id/verify` (admin-only, audit logged).

## External Dependencies
- **Discord**: Used for authentication, bidirectional role/rank synchronization, and nickname/avatar syncing via a Discord bot.
- **Roblox API**: Utilized for account linking and verification.
- **Stripe**: Integrated for payment processing, VIP subscriptions, product purchases, customer portal management, and webhooks.
- **Render**: The platform is configured for deployment on Render.