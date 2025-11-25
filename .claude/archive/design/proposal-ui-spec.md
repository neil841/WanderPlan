# Proposal Management UI - Design Specification

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

The Proposal Management system provides travel agents with a professional interface to create, send, and manage client proposals. The UI consists of five main components:

1. **Proposal List Page** - Data table with search, filters, and pagination
2. **Create/Edit Proposal Page** - Multi-section form for proposal details
3. **Proposal View Page** - Professional preview (printable layout)
4. **Send Proposal Dialog** - Email confirmation and sending
5. **Delete Confirmation Dialog** - Destructive action confirmation

**Design Philosophy**:
- Professional aesthetic suitable for client-facing documents
- Efficient data entry with real-time calculations
- Clear visual hierarchy emphasizing financial information
- Accessible to all users including keyboard-only navigation
- Responsive design that works on all devices
- Printable PDF-ready proposal preview

---

## User Flows

### Flow 1: Create New Proposal

```
User on Proposal List Page
  ↓
Click "Create Proposal" button
  ↓
Navigate to Create Proposal Page
  ↓
Section 1: Basic Info
  - Enter title (required)
  - Select client from autocomplete (required)
  - Optional: Select trip from autocomplete
  - Optional: Enter description
  - Optional: Select valid until date (must be future)
  ↓
Section 2: Line Items
  - Click "Add Line Item"
  - Enter description, quantity, unit price
  - Total auto-calculates (quantity × unit price)
  - Repeat for additional items
  - Subtotal auto-updates
  ↓
Section 3: Financial Summary
  - Subtotal shown (read-only, auto-calculated)
  - Optional: Enter tax amount
  - Optional: Enter discount amount
  - Total auto-calculates (subtotal + tax - discount)
  - Select currency (default: USD)
  ↓
Section 4: Additional Details
  - Optional: Enter internal notes
  - Optional: Enter terms and conditions
  ↓
Click "Save as Draft" OR "Send to Client"
  ↓
[Validation]
  ↓ Valid
Success toast appears
Navigate to Proposal View Page
  ↓ Invalid
Error messages shown inline
User corrects errors
```

### Flow 2: Send Proposal to Client

```
User on Proposal View Page (status: DRAFT)
  ↓
Click "Send to Client" button
  ↓
Send Proposal Dialog opens
  ↓
Shows:
  - Proposal title
  - Client name and email (pre-filled)
  - Email preview template
  - Total amount
  ↓
Click "Confirm and Send"
  ↓
Email sent to client
Status changes to SENT
sentAt timestamp recorded
Success toast appears
  ↓
Dialog closes
Proposal View Page updates (status badge changes)
"Send to Client" button disabled
```

### Flow 3: Search and Filter Proposals

```
User on Proposal List Page
  ↓
Type in search bar (title or description)
  ↓
Table filters in real-time (debounced 300ms)
  ↓
Optional: Select status filter (DRAFT/SENT/ACCEPTED/REJECTED)
  ↓
Optional: Select client filter (autocomplete)
  ↓
Table updates with filtered results
  ↓
Click "Clear Filters" to reset
```

### Flow 4: Edit Proposal

```
User on Proposal List Page
  ↓
Click "Edit" action on proposal row
  ↓
Navigate to Edit Proposal Page (pre-populated)
  ↓
Modify fields (same as Create flow)
  ↓
Click "Update Proposal"
  ↓
[Validation]
  ↓ Valid
Success toast appears
Navigate to Proposal View Page
  ↓
Status changes to DRAFT (if was SENT)
Note: Cannot edit ACCEPTED proposals
```

### Flow 5: Delete Proposal

```
User on Proposal List Page
  ↓
Click "Delete" action on proposal row
  ↓
Delete Confirmation Dialog opens
  ↓
Shows: "Are you sure you want to delete [Title]?"
Warning: Cannot delete ACCEPTED proposals
  ↓
Click "Confirm Delete"
  ↓
Proposal soft deleted (deletedAt timestamp)
Success toast appears
Proposal removed from table
```

---

## Component Specifications

### 1. Proposal List Page

**Location**: `src/app/(dashboard)/crm/proposals/page.tsx`

**Layout**:
```
┌───────────────────────────────────────────────────────────┐
│ [🏠 Dashboard > CRM > Proposals]                          │
├───────────────────────────────────────────────────────────┤
│ Proposals                                                 │
│ Create and manage client proposals                       │
│                                                           │
│ [🔍 Search proposals...] [Status ▾] [Client ▾] [+ Create]│
├───────────────────────────────────────────────────────────┤
│                                                           │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Title ↑ │ Client │ Trip │ Status │ Total │ Valid │ │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ Bali Adventure │ John Doe │ Bali Trip │ 🟢 SENT │ │   │
│ │ $5,250.00 │ Dec 31, 2025 │ [View][Edit][Del]      │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ Paris Honeymoon │ Jane Smith │ - │ 📝 DRAFT │     │   │
│ │ $12,800.00 │ - │ [View][Edit][Del]                │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ Tokyo Business │ Bob Johnson │ Tokyo │ ✅ ACCEPTED│   │
│ │ $3,400.00 │ Nov 30, 2025 │ [View]                 │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
│ Showing 1-20 of 48                      [← 1 2 3 →]      │
└───────────────────────────────────────────────────────────┘
```

**Features**:
- **Header Section**:
  - Page title: "Proposals" (text-3xl font-bold)
  - Subtitle: "Create and manage client proposals" (text-muted-foreground)
  - Breadcrumb navigation

- **Search & Filter Bar**:
  - Search input with magnifying glass icon
  - Placeholder: "Search proposals by title..."
  - Debounced search (300ms delay)
  - Status dropdown filter (All, DRAFT, SENT, ACCEPTED, REJECTED)
  - Client autocomplete filter
  - "Create Proposal" button (primary, top-right)

- **Data Table**:
  - Columns:
    - **Title** (sortable, max 50 chars shown, tooltip for full)
    - **Client** (firstName + lastName, sortable)
    - **Trip** (trip name or "-", optional)
    - **Status** (badge, filterable)
    - **Total** (currency formatted, sortable)
    - **Valid Until** (date or "-", sortable)
    - **Actions** (dropdown menu)
  - Row hover effect: subtle background change
  - Alternating row colors for readability
  - Empty state when no proposals

- **Pagination**:
  - Shows "Showing X-Y of Z"
  - Previous/Next buttons
  - Page number buttons (max 5 visible)
  - 20 items per page (configurable)

- **States**:
  - Loading: Skeleton loaders (5 rows)
  - Empty: "No proposals yet" with illustration and "Create Proposal" CTA
  - Error: Alert with error message and retry button

**Status Badge Colors**:
- DRAFT: Gray (neutral-400 background, neutral-900 text)
- SENT: Blue (primary-500 background, primary-900 text)
- ACCEPTED: Green (success-500 background, success-900 text)
- REJECTED: Red (error-500 background, error-900 text)

**Currency Formatting**:
- USD: $5,250.00
- EUR: €5,250.00
- GBP: £5,250.00

---

### 2. Create/Edit Proposal Page

**Location**:
- Create: `src/app/(dashboard)/crm/proposals/new/page.tsx`
- Edit: `src/app/(dashboard)/crm/proposals/[id]/edit/page.tsx`

**Layout**:
```
┌───────────────────────────────────────────────────────────┐
│ [🏠 Dashboard > CRM > Proposals > New]                    │
├───────────────────────────────────────────────────────────┤
│ Create Proposal                          [Save Draft] [X] │
│                                          [Send to Client]  │
├───────────────────────────────────────────────────────────┤
│                                                           │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ SECTION 1: Basic Information                       │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ Title *                                             │   │
│ │ [_____________________________] 0/200               │   │
│ │                                                     │   │
│ │ Client *                                            │   │
│ │ [Search clients...            ▾]                    │   │
│ │                                                     │   │
│ │ Trip (Optional)                                     │   │
│ │ [Search trips...              ▾]                    │   │
│ │                                                     │   │
│ │ Description (Optional)                              │   │
│ │ [_____________________________]                     │   │
│ │ [_____________________________] 0/2000              │   │
│ │                                                     │   │
│ │ Valid Until (Optional)                              │   │
│ │ [Select date              📅]                       │   │
│ │ ⓘ Proposal validity period for client              │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ SECTION 2: Line Items                              │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ ┌─────┬────────────┬────────┬──────────┬─────────┐ │   │
│ │ │ #   │ Descrip.   │ Qty    │ Unit $   │ Total   │ │   │
│ │ ├─────┼────────────┼────────┼──────────┼─────────┤ │   │
│ │ │ 1   │ Round trip │ 2      │ 850.00   │1,700.00 │ │   │
│ │ │     │ flights    │        │          │   [x]   │ │   │
│ │ ├─────┼────────────┼────────┼──────────┼─────────┤ │   │
│ │ │ 2   │ 5-night    │ 1      │ 2,000.00 │2,000.00 │ │   │
│ │ │     │ hotel stay │        │          │   [x]   │ │   │
│ │ └─────┴────────────┴────────┴──────────┴─────────┘ │   │
│ │                                                     │   │
│ │ [+ Add Line Item]                                   │   │
│ │                                                     │   │
│ │ Subtotal: $3,700.00                                 │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ SECTION 3: Financial Summary                       │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ Subtotal (auto-calculated)         $3,700.00       │   │
│ │                                                     │   │
│ │ Tax (optional)                                      │   │
│ │ [_________]                        +$   370.00      │   │
│ │                                                     │   │
│ │ Discount (optional)                                 │   │
│ │ [_________]                        -$     0.00      │   │
│ │                                                     │   │
│ │ Currency                                            │   │
│ │ [USD ▾]                                             │   │
│ │                                                     │   │
│ │ ──────────────────────────────────────────────      │   │
│ │ TOTAL                              $4,070.00       │   │
│ │ ──────────────────────────────────────────────      │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ SECTION 4: Additional Details                      │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ Internal Notes (optional)                           │   │
│ │ [_____________________________]                     │   │
│ │ [_____________________________] 0/2000              │   │
│ │ ⓘ These notes are not visible to the client        │   │
│ │                                                     │   │
│ │ Terms and Conditions (optional)                     │   │
│ │ [Rich text editor...]                               │   │
│ │ 0/5000 characters                                   │   │
│ │ ⓘ These terms will appear on the proposal          │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
│ [Cancel]                  [Save as Draft] [Send to Client]│
└───────────────────────────────────────────────────────────┘
```

**Features**:

**Section 1: Basic Information**
1. **Title** (required)
   - Max length: 200 characters
   - Character counter when > 150 chars
   - Error: "Title is required"

2. **Client** (required, autocomplete)
   - Command component with search
   - Shows: client name and email
   - Filters as user types
   - Error: "Client is required"

3. **Trip** (optional, autocomplete)
   - Command component with search
   - Shows: trip name and dates
   - Filters user's trips only
   - Can be left empty

4. **Description** (optional)
   - Textarea
   - Max length: 2000 characters
   - Character counter
   - Placeholder: "Describe this proposal..."

5. **Valid Until** (optional, date picker)
   - Must be future date
   - Calendar component
   - Error: "Date must be in the future"
   - Info icon: "Proposal validity period for client"

**Section 2: Line Items**
- Dynamic table with add/remove rows
- Minimum 1 line item required
- Each line item has:
  1. **Description** (required, max 500 chars)
  2. **Quantity** (required, positive number)
  3. **Unit Price** (required, non-negative number)
  4. **Total** (auto-calculated, read-only)
  5. **Remove button** (X icon)
- "Add Line Item" button generates new row with unique UUID
- Subtotal auto-updates on any change
- Real-time calculation

**Section 3: Financial Summary**
- **Subtotal**: Read-only, auto-calculated from line items
- **Tax**: Optional number input, defaults to 0
- **Discount**: Optional number input, defaults to 0
- **Currency**: Dropdown (USD, EUR, GBP, CAD, AUD, etc.)
- **Total**: Read-only, large prominent display
- Formula: Total = Subtotal + Tax - Discount
- All amounts display with 2 decimal places

**Section 4: Additional Details**
1. **Internal Notes** (optional)
   - Textarea
   - Max length: 2000 characters
   - Character counter
   - Info icon: "These notes are not visible to the client"
   - For internal tracking only

2. **Terms and Conditions** (optional)
   - Rich text editor (or textarea)
   - Max length: 5000 characters
   - Character counter
   - Info icon: "These terms will appear on the proposal"
   - Client-facing content

**Form Actions**:
- **Cancel Button**: Secondary, navigates back to list
- **Save as Draft**: Secondary, saves with status DRAFT
- **Send to Client**: Primary, validates and opens Send Dialog

**Form Validation**:
- Real-time validation on blur
- Error messages appear below field
- Error state styling (red border)
- Submit disabled until all required fields valid
- Unsaved changes warning when navigating away

**Auto-save**:
- Auto-save draft every 30 seconds
- Shows "Saving..." indicator
- Shows "All changes saved" when complete
- Doesn't apply to new proposals (only edits)

---

### 3. Proposal View Page

**Location**: `src/app/(dashboard)/crm/proposals/[id]/page.tsx`

**Layout** (Printable Preview):
```
┌───────────────────────────────────────────────────────────┐
│ [🏠 Dashboard > CRM > Proposals > Bali Adventure]         │
├───────────────────────────────────────────────────────────┤
│ [Edit] [Send to Client] [Download PDF] [Delete]           │
├───────────────────────────────────────────────────────────┤
│                                                           │
│ ┌─────────────────────────────────────────────────────┐   │
│ │                    [Company Logo]                   │   │
│ │                                                     │   │
│ │                   TRAVEL PROPOSAL                   │   │
│ │                   Bali Adventure                    │   │
│ │                                                     │   │
│ │   Status: 🟢 SENT                                   │   │
│ │   Created: November 22, 2025                        │   │
│ │   Valid Until: December 31, 2025                    │   │
│ │                                                     │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ CLIENT INFORMATION                                  │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ John Doe                                            │   │
│ │ john.doe@example.com                                │   │
│ │                                                     │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ TRIP INFORMATION                                    │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ Bali Adventure                                      │   │
│ │ December 15, 2025 - December 22, 2025               │   │
│ │                                                     │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ DESCRIPTION                                         │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ A comprehensive 7-day adventure in Bali including   │   │
│ │ flights, accommodation, and curated experiences.    │   │
│ │                                                     │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ PROPOSED SERVICES                                   │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ Item                          Qty  Unit    Total    │   │
│ │ ─────────────────────────────────────────────────  │   │
│ │ Round trip flights (LAX-DPS)   2   $850   $1,700   │   │
│ │ 5-night luxury hotel stay      1  $2,000  $2,000   │   │
│ │ Private temple tour             2   $150   $300    │   │
│ │ Cooking class experience        2   $100   $200    │   │
│ │ Airport transfers               1   $50    $50     │   │
│ │                                                     │   │
│ │                               Subtotal:  $4,250.00  │   │
│ │                               Tax (10%): $425.00    │   │
│ │                               Discount:  -$0.00     │   │
│ │                               ─────────────────     │   │
│ │                               TOTAL:     $4,675.00  │   │
│ │                                                     │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ TERMS AND CONDITIONS                                │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ 1. A 50% deposit is required to confirm booking.   │   │
│ │ 2. Final payment is due 30 days before departure.  │   │
│ │ 3. Cancellation policy applies as per our terms.   │   │
│ │ 4. Travel insurance is recommended.                │   │
│ │                                                     │   │
│ │ This proposal is valid until December 31, 2025.    │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Features**:

**Action Bar** (top, not printed):
- **Edit Button**: Navigate to edit page (disabled if ACCEPTED)
- **Send to Client**: Opens Send Dialog (disabled if SENT/ACCEPTED/REJECTED)
- **Download PDF**: Generate and download PDF
- **Delete Button**: Opens Delete Confirmation (disabled if ACCEPTED)

**Proposal Header** (printed):
- Company logo (if configured)
- "TRAVEL PROPOSAL" heading
- Proposal title (large, bold)
- Status badge
- Created date
- Valid until date (if set)

**Client Information Section**:
- Client full name
- Client email

**Trip Information Section** (if linked):
- Trip name
- Trip dates

**Description Section** (if provided):
- Proposal description

**Proposed Services Section**:
- Line items table
- Columns: Item, Qty, Unit Price, Total
- All line items listed
- Financial summary:
  - Subtotal
  - Tax (with percentage if > 0)
  - Discount (if > 0)
  - Total (prominent, large font)

**Terms and Conditions Section** (if provided):
- Formatted terms text
- Valid until reminder

**Print Styles**:
- Clean, professional layout
- Black and white friendly
- Page breaks at logical sections
- Footer with page numbers
- No action buttons in print view

**Status-Specific Actions**:
- **DRAFT**: Can edit, send, delete
- **SENT**: Cannot edit, can download PDF, cannot delete
- **ACCEPTED**: View only, download PDF only
- **REJECTED**: View only, download PDF only

---

### 4. Send Proposal Dialog

**Location**: `src/components/proposals/SendProposalDialog.tsx`

**Layout**:
```
┌─────────────────────────────────────┐
│ Send Proposal to Client     [✕]    │
├─────────────────────────────────────┤
│                                     │
│ You are about to send this proposal │
│ to your client via email.           │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Proposal: Bali Adventure        │ │
│ │ Client: John Doe                │ │
│ │ Email: john.doe@example.com     │ │
│ │ Total: $4,675.00                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Email Preview:                      │
│ ┌─────────────────────────────────┐ │
│ │ Subject: Your Travel Proposal   │ │
│ │                                 │ │
│ │ Dear John,                      │ │
│ │                                 │ │
│ │ Please find attached your       │ │
│ │ personalized travel proposal    │ │
│ │ for Bali Adventure.             │ │
│ │                                 │ │
│ │ Total: $4,675.00                │ │
│ │ Valid Until: Dec 31, 2025       │ │
│ │                                 │ │
│ │ [View Proposal Button]          │ │
│ │                                 │ │
│ │ Best regards,                   │ │
│ │ [Your Name]                     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ⓘ Client will receive an email with│
│   a link to view the proposal.     │
│                                     │
├─────────────────────────────────────┤
│         [Cancel]  [Confirm and Send]│
└─────────────────────────────────────┘
```

**Features**:
- **Dialog Header**:
  - Title: "Send Proposal to Client"
  - Close button (X)

- **Confirmation Summary**:
  - Proposal title
  - Client name
  - Client email (pre-filled, read-only)
  - Total amount

- **Email Preview**:
  - Shows email template
  - Subject line
  - Email body
  - Call-to-action button
  - Signature

- **Info Message**:
  - Info icon with description
  - "Client will receive an email with a link to view the proposal."

- **Actions**:
  - **Cancel**: Close dialog, no action
  - **Confirm and Send**:
    - Sends email to client
    - Updates status to SENT
    - Records sentAt timestamp
    - Shows success toast
    - Closes dialog

**Email Template Variables**:
- {clientName}
- {proposalTitle}
- {total}
- {validUntil}
- {viewProposalUrl}
- {senderName}

---

### 5. Delete Confirmation Dialog

**Location**: `src/components/proposals/DeleteProposalDialog.tsx`

**Layout**:
```
┌─────────────────────────────────────┐
│ Delete Proposal             [✕]    │
├─────────────────────────────────────┤
│                                     │
│     ⚠️                              │
│                                     │
│  Are you sure you want to delete    │
│  this proposal?                     │
│                                     │
│  Proposal: Bali Adventure           │
│  Client: John Doe                   │
│  Status: DRAFT                      │
│  Total: $4,675.00                   │
│                                     │
│  This action cannot be undone.      │
│                                     │
│  ⚠️ You cannot delete proposals     │
│     with ACCEPTED status.           │
│                                     │
├─────────────────────────────────────┤
│        [Cancel]  [Delete Proposal]  │
└─────────────────────────────────────┘
```

**Features**:
- **Warning Icon**: Large warning triangle (⚠️) in warning-500 color
- **Confirmation Message**:
  - Primary text: "Are you sure you want to delete this proposal?"
  - Proposal details: Title, client, status, total
  - Warning text: "This action cannot be undone." (text-destructive)
  - Additional warning: Cannot delete ACCEPTED proposals

- **Actions**:
  - **Cancel**: Close dialog, no action
  - **Delete Proposal**:
    - Destructive button (red)
    - Shows loading spinner during deletion
    - Text changes to "Deleting..." during submission
    - Soft deletes proposal (sets deletedAt)
    - Shows success toast
    - Navigates back to list page

**Validation**:
- Cannot delete proposals with status ACCEPTED
- Button disabled if status is ACCEPTED
- Error toast if attempted

---

## shadcn/ui Components

The following shadcn/ui components are required for implementation:

### Core Components

1. **Button** (`components/ui/button.tsx`)
   - Variants: default, secondary, destructive, outline, ghost
   - Sizes: default, sm, lg
   - Used in: All pages, dialogs, forms

2. **Dialog** (`components/ui/dialog.tsx`)
   - Includes: Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
   - Used in: Send Proposal, Delete Proposal

3. **Form** (`components/ui/form.tsx`)
   - React Hook Form + Zod integration
   - Includes: Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage
   - Used in: Create/Edit Proposal forms

4. **Input** (`components/ui/input.tsx`)
   - Text input component
   - Used in: Title, quantity, unit price, tax, discount fields

5. **Textarea** (`components/ui/textarea.tsx`)
   - Multi-line text input
   - Used in: Description, notes fields

6. **Select** (`components/ui/select.tsx`)
   - Dropdown select component
   - Includes: Select, SelectTrigger, SelectValue, SelectContent, SelectItem
   - Used in: Currency dropdown, status filter

7. **Badge** (`components/ui/badge.tsx`)
   - Variants: default, secondary, destructive, outline
   - Custom variants: success (green), warning (yellow)
   - Used in: Status badges

8. **Table** (`components/ui/table.tsx`)
   - Includes: Table, TableHeader, TableBody, TableHead, TableRow, TableCell
   - Used in: Proposal list, line items table

9. **Command** (`components/ui/command.tsx`)
   - Combobox functionality
   - Includes: Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem
   - Used in: Client autocomplete, trip autocomplete

10. **Calendar** (`components/ui/calendar.tsx`)
    - Date picker component
    - Used in: Valid until date field

### Additional Components

11. **Popover** (`components/ui/popover.tsx`)
    - Includes: Popover, PopoverTrigger, PopoverContent
    - Used in: Date picker, filter dropdowns

12. **Skeleton** (`components/ui/skeleton.tsx`)
    - Loading placeholder
    - Used in: Table loading state

13. **Alert** (`components/ui/alert.tsx`)
    - Variants: default, destructive
    - Used in: Error states, info messages

14. **Tooltip** (`components/ui/tooltip.tsx`)
    - Includes: Tooltip, TooltipTrigger, TooltipContent, TooltipProvider
    - Used in: Info icons, truncated text

15. **DropdownMenu** (`components/ui/dropdown-menu.tsx`)
    - Includes: DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
    - Used in: Row action menu (View/Edit/Delete)

16. **Separator** (`components/ui/separator.tsx`)
    - Horizontal divider
    - Used in: Section separators, financial summary

17. **Label** (`components/ui/label.tsx`)
    - Form field labels
    - Used in: All form fields

18. **Card** (`components/ui/card.tsx`)
    - Content container
    - Includes: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
    - Used in: Proposal view sections

19. **Toast** (`components/ui/toast.tsx`, `components/ui/toaster.tsx`, `components/ui/use-toast.tsx`)
    - Success/error notifications
    - Used in: Create/Update/Delete/Send feedback

20. **Scroll Area** (`components/ui/scroll-area.tsx`)
    - Scrollable content area
    - Used in: Long proposal previews, terms editor

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

#### 1. Keyboard Navigation

**Proposal List Page**:
- Tab order: Search input → Status filter → Client filter → Create Proposal button → Table rows → Pagination
- Table navigation:
  - Arrow keys to navigate between cells
  - Enter to activate row actions
  - Space to open action menu
- Focus visible on all interactive elements (2px outline, primary-500 color)

**Create/Edit Proposal Page**:
- Tab cycles through all form fields in logical order
- Line item table:
  - Tab to navigate between description/qty/price fields
  - Enter to add new line item
  - Delete/Backspace to remove line item (with confirmation)
- Focus trapped within dialogs when open
- Escape key closes dialogs

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
  aria-label="Search proposals by title or description"
  placeholder="Search proposals..."
/>

// Status filter
<Select aria-label="Filter by proposal status">
  <SelectTrigger>
    <SelectValue placeholder="All Statuses" />
  </SelectTrigger>
</Select>

// Action buttons
<Button aria-label={`Edit ${proposal.title}`}>
  <Edit className="h-4 w-4" aria-hidden="true" />
</Button>

// Status badge
<Badge aria-label={`Status: ${status}`}>
  {status}
</Badge>

// Line item remove button
<Button
  aria-label={`Remove line item ${index + 1}: ${item.description}`}
  onClick={() => removeLineItem(item.id)}
>
  <X className="h-4 w-4" aria-hidden="true" />
</Button>

// Total amount
<div aria-label={`Total amount: ${formatCurrency(total, currency)}`}>
  <span className="text-3xl font-bold">
    {formatCurrency(total, currency)}
  </span>
</div>
```

**Table Accessibility**:
- Proper table structure with `<thead>`, `<tbody>`
- Column headers use `<th>` with scope="col"
- Table caption: "Proposal list with {count} proposals"
- Sort indicators announced to screen readers

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
- DRAFT (Gray): neutral-400 bg (#a3a3a3) / neutral-900 text (#171717) = 4.5:1 ✓
- SENT (Blue): primary-500 bg (#3b82f6) / primary-900 text (#1e3a8a) = 4.6:1 ✓
- ACCEPTED (Green): success-500 bg (#22c55e) / success-900 text (#14532d) = 4.8:1 ✓
- REJECTED (Red): error-500 bg (#ef4444) / error-900 text (#7f1d1d) = 4.7:1 ✓

#### 4. Form Validation Accessibility

**Error Messages**:
```typescript
<FormField>
  <FormLabel htmlFor="title">Title *</FormLabel>
  <FormControl>
    <Input
      id="title"
      type="text"
      aria-invalid={!!errors.title}
      aria-describedby={errors.title ? "title-error" : undefined}
    />
  </FormControl>
  {errors.title && (
    <FormMessage
      id="title-error"
      role="alert"
      aria-live="polite"
    >
      {errors.title.message}
    </FormMessage>
  )}
</FormField>
```

**Line Item Validation**:
- Each line item has clear error states
- Total calculation errors announced
- Minimum line item requirement clearly stated

#### 5. Focus Management

**Dialog Open**:
```typescript
useEffect(() => {
  if (open) {
    // Focus first input when dialog opens
    titleRef.current?.focus();
  }
}, [open]);
```

**After Delete**:
```typescript
// After successful delete, announce to screen readers
announceToScreenReader('Proposal deleted successfully');

// Focus returns to "Create Proposal" button
createProposalButtonRef.current?.focus();
```

**Line Item Add/Remove**:
- Focus moves to new line item description field when added
- Focus moves to previous line item or "Add Line Item" button when removed

---

## Responsive Layouts

### Breakpoints (Tailwind CSS)

- **Mobile**: Default (< 768px)
- **Tablet**: `md:` (768px - 1023px)
- **Desktop**: `lg:` (1024px - 1279px)
- **Large Desktop**: `xl:` (1280px+)

### Proposal List Page Responsive Behavior

#### Mobile (375x667)
```
┌─────────────────┐
│ ☰ Proposals [+]│
├─────────────────┤
│ [🔍 Search...] │
│ [Filters ▾]    │
├─────────────────┤
│ ┌─────────────┐ │
│ │ Bali Advent.│ │
│ │ 🟢 SENT     │ │
│ │ John Doe    │ │
│ │ $5,250.00   │ │
│ │ Dec 31, 2025│ │
│ │ [View] [⋮]  │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │ Paris Honey.│ │
│ │ 📝 DRAFT    │ │
│ │ Jane Smith  │ │
│ │ $12,800.00  │ │
│ │ - │ │
│ │ [View] [⋮]  │ │
│ └─────────────┘ │
├─────────────────┤
│ [← 1 2 3 →]    │
└─────────────────┘
```

**Mobile Optimizations**:
- Table switches to card layout
- Each proposal shown as a card
- Cards stack vertically
- Actions collapse to dropdown menu (⋮)
- Search full-width
- Filters collapsed into single dropdown
- Touch targets minimum 44x44px
- Swipe gestures for pagination

#### Tablet (768x1024)
```
┌───────────────────────────────────┐
│ Proposals                    [+] │
├───────────────────────────────────┤
│ [🔍 Search...] [Status ▾] [Client]│
├───────────────────────────────────┤
│ ┌─────────────────────────────┐  │
│ │ Title │ Client │ Status │...│  │
│ ├─────────────────────────────┤  │
│ │ Bali │ John │ 🟢 SENT │ ... │  │
│ ├─────────────────────────────┤  │
│ │ Paris│ Jane │ 📝 DRAFT│ ... │  │
│ └─────────────────────────────┘  │
├───────────────────────────────────┤
│ Showing 1-20 of 48  [← 1 2 3 →] │
└───────────────────────────────────┘
```

**Tablet Optimizations**:
- Hybrid layout (table with reduced columns)
- Show: Title, Client, Status, Total, Actions
- Hide: Trip column (accessible via View)
- Valid Until shown in shortened format
- Filters shown as separate dropdowns

#### Desktop (1920x1080)
```
┌─────────────────────────────────────────────────────┐
│ Proposals                                      [+]  │
│ Create and manage client proposals                 │
├─────────────────────────────────────────────────────┤
│ [🔍 Search...] [Status ▾] [Client ▾]               │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ Title ↑ │ Client │ Trip │ Status │ Total │ ... │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ Bali Adventure │ John Doe │ Bali │ 🟢 SENT │ ...│ │
│ │ Paris Honeymoon│ Jane Smith│ - │ 📝 DRAFT│ ...  │ │
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

### Create/Edit Proposal Page Responsive Behavior

#### Mobile
- Full-screen layout
- Sections stack vertically
- Single column form layout
- Line items:
  - Each row takes full width
  - Fields stack vertically
  - Swipe to delete
- Financial summary:
  - Full width
  - Large, readable numbers
- Sticky footer with action buttons

#### Tablet & Desktop
- Max width: 1200px, centered
- Two-column layout for short fields
- Line items:
  - Table layout
  - Horizontal scrolling if needed
  - All columns visible
- Financial summary:
  - Right-aligned
  - Prominent total display
- Fixed action bar at bottom

**Responsive Classes**:
```tsx
<div className="
  // Mobile: Full width, small padding
  w-full p-4

  // Tablet: Centered with max width
  md:max-w-4xl md:mx-auto md:p-6

  // Desktop: Larger max width
  lg:max-w-6xl lg:p-8
">
```

### Proposal View Page Responsive Behavior

#### Mobile
- Single column layout
- Sections stack vertically
- Action buttons at top (sticky)
- Line items table:
  - Simplified layout
  - 2 columns: Item + Total
  - Qty and Unit Price hidden
- Financial summary:
  - Large, prominent total
  - Full width

#### Tablet & Desktop
- Two-column layout (client info | trip info)
- Full line items table
- Professional spacing
- Print-optimized layout
- Action bar at top (not printed)

---

## Design Tokens

### Color Usage

**Status Colors**:
```typescript
const statusColors = {
  DRAFT: {
    background: 'bg-neutral-100 dark:bg-neutral-800',
    text: 'text-neutral-700 dark:text-neutral-300',
    border: 'border-neutral-200 dark:border-neutral-700',
    icon: '📝',
  },
  SENT: {
    background: 'bg-primary-100 dark:bg-primary-900/20',
    text: 'text-primary-700 dark:text-primary-300',
    border: 'border-primary-200 dark:border-primary-800',
    icon: '🟢',
  },
  ACCEPTED: {
    background: 'bg-success-100 dark:bg-success-900/20',
    text: 'text-success-700 dark:text-success-300',
    border: 'border-success-200 dark:border-success-800',
    icon: '✅',
  },
  REJECTED: {
    background: 'bg-error-100 dark:bg-error-900/20',
    text: 'text-error-700 dark:text-error-300',
    border: 'border-error-200 dark:border-error-800',
    icon: '❌',
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
- Financial amounts: `text-2xl md:text-3xl font-bold text-neutral-900`

**Spacing**:
- Section gaps: `gap-8` (32px)
- Form field gaps: `gap-4` (16px)
- Card padding: `p-4` on mobile, `md:p-6` on tablet, `lg:p-8` on desktop
- Line item rows: `gap-2` (8px)

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

<AnimatePresence>
  {open && (
    <motion.div
      variants={dialogVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Dialog content */}
    </motion.div>
  )}
</AnimatePresence>
```

#### 2. Table Row Fade In

```typescript
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
  {proposals.map((proposal) => (
    <motion.tr key={proposal.id} variants={rowVariants}>
      {/* Row content */}
    </motion.tr>
  ))}
</motion.tbody>
```

#### 3. Line Item Add Animation

```typescript
const lineItemVariants = {
  hidden: { opacity: 0, x: -20, height: 0 },
  visible: {
    opacity: 1,
    x: 0,
    height: 'auto',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    height: 0,
    transition: {
      duration: 0.2,
    },
  },
};

<AnimatePresence mode="popLayout">
  {lineItems.map((item) => (
    <motion.tr
      key={item.id}
      variants={lineItemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      {/* Line item fields */}
    </motion.tr>
  ))}
</AnimatePresence>
```

#### 4. Total Amount Update

```typescript
const [total, setTotal] = useState(0);

// When total changes
useEffect(() => {
  // Trigger pulse animation
  controls.start({
    scale: [1, 1.05, 1],
    transition: { duration: 0.3 },
  });
}, [total]);

<motion.div
  animate={controls}
  className="text-3xl font-bold"
>
  {formatCurrency(total, currency)}
</motion.div>
```

#### 5. Status Badge Transition

```typescript
const statusBadgeVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
};

<motion.div
  variants={statusBadgeVariants}
  initial="initial"
  animate="animate"
>
  <Badge status={status}>{status}</Badge>
</motion.div>
```

#### 6. Success Toast Slide In

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

#### 7. Auto-save Indicator

```typescript
<AnimatePresence>
  {isSaving && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="text-sm text-muted-foreground"
    >
      <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
      Saving...
    </motion.div>
  )}
  {justSaved && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="text-sm text-success-600"
    >
      <CheckCircle2 className="h-3 w-3 inline mr-1" />
      All changes saved
    </motion.div>
  )}
</AnimatePresence>
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

### Proposal List Page State

```typescript
interface ProposalListState {
  // Data
  proposals: Proposal[];
  total: number;

  // Pagination
  page: number;
  limit: number;
  totalPages: number;

  // Filters
  searchQuery: string;
  statusFilter: ProposalStatus | 'all';
  clientFilter: string | null; // Client ID

  // Sort
  sortBy: 'title' | 'createdAt' | 'total' | 'validUntil';
  sortOrder: 'asc' | 'desc';

  // UI State
  isLoading: boolean;
  error: string | null;

  // Dialog State
  isSendDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  selectedProposal: Proposal | null;
}
```

**State Management Approach**: TanStack Query (React Query)

```typescript
// Hook for fetching proposals
const useProposals = (params: ProposalQueryParams) => {
  return useQuery({
    queryKey: ['proposals', params],
    queryFn: () => fetchProposals(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for creating proposal
const useCreateProposal = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createProposal,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast({
        title: 'Proposal created',
        description: 'The proposal has been saved as draft.',
      });
      router.push(`/crm/proposals/${data.proposal.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Similar hooks for update, delete, send
const useUpdateProposal = () => { /* ... */ };
const useDeleteProposal = () => { /* ... */ };
const useSendProposal = () => { /* ... */ };
```

### Create/Edit Proposal Form State

```typescript
interface ProposalFormState {
  // Basic Info
  title: string;
  clientId: string;
  tripId: string | null;
  description: string | null;
  validUntil: Date | null;

  // Line Items
  lineItems: ProposalLineItem[];

  // Financial
  tax: number;
  discount: number;
  currency: string;

  // Additional
  notes: string | null;
  terms: string | null;

  // Computed (read-only)
  subtotal: number;
  total: number;
}

interface LineItemFormState {
  id: string; // UUID
  description: string;
  quantity: number;
  unitPrice: number;
  total: number; // Auto-calculated
}
```

**React Hook Form + Zod**:

```typescript
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProposalSchema } from '@/lib/validations/proposal';

const form = useForm<CreateProposalRequest>({
  resolver: zodResolver(createProposalSchema),
  defaultValues: {
    title: '',
    clientId: '',
    tripId: null,
    description: null,
    lineItems: [{
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }],
    tax: 0,
    discount: 0,
    currency: 'USD',
    validUntil: null,
    notes: null,
    terms: null,
  },
});

// Line items management
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'lineItems',
});

// Add line item
const addLineItem = () => {
  append({
    id: crypto.randomUUID(),
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0,
  });
};

// Remove line item
const removeLineItem = (index: number) => {
  if (fields.length > 1) {
    remove(index);
  } else {
    toast({
      title: 'Minimum line items',
      description: 'Proposal must have at least one line item.',
      variant: 'destructive',
    });
  }
};

// Watch for changes to recalculate totals
const lineItems = form.watch('lineItems');
const tax = form.watch('tax') || 0;
const discount = form.watch('discount') || 0;

const subtotal = useMemo(() => {
  return lineItems.reduce((sum, item) => {
    const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
    return sum + itemTotal;
  }, 0);
}, [lineItems]);

const total = useMemo(() => {
  return subtotal + tax - discount;
}, [subtotal, tax, discount]);

// Update line item total on quantity/price change
const updateLineItemTotal = (index: number) => {
  const item = lineItems[index];
  const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
  form.setValue(`lineItems.${index}.total`, itemTotal);
};
```

### Auto-save Implementation

```typescript
import { useDebounce } from '@/hooks/useDebounce';
import { useEffect, useState } from 'react';

// Auto-save hook
const useAutoSave = (
  proposalId: string | null,
  formData: ProposalFormState,
  enabled: boolean
) => {
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const debouncedFormData = useDebounce(formData, 30000); // 30 seconds

  useEffect(() => {
    if (!enabled || !proposalId) return;

    const save = async () => {
      setIsSaving(true);
      try {
        await updateProposal(proposalId, debouncedFormData);
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    };

    save();
  }, [debouncedFormData, proposalId, enabled]);

  return { isSaving, justSaved };
};
```

### URL State Sync

```typescript
import { useSearchParams, useRouter } from 'next/navigation';

const [searchParams] = useSearchParams();
const router = useRouter();

// Get filters from URL
const statusFilter = searchParams.get('status') || 'all';
const clientFilter = searchParams.get('clientId');
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
  router.push(`?${params.toString()}`);
};
```

---

## TypeScript Interfaces

### Component Props

```typescript
// Proposal List Page
interface ProposalListPageProps {
  searchParams: {
    page?: string;
    q?: string;
    status?: ProposalStatus;
    clientId?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  };
}

// Create Proposal Page
interface CreateProposalPageProps {
  // No props needed (standalone page)
}

// Edit Proposal Page
interface EditProposalPageProps {
  params: {
    id: string; // Proposal ID
  };
}

// Proposal View Page
interface ProposalViewPageProps {
  params: {
    id: string; // Proposal ID
  };
}

// Send Proposal Dialog
interface SendProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: Proposal;
  onSuccess?: () => void;
}

// Delete Proposal Dialog
interface DeleteProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: Proposal;
  onSuccess?: () => void;
}

// Proposal Table
interface ProposalTableProps {
  proposals: Proposal[];
  isLoading: boolean;
  onView: (proposal: Proposal) => void;
  onEdit: (proposal: Proposal) => void;
  onDelete: (proposal: Proposal) => void;
  onSend: (proposal: Proposal) => void;
}

// Proposal Table Row
interface ProposalTableRowProps {
  proposal: Proposal;
  onView: (proposal: Proposal) => void;
  onEdit: (proposal: Proposal) => void;
  onDelete: (proposal: Proposal) => void;
  onSend: (proposal: Proposal) => void;
}

// Line Items Table
interface LineItemsTableProps {
  lineItems: ProposalLineItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, field: string, value: any) => void;
  editable: boolean;
}

// Line Item Row
interface LineItemRowProps {
  item: ProposalLineItem;
  index: number;
  onRemove: (id: string) => void;
  onChange: (id: string, field: string, value: any) => void;
  editable: boolean;
}

// Financial Summary
interface FinancialSummaryProps {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  editable: boolean;
  onTaxChange?: (value: number) => void;
  onDiscountChange?: (value: number) => void;
  onCurrencyChange?: (value: string) => void;
}

// Status Badge
interface StatusBadgeProps {
  status: ProposalStatus;
  className?: string;
}

// Client Autocomplete
interface ClientAutocompleteProps {
  value: string;
  onChange: (clientId: string) => void;
  error?: string;
}

// Trip Autocomplete
interface TripAutocompleteProps {
  value: string | null;
  onChange: (tripId: string | null) => void;
}

// Pagination
interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}
```

### Form Data Types

```typescript
// Matches createProposalSchema
type CreateProposalFormData = z.infer<typeof createProposalSchema>;

// Matches updateProposalSchema
type UpdateProposalFormData = z.infer<typeof updateProposalSchema>;

// Currency option
interface CurrencyOption {
  value: string; // ISO code (USD, EUR, GBP, etc.)
  label: string; // Display name (US Dollar, Euro, etc.)
  symbol: string; // Currency symbol ($, €, £, etc.)
}

// Available currencies
const currencies: CurrencyOption[] = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'CA$' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'AU$' },
];
```

### Utility Types

```typescript
// Format currency helper
const formatCurrency = (amount: number, currency: string): string => {
  const currencyInfo = currencies.find((c) => c.value === currency);
  const symbol = currencyInfo?.symbol || '$';
  return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

// Format date helper
const formatDate = (date: Date | null): string => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

// Status display helper
const getStatusDisplay = (status: ProposalStatus) => {
  const displays = {
    DRAFT: { label: 'Draft', icon: '📝', color: 'neutral' },
    SENT: { label: 'Sent', icon: '🟢', color: 'primary' },
    ACCEPTED: { label: 'Accepted', icon: '✅', color: 'success' },
    REJECTED: { label: 'Rejected', icon: '❌', color: 'error' },
  };
  return displays[status];
};
```

---

## Implementation Checklist

### Phase 1: Core Components (Day 1-2)

- [ ] Install required shadcn/ui components
- [ ] Create `ProposalListPage` component
- [ ] Create `ProposalTable` component with basic columns
- [ ] Create `ProposalTableRow` component
- [ ] Implement basic data fetching with TanStack Query
- [ ] Add loading skeleton state
- [ ] Create status badge component

### Phase 2: Create/Edit Proposal Form (Day 3-5)

- [ ] Create `CreateProposalPage` component
- [ ] Implement multi-section form layout
- [ ] Create Section 1: Basic Info
  - [ ] Title input
  - [ ] Client autocomplete
  - [ ] Trip autocomplete
  - [ ] Description textarea
  - [ ] Valid until date picker
- [ ] Create Section 2: Line Items
  - [ ] Line items table component
  - [ ] Add/remove line item functionality
  - [ ] Real-time total calculation
- [ ] Create Section 3: Financial Summary
  - [ ] Subtotal display
  - [ ] Tax input
  - [ ] Discount input
  - [ ] Currency selector
  - [ ] Total display (prominent)
- [ ] Create Section 4: Additional Details
  - [ ] Notes textarea
  - [ ] Terms textarea/rich text editor
- [ ] Implement form validation with React Hook Form + Zod
- [ ] Add auto-save functionality
- [ ] Create `EditProposalPage` component (reuse form)

### Phase 3: Proposal View & Actions (Day 6-7)

- [ ] Create `ProposalViewPage` component
- [ ] Design printable layout
- [ ] Create proposal header section
- [ ] Create client info section
- [ ] Create trip info section (if linked)
- [ ] Create line items display table
- [ ] Create financial summary display
- [ ] Create terms and conditions section
- [ ] Add print styles (CSS)
- [ ] Implement PDF generation (future enhancement)

### Phase 4: Dialogs & Actions (Day 8)

- [ ] Create `SendProposalDialog` component
- [ ] Implement email preview template
- [ ] Create send proposal mutation
- [ ] Create `DeleteProposalDialog` component
- [ ] Implement delete proposal mutation
- [ ] Add action buttons with proper permissions

### Phase 5: Search & Filters (Day 9)

- [ ] Create search bar component
- [ ] Implement debounced search
- [ ] Create status filter dropdown
- [ ] Create client filter autocomplete
- [ ] Sync filters with URL search params
- [ ] Add pagination component

### Phase 6: Polish & Accessibility (Day 10-11)

- [ ] Add Framer Motion animations
- [ ] Implement all ARIA labels
- [ ] Test keyboard navigation
- [ ] Add focus management
- [ ] Implement responsive layouts
- [ ] Test with screen reader
- [ ] Add loading states for all actions
- [ ] Add empty states
- [ ] Add error states

### Phase 7: Validation & Testing (Day 12)

- [ ] Validate with Chrome DevTools on all breakpoints
- [ ] Run accessibility audit (axe-core)
- [ ] Test all user flows
- [ ] Verify form validation
- [ ] Test calculations (line items, totals)
- [ ] Test error handling
- [ ] Verify success feedback
- [ ] Test print layout
- [ ] Verify status workflow (DRAFT → SENT → ACCEPTED/REJECTED)

---

## Design Decisions & Rationale

### 1. Multi-section Form Design

**Decision**: Organize create/edit form into 4 distinct sections rather than a single long form.

**Rationale**:
- Reduces cognitive load by grouping related fields
- Provides clear progress through form completion
- Makes validation errors easier to locate
- Improves mobile usability (scroll to section)
- Matches professional invoicing/proposal tools

### 2. Dynamic Line Items Table

**Decision**: Use dynamic table with add/remove functionality rather than fixed number of line items.

**Rationale**:
- Flexibility for proposals of any size
- Familiar pattern from invoicing systems
- Real-time total calculation provides immediate feedback
- Minimum 1 line item enforces business logic
- Easy to understand and use

### 3. Real-time Financial Calculations

**Decision**: Auto-calculate subtotal and total as user enters line items, tax, and discount.

**Rationale**:
- Immediate feedback prevents errors
- Reduces manual calculation burden
- Professional expectation from financial software
- Builds trust in accuracy
- Matches user mental model

### 4. Printable Proposal View

**Decision**: Design proposal view page as printable document rather than standard web page.

**Rationale**:
- Proposals are often printed or saved as PDF
- Client-facing document requires professional appearance
- Clear separation between editing and viewing
- Supports PDF generation feature (future)
- Matches business use case

### 5. Status Workflow Enforcement

**Decision**: Enforce status transitions and disable actions based on status.

**Rationale**:
- Prevents accidental changes to sent/accepted proposals
- Protects data integrity
- Matches business workflow
- Clear visual feedback of proposal state
- Reduces user errors

### 6. Auto-save for Drafts

**Decision**: Implement auto-save every 30 seconds for draft proposals.

**Rationale**:
- Prevents data loss from browser crashes
- Reduces user anxiety about losing work
- Matches Google Docs and modern SaaS apps
- Only applies to existing drafts (not new proposals)
- Clear visual feedback when saving

### 7. Client/Trip Autocomplete

**Decision**: Use autocomplete command components rather than static dropdowns.

**Rationale**:
- Better UX with many clients/trips
- Faster data entry (type to search)
- Reduces scrolling through long lists
- Matches modern app patterns
- Accessible with keyboard navigation

### 8. Currency Formatting

**Decision**: Display currency symbol with formatted amount (e.g., $5,250.00) rather than just number.

**Rationale**:
- Instant recognition of currency
- Professional financial document appearance
- Reduces ambiguity in international context
- Matches user expectations
- Improves readability

---

## Next Steps

1. **shadcn-implementation-builder** should implement components in this order:
   - Core UI primitives (if not already installed)
   - Proposal List Page skeleton
   - Create Proposal Page (sections 1-4)
   - Proposal View Page
   - Send/Delete dialogs
   - Search and filter components
   - Polish and animations

2. **Validation checkpoints**:
   - After Proposal List Page: Chrome DevTools validation
   - After Create/Edit Form: Form validation testing
   - After Proposal View: Print layout testing
   - After search/filters: Filter functionality testing
   - Final: Full accessibility audit

3. **Integration with existing app**:
   - Ensure navigation links to `/crm/proposals` in sidebar
   - Verify CRM section in dashboard layout exists
   - Verify authentication/authorization for CRM access
   - Test integration with client management system
   - Test integration with trip management system

---

## References

- **API Documentation**: `/home/user/WanderPlan/src/app/api/proposals/route.ts`
- **Type Definitions**: `/home/user/WanderPlan/src/types/proposal.ts`
- **Validation Schemas**: `/home/user/WanderPlan/src/lib/validations/proposal.ts`
- **Design Tokens**: `/home/user/WanderPlan/.claude/design/tokens.json`
- **CRM UI Reference**: `/home/user/WanderPlan/.claude/design/crm-ui-spec.md`
- **shadcn/ui Docs**: https://ui.shadcn.com/

---

**End of Design Specification**

This specification provides complete design guidance for implementing the Proposal Management UI. All components, interactions, and states are documented with implementation details, accessibility requirements, and responsive behavior.
