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
The platform is built with a dark theme UI (`#050505` backgrounds, `#121212` cards, white text) utilizing the Inter font family. Core UI components like Card and Badge are consistently applied. The global `--radius` is set to `0.5rem`, with `rounded-xl` as the maximum corner radius for a cleaner aesthetic.

Key features and their technical implementations include:
- **Authentication**: Supports Discord, Email/Password, and Roblox account linking with a verification flow using the Roblox API.
- **User Management**: Features a comprehensive rank system with over 40 ranks, VIP subscriptions across 4 tiers, and a staff directory. Discord role and nickname synchronization are automatically managed upon rank changes.
- **Content Management**:
    - **Forums**: Supports categories, threading, and staff moderation tools (pin, lock, delete, move, edit).
    - **Blog**: Admin-only posting with search and category filtering.
    - **Announcements**: Live management system for platform-wide notifications.
    - **Policies**: Dynamic policy management with a `policies` table, allowing Operations Managers to edit HTML content via AdminCP, with fallbacks to hardcoded content.
- **E-commerce**:
    - **Store**: Product catalog with categories, badges (Community Provided, Featured, LIMITED EDITION, VERIFIED), and Stripe integration for `Buy Now` and `Add to Cart` functionality.
    - **Marketplace**: Allows community product submissions.
    - **Product Badges**: Operations Managers review products and assign badges.
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
- **Design System**: Global design consistency achieved through semantic tokens, `VipBadge` component for VIP members, and a lifetime username gradient for `Lifetime` rank holders.

## External Dependencies
- **Discord**: Used for authentication and role synchronization via a Discord bot.
- **Roblox API**: Used for account linking and verification.
- **Stripe**: Integrated for payment processing, VIP subscriptions, product purchases, customer portal management, and webhooks.
- **Render**: The platform is configured for deployment on Render.