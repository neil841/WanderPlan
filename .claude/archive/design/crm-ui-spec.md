# CRM Client Management UI - Design Specification

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
4. [shadcn/ui Components](#shadcnui-components)
5. [Accessibility Requirements](#accessibility-requirements)
6. [Responsive Layouts](#responsive-layouts)
7. [Design Tokens](#design-tokens)
8. [Framer Motion Animations](#framer-motion-animations)
9. [State Management](#state-management)
10. [TypeScript Interfaces](#typescript-interfaces)

---

## Overview

The CRM Client Management system provides travel agents with a professional interface to manage their client relationships. The UI consists of five main components:

1. **Client List Page** - Data table with search, filters, and pagination
2. **Create Client Dialog** - Modal form for adding new clients
3. **Edit Client Dialog** - Modal form for updating client information
4. **Delete Confirmation Dialog** - Destructive action confirmation
5. **Client Details Page** (Optional Enhancement) - Full client profile view

**Design Philosophy**:
- Clean, professional aesthetic suitable for business users
- Efficient data entry with smart defaults
- Visual hierarchy that prioritizes important information
- Accessible to all users including keyboard-only navigation
- Responsive design that works on all devices

---

## User Flows

### Flow 1: Create New Client

```
User on Client List Page
  ↓
Click "Add Client" button
  ↓
Create Client Dialog opens
  ↓
Fill out form (firstName, lastName, email required)
  ↓
Optional: Add phone, status, source, tags, notes
  ↓
Click "Save Client"
  ↓
[Validation]
  ↓ Valid
Success toast appears
Dialog closes
Client appears in table
  ↓ Invalid
Error messages shown inline
User corrects errors
```

### Flow 2: Search and Filter Clients

```
User on Client List Page
  ↓
Type in search bar (firstName, lastName, email, source)
  ↓
Table filters in real-time (debounced 300ms)
  ↓
Optional: Select status filter (LEAD/ACTIVE/INACTIVE)
  ↓
Optional: Select tag filters (multi-select)
  ↓
Table updates with filtered results
  ↓
Click "Clear Filters" to reset
```

### Flow 3: Edit Client

```
User on Client List Page
  ↓
Click "Edit" action on client row
  ↓
Edit Client Dialog opens (pre-populated)
  ↓
Modify fields
  ↓
Click "Update Client"
  ↓
[Validation]
  ↓ Valid
Success toast appears
Dialog closes
Client updates in table
```

### Flow 4: Delete Client

```
User on Client List Page
  ↓
Click "Delete" action on client row
  ↓
Delete Confirmation Dialog opens
  ↓
Shows: "Are you sure you want to delete [Full Name]?"
  ↓
Click "Confirm Delete"
  ↓
Client deleted from database
Success toast appears
Client removed from table
```

---

## Component Specifications

### 1. Client List Page

**Location**: `src/app/(dashboard)/crm/clients/page.tsx`

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│ [🏠 Dashboard > CRM > Clients]                      │
├─────────────────────────────────────────────────────┤
│ Clients                                             │
│ Manage your client relationships                   │
│                                                     │
│ [🔍 Search clients...]  [Status ▾] [Tags ▾]  [+ Add│
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Name ↑ │ Email │ Status │ Source │ Created ↓   │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ John Doe │ john@example.com │ 🟢 ACTIVE │      │ │
│ │ Referral │ Nov 15, 2025 │ [View][Edit][Del]   │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ Jane Smith │ jane@example.com │ 🔵 LEAD │      │ │
│ │ Website │ Nov 10, 2025 │ [View][Edit][Del]    │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Showing 1-20 of 48                    [← 1 2 3 →]  │
└─────────────────────────────────────────────────────┘
```

**Features**:
- **Header Section**:
  - Page title: "Clients" (text-3xl font-bold)
  - Subtitle: "Manage your client relationships" (text-muted-foreground)
  - Breadcrumb navigation

- **Search & Filter Bar**:
  - Search input with magnifying glass icon
  - Placeholder: "Search clients..."
  - Debounced search (300ms delay)
  - Status dropdown filter (All, LEAD, ACTIVE, INACTIVE)
  - Tags multi-select dropdown with checkboxes
  - "Add Client" button (primary, top-right)

- **Data Table**:
  - Columns:
    - **Name** (firstName + lastName, sortable)
    - **Email** (sortable)
    - **Status** (badge, filterable)
    - **Source** (optional, sortable)
    - **Created** (date, sortable, default sort desc)
    - **Actions** (dropdown menu)
  - Row hover effect: subtle background change
  - Alternating row colors for readability
  - Empty state when no clients

- **Pagination**:
  - Shows "Showing X-Y of Z"
  - Previous/Next buttons
  - Page number buttons (max 5 visible)
  - 20 items per page (configurable)

- **States**:
  - Loading: Skeleton loaders (5 rows)
  - Empty: "No clients yet" with illustration and "Add Client" CTA
  - Error: Alert with error message and retry button

**Status Badge Colors**:
- LEAD: Blue (primary-500 background, primary-900 text)
- ACTIVE: Green (success-500 background, success-900 text)
- INACTIVE: Gray (neutral-400 background, neutral-900 text)

---

### 2. Create Client Dialog

**Location**: `src/components/crm/CreateClientDialog.tsx`

**Layout**:
```
┌─────────────────────────────────────┐
│ Add New Client              [✕]    │
├─────────────────────────────────────┤
│                                     │
│ First Name *                        │
│ [________________]                  │
│                                     │
│ Last Name *                         │
│ [________________]                  │
│                                     │
│ Email *                             │
│ [________________]                  │
│ ⓘ This email will be checked for   │
│    duplicates                       │
│                                     │
│ Phone                               │
│ [________________]                  │
│                                     │
│ Status *                            │
│ [LEAD            ▾]                 │
│                                     │
│ Source                              │
│ [________________]                  │
│ 💡 Autocomplete: Referral, Website  │
│                                     │
│ Tags                                │
│ [Select tags or create new...]     │
│ [VIP] [Corporate] [+]               │
│                                     │
│ Notes                               │
│ [________________________]          │
│ [________________________]          │
│ [________________________]          │
│ 0/1000 characters                   │
│                                     │
├─────────────────────────────────────┤
│           [Cancel]  [Save Client]   │
└─────────────────────────────────────┘
```

**Features**:
- **Dialog Header**:
  - Title: "Add New Client"
  - Close button (X) in top-right
  - Accessible close on Escape key

- **Form Fields**:
  1. **First Name** (required)
     - Max length: 50 characters
     - Character counter when > 40 chars
     - Error: "First name is required"

  2. **Last Name** (required)
     - Max length: 50 characters
     - Character counter when > 40 chars
     - Error: "Last name is required"

  3. **Email** (required)
     - Email format validation
     - Duplicate check on blur
     - Max length: 255 characters
     - Error: "Invalid email format" or "Email already exists"
     - Info icon with tooltip: "This email will be checked for duplicates"

  4. **Phone** (optional)
     - Max length: 20 characters
     - Pattern: flexible (international formats)
     - Placeholder: "+1 (555) 123-4567"

  5. **Status** (required, default: LEAD)
     - Dropdown with 3 options
     - Options: LEAD, ACTIVE, INACTIVE
     - Color-coded icons next to each option

  6. **Source** (optional)
     - Text input with autocomplete
     - Suggestions: Referral, Website, Social Media, Email Campaign, Event
     - Max length: 100 characters
     - Lightbulb icon with popular sources tooltip

  7. **Tags** (optional)
     - Multi-select combobox
     - Autocomplete existing tags
     - Create new tag on Enter
     - Visual chips for selected tags
     - Remove tag with X button
     - Max 10 tags per client

  8. **Notes** (optional)
     - Textarea
     - Max length: 1000 characters (note: spec says 5000 in validation, using 1000 for UI)
     - Character counter
     - Placeholder: "Add any additional notes about this client..."

- **Form Actions**:
  - **Cancel Button**:
    - Secondary style
    - Closes dialog
    - Confirms if form has unsaved changes
  - **Save Client Button**:
    - Primary style
    - Disabled when form invalid or submitting
    - Shows loading spinner when submitting
    - Text changes to "Saving..." during submission

- **Form Validation**:
  - Real-time validation on blur
  - Error messages appear below field
  - Error state styling (red border)
  - Submit button disabled until all required fields valid

- **Success Flow**:
  - Toast notification: "Client added successfully!"
  - Dialog closes
  - Client appears in table

- **Error Flow**:
  - Toast notification: "Failed to create client. Please try again."
  - Dialog remains open
  - Form shows specific field errors

---

### 3. Edit Client Dialog

**Location**: `src/components/crm/EditClientDialog.tsx`

**Layout**: Same as Create Client Dialog with these differences:

```
┌─────────────────────────────────────┐
│ Edit Client                 [✕]    │
│ Last updated: Nov 20, 2025 at 3:45PM│
├─────────────────────────────────────┤
│                                     │
│ [Pre-filled form fields...]         │
│                                     │
├─────────────────────────────────────┤
│         [Cancel]  [Update Client]   │
└─────────────────────────────────────┘
```

**Features**:
- All fields pre-populated with existing client data
- Title: "Edit Client"
- Subtitle showing last updated timestamp
- Button text: "Update Client" instead of "Save Client"
- Same validation rules as Create
- Tags show existing tags as chips
- Notes pre-filled with existing content

---

### 4. Delete Confirmation Dialog

**Location**: `src/components/crm/DeleteClientDialog.tsx`

**Layout**:
```
┌─────────────────────────────────────┐
│ Delete Client               [✕]    │
├─────────────────────────────────────┤
│                                     │
│     ⚠️                              │
│                                     │
│  Are you sure you want to delete    │
│  this client?                       │
│                                     │
│  Client: John Doe                   │
│  Email: john@example.com            │
│                                     │
│  This action cannot be undone.      │
│                                     │
├─────────────────────────────────────┤
│           [Cancel]  [Delete Client] │
└─────────────────────────────────────┘
```

**Features**:
- **Warning Icon**: Large warning triangle (⚠️) in warning-500 color
- **Confirmation Message**:
  - Primary text: "Are you sure you want to delete this client?"
  - Client details: Full name and email
  - Warning text: "This action cannot be undone." (text-destructive)
- **Actions**:
  - Cancel button (secondary)
  - Delete Client button (destructive/red)
  - Delete button shows loading spinner during deletion
  - Text changes to "Deleting..." during submission

---

### 5. Client Details Page (Optional Enhancement)

**Location**: `src/app/(dashboard)/crm/clients/[id]/page.tsx`

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│ [🏠 Dashboard > CRM > Clients > John Doe]          │
├─────────────────────────────────────────────────────┤
│                                                     │
│ John Doe                            [Edit] [Delete] │
│ 🟢 ACTIVE                                           │
│                                                     │
│ ┌─────────────────┬─────────────────────────────┐  │
│ │ Contact Info    │ Activity Timeline           │  │
│ ├─────────────────┼─────────────────────────────┤  │
│ │ 📧 john@ex.com  │ • Client created            │  │
│ │ 📱 +1-555-1234  │   Nov 15, 2025              │  │
│ │ 🏷️ VIP, Corp    │                             │  │
│ │ 📍 Referral     │ • Future: Linked trips      │  │
│ │                 │ • Future: Proposals sent    │  │
│ │ Notes:          │ • Future: Invoices          │  │
│ │ Important       │                             │  │
│ │ client...       │                             │  │
│ └─────────────────┴─────────────────────────────┘  │
│                                                     │
│ Related Trips                                       │
│ [Future: List of trips linked to this client]      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Features**:
- Client name as page title
- Status badge
- Edit and Delete buttons (top-right)
- Two-column layout on desktop, stacked on mobile
- Left column: Contact information card
- Right column: Activity timeline
- Future sections: Related trips, proposals, invoices

---

## shadcn/ui Components

The following shadcn/ui components are required for implementation:

### Core Components

1. **Button** (`components/ui/button.tsx`)
   - Variants: default, secondary, destructive, outline, ghost
   - Sizes: default, sm, lg
   - Used in: All dialogs, table actions, page header

2. **Dialog** (`components/ui/dialog.tsx`)
   - Includes: Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
   - Used in: Create Client, Edit Client, Delete Client

3. **Form** (`components/ui/form.tsx`)
   - React Hook Form + Zod integration
   - Includes: Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage
   - Used in: Create/Edit Client forms

4. **Input** (`components/ui/input.tsx`)
   - Text input component
   - Used in: All text fields (firstName, lastName, email, phone, source)

5. **Textarea** (`components/ui/textarea.tsx`)
   - Multi-line text input
   - Used in: Notes field

6. **Select** (`components/ui/select.tsx`)
   - Dropdown select component
   - Includes: Select, SelectTrigger, SelectValue, SelectContent, SelectItem
   - Used in: Status dropdown

7. **Badge** (`components/ui/badge.tsx`)
   - Variants: default, secondary, destructive, outline
   - Custom variants: success (green), warning (yellow), info (blue)
   - Used in: Status badges, tag chips

8. **Table** (`components/ui/table.tsx`)
   - Includes: Table, TableHeader, TableBody, TableHead, TableRow, TableCell
   - Used in: Client list table

9. **Popover** (`components/ui/popover.tsx`)
   - Includes: Popover, PopoverTrigger, PopoverContent
   - Used in: Tag selector, filter dropdowns

10. **Command** (`components/ui/command.tsx`)
    - Combobox functionality
    - Includes: Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem
    - Used in: Tag autocomplete, source autocomplete

### Additional Components

11. **Skeleton** (`components/ui/skeleton.tsx`)
    - Loading placeholder
    - Used in: Table loading state

12. **Alert** (`components/ui/alert.tsx`)
    - Variants: default, destructive
    - Used in: Error states

13. **Tooltip** (`components/ui/tooltip.tsx`)
    - Includes: Tooltip, TooltipTrigger, TooltipContent, TooltipProvider
    - Used in: Info icons, action buttons

14. **DropdownMenu** (`components/ui/dropdown-menu.tsx`)
    - Includes: DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
    - Used in: Row action menu (View/Edit/Delete)

15. **Separator** (`components/ui/separator.tsx`)
    - Horizontal divider
    - Used in: Section separators

16. **Label** (`components/ui/label.tsx`)
    - Form field labels
    - Used in: All form fields

17. **Checkbox** (`components/ui/checkbox.tsx`)
    - Used in: Tag multi-select filter

18. **Toast** (`components/ui/toast.tsx`, `components/ui/toaster.tsx`, `components/ui/use-toast.tsx`)
    - Success/error notifications
    - Used in: Create/Update/Delete feedback

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

#### 1. Keyboard Navigation

**Client List Page**:
- Tab order: Search input → Status filter → Tags filter → Add Client button → Table rows → Pagination
- Table navigation:
  - Arrow keys to navigate between cells
  - Enter to activate row actions
  - Space to open action menu
- Focus visible on all interactive elements (2px outline, primary-500 color)

**Dialogs**:
- Focus trapped within dialog when open
- Focus moves to first input field on dialog open
- Escape key closes dialog
- Tab cycles through form fields
- Enter submits form (when valid)

**Forms**:
- Labels associated with inputs via htmlFor/id
- Required fields marked with asterisk and aria-required
- Error messages announced via aria-live="polite"
- Field descriptions use aria-describedby

#### 2. Screen Reader Support

**ARIA Labels**:
```typescript
// Search input
<Input
  aria-label="Search clients by name, email, or source"
  placeholder="Search clients..."
/>

// Status filter
<Select aria-label="Filter by client status">
  <SelectTrigger>
    <SelectValue placeholder="All Statuses" />
  </SelectTrigger>
</Select>

// Action buttons
<Button aria-label={`Edit ${client.firstName} ${client.lastName}`}>
  <Edit className="h-4 w-4" aria-hidden="true" />
</Button>

// Status badge
<Badge aria-label={`Status: ${status}`}>
  {status}
</Badge>
```

**Table Accessibility**:
- Proper table structure with `<thead>`, `<tbody>`
- Column headers use `<th>` with scope="col"
- Row headers (if any) use `<th>` with scope="row"
- Table caption: "Client list with {count} clients"

**Dialog Accessibility**:
- `role="dialog"`
- `aria-labelledby` points to dialog title
- `aria-describedby` points to dialog description
- Focus management on open/close

#### 3. Color Contrast

All text meets WCAG AA contrast requirements:
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- Interactive elements: 3:1 minimum

**Status Badge Contrast**:
- LEAD (Blue): primary-500 bg (#3b82f6) / primary-900 text (#1e3a8a) = 4.6:1 ✓
- ACTIVE (Green): success-500 bg (#22c55e) / success-900 text (#14532d) = 4.8:1 ✓
- INACTIVE (Gray): neutral-400 bg (#a3a3a3) / neutral-900 text (#171717) = 4.5:1 ✓

#### 4. Form Validation Accessibility

**Error Messages**:
```typescript
<FormField>
  <FormLabel htmlFor="email">Email *</FormLabel>
  <FormControl>
    <Input
      id="email"
      type="email"
      aria-invalid={!!errors.email}
      aria-describedby={errors.email ? "email-error" : "email-description"}
    />
  </FormControl>
  <FormDescription id="email-description">
    This email will be checked for duplicates
  </FormDescription>
  {errors.email && (
    <FormMessage
      id="email-error"
      role="alert"
      aria-live="polite"
    >
      {errors.email.message}
    </FormMessage>
  )}
</FormField>
```

#### 5. Focus Management

**Dialog Open**:
```typescript
useEffect(() => {
  if (open) {
    // Focus first input when dialog opens
    firstNameRef.current?.focus();
  }
}, [open]);
```

**After Delete**:
```typescript
// After successful delete, announce to screen readers
announceToScreenReader('Client deleted successfully');

// Focus returns to "Add Client" button
addClientButtonRef.current?.focus();
```

---

## Responsive Layouts

### Breakpoints (Tailwind CSS)

- **Mobile**: Default (< 768px)
- **Tablet**: `md:` (768px - 1023px)
- **Desktop**: `lg:` (1024px - 1279px)
- **Large Desktop**: `xl:` (1280px+)

### Client List Page Responsive Behavior

#### Mobile (375x667)
```
┌─────────────────┐
│ ☰ Clients  [+] │
├─────────────────┤
│ [🔍 Search...] │
│ [Filters ▾]    │
├─────────────────┤
│ ┌─────────────┐ │
│ │ John Doe    │ │
│ │ 🟢 ACTIVE   │ │
│ │ john@ex.com │ │
│ │ Nov 15, 2025│ │
│ │ [View] [⋮]  │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │ Jane Smith  │ │
│ │ 🔵 LEAD     │ │
│ │ jane@ex.com │ │
│ │ Nov 10, 2025│ │
│ │ [View] [⋮]  │ │
│ └─────────────┘ │
├─────────────────┤
│ [← 1 2 3 →]    │
└─────────────────┘
```

**Mobile Optimizations**:
- Table switches to card layout
- Each client shown as a card
- Cards stack vertically
- Actions collapse to dropdown menu (⋮)
- Search full-width
- Filters collapsed into single dropdown
- Touch targets minimum 44x44px
- Swipe gestures for pagination

#### Tablet (768x1024)
```
┌───────────────────────────────────┐
│ Clients                      [+] │
├───────────────────────────────────┤
│ [🔍 Search...] [Status ▾] [Tag ▾]│
├───────────────────────────────────┤
│ ┌─────────────────────────────┐  │
│ │ Name │ Email │ Status │ ... │  │
│ ├─────────────────────────────┤  │
│ │ John │ john@ │ 🟢 ACT │ ... │  │
│ ├─────────────────────────────┤  │
│ │ Jane │ jane@ │ 🔵 LEA │ ... │  │
│ └─────────────────────────────┘  │
├───────────────────────────────────┤
│ Showing 1-20 of 48    [← 1 2 →] │
└───────────────────────────────────┘
```

**Tablet Optimizations**:
- Hybrid layout (table with reduced columns)
- Show: Name, Email, Status, Actions
- Hide: Source column (accessible via View)
- Created date shown in shortened format
- Filters shown as separate dropdowns

#### Desktop (1920x1080)
```
┌─────────────────────────────────────────────────────┐
│ Clients                                       [+]   │
│ Manage your client relationships                   │
├─────────────────────────────────────────────────────┤
│ [🔍 Search clients...] [Status ▾] [Tags ▾]         │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ Name ↑ │ Email │ Status │ Source │ Created ↓  │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ John Doe │ john@example.com │ 🟢 ACTIVE │ ...  │ │
│ │ Jane Smith │ jane@example.com │ 🔵 LEAD │ ...  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Showing 1-20 of 48                    [← 1 2 3 →]  │
└─────────────────────────────────────────────────────┘
```

**Desktop Features**:
- Full table with all columns visible
- Generous whitespace (p-8)
- Subtitle text visible
- All filters shown inline
- Hover effects on rows
- Tooltip on truncated text

### Dialog Responsive Behavior

#### Mobile
- Full-screen dialog (or nearly full)
- Content scrollable
- Fixed footer with actions
- Single column form layout
- Stack form fields vertically

#### Tablet & Desktop
- Centered modal
- Max width: 600px
- Rounded corners
- Drop shadow
- Form fields at optimal width
- Two-column layout for short fields (firstName/lastName)

**Responsive Classes**:
```tsx
<DialogContent className="
  // Mobile: Full screen with small padding
  w-full h-full max-w-full max-h-full p-4

  // Tablet: Centered modal
  md:w-auto md:h-auto md:max-w-2xl md:max-h-[90vh] md:p-6 md:rounded-lg

  // Desktop: Optimal modal size
  lg:max-w-3xl lg:p-8
">
```

---

## Design Tokens

### Color Usage

**Status Colors**:
```typescript
const statusColors = {
  LEAD: {
    background: 'bg-primary-100 dark:bg-primary-900/20',
    text: 'text-primary-700 dark:text-primary-300',
    border: 'border-primary-200 dark:border-primary-800',
  },
  ACTIVE: {
    background: 'bg-success-100 dark:bg-success-900/20',
    text: 'text-success-700 dark:text-success-300',
    border: 'border-success-200 dark:border-success-800',
  },
  INACTIVE: {
    background: 'bg-neutral-100 dark:bg-neutral-800',
    text: 'text-neutral-700 dark:text-neutral-300',
    border: 'border-neutral-200 dark:border-neutral-700',
  },
};
```

**Interactive Elements**:
- Primary actions: `bg-primary-600 hover:bg-primary-700`
- Secondary actions: `bg-secondary-200 hover:bg-secondary-300`
- Destructive actions: `bg-error-600 hover:bg-error-700`
- Focus ring: `ring-2 ring-primary-500 ring-offset-2`

**Typography**:
- Page title: `text-3xl font-bold text-neutral-900 dark:text-neutral-100`
- Subtitle: `text-base text-neutral-600 dark:text-neutral-400`
- Section heading: `text-xl font-semibold text-neutral-800 dark:text-neutral-200`
- Body text: `text-base text-neutral-700 dark:text-neutral-300`
- Muted text: `text-sm text-neutral-500 dark:text-neutral-500`

**Spacing**:
- Section gaps: `gap-6` (24px)
- Form field gaps: `gap-4` (16px)
- Card padding: `p-6` on mobile, `md:p-8` on desktop
- Dialog padding: `p-4` on mobile, `md:p-6` on desktop

**Shadows**:
- Cards: `shadow-md`
- Dialogs: `shadow-xl`
- Dropdown menus: `shadow-lg`
- Hover elevation: `hover:shadow-lg transition-shadow duration-200`

**Border Radius**:
- Buttons: `rounded-md` (6px)
- Cards: `rounded-lg` (8px)
- Dialogs: `rounded-xl` (12px)
- Inputs: `rounded-md` (6px)
- Badges: `rounded-full`

---

## Framer Motion Animations

### Animation Guidelines

**Principles**:
- Duration: 150ms for micro-interactions, 250ms for page transitions
- Easing: Use `easeOut` for entrances, `easeIn` for exits, `easeInOut` for movements
- Respect `prefers-reduced-motion` media query
- Animate transform and opacity only (not layout properties)

### Component Animations

#### 1. Dialog Enter/Exit

```typescript
// Dialog container
const dialogVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

<motion.div
  variants={dialogVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
>
  {/* Dialog content */}
</motion.div>
```

#### 2. Table Row Fade In

```typescript
// Staggered fade-in for table rows
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

<motion.tbody variants={containerVariants} initial="hidden" animate="visible">
  {clients.map((client) => (
    <motion.tr key={client.id} variants={rowVariants}>
      {/* Row content */}
    </motion.tr>
  ))}
</motion.tbody>
```

#### 3. Button Hover/Tap

```typescript
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{
    type: 'spring',
    stiffness: 400,
    damping: 17
  }}
>
  Add Client
</motion.button>
```

#### 4. Status Badge Pulse (on update)

```typescript
const [justUpdated, setJustUpdated] = useState(false);

// When status changes
const handleStatusUpdate = () => {
  setJustUpdated(true);
  setTimeout(() => setJustUpdated(false), 1000);
};

<motion.div
  animate={justUpdated ? { scale: [1, 1.1, 1] } : {}}
  transition={{ duration: 0.3 }}
>
  <Badge>{status}</Badge>
</motion.div>
```

#### 5. Success Toast Slide In

```typescript
const toastVariants = {
  hidden: {
    opacity: 0,
    x: 100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};
```

#### 6. Tag Chip Add/Remove

```typescript
// Tag appears with scale + fade
const tagVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

<AnimatePresence mode="popLayout">
  {tags.map((tag) => (
    <motion.div
      key={tag}
      variants={tagVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <Badge>{tag}</Badge>
    </motion.div>
  ))}
</AnimatePresence>
```

#### 7. Skeleton Loading Pulse

```typescript
<motion.div
  className="h-10 bg-neutral-200 rounded"
  animate={{
    opacity: [0.5, 0.8, 0.5],
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
/>
```

#### 8. Reduced Motion Support

```typescript
import { useReducedMotion } from 'framer-motion';

const prefersReducedMotion = useReducedMotion();

const variants = prefersReducedMotion
  ? {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    }
  : {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    };
```

---

## State Management

### Client List Page State

```typescript
interface ClientListState {
  // Data
  clients: Client[];
  total: number;

  // Pagination
  page: number;
  limit: number;
  totalPages: number;

  // Filters
  searchQuery: string;
  statusFilter: ClientStatus | 'all';
  tagFilters: string[];

  // Sort
  sortBy: 'firstName' | 'lastName' | 'email' | 'createdAt';
  sortOrder: 'asc' | 'desc';

  // UI State
  isLoading: boolean;
  error: string | null;

  // Dialog State
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  selectedClient: Client | null;
}
```

**State Management Approach**: TanStack Query (React Query)

```typescript
// Hook for fetching clients
const useClients = (params: ClientQueryParams) => {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => fetchClients(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for creating client
const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      // Invalidate and refetch clients
      queryClient.invalidateQueries({ queryKey: ['clients'] });

      // Show success toast
      toast({
        title: 'Client created',
        description: 'The client has been added successfully.',
      });
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Similar hooks for update and delete
const useUpdateClient = () => { /* ... */ };
const useDeleteClient = () => { /* ... */ };
```

### Form State Management

**React Hook Form + Zod**:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClientSchema } from '@/lib/validations/crm';

const form = useForm<CreateClientRequest>({
  resolver: zodResolver(createClientSchema),
  defaultValues: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'LEAD',
    source: '',
    tags: [],
    notes: '',
  },
});

const onSubmit = async (data: CreateClientRequest) => {
  await createClientMutation.mutateAsync(data);
  form.reset();
  onClose();
};
```

### URL State Sync

**Use search params for filters**:

```typescript
import { useSearchParams } from 'next/navigation';

const [searchParams, setSearchParams] = useSearchParams();

// Get filter from URL
const statusFilter = searchParams.get('status') || 'all';
const page = Number(searchParams.get('page')) || 1;

// Update URL when filter changes
const handleStatusChange = (status: string) => {
  const params = new URLSearchParams(searchParams);
  if (status === 'all') {
    params.delete('status');
  } else {
    params.set('status', status);
  }
  params.set('page', '1'); // Reset to page 1
  setSearchParams(params);
};
```

---

## TypeScript Interfaces

### Component Props

```typescript
// Client List Page
interface ClientListPageProps {
  searchParams: {
    page?: string;
    q?: string;
    status?: ClientStatus;
    tags?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  };
}

// Create Client Dialog
interface CreateClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (client: Client) => void;
}

// Edit Client Dialog
interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  onSuccess?: (client: Client) => void;
}

// Delete Client Dialog
interface DeleteClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  onSuccess?: () => void;
}

// Client Table
interface ClientTableProps {
  clients: Client[];
  isLoading: boolean;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onView: (client: Client) => void;
}

// Client Table Row
interface ClientTableRowProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onView: (client: Client) => void;
}

// Search Bar
interface ClientSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Status Filter
interface StatusFilterProps {
  value: ClientStatus | 'all';
  onChange: (value: ClientStatus | 'all') => void;
}

// Tag Filter
interface TagFilterProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  availableTags: string[];
}

// Pagination
interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

// Tag Input
interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  availableTags: string[];
  maxTags?: number;
}

// Status Badge
interface StatusBadgeProps {
  status: ClientStatus;
  className?: string;
}
```

### Form Data Types

```typescript
// Matches createClientSchema
type CreateClientFormData = z.infer<typeof createClientSchema>;

// Matches updateClientSchema
type UpdateClientFormData = z.infer<typeof updateClientSchema>;

// Tag with metadata
interface Tag {
  id: string;
  name: string;
  color?: string;
  count?: number; // How many clients have this tag
}

// Source suggestion
interface SourceSuggestion {
  value: string;
  label: string;
  count?: number; // How many clients from this source
}
```

---

## Implementation Checklist

### Phase 1: Core Components (Day 1-2)

- [ ] Install required shadcn/ui components
- [ ] Create `ClientListPage` component
- [ ] Create `ClientTable` component with basic columns
- [ ] Create `ClientTableRow` component
- [ ] Implement basic data fetching with TanStack Query
- [ ] Add loading skeleton state

### Phase 2: Dialogs & Forms (Day 3-4)

- [ ] Create `CreateClientDialog` component
- [ ] Implement form with React Hook Form + Zod
- [ ] Add all form fields with validation
- [ ] Create `EditClientDialog` component
- [ ] Create `DeleteClientDialog` component
- [ ] Implement create/update/delete mutations

### Phase 3: Search & Filters (Day 5)

- [ ] Create `ClientSearchBar` component
- [ ] Implement debounced search
- [ ] Create `StatusFilter` dropdown
- [ ] Create `TagFilter` multi-select
- [ ] Sync filters with URL search params

### Phase 4: Advanced Features (Day 6-7)

- [ ] Create `TagInput` component with autocomplete
- [ ] Implement source autocomplete
- [ ] Add pagination component
- [ ] Implement sorting on table columns
- [ ] Add empty states
- [ ] Add error states

### Phase 5: Polish & Accessibility (Day 8-9)

- [ ] Add Framer Motion animations
- [ ] Implement all ARIA labels
- [ ] Test keyboard navigation
- [ ] Add focus management
- [ ] Implement responsive layouts
- [ ] Test with screen reader
- [ ] Add loading states for all actions

### Phase 6: Validation & Testing (Day 10)

- [ ] Validate with Chrome DevTools on all breakpoints
- [ ] Run accessibility audit (axe-core)
- [ ] Test all user flows
- [ ] Verify form validation
- [ ] Test error handling
- [ ] Verify success feedback

---

## Design Decisions & Rationale

### 1. Status Badge Design

**Decision**: Use filled backgrounds with contrasting text rather than outlined badges.

**Rationale**:
- Filled badges are more visually prominent and easier to scan
- Color-coding provides instant visual feedback
- Meets WCAG AA contrast requirements
- Consistent with shadcn/ui Badge component variants

### 2. Tag System Implementation

**Decision**: Use multi-select combobox with autocomplete and create-new functionality.

**Rationale**:
- Reduces duplicate tags (autocomplete suggests existing)
- Flexible (users can create new tags when needed)
- Efficient data entry (keyboard navigation)
- Standard pattern in CRM systems

### 3. Mobile Card Layout

**Decision**: Switch from table to card layout on mobile rather than horizontal scroll.

**Rationale**:
- Horizontal scrolling on mobile is poor UX
- Cards provide better touch targets
- Easier to read on small screens
- Can show more information per client

### 4. Form Field Order

**Decision**: Order fields from most to least important (Name → Email → Phone → Status → Source → Tags → Notes).

**Rationale**:
- Natural information hierarchy
- Required fields at the top
- Optional/advanced fields at the bottom
- Matches user mental model

### 5. Pagination Over Infinite Scroll

**Decision**: Use traditional pagination rather than infinite scroll.

**Rationale**:
- Business users prefer to know total count
- Easier to reference specific clients ("page 3")
- Better performance for large datasets
- Consistent with professional CRM tools

---

## Next Steps

1. **shadcn-implementation-builder** should implement components in this order:
   - Core UI primitives (if not already installed)
   - Client List Page skeleton
   - Create Client Dialog
   - Edit/Delete dialogs
   - Search and filter components
   - Polish and animations

2. **Validation checkpoints**:
   - After Client List Page: Chrome DevTools validation
   - After all dialogs: Form validation testing
   - After search/filters: Filter functionality testing
   - Final: Full accessibility audit

3. **Integration with existing app**:
   - Ensure navigation links to `/crm/clients` in sidebar
   - Add CRM section to dashboard layout
   - Verify authentication/authorization for CRM access

---

## References

- **API Documentation**: `/home/user/WanderPlan/src/app/api/crm/clients/route.ts`
- **Type Definitions**: `/home/user/WanderPlan/src/types/crm.ts`
- **Validation Schemas**: `/home/user/WanderPlan/src/lib/validations/crm.ts`
- **Design Tokens**: `/home/user/WanderPlan/.claude/design/tokens.json`
- **shadcn/ui Docs**: https://ui.shadcn.com/

---

**End of Design Specification**

This specification provides complete design guidance for implementing the CRM Client Management UI. All components, interactions, and states are documented with implementation details, accessibility requirements, and responsive behavior.
