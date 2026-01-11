# RIVET Studios Platform - Development Notes

## Project Overview
Full-featured gaming community platform for RIVET Studios with Discord/email authentication, VIP subscriptions, forums, blog, store, user profiles, and comprehensive rank system.

## Current Status (December 21, 2025)
- ✅ Core authentication (Discord, Email/Password, Roblox linking)
- ✅ Comprehensive user rank system (40+ ranks including staff, leadership, VIP, member types)
- ✅ Landing page with hero, stats counter, and features grid
- ✅ Blog functionality (admin-only posting)
- ✅ Forums with categories and threading
- ✅ User profiles with redesigned layout and badges
- ✅ VIP subscription system with 4 tiers
- ✅ Store page with product catalog and cart
- ✅ Policies hub aggregating all legal documents
- ✅ Settings page with account, connections, and billing
- ✅ Professional navigation header with search
- ✅ AdminCP with 7 management tabs
- ✅ Live announcement management system
- ✅ Support page with FAQ and contact form
- ✅ Projects showcase page
- ✅ Site offline mode
- ✅ Staff Directory
- ✅ Chat system

## Recent Additions (Turn 3-4)

### New Pages Created:
- **Store Page** (`/store`) - Product catalog with search, filters, cart functionality, 9 sample items
- **Policies Hub** (`/policies`) - Aggregated policies linking to Privacy, Terms, Guidelines, Community Rules, DMCA, Project Foxtrot Rules

### Profile Redesign:
- New React Studios-inspired layout
- Cleaner header with avatar, name, badges, join date
- Member info card with status, posts, reputation
- Linked accounts section (Discord/Roblox)
- About section with bio details
- Activity stats grid

### Rank System Expansion:
Added 13+ new ranks to match workflow & position entitlement:
- **Leadership**: RS Trust & Safety Director (existing)
- **Team**: RS Trust & Safety Team (new)
- **Staff**: 
  - Staff Internal Affairs (new)
  - Staff Department Director (new)
  - Appeals Moderator (new)
  - Community Senior Administrator (new)
  - Community Administrator (new)
  - Community Moderator (existing)
  - Community Senior Moderator (existing)
  - Community Developer (existing)
- **Member Types**:
  - Trusted Member (new - green)
  - Active Member (new - blue)
  - Community Partner (new - purple)
  - Banned (new - red)

### Bug Fixes:
- Fixed AnimatedCounter prop type mismatch (value → end)

## Database Schema
- Users (with VIP tier, Discord/Roblox linking, user ranks)
- Announcements (live-edited by admins)
- Payments (tracks card charges with status)
- Projects (RIVET Studios projects list)
- Site Settings (offline mode, custom message)
- Forums, Clans, Chat, and other community features

## Design System
- **Color Scheme**: Professional slate (#4B5563) as primary
- **Theme**: Light mode by default (with dark mode toggle)
- **Font**: Instrument Sans
- **Components**: Shadcn UI with Tailwind CSS
- **Responsiveness**: Mobile-first, responsive across all devices

## Environment Variables Configured
- DATABASE_URL
- DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_BOT_TOKEN
- SESSION_SECRET
- Node environment configured for production

## User Preferences
- Light theme as default experience
- Professional slate color scheme throughout
- Instrument Sans typography
- Manual payment system with direct card charging
- Admin-approved subscription changes only after payment success
- RS-themed UI throughout
- Public platform with auth required only for interactive features

## Navigation Structure

### Public Pages (No Auth Required):
- Landing (`/`)
- Blog (`/blog`)
- Forums (`/forums`)
- Store (`/store`)
- Policies (`/policies`)
- Support (`/support`)
- Projects (`/projects`)
- Announcements (`/announcements`)
- Staff Directory (`/team`)
- Community Rules (`/community-rules`)

### Authenticated Pages:
- Profile (`/profile`)
- Settings (`/settings`)
- VIP (`/vip`)
- Chat (`/chat`)
- Clans (`/clans`)
- Admin (`/admin`)
- ModCP (`/modcp`)
- AdminCP (`/admin-cp`)

### Legal/Policy Pages:
- Privacy (`/privacy`)
- Terms (`/terms`)
- Guidelines (`/guidelines`)
- DMCA (`/dmca`)
- Project Foxtrot Rules (`/project-foxtrot-rules`)
- Volunteer Agreement (`/volunteer-agreement`)
- LEO Guidelines (`/leo-guidelines`)

## Deployment
- Render-deployed via git integration
- Production builds from main branch
- Automatic deployments on git push

## Next Steps if Continuing
1. Customize store items with real products
2. Implement actual checkout/payment integration
3. Add more user profile customization options
4. Enhance forum features (search, tagging, reputation)
5. Analytics and user engagement tracking
