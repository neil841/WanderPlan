# Expense Splitting UI - Design Specification

**Task**: 5.6 - Expense Split UI
**Created**: 2025-11-22
**Designer**: Premium UX/UI Designer Agent
**Status**: Ready for Implementation

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Component Architecture](#component-architecture)
3. [Component 1: Enhanced Expense Creation Dialog](#component-1-enhanced-expense-creation-dialog)
4. [Component 2: Settlement Summary Dashboard](#component-2-settlement-summary-dashboard)
5. [Component 3: Settlement Card](#component-3-settlement-card)
6. [Component 4: Expense List Enhancements](#component-4-expense-list-enhancements)
7. [User Flows](#user-flows)
8. [Responsive Design](#responsive-design)
9. [Accessibility Requirements](#accessibility-requirements)
10. [Animation & Transitions](#animation--transitions)
11. [Color Palette & Visual Design](#color-palette--visual-design)
12. [Implementation Notes](#implementation-notes)

---

## Overview

### Purpose
Enable group expense splitting functionality with three split modes:
1. **I paid** - Solo expense (no split)
2. **Equal split** - Divide equally among selected collaborators
3. **Custom split** - Manual split by amount or percentage

Provide clear settlement visualization showing who owes whom.

### Backend API Integration
- **POST** `/api/trips/[tripId]/expenses` - Create expense with splits
- **GET** `/api/trips/[tripId]/expenses/settlements` - Fetch settlements

### Design Principles
- **Clarity**: Complex splitting made simple with clear visual feedback
- **Flexibility**: Support multiple split methods without overwhelming users
- **Trust**: Real-time calculation validation ensures accuracy
- **Accessibility**: WCAG 2.1 AA compliant, keyboard navigable

---

## Component Architecture

```
ExpensesPage
├── ExpenseList
│   ├── ExpenseCard (Enhanced with split indicator)
│   └── CreateExpenseDialog (Enhanced with split UI)
│       ├── SplitTypeSelector (Radio group)
│       ├── EqualSplitSection (Collaborator multi-select)
│       └── CustomSplitSection (Amount/Percentage inputs)
├── SettlementSummary (New)
│   ├── SettlementStats (Summary cards)
│   ├── SettlementTabs (All / You Owe / Owed to You)
│   └── SettlementCard[] (Individual settlements)
└── ExpenseFilters (Enhanced with split filter)
```

---

## Component 1: Enhanced Expense Creation Dialog

### Visual Design

```
┌────────────────────────────────────────────────────────┐
│ Add Expense                                         [X] │
├────────────────────────────────────────────────────────┤
│                                                         │
│ Description                                             │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Hotel accommodation, restaurant meal, taxi, etc.    ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ Amount               Currency                          │
│ ┌──────────────────┐ ┌────────┐                       │
│ │ 150.00           │ │ USD    │                       │
│ └──────────────────┘ └────────┘                       │
│                                                         │
│ Category                                                │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Food & Dining                          ▼            ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Split Type                                          ││
│ │                                                     ││
│ │ ○ I paid (no split)                                ││
│ │ ● Split equally                                    ││
│ │ ○ Custom split                                     ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ [EQUAL SPLIT SECTION - EXPANDED]                       │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Split with:                                         ││
│ │                                                     ││
│ │ ☑ Alice Johnson          $50.00                    ││
│ │ ☑ Bob Smith              $50.00                    ││
│ │ ☑ You (Charlie Davis)    $50.00                    ││
│ │                                                     ││
│ │ 3 people • $50.00 each                             ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│                          [Cancel] [Add Expense]         │
└────────────────────────────────────────────────────────┘
```

### Split Type Sections

#### 1. I Paid (No Split) - SELECTED
```
┌─────────────────────────────────────────────────────┐
│ Split Type                                          │
│                                                     │
│ ● I paid (no split)                                │
│ ○ Split equally                                    │
│ ○ Custom split                                     │
└─────────────────────────────────────────────────────┘

[No additional UI shown]
```

#### 2. Equal Split - SELECTED
```
┌─────────────────────────────────────────────────────┐
│ Split Type                                          │
│                                                     │
│ ○ I paid (no split)                                │
│ ● Split equally                                    │
│ ○ Custom split                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Split with:                                         │
│                                                     │
│ ☑ Alice Johnson          $50.00                    │
│   [avatar] alice@example.com                       │
│                                                     │
│ ☑ Bob Smith              $50.00                    │
│   [avatar] bob@example.com                         │
│                                                     │
│ ☑ You (Charlie Davis)    $50.00                    │
│   [avatar] charlie@example.com                     │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ ℹ 3 people • $50.00 each                        ││
│ └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

#### 3. Custom Split - SELECTED (Amount Mode)
```
┌─────────────────────────────────────────────────────┐
│ Split Type                                          │
│                                                     │
│ ○ I paid (no split)                                │
│ ○ Split equally                                    │
│ ● Custom split                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Split by:  ● Amount   ○ Percentage                 │
│                                                     │
│ Alice Johnson                                       │
│ [avatar]  [$] ┌──────────┐                         │
│               │ 75.00    │  Owes: $75.00          │
│               └──────────┘                          │
│                                                     │
│ Bob Smith                                           │
│ [avatar]  [$] ┌──────────┐                         │
│               │ 50.00    │  Owes: $50.00          │
│               └──────────┘                          │
│                                                     │
│ Charlie Davis (You)                                 │
│ [avatar]  [$] ┌──────────┐                         │
│               │ 25.00    │  Owes: $25.00          │
│               └──────────┘                          │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ ✓ Total: $150.00 / $150.00                     ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ [+ Add Person]                                      │
└─────────────────────────────────────────────────────┘
```

#### 4. Custom Split - SELECTED (Percentage Mode)
```
┌─────────────────────────────────────────────────────┐
│ Split by:  ○ Amount   ● Percentage                 │
│                                                     │
│ Alice Johnson                                       │
│ [avatar]  [%] ┌──────────┐                         │
│               │ 50       │  Owes: $75.00 (50%)    │
│               └──────────┘                          │
│                                                     │
│ Bob Smith                                           │
│ [avatar]  [%] ┌──────────┐                         │
│               │ 33.33    │  Owes: $50.00 (33%)    │
│               └──────────┘                          │
│                                                     │
│ Charlie Davis (You)                                 │
│ [avatar]  [%] ┌──────────┐                         │
│               │ 16.67    │  Owes: $25.00 (17%)    │
│               └──────────┘                          │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ ✓ Total: 100.00% / 100%                        ││
│ └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Interactive States

#### Validation States

**Valid Split (Green)**
```
┌─────────────────────────────────────────────────┐
│ ✓ Total: $150.00 / $150.00                     │
│   bg-green-50 border-green-500                  │
└─────────────────────────────────────────────────┘
```

**Invalid Split (Red)**
```
┌─────────────────────────────────────────────────┐
│ ✗ Total: $120.00 / $150.00                     │
│   Missing $30.00                                │
│   bg-red-50 border-red-500                      │
└─────────────────────────────────────────────────┘
```

**Over Split (Orange)**
```
┌─────────────────────────────────────────────────┐
│ ⚠ Total: $175.00 / $150.00                     │
│   Over by $25.00                                │
│   bg-orange-50 border-orange-500                │
└─────────────────────────────────────────────────┘
```

### Component Code Structure

```typescript
// CreateExpenseDialog.tsx (Enhanced)
interface CreateExpenseDialogProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CreateExpenseRequest) => Promise<void>;
  events?: Array<{ id: string; title: string }>;
  collaborators: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl: string | null;
    };
  }>;
}

type SplitMode = 'NONE' | 'EQUAL' | 'CUSTOM';
type CustomSplitMode = 'AMOUNT' | 'PERCENTAGE';

interface SplitState {
  mode: SplitMode;
  customMode: CustomSplitMode;
  selectedUserIds: string[];
  customSplits: Map<string, { amount?: number; percentage?: number }>;
}
```

```tsx
// Example implementation snippet
<FormField
  control={form.control}
  name="splitType"
  render={({ field }) => (
    <FormItem className="space-y-3">
      <FormLabel>Split Type</FormLabel>
      <FormControl>
        <RadioGroup
          onValueChange={(value) => {
            field.onChange(value);
            handleSplitTypeChange(value as SplitMode);
          }}
          defaultValue={field.value}
          className="flex flex-col space-y-1"
        >
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="NONE" />
            </FormControl>
            <FormLabel className="font-normal cursor-pointer">
              I paid (no split)
            </FormLabel>
          </FormItem>
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="EQUAL" />
            </FormControl>
            <FormLabel className="font-normal cursor-pointer">
              Split equally
            </FormLabel>
          </FormItem>
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="CUSTOM" />
            </FormControl>
            <FormLabel className="font-normal cursor-pointer">
              Custom split
            </FormLabel>
          </FormItem>
        </RadioGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

{splitMode === 'EQUAL' && (
  <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
    <Label>Split with:</Label>
    <div className="space-y-2">
      {collaborators.map((collab) => (
        <div
          key={collab.userId}
          className="flex items-center justify-between p-2 rounded-md hover:bg-muted/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Checkbox
              id={`split-${collab.userId}`}
              checked={selectedUserIds.includes(collab.userId)}
              onCheckedChange={(checked) =>
                handleUserToggle(collab.userId, checked as boolean)
              }
            />
            <Label
              htmlFor={`split-${collab.userId}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={collab.user.avatarUrl || undefined} />
                <AvatarFallback>
                  {collab.user.firstName[0]}
                  {collab.user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">
                {collab.user.firstName} {collab.user.lastName}
              </span>
            </Label>
          </div>
          {selectedUserIds.includes(collab.userId) && (
            <span className="text-sm font-medium text-primary">
              {formatCurrency(perPersonAmount, form.getValues('currency'))}
            </span>
          )}
        </div>
      ))}
    </div>
    <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-md text-sm text-blue-800 dark:text-blue-200">
      <Info className="h-4 w-4" />
      <span>
        {selectedUserIds.length} people • {formatCurrency(perPersonAmount, currency)} each
      </span>
    </div>
  </div>
)}
```

---

## Component 2: Settlement Summary Dashboard

### Visual Design

```
┌──────────────────────────────────────────────────────────────┐
│ Settlement Summary                                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ 💰          │ │ 📤          │ │ 📥          │            │
│ │ Total       │ │ You Owe     │ │ Owed to You │            │
│ │ $450.00     │ │ $75.00      │ │ $0.00       │            │
│ │ 12 expenses │ │ 2 people    │ │ 0 people    │            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [All]  [You Owe (2)]  [Owed to You (0)]                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ You owe Alice Johnson                                   │ │
│ │                                                         │ │
│ │ [avatar]  You → Alice             $50.00               │ │
│ │           charlie@... → alice@...                      │ │
│ │                                                         │ │
│ │           [Mark as Paid] (disabled - coming soon)      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ You owe Bob Smith                                       │ │
│ │                                                         │ │
│ │ [avatar]  You → Bob               $25.00               │ │
│ │           charlie@... → bob@...                        │ │
│ │                                                         │ │
│ │           [Mark as Paid] (disabled - coming soon)      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Summary Cards

```typescript
// SettlementStats.tsx
interface SettlementStatsProps {
  totalExpenses: number;
  totalAmount: number;
  youOwe: number;
  owedToYou: number;
  currency: string;
}
```

**Desktop Layout** (3 columns)
```
┌─────────────────┬─────────────────┬─────────────────┐
│ Card 1          │ Card 2          │ Card 3          │
│ Total Expenses  │ You Owe         │ Owed to You     │
│ $450.00         │ $75.00          │ $0.00           │
│ 12 expenses     │ 2 people        │ 0 people        │
└─────────────────┴─────────────────┴─────────────────┘
```

**Mobile Layout** (stacked)
```
┌─────────────────────────┐
│ Card 1                  │
│ Total Expenses          │
│ $450.00                 │
│ 12 expenses             │
├─────────────────────────┤
│ Card 2                  │
│ You Owe                 │
│ $75.00                  │
│ 2 people                │
├─────────────────────────┤
│ Card 3                  │
│ Owed to You             │
│ $0.00                   │
│ 0 people                │
└─────────────────────────┘
```

### Tabs Structure

```tsx
<Tabs defaultValue="all" className="w-full">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="all">
      All {settlements.length > 0 && `(${settlements.length})`}
    </TabsTrigger>
    <TabsTrigger value="you-owe">
      You Owe {youOweCount > 0 && `(${youOweCount})`}
    </TabsTrigger>
    <TabsTrigger value="owed-to-you">
      Owed to You {owedToYouCount > 0 && `(${owedToYouCount})`}
    </TabsTrigger>
  </TabsList>

  <TabsContent value="all" className="space-y-3 mt-4">
    {settlements.map((settlement) => (
      <SettlementCard key={`${settlement.from}-${settlement.to}`} {...settlement} />
    ))}
  </TabsContent>

  <TabsContent value="you-owe" className="space-y-3 mt-4">
    {settlementsYouOwe.map((settlement) => (
      <SettlementCard key={`${settlement.from}-${settlement.to}`} {...settlement} />
    ))}
  </TabsContent>

  <TabsContent value="owed-to-you" className="space-y-3 mt-4">
    {settlementsOwedToYou.map((settlement) => (
      <SettlementCard key={`${settlement.from}-${settlement.to}`} {...settlement} />
    ))}
  </TabsContent>
</Tabs>
```

### Empty States

**No Settlements**
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              💸                                 │
│                                                 │
│         No settlements needed                   │
│                                                 │
│   All expenses are either individual or         │
│   everyone's split amounts are settled.         │
│                                                 │
└─────────────────────────────────────────────────┘
```

**No "You Owe"**
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              ✅                                 │
│                                                 │
│         You're all settled up!                  │
│                                                 │
│         You don't owe anyone money.             │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Component 3: Settlement Card

### Visual Design

**You Owe Variant** (Red accent)
```
┌─────────────────────────────────────────────────────┐
│ You owe Alice Johnson                               │
│                                                     │
│ ┌─[avatar]──────────────────────────────────────┐  │
│ │ AD          You → Alice                       │  │
│ │                                               │  │
│ │             $50.00                            │  │
│ │             (text-red-600)                    │  │
│ │                                               │  │
│ │             charlie@example.com               │  │
│ │             → alice@example.com               │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
│ [Mark as Paid] (disabled - coming soon)             │
│ text-muted-foreground opacity-50                    │
└─────────────────────────────────────────────────────┘
```

**Owed to You Variant** (Green accent)
```
┌─────────────────────────────────────────────────────┐
│ Bob Smith owes you                                  │
│                                                     │
│ ┌─[avatar]──────────────────────────────────────┐  │
│ │ BS          Bob → You                         │  │
│ │                                               │  │
│ │             $25.00                            │  │
│ │             (text-green-600)                  │  │
│ │                                               │  │
│ │             bob@example.com                   │  │
│ │             → charlie@example.com             │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
│ [Mark as Paid] (disabled - coming soon)             │
└─────────────────────────────────────────────────────┘
```

### Component Code

```typescript
// SettlementCard.tsx
interface SettlementCardProps {
  from: string;
  to: string;
  amount: number;
  fromUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
  toUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
  currentUserId: string;
  currency?: string;
  onMarkAsPaid?: () => void;
}
```

```tsx
export function SettlementCard({
  from,
  to,
  amount,
  fromUser,
  toUser,
  currentUserId,
  currency = 'USD',
  onMarkAsPaid,
}: SettlementCardProps) {
  const isYouOwe = from === currentUserId;
  const isOwedToYou = to === currentUserId;

  const otherUser = isYouOwe ? toUser : fromUser;

  const title = isYouOwe
    ? `You owe ${toUser.firstName} ${toUser.lastName}`
    : `${fromUser.firstName} ${fromUser.lastName} owes you`;

  const amountColor = isYouOwe
    ? 'text-red-600 dark:text-red-400'
    : 'text-green-600 dark:text-green-400';

  const borderColor = isYouOwe
    ? 'border-red-200 dark:border-red-800'
    : 'border-green-200 dark:border-green-800';

  return (
    <Card className={cn('transition-all hover:shadow-md', borderColor)}>
      <CardContent className="p-4">
        <h4 className="font-medium mb-3">{title}</h4>

        <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
          <Avatar className="h-12 w-12">
            <AvatarImage src={otherUser.avatarUrl || undefined} />
            <AvatarFallback>
              {otherUser.firstName[0]}
              {otherUser.lastName[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span>{isYouOwe ? 'You' : fromUser.firstName}</span>
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
              <span>{isYouOwe ? toUser.firstName : 'You'}</span>
            </div>

            <p className={cn('text-2xl font-bold', amountColor)}>
              {formatCurrency(amount, currency)}
            </p>

            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <span className="truncate">{fromUser.email}</span>
              <ArrowRight className="h-2 w-2" aria-hidden="true" />
              <span className="truncate">{toUser.email}</span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full mt-3"
          disabled
          aria-label={`Mark settlement with ${otherUser.firstName} as paid (coming soon)`}
        >
          Mark as Paid
          <span className="ml-2 text-xs text-muted-foreground">
            (Coming Soon)
          </span>
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## Component 4: Expense List Enhancements

### Split Indicator Badge

```
┌────────────────────────────────────────────────────┐
│ Hotel Accommodation                   $150.00      │
│ ┌──────┐ ┌─────────┐ ┌──────────┐                │
│ │ Food │ │ Mar 15  │ │ 👥 Split │                │
│ │ Badge│ │         │ │  (badge) │                │
│ └──────┘ └─────────┘ └──────────┘                │
└────────────────────────────────────────────────────┘
```

**Badge Design**
```tsx
{expense.splits && expense.splits.length > 0 && (
  <Badge
    variant="secondary"
    className="gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
  >
    <Users className="h-3 w-3" aria-hidden="true" />
    Split ({expense.splits.length})
  </Badge>
)}
```

### Tooltip with Split Details

**Hover State**
```
┌────────────────────────────────────┐
│ Split Details                      │
├────────────────────────────────────┤
│ Alice Johnson    $50.00            │
│ Bob Smith        $50.00            │
│ You              $50.00            │
│                                    │
│ Total: $150.00 (3 people)         │
└────────────────────────────────────┘
```

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Badge
        variant="secondary"
        className="gap-1 cursor-help bg-blue-100 text-blue-800"
      >
        <Users className="h-3 w-3" aria-hidden="true" />
        Split ({expense.splits.length})
      </Badge>
    </TooltipTrigger>
    <TooltipContent className="max-w-xs">
      <div className="space-y-1">
        <p className="font-medium">Split Details</p>
        <div className="text-sm space-y-1">
          {expense.splits.map((split) => (
            <div key={split.id} className="flex justify-between gap-3">
              <span>{split.user.firstName} {split.user.lastName}</span>
              <span className="font-medium">
                {formatCurrency(split.amount, expense.currency)}
              </span>
            </div>
          ))}
        </div>
        <Separator className="my-2" />
        <p className="text-xs text-muted-foreground">
          Total: {formatCurrency(expense.amount, expense.currency)} ({expense.splits.length} people)
        </p>
      </div>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Filter Enhancement

```tsx
// Add to existing filter options
<Select value={splitFilter} onValueChange={setSplitFilter}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Filter by split" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Expenses</SelectItem>
    <SelectItem value="split">Split Only</SelectItem>
    <SelectItem value="not-split">Not Split</SelectItem>
  </SelectContent>
</Select>
```

---

## User Flows

### Flow 1: Create Equal Split Expense

```
1. User clicks "Add Expense" button
   └─> CreateExpenseDialog opens

2. User fills in expense details:
   - Description: "Dinner at Italian Restaurant"
   - Amount: $150.00
   - Currency: USD
   - Category: Food & Dining
   - Date: March 15, 2025

3. User selects "Split equally" radio option
   └─> Equal split section expands with animation

4. User sees all trip collaborators with checkboxes:
   [✓] Alice Johnson       $50.00
   [✓] Bob Smith          $50.00
   [✓] You (Charlie)      $50.00
   [ ] David Lee          -

5. User checks/unchecks collaborators
   └─> Per-person amount updates in real-time
   └─> Summary shows: "3 people • $50.00 each"

6. User clicks "Add Expense"
   └─> Validation passes
   └─> API call to create expense with splits
   └─> Dialog closes
   └─> Success toast: "Expense added successfully"
   └─> Expense list refreshes
   └─> Settlement summary updates
```

### Flow 2: Create Custom Split Expense

```
1. User selects "Custom split" radio option
   └─> Custom split section expands

2. User sees split mode toggle:
   ● Amount   ○ Percentage

3. User enters amounts for each person:
   - Alice: $80.00
   - Bob: $45.00
   - You: $25.00

4. Real-time validation indicator:
   ✓ Total: $150.00 / $150.00 (green)

5. If user makes error (e.g., total = $140):
   ✗ Total: $140.00 / $150.00
   Missing $10.00 (red)
   └─> "Add Expense" button disabled

6. User corrects amounts
   └─> Validation passes (green)
   └─> "Add Expense" button enabled

7. User clicks "Add Expense"
   └─> Success flow (same as equal split)
```

### Flow 3: View Settlements

```
1. User navigates to Expenses tab
   └─> Settlement Summary section visible at top

2. User sees summary cards:
   - Total Expenses: $450.00
   - You Owe: $75.00 (to 2 people)
   - Owed to You: $0.00

3. User clicks "You Owe (2)" tab
   └─> Filters to show only settlements where user owes

4. User sees settlement cards:
   ┌──────────────────────────┐
   │ You owe Alice    $50.00 │
   │ [Mark as Paid] disabled  │
   └──────────────────────────┘
   ┌──────────────────────────┐
   │ You owe Bob      $25.00 │
   │ [Mark as Paid] disabled  │
   └──────────────────────────┘

5. User clicks on expense in list with split
   └─> Tooltip shows split details
   └─> Or modal opens with full expense details
```

---

## Responsive Design

### Breakpoints

```typescript
// Tailwind breakpoints
sm: '640px'   // Mobile landscape
md: '768px'   // Tablet portrait
lg: '1024px'  // Tablet landscape / Small desktop
xl: '1280px'  // Desktop
2xl: '1536px' // Large desktop
```

### Mobile (< 640px)

**CreateExpenseDialog**
- Full screen on mobile
- Scroll vertically
- Stack all inputs
- Split list: single column
- Touch-friendly targets (min 44x44px)

```tsx
<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
  {/* Mobile: full width, desktop: max-w-2xl */}
</DialogContent>
```

**Settlement Summary**
- Stack summary cards vertically
- Full width tabs
- Settlement cards: full width

```tsx
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  {/* Mobile: 1 column, Desktop: 3 columns */}
</div>
```

### Tablet (640px - 1024px)

**CreateExpenseDialog**
- 2-column layout for amount/currency
- Equal split: 2 collaborators per row
- Custom split: full width inputs

**Settlement Summary**
- 3-column summary cards (if space allows)
- 2-column settlement cards

### Desktop (> 1024px)

**CreateExpenseDialog**
- Max width: 672px (max-w-2xl)
- 3-column layout where appropriate
- Equal split: 2-3 collaborators per row
- Custom split: compact inputs

**Settlement Summary**
- 3-column summary cards
- 2-column settlement cards if many settlements

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

#### 1. Keyboard Navigation

**All interactive elements must be keyboard accessible:**
- Tab order: logical, top-to-bottom, left-to-right
- Enter/Space: activate buttons and checkboxes
- Arrow keys: navigate radio groups
- Escape: close dialogs

```tsx
// Example: Custom split input with keyboard navigation
<Input
  type="number"
  aria-label={`Amount for ${user.firstName} ${user.lastName}`}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Move to next input or submit
    }
  }}
/>
```

#### 2. Screen Reader Support

**ARIA labels for all interactive elements:**
```tsx
<RadioGroupItem
  value="EQUAL"
  aria-label="Split expense equally among selected collaborators"
/>

<Checkbox
  id={`split-${userId}`}
  aria-label={`Include ${user.firstName} ${user.lastName} in equal split`}
/>

<Button
  variant="outline"
  disabled
  aria-label={`Mark settlement with ${otherUser.firstName} as paid (feature coming soon)`}
>
  Mark as Paid
</Button>
```

**Decorative icons hidden from screen readers:**
```tsx
<Users className="h-3 w-3" aria-hidden="true" />
<ArrowRight className="h-3 w-3" aria-hidden="true" />
```

**Live regions for dynamic updates:**
```tsx
<div
  role="status"
  aria-live="polite"
  className="sr-only"
>
  {splitValidation.isValid
    ? `Split is valid. Total matches expense amount.`
    : `Split is invalid. ${splitValidation.error}`
  }
</div>
```

#### 3. Color Contrast

**Minimum contrast ratios:**
- Text: 4.5:1
- Large text (18pt+): 3:1
- UI components: 3:1

**Colors used:**
```css
/* Valid state - Green */
.validation-valid {
  background: hsl(142, 76%, 96%);  /* bg-green-50 */
  border-color: hsl(142, 76%, 36%); /* border-green-500 */
  color: hsl(142, 76%, 26%);       /* text-green-700 */
}

/* Invalid state - Red */
.validation-invalid {
  background: hsl(0, 86%, 97%);     /* bg-red-50 */
  border-color: hsl(0, 84%, 60%);   /* border-red-500 */
  color: hsl(0, 84%, 40%);          /* text-red-700 */
}

/* You owe - Red accent */
.settlement-owe {
  color: hsl(0, 84%, 60%);          /* text-red-600 */
  border-color: hsl(0, 84%, 80%);   /* border-red-200 */
}

/* Owed to you - Green accent */
.settlement-owed {
  color: hsl(142, 76%, 36%);        /* text-green-600 */
  border-color: hsl(142, 76%, 80%); /* border-green-200 */
}
```

#### 4. Focus Indicators

**Visible focus rings:**
```tsx
<Button
  className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
>
  Add Expense
</Button>
```

#### 5. Touch Targets

**Minimum size: 44x44px**
```tsx
<Checkbox
  className="h-5 w-5 min-w-[44px] min-h-[44px]"
  // Visual size 20px, but touch target 44px
/>
```

---

## Animation & Transitions

### Expand/Collapse Animations

**Split section expand** (using Framer Motion)
```tsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence>
  {splitMode === 'EQUAL' && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      {/* Equal split content */}
    </motion.div>
  )}
</AnimatePresence>
```

### Real-time Updates

**Amount recalculation** (smooth number transitions)
```tsx
import { motion } from 'framer-motion';

<motion.span
  key={perPersonAmount}
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.15 }}
  className="text-sm font-medium text-primary"
>
  {formatCurrency(perPersonAmount, currency)}
</motion.span>
```

### Validation State Transitions

**Validation indicator color change**
```tsx
<motion.div
  animate={{
    backgroundColor: validationState.isValid
      ? 'hsl(142, 76%, 96%)'  // green
      : 'hsl(0, 86%, 97%)',    // red
    borderColor: validationState.isValid
      ? 'hsl(142, 76%, 36%)'
      : 'hsl(0, 84%, 60%)',
  }}
  transition={{ duration: 0.2 }}
  className="p-2 rounded-md border"
>
  {/* Validation content */}
</motion.div>
```

### Loading States

**Submit button**
```tsx
<Button type="submit" disabled={isSubmitting}>
  {isSubmitting && (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  )}
  Add Expense
</Button>
```

**Settlement cards loading**
```tsx
{isLoading ? (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <Card key={i}>
        <CardContent className="p-4">
          <Skeleton className="h-4 w-1/3 mb-3" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
) : (
  <SettlementList settlements={settlements} />
)}
```

---

## Color Palette & Visual Design

### Theme Integration

**Uses existing shadcn/ui theme variables:**
```css
/* Primary colors */
--primary: hsl(var(--primary));
--primary-foreground: hsl(var(--primary-foreground));

/* Accent colors for splits */
--split-equal: hsl(217, 91%, 60%);     /* Blue */
--split-custom: hsl(262, 83%, 58%);    /* Purple */

/* Validation colors */
--valid: hsl(142, 76%, 36%);           /* Green */
--invalid: hsl(0, 84%, 60%);           /* Red */
--warning: hsl(25, 95%, 53%);          /* Orange */

/* Settlement colors */
--settlement-owe: hsl(0, 84%, 60%);    /* Red */
--settlement-owed: hsl(142, 76%, 36%); /* Green */
```

### Icons

**Using lucide-react icons:**
- **Users** - Split indicator
- **ArrowRight** - Direction indicator (A → B)
- **DollarSign** - Amount indicator
- **Percent** - Percentage mode
- **Info** - Information tooltip
- **Check** - Valid state
- **X** - Invalid state
- **AlertCircle** - Warning state

### Typography

**Font hierarchy:**
```css
/* Headers */
.dialog-title: text-lg font-semibold
.section-title: text-base font-medium
.card-title: text-sm font-medium

/* Body */
.body-text: text-sm
.meta-text: text-xs text-muted-foreground

/* Amounts */
.amount-large: text-2xl font-bold
.amount-small: text-sm font-medium
```

---

## Implementation Notes

### File Structure

```
src/
├── components/
│   └── expenses/
│       ├── CreateExpenseDialog.tsx (Enhanced)
│       ├── ExpenseCard.tsx (Enhanced)
│       ├── ExpenseList.tsx (Enhanced)
│       ├── SplitTypeSelector.tsx (New)
│       ├── EqualSplitSection.tsx (New)
│       ├── CustomSplitSection.tsx (New)
│       ├── SplitValidationIndicator.tsx (New)
│       ├── SettlementSummary.tsx (New)
│       ├── SettlementStats.tsx (New)
│       ├── SettlementCard.tsx (New)
│       └── ExpenseFilters.tsx (Enhanced)
├── hooks/
│   ├── useExpenseSplit.ts (New)
│   └── useSettlements.ts (New)
└── lib/
    └── expenses/
        └── split-helpers.ts (New - client-side split calculations)
```

### Custom Hooks

```typescript
// useExpenseSplit.ts
export function useExpenseSplit(
  amount: number,
  collaborators: Collaborator[],
  currentUserId: string
) {
  const [splitMode, setSplitMode] = useState<SplitMode>('NONE');
  const [customMode, setCustomMode] = useState<CustomSplitMode>('AMOUNT');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [customSplits, setCustomSplits] = useState<Map<string, CustomSplit>>(new Map());

  const { perPersonAmount, validation } = useMemo(() => {
    // Calculate split amounts and validation
  }, [splitMode, amount, selectedUserIds, customSplits]);

  return {
    splitMode,
    setSplitMode,
    customMode,
    setCustomMode,
    selectedUserIds,
    setSelectedUserIds,
    customSplits,
    setCustomSplits,
    perPersonAmount,
    validation,
    reset: () => { /* reset to initial state */ },
  };
}
```

```typescript
// useSettlements.ts
export function useSettlements(tripId: string, userId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['settlements', tripId],
    queryFn: () => fetchSettlements(tripId),
  });

  const settlementsYouOwe = useMemo(() =>
    data?.settlements.filter(s => s.from === userId) || [],
    [data, userId]
  );

  const settlementsOwedToYou = useMemo(() =>
    data?.settlements.filter(s => s.to === userId) || [],
    [data, userId]
  );

  const totalYouOwe = useMemo(() =>
    settlementsYouOwe.reduce((sum, s) => sum + s.amount, 0),
    [settlementsYouOwe]
  );

  const totalOwedToYou = useMemo(() =>
    settlementsOwedToYou.reduce((sum, s) => sum + s.amount, 0),
    [settlementsOwedToYou]
  );

  return {
    settlements: data?.settlements || [],
    settlementsYouOwe,
    settlementsOwedToYou,
    totalYouOwe,
    totalOwedToYou,
    summary: data?.summary,
    isLoading,
    error,
  };
}
```

### Helper Functions

```typescript
// split-helpers.ts
export function calculatePerPersonAmount(
  total: number,
  peopleCount: number
): number {
  if (peopleCount === 0) return 0;
  return Math.floor((total / peopleCount) * 100) / 100;
}

export function validateSplitAmounts(
  total: number,
  splits: Map<string, { amount?: number; percentage?: number }>
): ValidationResult {
  const amounts = Array.from(splits.values());

  if (amounts.length === 0) {
    return { isValid: false, error: 'No splits defined' };
  }

  const hasAmounts = amounts.some(s => s.amount !== undefined);
  const hasPercentages = amounts.some(s => s.percentage !== undefined);

  if (hasAmounts && hasPercentages) {
    return { isValid: false, error: 'Cannot mix amounts and percentages' };
  }

  if (hasAmounts) {
    const sum = amounts.reduce((s, a) => s + (a.amount || 0), 0);
    const diff = Math.abs(sum - total);

    if (diff > 0.01) {
      return {
        isValid: false,
        error: `Split amounts ${sum > total ? 'exceed' : 'are less than'} total by $${diff.toFixed(2)}`,
      };
    }
  } else if (hasPercentages) {
    const sum = amounts.reduce((s, a) => s + (a.percentage || 0), 0);
    const diff = Math.abs(sum - 100);

    if (diff > 0.01) {
      return {
        isValid: false,
        error: `Percentages must sum to 100%, currently ${sum.toFixed(2)}%`,
      };
    }
  }

  return { isValid: true };
}

export function formatCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
```

### Performance Considerations

1. **Debounce split calculations** (useDebounce hook)
```typescript
const debouncedValidation = useDebounce(validation, 300);
```

2. **Memoize settlement calculations**
```typescript
const settlements = useMemo(() =>
  calculateSettlements(expenses),
  [expenses]
);
```

3. **Virtualize long settlement lists** (if > 50 items)
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';
```

4. **Lazy load Settlement Summary** (code splitting)
```typescript
const SettlementSummary = lazy(() => import('./SettlementSummary'));
```

### Testing Considerations

**Unit tests:**
- Split calculation functions
- Validation logic
- Settlement calculation algorithm

**Component tests:**
- Split UI state changes
- Form validation
- Settlement card rendering

**Integration tests:**
- Full expense creation flow
- Settlement calculation with real data

**Accessibility tests:**
- Keyboard navigation
- Screen reader announcements
- Focus management

---

## Summary

This design specification provides:

✅ **4 main components** with detailed wireframes
✅ **Complete user flows** for all split scenarios
✅ **Responsive layouts** for mobile, tablet, desktop
✅ **WCAG 2.1 AA accessibility** requirements
✅ **Animation specifications** using Framer Motion
✅ **Code examples** with TypeScript + React + shadcn/ui
✅ **Custom hooks** for state management
✅ **Helper functions** for calculations
✅ **Color palette** and visual design guidelines
✅ **Performance optimizations**
✅ **Testing strategy**

**Ready for implementation by shadcn-implementation-builder agent.**

---

**Questions or clarifications needed?**
- See `.claude/specs/implementation-tasks.md` Task 5.6 for acceptance criteria
- Backend API: `/src/app/api/trips/[tripId]/expenses/route.ts`
- Settlement API: `/src/app/api/trips/[tripId]/expenses/settlements/route.ts`
- Types: `/src/types/expense.ts`
