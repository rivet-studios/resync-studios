# RESYNC Studios Platform - Development Notes

## Project Overview
Full-featured gaming community platform for RESYNC Studios with Discord/email authentication, VIP subscriptions, forums, announcements, projects showcase, and admin management.

## Current Status (December 1, 2025)
- ✅ Core authentication (Discord, Email/Password, Roblox linking)
- ✅ Comprehensive AdminCP with 7 management tabs
- ✅ Live announcement management system
- ✅ Manual Payment System (MPS) for VIP with automatic card charging
- ✅ Support page with FAQ and contact form
- ✅ Projects showcase page (10 RESYNC Studios projects)
- ✅ Site offline mode with custom messaging
- ✅ 16-tier user rank system with badges
- ✅ Public browsing (unauthenticated) for forums, projects, staff, announcements
- ✅ Removed LFG and Build features per user request

## Important Notes
- **Stripe Integration**: Dismissed but needed for payment processing
  - User needs to complete Stripe integration setup via Replit to enable automatic card charging
  - Alternative: Provide Stripe API key via environment variable for manual setup
  - Payment form collects card data (number, expiry, CVC, billing address)
  - Backend ready to process charges - awaiting Stripe connection

## Database Schema
- Users (with VIP tier, Discord/Roblox linking)
- Announcements (live-edited by admins)
- Payments (tracks card charges with status: processing/success/failed)
- Projects (RESYNC Studios projects list)
- Site Settings (offline mode, custom message)
- Forums, Clans, Chat, and other community features

## Environment Variables Configured
- DATABASE_URL
- DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_BOT_TOKEN
- SESSION_SECRET
- Stripe integration: PENDING (user dismissed initial setup)

## Next Steps if Continuing
1. Complete Stripe integration in Replit dashboard OR provide API key
2. Implement actual Stripe card processing in payment endpoint
3. Add admin payment management dashboard
4. Set up webhook handlers for payment confirmation
5. Clean up old LFG/Builds files from codebase

## Removed Features
- LFG (Looking for Group) matchmaking
- Build meta sharing/voting
- "Project Ventura" → renamed to "Project Foxtrot" everywhere

## User Preferences
- Manual payment system with direct card charging (not third-party redirects)
- Admin-approved subscription changes only after payment success
- RS-themed UI throughout
- Public platform with auth required only for interactive features
