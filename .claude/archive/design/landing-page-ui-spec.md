# Landing Page Builder UI - Design Specification

**Version**: 1.0.0
**Date**: 2025-11-22
**Designer**: premium-ux-designer
**Implementation Agent**: shadcn-implementation-builder
**Status**: Ready for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [User Flows](#user-flows)
3. [Component Specifications](#component-specifications)
4. [Block Type Specifications](#block-type-specifications)
5. [shadcn/ui Components](#shadcnui-components)
6. [Accessibility Requirements](#accessibility-requirements)
7. [Responsive Layouts](#responsive-layouts)
8. [Design Tokens](#design-tokens)
9. [Framer Motion Animations](#framer-motion-animations)
10. [State Management](#state-management)
11. [TypeScript Interfaces](#typescript-interfaces)
12. [Implementation Roadmap](#implementation-roadmap)

---

## Overview

The Landing Page Builder enables travel agents to create beautiful, conversion-optimized landing pages for their trips with integrated lead capture. The system consists of:

1. **Landing Pages List Page** - Management dashboard for all landing pages
2. **Landing Page Editor** - Block-based WYSIWYG editor with live preview
3. **Public Landing Page** - Server-rendered public page with lead capture
4. **Lead Management** - Leads captured via landing pages flow into CRM

**Design Philosophy**:
- Intuitive block-based editing similar to modern page builders
- Real-time preview to see changes immediately
- Professional, conversion-optimized templates
- Mobile-first responsive design for public pages
- WCAG 2.1 AA accessibility compliance
- SEO-friendly server-side rendering

**Key Features**:
- 6 block types: Hero, Text, Features, Gallery, Lead Capture, Pricing
- Drag-and-drop block reordering
- Publish/unpublish workflow
- Custom slug for public URL
- Trip association for context
- Lead capture with email notifications

---

## User Flows

### Flow 1: Create New Landing Page

```
User on Landing Pages List
  ↓
Click "Create Landing Page" button
  ↓
Editor page loads with empty canvas
  ↓
Enter page title and slug
  ↓
Optional: Link to trip
  ↓
Click "Add Block" button
  ↓
Select block type (Hero, Text, Features, etc.)
  ↓
Fill in block content
  ↓
Repeat: Add more blocks
  ↓
Drag blocks to reorder
  ↓
Click "Preview" to see public view
  ↓
Click "Publish" to make live
  ↓
Success: Public URL available at /p/[slug]
```

### Flow 2: Edit Existing Landing Page

```
User on Landing Pages List
  ↓
Click "Edit" action on landing page row
  ↓
Editor loads with existing blocks
  ↓
Modify block content
  ↓
Add/remove blocks
  ↓
Reorder blocks via drag-and-drop
  ↓
Click "Save Draft" or "Publish"
  ↓
Changes saved
```

### Flow 3: Publish/Unpublish Landing Page

```
User in Editor
  ↓
Toggle "Published" switch
  ↓
Confirmation dialog appears
  ↓
Click "Confirm"
  ↓
Published: Page goes live at /p/[slug]
Unpublished: Page becomes inaccessible
  ↓
Success toast appears
```

### Flow 4: Public User Submits Lead

```
Public user visits /p/trip-to-paris
  ↓
Scrolls through beautiful blocks
  ↓
Reaches Lead Capture block
  ↓
Fills form: Name, Email, Phone, Message
  ↓
Clicks "Get Quote" (or custom CTA)
  ↓
[Validation]
  ↓ Valid
Success message appears
Lead saved to CRM
Email notification sent to agent
  ↓ Invalid
Error messages shown
User corrects and resubmits
```

### Flow 5: Delete Landing Page

```
User on Landing Pages List
  ↓
Click "Delete" action
  ↓
Confirmation dialog appears
  ↓
Shows: "Delete '[Page Title]'?" with warning
  ↓
Click "Confirm Delete"
  ↓
Page soft-deleted (deletedAt set)
Success toast appears
Page removed from list
```

---

## Component Specifications

### 1. Landing Pages List Page

**Location**: `src/app/(dashboard)/crm/landing-pages/page.tsx`

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ [🏠 Dashboard > CRM > Landing Pages]                        │
├─────────────────────────────────────────────────────────────┤
│ Landing Pages                                               │
│ Create beautiful landing pages to capture leads            │
│                                                             │
│ [🔍 Search pages...]    [Status ▾]    [+ Create Landing Page]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Title ↑ │ Slug │ Trip │ Status │ Leads │ Updated ↓   │   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ Paris Adventure │ paris-2025 │ Paris Trip │ 🟢 Published│  │
│ │                │             │            │ 12 leads │[Edit│
│ ├───────────────────────────────────────────────────────┤   │
│ │ Italian Escape │ italy-tour │ — │ 🔴 Draft │ 0 leads │ [Ed│
│ │                │             │            │          │     │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ Showing 1-10 of 42                     [← 1 2 3 ... 5 →]   │
└─────────────────────────────────────────────────────────────┘
```

**Components**:
- Page header with title and description
- Search input (debounced 300ms)
- Status filter dropdown (All, Published, Draft)
- "Create Landing Page" button (primary CTA)
- Data table with sortable columns
- Pagination controls

**Table Columns**:
1. **Title** - Landing page title (sortable)
2. **Slug** - Public URL slug (monospace font)
3. **Trip** - Associated trip name (or "—" if none)
4. **Status** - Badge (🟢 Published or 🔴 Draft)
5. **Leads** - Lead count with icon
6. **Updated** - Last updated timestamp (sortable, default desc)
7. **Actions** - Dropdown menu

**Actions Menu**:
- View Public Page (external link icon)
- Edit (pencil icon)
- Duplicate (copy icon)
- Delete (trash icon, destructive)

**Empty State**:
```
┌─────────────────────────────────────┐
│         [📄 Large Icon]             │
│                                     │
│   No Landing Pages Yet              │
│                                     │
│   Create your first landing page    │
│   to start capturing leads          │
│                                     │
│   [+ Create Landing Page]           │
└─────────────────────────────────────┘
```

**States**:
- Loading: Skeleton rows
- Empty: Empty state illustration
- Error: Alert with retry button
- Success: Data table with results

---

### 2. Landing Page Editor

**Location**: `src/app/(dashboard)/crm/landing-pages/[slug]/page.tsx`

**Layout** (Split View):
```
┌─────────────────────────────────────────────────────────────┐
│ [← Back]  Paris Adventure                                   │
│ [Save Draft] [Preview] [Publish ⚡]                         │
├──────────────────────┬──────────────────────────────────────┤
│                      │                                      │
│  EDITOR PANEL        │        LIVE PREVIEW                 │
│  (40% width)         │        (60% width)                  │
│                      │                                      │
│ ┌──────────────────┐ │ ┌──────────────────────────────┐   │
│ │ Page Settings    │ │ │ [Hero Block Preview]         │   │
│ │                  │ │ │                              │   │
│ │ Title: [Paris...]│ │ │  Discover Paris              │   │
│ │ Slug: [paris-...]│ │ │  The City of Light           │   │
│ │ Trip: [Select ▾] │ │ │  [Book Now]                  │   │
│ │ Description:     │ │ └──────────────────────────────┘   │
│ │ [Textarea...]    │ │                                      │
│ └──────────────────┘ │ ┌──────────────────────────────┐   │
│                      │ │ [Text Block Preview]         │   │
│ ┌──────────────────┐ │ │                              │   │
│ │ Blocks           │ │ │  Why visit Paris?            │   │
│ │                  │ │ │  Experience the romance...   │   │
│ │ [+ Add Block ▾]  │ │ └──────────────────────────────┘   │
│ │                  │ │                                      │
│ │ ⋮⋮ Hero Block    │ │ ┌──────────────────────────────┐   │
│ │    [Edit] [×]    │ │ │ [Lead Capture Form]          │   │
│ │                  │ │ │                              │   │
│ │ ⋮⋮ Text Block    │ │ │  Ready to book?              │   │
│ │    [Edit] [×]    │ │ │  [Name] [Email] [Submit]     │   │
│ │                  │ │ └──────────────────────────────┘   │
│ │ ⋮⋮ Lead Capture  │ │                                      │
│ │    [Edit] [×]    │ │                                      │
│ └──────────────────┘ │                                      │
└──────────────────────┴──────────────────────────────────────┘
```

**Editor Panel Components**:

1. **Top Bar**:
   - Back button (← Back to Landing Pages)
   - Page title (editable inline)
   - Save Draft button (secondary)
   - Preview button (opens in new tab)
   - Publish button (primary, with ⚡ icon)

2. **Page Settings Card**:
   - Title input (required, max 100 chars)
   - Slug input (required, auto-generated from title, validated)
   - Trip selector (optional, autocomplete)
   - Description textarea (optional, max 500 chars)
   - Published toggle switch

3. **Blocks Section**:
   - "Add Block" dropdown button
   - List of blocks (drag handles, edit/delete)
   - Block type indicator
   - Collapsed/expanded states

**Block List Item**:
```
┌──────────────────────────────┐
│ ⋮⋮  Hero Block               │ ← Drag handle
│     "Discover Paris"          │ ← Preview text
│     [Edit] [×]                │ ← Actions
└──────────────────────────────┘
```

**Add Block Dropdown**:
```
┌──────────────────────┐
│ Hero                 │ ← Large header with image
│ Text                 │ ← Rich text content
│ Features             │ ← Icon grid with descriptions
│ Gallery              │ ← Image gallery
│ Lead Capture         │ ← Contact form
│ Pricing              │ ← Pricing table
└──────────────────────┘
```

**Live Preview Panel**:
- Renders blocks exactly as they'll appear publicly
- Updates in real-time as user edits
- Scrollable to see full page
- Responsive preview controls (desktop/tablet/mobile toggle)

---

### 3. Block Editors

Each block type has a dedicated editor form that appears when "Edit" is clicked.

#### 3.1 Hero Block Editor

**Form Fields**:
```
┌──────────────────────────────────┐
│ Hero Block                       │
│ ─────────────────────────────── │
│                                  │
│ Title *                          │
│ [Discover Paris]                 │
│                                  │
│ Subtitle                         │
│ [The City of Light awaits you]   │
│                                  │
│ Background Image URL             │
│ [https://...]                    │
│ [Upload Image]                   │
│                                  │
│ CTA Button Text                  │
│ [Book Now]                       │
│                                  │
│ CTA Button URL                   │
│ [https://...]                    │
│                                  │
│ [Cancel] [Save Block]            │
└──────────────────────────────────┘
```

**Preview**:
```
┌────────────────────────────────────┐
│  Background Image                  │
│                                    │
│    Discover Paris                  │ ← Large heading
│    The City of Light awaits you    │ ← Subtitle
│                                    │
│    [Book Now]                      │ ← CTA button
│                                    │
└────────────────────────────────────┘
```

#### 3.2 Text Block Editor

**Form Fields**:
```
┌──────────────────────────────────┐
│ Text Block                       │
│ ─────────────────────────────── │
│                                  │
│ Content *                        │
│ ┌──────────────────────────────┐ │
│ │ [B] [I] [U] [H1] [H2] [List] │ │ ← Formatting toolbar
│ │                              │ │
│ │ Why visit Paris?             │ │
│ │                              │ │
│ │ Experience the romance of... │ │
│ │                              │ │
│ └──────────────────────────────┘ │
│                                  │
│ [Cancel] [Save Block]            │
└──────────────────────────────────┘
```

**Editor**: Rich text editor (TipTap or similar)
- Bold, Italic, Underline
- Headings (H1, H2, H3)
- Lists (ordered, unordered)
- Links
- Character limit: 5000

#### 3.3 Features Block Editor

**Form Fields**:
```
┌──────────────────────────────────┐
│ Features Block                   │
│ ─────────────────────────────── │
│                                  │
│ Features (max 6)                 │
│                                  │
│ Feature 1                        │
│ Icon: [🗼] [Change Icon]         │
│ Title: [Iconic Landmarks]        │
│ Description:                     │
│ [Visit the Eiffel Tower...]      │
│ [Remove]                         │
│ ─────────────────────────────── │
│ Feature 2                        │
│ Icon: [🍷] [Change Icon]         │
│ Title: [World-Class Cuisine]     │
│ Description:                     │
│ [Savor French delicacies...]     │
│ [Remove]                         │
│ ─────────────────────────────── │
│                                  │
│ [+ Add Feature]                  │
│                                  │
│ [Cancel] [Save Block]            │
└──────────────────────────────────┘
```

**Icon Picker**:
- Lucide icons library
- Search functionality
- Grid display
- Popular icons first

**Preview** (3-column grid):
```
┌──────────────────────────────────┐
│ 🗼              🍷        🎨      │
│ Iconic         World-    Art &   │
│ Landmarks      Class     Culture │
│                Cuisine            │
│ Visit the      Savor     Explore │
│ Eiffel...      French... museums │
└──────────────────────────────────┘
```

#### 3.4 Gallery Block Editor

**Form Fields**:
```
┌──────────────────────────────────┐
│ Gallery Block                    │
│ ─────────────────────────────── │
│                                  │
│ Images (max 12)                  │
│                                  │
│ ┌─────┐ Image 1                  │
│ │[img]│ URL: [https://...]       │
│ └─────┘ Alt: [Eiffel Tower]      │
│         Caption: [At sunset]     │
│         [Remove]                 │
│ ─────────────────────────────── │
│ ┌─────┐ Image 2                  │
│ │[img]│ URL: [https://...]       │
│ └─────┘ Alt: [Louvre Museum]     │
│         Caption: [Art gallery]   │
│         [Remove]                 │
│ ─────────────────────────────── │
│                                  │
│ [+ Add Image] [Upload Images]    │
│                                  │
│ [Cancel] [Save Block]            │
└──────────────────────────────────┘
```

**Preview** (Responsive grid):
```
┌────────────────────────────────┐
│ [Image 1] [Image 2] [Image 3]  │
│ [Image 4] [Image 5] [Image 6]  │
└────────────────────────────────┘
```

#### 3.5 Lead Capture Block Editor

**Form Fields**:
```
┌──────────────────────────────────┐
│ Lead Capture Block               │
│ ─────────────────────────────── │
│                                  │
│ Title *                          │
│ [Ready to book your trip?]       │
│                                  │
│ Subtitle                         │
│ [Fill out the form below...]     │
│                                  │
│ Submit Button Text *             │
│ [Get Your Free Quote]            │
│                                  │
│ Form Fields                      │
│ ☑ First Name (required)          │
│ ☑ Last Name (required)           │
│ ☑ Email (required)               │
│ ☑ Phone (optional)               │
│ ☑ Message (optional)             │
│                                  │
│ Success Message                  │
│ [Thank you! We'll contact...]    │
│                                  │
│ [Cancel] [Save Block]            │
└──────────────────────────────────┘
```

**Preview**:
```
┌────────────────────────────────┐
│ Ready to book your trip?       │
│ Fill out the form below...     │
│                                │
│ First Name: [________]         │
│ Last Name:  [________]         │
│ Email:      [________]         │
│ Phone:      [________]         │
│ Message:    [________]         │
│             [________]         │
│                                │
│ [Get Your Free Quote]          │
└────────────────────────────────┘
```

#### 3.6 Pricing Block Editor

**Form Fields**:
```
┌──────────────────────────────────┐
│ Pricing Block                    │
│ ─────────────────────────────── │
│                                  │
│ Pricing Plans (max 4)            │
│                                  │
│ Plan 1                           │
│ Name: [Standard Package]         │
│ Price: [1,299]                   │
│ Currency: [USD ▾]                │
│ Highlighted: ☐                   │
│ Features:                        │
│ • [3 nights accommodation]       │
│ • [Airport transfers]            │
│ • [City tour]                    │
│ [+ Add Feature] [Remove Plan]    │
│ ─────────────────────────────── │
│ Plan 2                           │
│ Name: [Premium Package]          │
│ Price: [2,499]                   │
│ Currency: [USD ▾]                │
│ Highlighted: ☑ ← Most Popular    │
│ Features:                        │
│ • [5 nights accommodation]       │
│ • [Airport transfers]            │
│ • [Multiple tours]               │
│ • [Fine dining experience]       │
│ [+ Add Feature] [Remove Plan]    │
│ ─────────────────────────────── │
│                                  │
│ [+ Add Plan]                     │
│                                  │
│ [Cancel] [Save Block]            │
└──────────────────────────────────┘
```

**Preview** (Side-by-side cards):
```
┌────────────┬─────────────┐
│ Standard   │ Premium ⭐  │ ← Highlighted
│ $1,299     │ $2,499      │
│            │             │
│ ✓ 3 nights │ ✓ 5 nights  │
│ ✓ Transfers│ ✓ Transfers │
│ ✓ City tour│ ✓ Tours     │
│            │ ✓ Dining    │
│            │             │
│ [Select]   │ [Select]    │
└────────────┴─────────────┘
```

---

### 4. Public Landing Page

**Location**: `src/app/(public)/p/[slug]/page.tsx`

**Layout** (Server-rendered, SEO-optimized):
```
┌─────────────────────────────────────────────┐
│                                             │ ← No dashboard navigation
│  [Hero Block - Full width]                 │
│                                             │
│  Discover Paris                             │
│  The City of Light awaits you               │
│  [Book Now]                                 │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [Text Block - Contained width]             │
│                                             │
│  Why visit Paris?                           │
│  Experience the romance...                  │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [Features Block - 3 column grid]           │
│                                             │
│  🗼 Landmarks  🍷 Cuisine  🎨 Culture       │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [Gallery Block - Responsive grid]          │
│                                             │
│  [img] [img] [img]                          │
│  [img] [img] [img]                          │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [Pricing Block - Centered cards]           │
│                                             │
│  Standard    Premium ⭐   Luxury            │
│  $1,299      $2,499       $4,999            │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [Lead Capture Block - Centered form]       │
│                                             │
│  Ready to book your trip?                   │
│  [Form fields]                              │
│  [Get Your Free Quote]                      │
│                                             │
├─────────────────────────────────────────────┤
│  Footer                                     │
│  Powered by WanderPlan                      │
└─────────────────────────────────────────────┘
```

**Features**:
- Server-side rendering for SEO
- Open Graph meta tags for social sharing
- Structured data (JSON-LD) for search engines
- Mobile-first responsive design
- Optimized images with lazy loading
- Smooth scroll between sections
- No authentication required
- Professional branding

**Meta Tags** (for SEO):
```html
<head>
  <title>{landingPage.title}</title>
  <meta name="description" content={landingPage.description} />
  <meta property="og:title" content={landingPage.title} />
  <meta property="og:description" content={landingPage.description} />
  <meta property="og:image" content={heroImageUrl} />
  <meta property="og:url" content={`/p/${landingPage.slug}`} />
  <meta name="twitter:card" content="summary_large_image" />
</head>
```

**Footer**:
```
┌─────────────────────────────────────┐
│ Powered by WanderPlan               │ ← Subtle branding
│ Privacy Policy | Terms of Service   │
└─────────────────────────────────────┘
```

---

### 5. Lead Capture Form Component

**Location**: `src/components/landing-pages/LeadCaptureForm.tsx`

**Form Layout**:
```
┌──────────────────────────────────────┐
│ Ready to book your trip?             │ ← Heading
│ Fill out the form below and we'll... │ ← Subheading
│                                      │
│ First Name *                         │
│ ┌──────────────────────────────────┐ │
│ │ John                             │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Last Name *                          │
│ ┌──────────────────────────────────┐ │
│ │ Doe                              │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Email *                              │
│ ┌──────────────────────────────────┐ │
│ │ john@example.com                 │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Phone (optional)                     │
│ ┌──────────────────────────────────┐ │
│ │ +1 (555) 123-4567                │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Message (optional)                   │
│ ┌──────────────────────────────────┐ │
│ │ I'm interested in booking...     │ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ☑ I agree to the privacy policy      │
│                                      │
│ [Get Your Free Quote]                │ ← CTA button
│                                      │
│ 🔒 Your information is secure        │ ← Trust indicator
└──────────────────────────────────────┘
```

**Success State**:
```
┌──────────────────────────────────────┐
│ ✅ Thank you!                        │
│                                      │
│ We've received your request and      │
│ will contact you within 24 hours.    │
│                                      │
│ Check your email for confirmation.   │
└──────────────────────────────────────┘
```

**Error State**:
```
┌──────────────────────────────────────┐
│ ⚠️ Oops!                             │
│                                      │
│ Something went wrong. Please check   │
│ your information and try again.      │
│                                      │
│ First Name *                         │
│ ┌──────────────────────────────────┐ │
│ │ [Empty]                          │ │ ← Red border
│ └──────────────────────────────────┘ │
│ ❌ First name is required            │ ← Error message
│                                      │
│ Email *                              │
│ ┌──────────────────────────────────┐ │
│ │ invalid-email                    │ │ ← Red border
│ └──────────────────────────────────┘ │
│ ❌ Please enter a valid email        │ ← Error message
└──────────────────────────────────────┘
```

**Validation Rules**:
- First Name: Required, 1-50 chars, letters only
- Last Name: Required, 1-50 chars, letters only
- Email: Required, valid email format
- Phone: Optional, valid phone format
- Message: Optional, max 1000 chars
- Privacy policy checkbox: Required

**Submission Flow**:
1. Client-side validation
2. Display loading spinner on button
3. POST to `/api/landing-pages/[slug]/leads`
4. On success: Show success message, hide form
5. On error: Show error message, highlight fields

---

## Block Type Specifications

### Block 1: Hero

**Data Structure**:
```typescript
{
  id: string;
  type: 'hero';
  data: {
    title: string;
    subtitle?: string;
    backgroundImage?: string;
    ctaText?: string;
    ctaUrl?: string;
  }
}
```

**Rendering**:
- Full-width section
- Background image with overlay
- Centered content
- Large heading (text-5xl or larger)
- Subtitle below heading
- CTA button (if provided)
- Min height: 500px on desktop, 400px on mobile

**Styling**:
- Dark overlay (40% opacity) on background image
- White text for contrast
- CTA button: Primary color, hover effect
- Padding: py-24 on desktop, py-16 on mobile

### Block 2: Text

**Data Structure**:
```typescript
{
  id: string;
  type: 'text';
  data: {
    content: string; // Rich text HTML
  }
}
```

**Rendering**:
- Contained width (max-w-4xl)
- Centered
- Rich text rendering
- Typography styles: headings, paragraphs, lists, links

**Styling**:
- Prose classes for beautiful typography
- Generous line height (1.7)
- Padding: py-12

### Block 3: Features

**Data Structure**:
```typescript
{
  id: string;
  type: 'features';
  data: {
    items: Array<{
      icon: string; // Lucide icon name
      title: string;
      description: string;
    }>;
  }
}
```

**Rendering**:
- Grid layout: 3 columns on desktop, 2 on tablet, 1 on mobile
- Icon above title
- Title (text-xl, semibold)
- Description (text-base, muted)

**Styling**:
- Gap between items: gap-8
- Icon size: 48px
- Icon color: Primary
- Padding: py-16

### Block 4: Gallery

**Data Structure**:
```typescript
{
  id: string;
  type: 'gallery';
  data: {
    images: Array<{
      url: string;
      alt: string;
      caption?: string;
    }>;
  }
}
```

**Rendering**:
- Responsive grid: 3 columns on desktop, 2 on tablet, 1 on mobile
- Images with aspect ratio 4:3
- Captions below images (if provided)
- Lightbox on click (optional enhancement)

**Styling**:
- Gap between images: gap-4
- Rounded corners: rounded-lg
- Hover effect: slight zoom
- Padding: py-12

### Block 5: Lead Capture

**Data Structure**:
```typescript
{
  id: string;
  type: 'lead-capture';
  data: {
    title: string;
    subtitle?: string;
    submitText: string;
    fields: {
      firstName: boolean;
      lastName: boolean;
      email: boolean;
      phone: boolean;
      message: boolean;
    };
  }
}
```

**Rendering**:
- Centered container (max-w-2xl)
- Form with configured fields
- Submit button with custom text
- Success/error states

**Styling**:
- Background: Light gray or white card
- Padding: p-8
- Form gap: space-y-4
- CTA button: Primary, full-width

### Block 6: Pricing

**Data Structure**:
```typescript
{
  id: string;
  type: 'pricing';
  data: {
    plans: Array<{
      name: string;
      price: number;
      currency: string;
      features: string[];
      highlighted: boolean;
    }>;
  }
}
```

**Rendering**:
- Grid layout: 3 columns on desktop, 1-2 on tablet/mobile
- Cards with plan details
- Highlighted plan: elevated, border accent
- Features list with checkmarks

**Styling**:
- Card shadow: shadow-lg
- Highlighted card: ring-2 ring-primary, scale-105
- Features: space-y-2, checkmark icons
- Price: Large, bold
- Padding: py-16

---

## shadcn/ui Components

### Used Components

1. **Button** - CTAs, form submissions, actions
2. **Input** - Text inputs in forms
3. **Textarea** - Multi-line text inputs
4. **Label** - Form labels
5. **Select** - Dropdowns (trip selector, status filter)
6. **Card** - Content containers
7. **Badge** - Status indicators
8. **Dialog** - Modals (delete confirmation, publish confirmation)
9. **DropdownMenu** - Actions menu in table
10. **Table** - Data table for landing pages list
11. **Skeleton** - Loading states
12. **Alert** - Success/error messages
13. **Tabs** - Responsive preview toggle (desktop/tablet/mobile)
14. **Switch** - Published toggle
15. **Popover** - Icon picker
16. **Separator** - Visual dividers
17. **ScrollArea** - Scrollable areas

### Installation Commands

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add table
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add scroll-area
```

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

**Keyboard Navigation**:
- All interactive elements accessible via Tab
- Drag-and-drop has keyboard alternative (move up/down buttons)
- Escape closes modals
- Enter submits forms
- Arrow keys navigate menus

**Screen Reader Support**:
- Semantic HTML: `<main>`, `<nav>`, `<article>`, `<form>`
- ARIA labels: All icon buttons
- ARIA live regions: Form validation errors
- ARIA roles: `role="alert"` for errors
- Form field associations: `htmlFor` and `id` matching

**Focus Management**:
- Visible focus indicators (2px ring)
- Focus trapped in modals
- Focus returned to trigger on modal close
- Skip links for keyboard users

**Color Contrast**:
- Text on background: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum
- Status badges meet contrast requirements

**Form Accessibility**:
- All inputs have labels
- Required fields marked with asterisk and `aria-required`
- Error messages announced via `aria-live="polite"`
- Error messages linked via `aria-describedby`

**Image Accessibility**:
- All images have alt text
- Decorative images: `alt=""` or `aria-hidden`
- Complex images: long descriptions

---

## Responsive Layouts

### Breakpoints (Tailwind defaults)

- **Mobile**: < 640px (default)
- **Tablet**: 640px - 1024px (sm, md)
- **Desktop**: 1024px+ (lg, xl, 2xl)

### Landing Pages List

**Mobile** (< 640px):
- Stack search and filters vertically
- Table switches to card layout
- Each landing page is a card
- Actions in dropdown at bottom of card

**Tablet** (640px - 1024px):
- Search and filters in row
- Table shows fewer columns (hide Trip, Leads)
- Actions visible

**Desktop** (1024px+):
- Full table with all columns
- Hover states on rows
- Inline actions

### Landing Page Editor

**Mobile** (< 640px):
- Single column layout
- Preview hidden by default
- "Show Preview" button opens full-screen preview
- Block list shows one at a time

**Tablet** (640px - 1024px):
- Tabbed interface: "Editor" tab and "Preview" tab
- Switch between editing and preview

**Desktop** (1024px+):
- Split view: 40% editor, 60% preview
- Side-by-side editing and preview
- Drag-and-drop reordering

### Public Landing Page

**Mobile** (< 640px):
- Single column layout
- Hero: Smaller text, shorter height
- Features: 1 column
- Gallery: 1 column
- Pricing: 1 column (stack cards)
- Lead form: Full width

**Tablet** (640px - 1024px):
- Hero: Medium text
- Features: 2 columns
- Gallery: 2 columns
- Pricing: 2 columns
- Lead form: Constrained width

**Desktop** (1024px+):
- Hero: Large text, full height
- Features: 3 columns
- Gallery: 3-4 columns
- Pricing: 3-4 columns side-by-side
- Lead form: Centered, max-w-2xl

---

## Design Tokens

Using existing WanderPlan design tokens from `.claude/design/tokens.json`.

### Colors

**Primary**: Blue (#3b82f6)
- Use for: CTA buttons, links, accents, Published badge

**Success**: Green (#22c55e)
- Use for: Success messages, Published status

**Error**: Red (#ef4444)
- Use for: Error messages, destructive actions, Draft status

**Neutral**: Gray scale
- Use for: Backgrounds, borders, text

**Accent**: Purple (#d946ef)
- Use for: Highlighted pricing plans

### Typography

**Font Families**:
- Sans: Inter (body text, UI)
- Display: Cal Sans (headings on public pages)
- Mono: JetBrains Mono (slugs, code)

**Font Sizes**:
- xs: 0.75rem (12px) - Small labels
- sm: 0.875rem (14px) - Secondary text
- base: 1rem (16px) - Body text
- lg: 1.125rem (18px) - Subheadings
- xl: 1.25rem (20px) - Card titles
- 2xl: 1.5rem (24px) - Section headings
- 3xl: 1.875rem (30px) - Page titles
- 4xl: 2.25rem (36px) - Hero subtitles
- 5xl: 3rem (48px) - Hero titles

### Spacing

Using Tailwind spacing scale:
- `p-4`: 1rem (16px) - Compact padding
- `p-6`: 1.5rem (24px) - Standard padding
- `p-8`: 2rem (32px) - Generous padding
- `p-12`: 3rem (48px) - Section padding
- `gap-4`: 1rem - Standard gap
- `gap-6`: 1.5rem - Generous gap
- `gap-8`: 2rem - Large gap

### Shadows

- `shadow-sm`: Subtle elevation
- `shadow-md`: Standard card elevation
- `shadow-lg`: Prominent elevation
- `shadow-xl`: Modal/dialog elevation
- `shadow-premium`: Hero sections

### Border Radius

- `rounded-lg`: 0.5rem (8px) - Standard
- `rounded-xl`: 0.75rem (12px) - Cards
- `rounded-2xl`: 1rem (16px) - Large cards

---

## Framer Motion Animations

### Page Transitions

**List Page Load**:
```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};
```

**Editor Panel Slide In**:
```typescript
<motion.div
  initial={{ x: -300, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.4, ease: 'easeOut' }}
>
```

**Block Add Animation**:
```typescript
<motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0.9, opacity: 0 }}
  transition={{ duration: 0.2 }}
>
```

### Micro-interactions

**Button Hover**:
```typescript
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
>
```

**Card Hover**:
```typescript
<motion.div
  whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
  transition={{ duration: 0.2 }}
>
```

**Publish Toggle**:
```typescript
<motion.div
  animate={{
    backgroundColor: isPublished ? '#22c55e' : '#e5e5e5'
  }}
  transition={{ duration: 0.3 }}
>
```

**Lead Form Success**:
```typescript
<motion.div
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
>
  ✅ Thank you!
</motion.div>
```

### Drag and Drop

**Block Reordering**:
```typescript
import { Reorder } from 'framer-motion';

<Reorder.Group values={blocks} onReorder={setBlocks}>
  {blocks.map((block) => (
    <Reorder.Item key={block.id} value={block}>
      <BlockListItem block={block} />
    </Reorder.Item>
  ))}
</Reorder.Group>
```

**Drag Indicator**:
```typescript
<motion.div
  drag="y"
  dragConstraints={{ top: 0, bottom: 0 }}
  dragElastic={0.2}
  whileDrag={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2)' }}
>
```

### Accessibility

**Respect prefers-reduced-motion**:
```typescript
const shouldReduceMotion = useReducedMotion();

const transition = shouldReduceMotion
  ? { duration: 0 }
  : { duration: 0.3, ease: 'easeOut' };
```

---

## State Management

### Landing Pages List

**Data Fetching** (TanStack Query):
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['landing-pages', { search, status }],
  queryFn: () => fetchLandingPages({ search, status }),
});
```

**Filters State** (URL search params):
```typescript
const [searchParams, setSearchParams] = useSearchParams();
const search = searchParams.get('search') || '';
const status = searchParams.get('status') || 'all';
```

**Create/Edit** (Mutations):
```typescript
const createMutation = useMutation({
  mutationFn: createLandingPage,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
    router.push(`/crm/landing-pages/${newSlug}`);
  },
});
```

### Landing Page Editor

**Local State** (React useState):
```typescript
const [title, setTitle] = useState(landingPage.title);
const [slug, setSlug] = useState(landingPage.slug);
const [blocks, setBlocks] = useState(landingPage.content.blocks);
const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
```

**Auto-save** (Debounced):
```typescript
const debouncedSave = useDebouncedCallback(
  (data) => {
    updateLandingPage.mutate(data);
  },
  1000 // 1 second debounce
);

useEffect(() => {
  debouncedSave({ title, slug, blocks });
}, [title, slug, blocks]);
```

**Optimistic Updates**:
```typescript
const updateMutation = useMutation({
  mutationFn: updateLandingPage,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['landing-page', slug] });
    const previousData = queryClient.getQueryData(['landing-page', slug]);
    queryClient.setQueryData(['landing-page', slug], newData);
    return { previousData };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['landing-page', slug], context?.previousData);
  },
});
```

### Public Landing Page

**Server-side Data Fetching**:
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const landingPage = await fetchLandingPageBySlug(params.slug);
  return {
    title: landingPage.title,
    description: landingPage.description,
    openGraph: {
      title: landingPage.title,
      description: landingPage.description,
      images: [heroImageUrl],
    },
  };
}
```

**Lead Form State**:
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);
const [errors, setErrors] = useState<Record<string, string>>({});
```

---

## TypeScript Interfaces

### Components

```typescript
// Landing Pages List
interface LandingPagesListProps {
  initialData?: LandingPage[];
}

// Landing Page Editor
interface LandingPageEditorProps {
  landingPageSlug: string;
}

// Block Editor
interface BlockEditorProps {
  block: LandingPageBlock;
  onSave: (block: LandingPageBlock) => void;
  onCancel: () => void;
}

// Public Landing Page
interface PublicLandingPageProps {
  landingPage: LandingPage;
}

// Lead Capture Form
interface LeadCaptureFormProps {
  landingPageSlug: string;
  config: {
    title: string;
    subtitle?: string;
    submitText: string;
    fields: {
      firstName: boolean;
      lastName: boolean;
      email: boolean;
      phone: boolean;
      message: boolean;
    };
  };
  onSuccess?: () => void;
}

// Block Renderer
interface BlockRendererProps {
  block: LandingPageBlock;
  isPreview?: boolean;
}
```

### Hooks

```typescript
// useLandingPages
interface UseLandingPagesOptions {
  search?: string;
  status?: 'all' | 'published' | 'draft';
  page?: number;
  limit?: number;
}

function useLandingPages(options: UseLandingPagesOptions): {
  data: LandingPageListResponse | undefined;
  isLoading: boolean;
  error: Error | null;
};

// useLandingPage
function useLandingPage(slug: string): {
  data: LandingPage | undefined;
  isLoading: boolean;
  error: Error | null;
};

// useCreateLandingPage
function useCreateLandingPage(): {
  mutate: (data: CreateLandingPageRequest) => void;
  isLoading: boolean;
  error: Error | null;
};

// useUpdateLandingPage
function useUpdateLandingPage(slug: string): {
  mutate: (data: UpdateLandingPageRequest) => void;
  isLoading: boolean;
  error: Error | null;
};

// useDeleteLandingPage
function useDeleteLandingPage(): {
  mutate: (slug: string) => void;
  isLoading: boolean;
  error: Error | null;
};

// useSubmitLead
function useSubmitLead(landingPageSlug: string): {
  mutate: (data: CreateLeadRequest) => void;
  isLoading: boolean;
  error: Error | null;
};
```

---

## Implementation Roadmap

### Phase 1: Foundation (Day 1)

**Tasks**:
1. Create TanStack Query hooks for API integration
2. Create Landing Pages List page with empty state
3. Implement basic data table
4. Add search and filters
5. Implement Create Landing Page flow (basic form)

**Deliverables**:
- `src/hooks/useLandingPages.ts`
- `src/app/(dashboard)/crm/landing-pages/page.tsx`
- Basic CRUD working

### Phase 2: Editor - Part 1 (Day 2-3)

**Tasks**:
1. Create Editor page with split layout
2. Implement Page Settings panel
3. Create Block List component
4. Implement Add Block dropdown
5. Create Block Editor dialogs (Hero, Text)

**Deliverables**:
- `src/app/(dashboard)/crm/landing-pages/[slug]/page.tsx`
- `src/components/landing-pages/PageEditor.tsx`
- `src/components/landing-pages/BlockEditor.tsx`
- Hero and Text blocks working

### Phase 3: Editor - Part 2 (Day 4-5)

**Tasks**:
1. Implement Features Block Editor
2. Implement Gallery Block Editor
3. Implement Lead Capture Block Editor
4. Implement Pricing Block Editor
5. Add drag-and-drop reordering

**Deliverables**:
- All 6 block types editable
- Drag-and-drop working
- Editor fully functional

### Phase 4: Public Page (Day 6-7)

**Tasks**:
1. Create Public Landing Page component
2. Implement Block Renderers for all 6 types
3. Add SEO meta tags
4. Create Lead Capture Form component
5. Implement form submission
6. Style for mobile/tablet/desktop

**Deliverables**:
- `src/app/(public)/p/[slug]/page.tsx`
- `src/components/landing-pages/BlockRenderer.tsx`
- `src/components/landing-pages/LeadCaptureForm.tsx`
- Public pages working end-to-end

### Phase 5: Polish (Day 8-9)

**Tasks**:
1. Add all Framer Motion animations
2. Implement auto-save
3. Add Preview mode in editor
4. Implement Publish/Unpublish workflow
5. Add Delete confirmation dialog
6. Optimize images
7. Test on all breakpoints

**Deliverables**:
- Polished, production-ready UI
- All animations smooth
- Mobile experience excellent

### Phase 6: Testing & Documentation (Day 10)

**Tasks**:
1. Chrome DevTools validation on all pages
2. Accessibility audit (WCAG 2.1 AA)
3. Cross-browser testing
4. Performance optimization
5. Write component documentation

**Deliverables**:
- All tests passing
- Accessibility compliant
- Documentation complete

---

## File Structure Summary

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── crm/
│   │       └── landing-pages/
│   │           ├── page.tsx                 ← List page
│   │           └── [slug]/
│   │               └── page.tsx             ← Editor page
│   └── (public)/
│       └── p/
│           └── [slug]/
│               └── page.tsx                 ← Public page
│
├── components/
│   └── landing-pages/
│       ├── LandingPagesList.tsx             ← Table component
│       ├── CreateLandingPageDialog.tsx      ← Create dialog
│       ├── DeleteLandingPageDialog.tsx      ← Delete confirmation
│       ├── PageEditor.tsx                   ← Main editor
│       ├── BlockList.tsx                    ← Draggable block list
│       ├── BlockEditor.tsx                  ← Block editor dialogs
│       ├── HeroBlockEditor.tsx              ← Hero editor
│       ├── TextBlockEditor.tsx              ← Text editor
│       ├── FeaturesBlockEditor.tsx          ← Features editor
│       ├── GalleryBlockEditor.tsx           ← Gallery editor
│       ├── LeadCaptureBlockEditor.tsx       ← Lead capture editor
│       ├── PricingBlockEditor.tsx           ← Pricing editor
│       ├── BlockRenderer.tsx                ← Renders blocks publicly
│       ├── LeadCaptureForm.tsx              ← Public lead form
│       └── PublishToggle.tsx                ← Publish/unpublish switch
│
└── hooks/
    └── useLandingPages.ts                   ← TanStack Query hooks
```

---

## Dependencies

**Required npm packages**:
- `@tanstack/react-query` - Data fetching ✅ (already installed)
- `react-hook-form` - Form management ✅ (already installed)
- `framer-motion` - Animations ✅ (already installed)
- `lucide-react` - Icons ✅ (already installed)
- `@dnd-kit/core` - Drag and drop (if not using Framer Motion Reorder)
- `@dnd-kit/sortable` - Sortable lists
- `slugify` - Slug generation
- `zod` - Validation ✅ (already installed)

**Optional enhancements**:
- `tiptap` or `lexical` - Rich text editor for Text block
- `react-image-lightbox` - Image lightbox for Gallery block
- `react-phone-number-input` - Phone input component

---

## Success Criteria

✅ **Functional Requirements**:
- [ ] Can create, edit, delete landing pages
- [ ] Can add/remove/reorder blocks
- [ ] All 6 block types editable
- [ ] Public pages render correctly
- [ ] Lead capture form works
- [ ] Leads saved to database
- [ ] Publish/unpublish workflow works
- [ ] SEO meta tags generated

✅ **Design Requirements**:
- [ ] Matches WanderPlan design system
- [ ] Professional, modern aesthetic
- [ ] Smooth animations
- [ ] Responsive on all devices
- [ ] Premium feel throughout

✅ **Accessibility Requirements**:
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Focus management correct
- [ ] Color contrast meets standards

✅ **Performance Requirements**:
- [ ] Public pages load < 2s
- [ ] Editor responsive (no lag)
- [ ] Images optimized
- [ ] Lighthouse score > 80

---

## Notes for Implementation Agent

**Complexity**: LARGE (10-day implementation)

**Key Challenges**:
1. **Block Editor System**: Building flexible block editors for 6 types
2. **Drag and Drop**: Implementing smooth reordering
3. **Live Preview**: Real-time preview as user edits
4. **Public Rendering**: Server-side rendering with SEO
5. **Form Validation**: Complex lead capture form

**Recommendations**:
1. Start with Landing Pages List (simpler, sets foundation)
2. Build Hero and Text blocks first (simpler blocks)
3. Add remaining blocks incrementally
4. Test public page rendering early
5. Add animations last (polish phase)

**Reusable Patterns**:
- Similar to CRM Clients list page structure
- Similar to Proposal/Invoice forms (React Hook Form patterns)
- Similar to existing table components
- Reuse existing shadcn/ui components

**Testing Priority**:
1. Critical: Lead form submission (revenue-generating)
2. High: Block editors (core functionality)
3. Medium: Drag and drop (nice-to-have, has keyboard alternative)
4. Low: Animations (polish)

---

**End of Design Specification**

This specification is ready for the shadcn-implementation-builder agent to implement.
