# Phase 7 Milestone 1: Foundation - Requirements

**Project:** Rakuxon City Admin Dashboard  
**Milestone:** 1 - Authentication, Layout & Dashboard  
**Duration:** Days 1-3  
**Status:** Planning

---

## Overview

Build the authentication system and admin shell that provides the foundation for all subsequent admin features. After this milestone, authorized users can log in and see a dashboard with key metrics.

---

## Goals

1. Secure authentication using Auth.js v5 with credentials provider
2. Role-based access control with middleware protection
3. Admin layout with navigation and user menu
4. Dashboard displaying cached metrics (1-3 minute cache)
5. Force password change on first login

---

## Functional Requirements

### FR-M1.1: Authentication System

**FR-M1.1.1: Login Page**
- Login form at `/admin/login`
- Email and password fields (both required)
- Client-side validation (email format, password min length)
- Error display for invalid credentials
- Redirect to dashboard on success
- Loading state during authentication

**FR-M1.1.2: Session Management**
- Sessions stored in database via Auth.js adapter
- 30-day session expiration
- Sessions tied to user ID, email, role, salesTrack

**FR-M1.1.3: Password Security**
- Bcrypt hashing with cost factor 12
- Temporary passwords generated for new users
- Force password change flag in User table

**FR-M1.1.4: First Login Flow**
- Detect if user has `mustChangePassword: true`
- Redirect to `/admin/change-password` after login
- New password requirements: 12+ chars, uppercase, lowercase, number

**FR-M1.1.5: Logout**
- Logout button in user menu
- Clears session from database
- Redirects to `/admin/login`

---

### FR-M1.2: Authorization & Access Control

**Roles:**
- `ADMIN`: Full access
- `SALES`: Filtered by salesTrack  
- `INVESTOR_MANAGER`: Investor enquiries only

---

### FR-M1.3: Admin Layout

**Navigation:**
- Dashboard
- Listings (Land, Homes)
- Estates
- Enquiries
- Articles (admin only)
- Media
- Users (admin only)
- Import (admin only)
- Settings (admin only)

---

### FR-M1.4: Dashboard Home

**Metrics (cached 1-3 min):**
- Enquiries: New, unassigned, in progress
- Listings: Total, available, reserved, sold, draft
- Estates: Total, active, sold out, delivered
- System health (admin): Stand-in media, users

**Features:**
- Recent activity feed (last 10 actions)
- Quick action buttons
- Track-based filtering for sales users
- Refresh button

---

## Acceptance Criteria

- [ ] User can log in with valid credentials
- [ ] Temporary password forces password change
- [ ] Role-based navigation displays correctly
- [ ] Dashboard shows accurate metrics
- [ ] Metrics cache for 1-3 minutes
- [ ] Track filtering works for sales users
- [ ] Mobile responsive
- [ ] WCAG AA compliant

---

## Dependencies

```bash
pnpm add next-auth@beta @auth/prisma-adapter bcrypt date-fns
pnpm add -D @types/bcrypt
```

**Next:** Proceed with implementation
