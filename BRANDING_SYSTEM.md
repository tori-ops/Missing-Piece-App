# White-Label Branding System

## Overview
The Missing Piece App now supports complete white-label branding, allowing each tenant to customize the client-facing experience with their own colors, logo, company name, and messaging.

## Features

### 1. **Tenant Branding Fields** (Database)
Added 7 customizable branding fields to the Tenant model in Prisma:

- **brandingPrimaryColor** (default: #274E13) - Main brand color used for headings, buttons, borders
- **brandingSecondaryColor** (default: #D0CEB5) - Secondary color for backgrounds and accents
- **brandingLogoUrl** - URL to tenant's logo image
- **brandingCompanyName** - Custom company name (displayed as "Powered by {companyName}")
- **brandingTagline** - Short tagline/description for the tenant
- **brandingFaviconUrl** - URL to custom favicon
- **brandingFooterText** - Custom footer text

### 2. **Branding Utility Library** (`src/lib/branding.ts`)
Provides helper functions for working with tenant branding:

```typescript
// Get complete branding object with fallback defaults
const branding = getTenantBranding(tenant);

// Validate hex color format
if (isValidHexColor('#FF0000')) { ... }

// Convert hex to RGB (for hover effects, transparency)
const rgb = hexToRgb('#FF0000'); // returns [255, 0, 0]

// Adjust color lightness for hover states
const lighter = adjustColorLightness('#274E13', 0.2); // 20% lighter
```

### 3. **Client Dashboard Branding** (`src/app/dashboard/client/page.tsx`)
The client-facing dashboard fully uses tenant branding:

- **Dynamic Colors**: All hardcoded colors replaced with tenant branding colors
- **Logo Display**: Shows tenant's logo if provided
- **Company Name**: Displays "Powered by {companyName}" instead of hardcoded messaging
- **Footer Text**: Shows custom footer text if provided
- **Safe Defaults**: Falls back to The Missing Piece branding if not customized

Example usage:
```tsx
const branding = getTenantBranding(tenant);
const primaryColor = branding.primaryColor; // #274E13 or tenant's color
<div style={{ color: primaryColor }}>Welcome!</div>
```

### 4. **SuperAdmin Branding Editor** 
#### Form Component (`src/components/TenantBrandingForm.tsx`)
Client-side form for customizing tenant branding:
- Color picker + hex input fields
- Logo and favicon URL inputs
- Company name, tagline, footer text inputs
- Hex color validation
- Success/error messaging
- Real-time form handling

#### Modal Wrapper (`src/components/TenantBrandingModal.tsx`)
- "🎨 Edit Branding" button (appears in Tenant Management)
- Modal overlay with form
- Auto-closes and reloads page on success

#### API Endpoint (`src/app/api/admin/update-tenant-branding/route.ts`)
- **Method**: POST
- **Auth**: SuperAdmin only
- **Validation**: 
  - Hex color format validation
  - Tenant existence check
- **Response**: Updated tenant with branding fields
- **Audit Trail**: Creates audit log entry for branding changes

### 5. **Tenant Management Integration** (`src/components/TenantManagement.tsx`)
Updated SuperAdmin tenant management view:
- New "Branding" column in tenant table
- Each tenant row has "🎨 Edit Branding" button
- Opens TenantBrandingModal for that specific tenant
- Updated API calls now fetch and return all branding fields

### 6. **API Updates**
Updated `/api/admin/list-tenants` to include all 7 branding fields in responses

## How It Works

### For SuperAdmin:
1. Log in to SuperAdmin account
2. Go to Tenant Management modal
3. Click "🎨 Edit Branding" on any tenant row
4. Customize colors, logo, company name, tagline, favicon, footer text
5. Click Save
6. Changes are immediately saved to database and audit log created

### For Clients:
1. Client logs in to their account
2. Dashboard displays tenant's custom branding throughout:
   - Primary color for headings, borders, box shadows
   - Secondary color for background
   - Tenant's logo in header (if provided)
   - "Powered by {companyName}" instead of fixed branding
   - Custom footer text (if provided)

## Database Schema

```prisma
model Tenant {
  // ... existing fields ...
  
  // Branding fields
  brandingPrimaryColor      String?           @default("#274E13")
  brandingSecondaryColor    String?           @default("#D0CEB5")
  brandingLogoUrl           String?
  brandingCompanyName       String?
  brandingTagline           String?
  brandingFaviconUrl        String?
  brandingFooterText        String?
  
  // ... rest of model ...
}
```

## Files Modified/Created

### Created:
- `src/lib/branding.ts` - Branding utility library
- `src/components/TenantBrandingForm.tsx` - Branding customization form
- `src/components/TenantBrandingModal.tsx` - Modal wrapper for form
- `src/app/api/admin/update-tenant-branding/route.ts` - API endpoint

### Modified:
- `prisma/schema.prisma` - Added 7 branding fields to Tenant model
- `src/app/dashboard/client/page.tsx` - Updated to use dynamic branding
- `src/components/TenantManagement.tsx` - Added branding editor integration
- `src/app/api/admin/list-tenants/route.ts` - Added branding fields to select

## Testing the Branding System

### Step 1: SuperAdmin Login
```
Email: tori@missingpieceplanning.com
Password: SuperAdmin123!
```

### Step 2: Edit Tenant Branding
1. Click "Tenant Management" modal button
2. Find a tenant row
3. Click "🎨 Edit Branding" button
4. Change primary color to: `#0066CC` (blue)
5. Change company name to: "Elite Weddings"
6. Click Save

### Step 3: Client Login
```
Email: emma@example.local
Password: test123!
```

### Step 4: Verify Branding
- Dashboard should show:
  - Blue headings and borders (custom primary color)
  - Light background (default secondary)
  - "Powered by Elite Weddings" in header
  - All UI elements in custom color scheme

## Safety & Defaults

The system is designed with safety in mind:

1. **Fallback Defaults**: If a tenant's branding is NULL, falls back to The Missing Piece defaults
2. **Validation**: Hex colors are validated before saving
3. **No Breaking Changes**: Old code without branding still works (uses defaults)
4. **Audit Trail**: All branding changes are logged with timestamp and user

## Future Enhancements

Potential additions to the branding system:
- Logo upload (instead of URL)
- Font family customization
- Button styling customization
- Email template branding
- Client interface layout themes
- Custom domain support
- Brand guidelines document per tenant

## Testing Checklist

- [x] Database migration with branding fields
- [x] Branding utility functions created
- [x] Client dashboard uses dynamic colors
- [x] SuperAdmin form validates hex colors
- [x] API endpoint updates tenant branding
- [x] Tenant list fetches branding fields
- [x] Modal integration in tenant management
- [ ] End-to-end test with multiple tenants
- [ ] Verify audit logs are created
- [ ] Test color picker functionality
- [ ] Test with custom logo URLs
- [ ] Verify page reload on save works
