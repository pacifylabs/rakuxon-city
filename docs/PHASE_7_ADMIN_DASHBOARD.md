# Phase 7: Admin Dashboard — Implementation Plan

**Project:** Rakuxon City  
**Phase:** 7 — Admin Dashboard  
**Branch:** `feature/phase-7-admin-dashboard`  
**Status:** Planning  
**Date Started:** 2026-08-27

---

## Overview

Phase 7 builds the staff-facing admin dashboard that allows the Rakuxon City team to manage listings, estates, articles, media, enquiries, and users without developer intervention. This is the final major phase before launch readiness (Phase 8).

**Why last:** Per 03_IMPLEMENTATION_PLAN.md, the admin is last by choice. The public site needs to be demo-ready first (achieved in Phases 3-6). Staff tooling comes after the client has something to show stakeholders.

---

## Scope

### In Scope (Phase 7)
1. Authentication system (Auth.js)
2. Role-based access control (admin, sales, investor_manager)
3. Dashboard with key metrics
4. Listing CRUD (Land & Homes)
5. Estate CRUD
6. Article CRUD with rich text editor
7. Media library with upload & management
8. Enquiry inbox with filtering, notes, and assignment
9. User management
10. CSV import for bulk listing creation
11. Status transition tracking

### Out of Scope (Deferred)
- Advanced reporting/analytics → Phase 8
- Bulk operations (mass status changes, bulk delete) → Post-launch
- Email templates editor → Post-launch
- Custom fields/metadata → Post-launch
- API for external integrations → Post-launch

---

## Architecture

### Route Structure
```
/admin
  /login                  # Auth.js credentials provider
  /dashboard              # Overview metrics
  /listings
    /land                 # Land listing management
    /land/new
    /land/[id]
    /land/[id]/edit
    /homes                # Home listing management
    /homes/new
    /homes/[id]
    /homes/[id]/edit
  /estates
    /                     # Estate list
    /new
    /[id]
    /[id]/edit
  /enquiries
    /                     # Enquiry inbox
    /[id]                 # Enquiry detail
  /investor-enquiries     # Separate investor enquiries
    /
    /[id]
  /articles
    /                     # Article list
    /new
    /[id]/edit
  /media
    /                     # Media library
    /upload
  /users                  # User management (admin only)
    /
    /new
    /[id]/edit
  /import                 # CSV importer
    /listings
    /estates
  /settings               # Site settings & placements
```

### Authentication & Authorization

**Auth.js Setup:**
- Credentials provider (email + password)
- Bcrypt password hashing
- Session stored in database
- 30-day session expiration
- Middleware protecting `/admin/*` routes

**Roles:**
```typescript
enum Role {
  ADMIN              // Full access to everything
  SALES              // Listings, enquiries (filtered by salesTrack)
  INVESTOR_MANAGER   // Investor enquiries only
}

enum SalesTrack {
  LAND               // Can see land listings & enquiries
  HOMES              // Can see homes listings & enquiries
  BOTH               // Can see all
}
```

**Access Matrix:**

| Resource | Admin | Sales (Land) | Sales (Homes) | Sales (Both) | Investor Manager |
|----------|-------|--------------|---------------|--------------|------------------|
| Dashboard | ✅ All | ✅ Track-filtered | ✅ Track-filtered | ✅ All listings | ✅ Investor only |
| Land listings | ✅ | ✅ | ❌ | ✅ | ❌ |
| Home listings | ✅ | ❌ | ✅ | ✅ | ❌ |
| Land enquiries | ✅ | ✅ | ❌ | ✅ | ❌ |
| Home enquiries | ✅ | ❌ | ✅ | ✅ | ❌ |
| Investor enquiries | ✅ | ❌ | ❌ | ❌ | ✅ |
| Estates | ✅ | ✅ Read-only | ✅ Read-only | ✅ Read-only | ❌ |
| Articles | ✅ | ❌ | ❌ | ❌ | ❌ |
| Media | ✅ | ✅ Upload | ✅ Upload | ✅ Upload | ❌ |
| Users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Implementation Plan

### 1. Authentication Foundation (Days 1-2)

**Tasks:**
- [ ] Install and configure Auth.js v5
- [ ] Create `/admin/login` page with email/password form
- [ ] Implement credentials provider with bcrypt
- [ ] Add database session adapter
- [ ] Create middleware to protect `/admin/*` routes
- [ ] Build logout functionality
- [ ] Add password reset flow (optional for MVP)

**Files:**
```
src/
  app/
    admin/
      login/
        page.tsx
  lib/
    auth/
      config.ts          # Auth.js configuration
      providers.ts       # Credentials provider
      middleware.ts      # Route protection
      session.ts         # Session helpers
```

**Environment Variables:**
```bash
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"  # Production: https://rakuxoncity.com
```

**Verification:**
- [ ] Login with seeded admin user works
- [ ] Session persists across page reloads
- [ ] Protected routes redirect to login
- [ ] Logout clears session
- [ ] Incorrect credentials rejected

---

### 2. Dashboard Layout & Navigation (Day 2)

**Tasks:**
- [ ] Create admin layout component
- [ ] Build sidebar navigation
- [ ] Add user menu with role display
- [ ] Create breadcrumb component
- [ ] Build empty states for all sections

**Files:**
```
src/
  app/
    admin/
      layout.tsx         # Admin shell with sidebar
  components/
    admin/
      sidebar.tsx
      user-menu.tsx
      breadcrumbs.tsx
      page-header.tsx
```

**Design:**
- Sidebar: Fixed left, collapsible on mobile
- Navigation: Icon + label, active state
- User menu: Name, role, logout
- Responsive: Drawer on mobile, fixed on desktop

**Verification:**
- [ ] All routes accessible from sidebar
- [ ] Active route highlighted
- [ ] Mobile navigation works
- [ ] User role displayed correctly
- [ ] Logout accessible

---

### 3. Dashboard Home (Day 3)

**Tasks:**
- [ ] Build metrics query functions
- [ ] Create metric card components
- [ ] Add recent activity feed
- [ ] Build status distribution charts
- [ ] Add quick actions section

**Metrics:**
```typescript
interface DashboardMetrics {
  newEnquiries: {
    total: number
    change: number          // vs last period
    byTrack: { land: number; homes: number }
  }
  listings: {
    total: number
    available: number
    reserved: number
    sold: number
    draft: number
    byType: { land: number; homes: number }
  }
  estates: {
    total: number
    active: number
    soldOut: number
    delivered: number
  }
  recentActivity: Activity[]  // Last 10 actions
}
```

**Files:**
```
src/
  app/
    admin/
      dashboard/
        page.tsx
  lib/
    admin/
      queries/
        dashboard.ts     # Metrics queries
  components/
    admin/
      metric-card.tsx
      activity-feed.tsx
      status-chart.tsx
```

**Verification:**
- [ ] All metrics display correctly
- [ ] Track filtering works for sales users
- [ ] Recent activity accurate
- [ ] Charts render properly
- [ ] Quick actions navigate correctly

---

### 4. Listing Management (Days 4-7)

**Tasks:**
- [ ] Build listing list pages (land & homes)
- [ ] Add filtering, sorting, and search
- [ ] Create listing detail view
- [ ] Build create/edit forms (type-specific)
- [ ] Implement status transitions
- [ ] Add duplicate listing feature
- [ ] Build preview mode

**List Features:**
- Filters: Status, estate, price range, date
- Sort: Newest, oldest, price, status
- Search: Reference, title, location
- Bulk actions: Export, status change (admin only)
- Pagination: 25 per page

**Form Structure:**
```typescript
// Listing create flow
1. Select type → Land or Homes
2. Basic info → Title, reference, location, estate
3. Details → Type-specific (plot size OR bedrooms)
4. Pricing → Price, price on request, payment plan
5. Media → Upload & order images
6. Review → Preview before save
```

**Files:**
```
src/
  app/
    admin/
      listings/
        land/
          page.tsx              # List
          new/
            page.tsx            # Create wizard
          [id]/
            page.tsx            # Detail
            edit/
              page.tsx          # Edit form
        homes/
          [similar structure]
  lib/
    admin/
      queries/
        listings.ts             # CRUD queries
      validation/
        listing-forms.ts        # Form validation
  components/
    admin/
      listings/
        list-table.tsx
        list-filters.tsx
        listing-form.tsx
        land-detail-form.tsx
        home-detail-form.tsx
        media-uploader.tsx
        status-badge.tsx
```

**Status Transitions:**
```
DRAFT → AVAILABLE → RESERVED → SOLD
         ↓
      UNAVAILABLE (temporary)
```

Track in `StatusChange` table with user + timestamp.

**Verification:**
- [ ] List displays correctly with track filtering
- [ ] Filters and search work
- [ ] Create flow saves correctly
- [ ] Land-specific fields only on land listings
- [ ] Home-specific fields only on home listings
- [ ] Media upload and reordering works
- [ ] Status changes record history
- [ ] Sales users can't see wrong track
- [ ] Preview mode accurate

---

### 5. Estate Management (Days 8-9)

**Tasks:**
- [ ] Build estate list page
- [ ] Create estate form
- [ ] Add amenity management
- [ ] Link listings to estates
- [ ] Build estate detail view

**Features:**
- CRUD operations
- Amenity list (add/remove/reorder)
- Status management
- Linked listings display
- Media gallery

**Files:**
```
src/
  app/
    admin/
      estates/
        page.tsx
        new/page.tsx
        [id]/
          page.tsx
          edit/page.tsx
  lib/
    admin/
      queries/
        estates.ts
  components/
    admin/
      estates/
        estate-form.tsx
        amenity-manager.tsx
        estate-listing.tsx
```

**Verification:**
- [ ] Create estate with amenities
- [ ] Link existing listings to estate
- [ ] Update estate status
- [ ] View linked listings
- [ ] Delete estate (only if no listings)

---

### 6. Media Library (Days 10-11)

**Tasks:**
- [ ] Build media library grid view
- [ ] Implement file upload (Vercel Blob)
- [ ] Add image optimization pipeline
- [ ] Create alt text editor
- [ ] Build media placements manager
- [ ] Add usage tracking (which listings use this media)

**Features:**
- Multi-file upload with drag-and-drop
- Automatic image optimization (AVIF, WebP, JPEG)
- Mandatory alt text
- Filter by: Used/unused, stand-in flag
- Search by filename or alt text
- Replace functionality
- Delete with usage check

**Files:**
```
src/
  app/
    admin/
      media/
        page.tsx           # Grid view
        upload/page.tsx    # Upload interface
  lib/
    admin/
      media/
        upload.ts          # Vercel Blob integration
        optimize.ts        # Image processing
      queries/
        media.ts
  components/
    admin/
      media/
        media-grid.tsx
        upload-zone.tsx
        alt-editor.tsx
        placement-manager.tsx
```

**Image Pipeline:**
```typescript
1. Upload → Vercel Blob
2. Generate optimized variants:
   - AVIF (68% quality)
   - WebP (75% quality)
   - JPEG (80% quality)
3. Extract dimensions
4. Save to Media table
5. Return URL + variants
```

**Placements Manager:**
```typescript
// Special placements for site furniture
const PLACEMENTS = [
  'site.logo',
  'site.ogImage',
  'homepage.hero',
  'homepage.collage.1',
  'homepage.collage.2',
  'homepage.collage.3',
  'homepage.collage.4',
]
```

**Verification:**
- [ ] Upload multiple files
- [ ] Alt text required before save
- [ ] Optimized variants generated
- [ ] Filter by stand-in flag works
- [ ] Usage tracking shows which listings use media
- [ ] Delete prevented if in use
- [ ] Placements manager works

---

### 7. Enquiry Management (Days 12-13)

**Tasks:**
- [ ] Build enquiry inbox with filters
- [ ] Create enquiry detail view
- [ ] Add internal notes functionality
- [ ] Implement status management
- [ ] Build reassignment feature
- [ ] Add search and export

**Inbox Features:**
- Filters: Status, track, assigned user, date range
- Sort: Newest, oldest, status
- Search: Reference, name, email, phone
- Bulk: Export to CSV, assign
- Unread indicator

**Detail View:**
- Enquiry information
- Linked listing (if applicable)
- Status timeline
- Internal notes (private, not sent to enquirer)
- Reassign button
- Contact actions (email, phone)

**Files:**
```
src/
  app/
    admin/
      enquiries/
        page.tsx           # Inbox
        [id]/
          page.tsx         # Detail
      investor-enquiries/
        [similar structure]
  lib/
    admin/
      queries/
        enquiries.ts
  components/
    admin/
      enquiries/
        inbox-table.tsx
        inbox-filters.tsx
        enquiry-detail.tsx
        notes-panel.tsx
        reassign-dialog.tsx
```

**Status Flow:**
```
NEW → IN_PROGRESS → CONTACTED → COMPLETED
                   ↓
                QUALIFIED (for sales tracking)
                   ↓
                CONVERTED (to sale)
```

**Verification:**
- [ ] Track filtering for sales users
- [ ] Status changes record history
- [ ] Notes save and display
- [ ] Reassignment works
- [ ] Investor enquiries separate
- [ ] Export to CSV works
- [ ] Search finds enquiries

---

### 8. Article Management (Day 14)

**Tasks:**
- [ ] Build article list page
- [ ] Create article editor with rich text
- [ ] Add slug generation
- [ ] Implement draft/published workflow
- [ ] Add featured image selector

**Features:**
- Rich text editor (Tiptap or similar)
- Auto-generate slug from title
- Draft/Published status
- Featured image from media library
- SEO fields (meta description)
- Publish date

**Files:**
```
src/
  app/
    admin/
      articles/
        page.tsx
        new/page.tsx
        [id]/edit/page.tsx
  lib/
    admin/
      queries/
        articles.ts
  components/
    admin/
      articles/
        article-form.tsx
        rich-text-editor.tsx
        slug-field.tsx
```

**Verification:**
- [ ] Rich text editor saves formatted content
- [ ] Slug auto-generates and is editable
- [ ] Draft articles don't appear on public site
- [ ] Featured image selection works
- [ ] Published articles appear immediately

---

### 9. User Management (Day 15)

**Tasks:**
- [ ] Build user list (admin only)
- [ ] Create user form
- [ ] Implement role and track assignment
- [ ] Add password reset functionality
- [ ] Build activity log

**Features:**
- List all users
- Create new users
- Edit role and salesTrack
- Reset password
- Deactivate users (soft delete)
- View user activity (enquiries assigned, listings created)

**Files:**
```
src/
  app/
    admin/
      users/
        page.tsx
        new/page.tsx
        [id]/edit/page.tsx
  lib/
    admin/
      queries/
        users.ts
  components/
    admin/
      users/
        user-form.tsx
        role-select.tsx
        activity-log.tsx
```

**Verification:**
- [ ] Only admin can access
- [ ] Create user with email/password
- [ ] Assign correct roles and tracks
- [ ] Reset password generates new one
- [ ] Deactivated users can't log in
- [ ] Activity log shows actions

---

### 10. CSV Import System (Days 16-17)

**Tasks:**
- [ ] Build CSV upload interface
- [ ] Create column mapping UI
- [ ] Implement row validation
- [ ] Add preview before commit
- [ ] Make imports idempotent on reference
- [ ] Record import batches

**Import Flow:**
```typescript
1. Upload CSV file
2. Auto-detect columns or manual mapping
3. Validate each row (Zod schemas)
4. Show preview with errors highlighted
5. User reviews and fixes errors
6. Commit: Valid rows → drafts, errors skipped
7. Record ImportBatch with summary
```

**Features:**
- Support for land and home listings
- Column auto-detection
- Per-row validation with error messages
- Preview table with error highlighting
- Idempotent: Re-importing same reference updates, doesn't duplicate
- Error export: Download rows that failed
- Batch tracking: Who imported, when, how many succeeded/failed

**Files:**
```
src/
  app/
    admin/
      import/
        listings/
          page.tsx         # Upload & map
          preview/page.tsx # Review & commit
  lib/
    admin/
      import/
        parser.ts          # CSV parsing
        mapper.ts          # Column mapping
        validator.ts       # Row validation
        importer.ts        # Batch commit
  components/
    admin/
      import/
        upload-zone.tsx
        column-mapper.tsx
        preview-table.tsx
        error-row.tsx
```

**CSV Format:**
```csv
reference,type,title,location,state,price,priceOnRequest,plotSize,plotUnit,titleType...
RC-L-001,land,Plot A14 Emerald Ridge,Emerald Ridge Estate,Lagos,15000000,false,600,sqm,CERTIFICATE_OF_OCCUPANCY...
```

**Verification:**
- [ ] Upload CSV with valid data
- [ ] Auto-detect common columns
- [ ] Map columns manually
- [ ] Validate rows show errors
- [ ] Preview accurate
- [ ] Commit creates draft listings
- [ ] Re-import updates existing
- [ ] Error export works
- [ ] Batch records saved

---

### 11. Settings & Placements (Day 18)

**Tasks:**
- [ ] Build site settings page
- [ ] Create media placement editor
- [ ] Add homepage content editor
- [ ] Implement cache clearing

**Settings:**
- Site name, tagline
- Contact information
- Social media links
- Featured estates (for homepage)
- Trust band figures (override database counts)

**Placements:**
- Logo
- OG image
- Hero images
- FAQ collage images

**Files:**
```
src/
  app/
    admin/
      settings/
        page.tsx
        placements/page.tsx
  lib/
    admin/
      queries/
        settings.ts
  components/
    admin/
      settings/
        settings-form.tsx
        placement-editor.tsx
```

**Verification:**
- [ ] Update site settings
- [ ] Change logo placement
- [ ] Update hero images
- [ ] Override trust band figures
- [ ] Changes appear on public site

---

## Testing Strategy

### Unit Tests
- [ ] Auth functions (login, session, logout)
- [ ] Access control helpers (role checks)
- [ ] Query functions (listings, estates, enquiries)
- [ ] CSV parser and validator
- [ ] Form validation schemas

### Integration Tests
- [ ] Login flow
- [ ] Create listing end-to-end
- [ ] CSV import flow
- [ ] Media upload and optimization
- [ ] Enquiry assignment and notes

### Manual Testing Checklist
- [ ] Role-based access (try accessing pages as different roles)
- [ ] Track filtering (sales user sees only their track)
- [ ] CSV import with errors
- [ ] Media upload and alt text requirement
- [ ] Status transitions record history
- [ ] Responsive design on mobile
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

---

## Security Considerations

### Authentication
- [ ] Bcrypt password hashing (cost factor 12)
- [ ] Session tokens in database, not localStorage
- [ ] CSRF protection via Auth.js
- [ ] Secure cookies (httpOnly, sameSite)
- [ ] Session expiration (30 days)

### Authorization
- [ ] Role checks in middleware AND query layer
- [ ] Track filtering enforced server-side
- [ ] Direct URL access blocked if unauthorized
- [ ] API routes protected with session check

### Data Validation
- [ ] All inputs validated with Zod
- [ ] File uploads: Type and size limits
- [ ] CSV uploads: Row count limits
- [ ] SQL injection prevention (Prisma parameterization)
- [ ] XSS prevention (React escaping + CSP)

### Rate Limiting
- [ ] Login attempts: 5 per minute per IP
- [ ] Media uploads: 10 per minute per user
- [ ] CSV imports: 2 per minute per user
- [ ] API calls: 100 per minute per user

---

## Performance Targets

- Dashboard load: < 1s
- Listing list (25 items): < 500ms
- Media library (50 images): < 800ms
- CSV import preview (100 rows): < 2s
- Form submission: < 300ms

---

## Dependencies to Install

```json
{
  "dependencies": {
    "next-auth": "^5.0.0",           // Authentication
    "bcrypt": "^5.1.1",               // Password hashing
    "@vercel/blob": "^0.23.0",        // Media storage
    "sharp": "^0.33.0",               // Image optimization
    "@tiptap/react": "^2.8.0",        // Rich text editor
    "@tiptap/starter-kit": "^2.8.0",  // Tiptap basics
    "csv-parse": "^5.5.6",            // CSV parsing
    "papaparse": "^5.4.1",            // CSV parsing alternative
    "react-hook-form": "^7.53.0",     // Form handling
    "@hookform/resolvers": "^3.9.0",  // Zod integration
    "recharts": "^2.13.0",            // Dashboard charts
    "date-fns": "^4.1.0"              // Date formatting
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/papaparse": "^5.3.14"
  }
}
```

---

## Environment Variables

```bash
# Authentication
AUTH_SECRET="your-secret-here"
AUTH_URL="http://localhost:3000"

# Media Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_token_here"

# Already set from Phase 6
DATABASE_URL="postgresql://..."
RESEND_API_KEY="re_..."
ENQUIRY_FROM_EMAIL="enquiries@rakuxoncity.com"
INVESTOR_NOTIFICATION_EMAIL="investors@rakuxoncity.com"
TURNSTILE_SITE_KEY="..."
TURNSTILE_SECRET_KEY="..."
```

---

## Deliverables Checklist

### Functionality
- [ ] Auth system with role-based access
- [ ] Dashboard with metrics
- [ ] Listing CRUD (land & homes)
- [ ] Estate CRUD
- [ ] Article CRUD with rich text
- [ ] Media library with optimization
- [ ] Enquiry inbox with notes
- [ ] User management
- [ ] CSV import
- [ ] Settings & placements

### Quality
- [ ] All forms validate properly
- [ ] Role and track filtering enforced
- [ ] Responsive on mobile
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Lighthouse accessibility ≥ 95
- [ ] Unit tests passing
- [ ] Integration tests passing

### Documentation
- [ ] Admin user guide
- [ ] CSV import format specification
- [ ] API documentation (if exposing any)
- [ ] Deployment guide
- [ ] Security audit notes

---

## Launch Readiness

Before Phase 7 is complete:
- [ ] All acceptance criteria met
- [ ] Security audit passed
- [ ] Performance targets met
- [ ] Browser compatibility verified
- [ ] Mobile responsiveness confirmed
- [ ] Admin trained on system
- [ ] Real users created (not seed data)
- [ ] Backup procedures established

---

## Post-Phase 7 (Phase 8 Prep)

Items to resolve before launch:
- [ ] Replace stand-in photography (TODO §2.5)
- [ ] Replace trust band figures (TODO §2.4)
- [ ] Legal sign-off on privacy/terms (TODO §2.2)
- [ ] Legal sign-off on buyer guides (TODO §2.3)
- [ ] Set retention period (TODO §2.2)
- [ ] Replace placeholder videos (TODO §1.9)
- [ ] Create real mailboxes for sales users (TODO §1.19)
- [ ] Build unsubscribe page (TODO §1.20)

---

**Implementation Start:** 2026-08-27  
**Estimated Duration:** 18 working days  
**Branch:** `feature/phase-7-admin-dashboard`  
**Ready for:** Code review, testing, and merge to main
