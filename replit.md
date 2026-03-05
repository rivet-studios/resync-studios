# RIVET Studios Platform - Development Notes

## Project Overview
Full-featured gaming community platform for RIVET Studios with Discord/email authentication, VIP subscriptions, forums, blog, store, user profiles, and comprehensive rank system.

## Current Status (March 05, 2026)
- ✅ Core authentication (Discord, Email/Password, Roblox linking)
- ✅ Comprehensive user rank system (40+ ranks)
- ✅ Landing page with hero, stats counter, and features grid
- ✅ Blog functionality (admin-only posting)
- ✅ Forums with categories and threading
- ✅ User profiles with redesigned layout and badges
- ✅ VIP subscription system with 4 tiers
- ✅ Store page with product catalog and cart
- ✅ Policies hub aggregating all legal documents
- ✅ Settings page with redesigned Integrations tab
- ✅ Professional navigation header with search
- ✅ AdminCP and ModCP with sidebar-based dark layout
- ✅ Live announcement management system
- ✅ Support page with FAQ and contact form
- ✅ Projects showcase page
- ✅ Site offline mode
- ✅ Staff Directory
- ✅ Chat system
- ✅ Scroll position fixed on navigation (ScrollToTop component)
- ✅ Legal and policy pages centered and optimized for readability

## Recent Additions

### Infrastructure & Bug Fixes:
- **Forum Fix**: Fixed category selection in "Create Thread" page.
- **Landing Page**: Fixed syntax errors.
- **Authentication**: Updated email login flow to automatically assign "Team Member" rank and admin access to users with `@resyncstudios.com` email addresses.
- **Layouts**: Standardized container widths for all legal/policy pages.
- **Scroll Management**: Added `ScrollToTop` utility.

### Design System:
- **Color Palette**: Dark theme throughout (`#050505` backgrounds, `#121212` cards, white text).
- **Typography**: Instrument Sans.
- **Components**: Redesigned AdminCP, ModCP, and Settings Integrations using a professional dark sidebar layout.

## Database Schema
- Users (with VIP tier, Discord/Roblox linking, user ranks)
- Announcements (live-edited by admins)
- Payments (tracks card charges with status)
- Projects (RIVET Studios projects list)
- Site Settings (offline mode, custom message)
- Forums, Clans, Chat, and other community features

## Next Steps
1. Customize store items with real products
2. Implement actual checkout/payment integration
3. Add more user profile customization options
4. Enhance forum features (search, tagging, reputation)
5. Analytics and user engagement tracking

## Deployment
- Configured for deployment on Render
- Domain: resyncstudios.com
