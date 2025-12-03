# Guest Mode Implementation Guide

Complete documentation for WanderPlan's guest mode functionality.

## Overview

Guest mode allows users to start planning trips immediately without creating an account. Trips are stored in browser localStorage and can be migrated to the database when the user signs up.

## Architecture

### Core Files

#### Storage & State Management
- **`src/lib/guest-mode.ts`** - Core localStorage utilities (CRUD operations, session tracking)
- **`src/lib/guest-storage.ts`** - Safe storage with error handling and quota management
- **`src/lib/guest-migration.ts`** - Migration utilities for signup conversion
- **`src/lib/guest-analytics.ts`** - Conversion funnel tracking

#### UI Components
- **`src/components/guest/GuestTripBuilder.tsx`** - Trip creation form
- **`src/components/guest/GuestTripView.tsx`** - Trip detail view with conversion prompts
- **`src/components/guest/GuestTripList.tsx`** - Trip list with cards
- **`src/components/guest/SignupPromptModal.tsx`** - Context-aware signup modal
- **`src/components/guest/MigrationBanner.tsx`** - Post-signup import banner
- **`src/components/layout/PublicHeader.tsx`** - Adaptive navigation

#### Routes
- **`src/app/plan/new/page.tsx`** - Trip creation route
- **`src/app/plan/[id]/page.tsx`** - Trip detail route
- **`src/app/plan/page.tsx`** - Trip list route

## User Flow

```
1. Landing Page
   ↓ Click "Start Planning Free"
2. Trip Creation Form (/plan/new)
   ↓ Fill form & submit
3. Trip Saved to localStorage
   ↓ Redirect to trip view
4. Trip Detail View (/plan/{id})
   - Feature cards showing signup benefits
   - Premium CTA section
   ↓ Optional: Navigate to "My Trips"
5. Trip List (/plan)
   - Shows all guest trips
   - Urgent prompt when 2+ trips
   ↓ When ready to signup
6. Register Page
   ↓ After successful signup
7. Migration Banner appears
   ↓ Click "Import Trips"
8. Trips migrated to database
   ↓ localStorage cleared
9. User sees all trips in authenticated dashboard
```

## Features

### 1. localStorage Management

**Key Functions** (from `guest-mode.ts`):
```typescript
getGuestTrips() // Get all trips
createGuestTrip(trip) // Create new trip
getGuestTrip(id) // Get single trip
updateGuestTrip(id, updates) // Update trip
deleteGuestTrip(id) // Delete trip
clearGuestTrips() // Clear all trips
```

**Session Tracking**:
- Time spent in app
- Number of trips created
- Features used
- Last active timestamp

### 2. Smart Signup Prompts

**Trigger Reasons**:
1. **`collaborate`** - User clicks invite/collaborate feature
2. **`save`** - User wants permanent storage
3. **`export`** - User wants to export/share trip
4. **`engagement`** - After 5+ minutes of use
5. **`feature_limit`** - After creating 2+ trips

**Implementation**:
```typescript
import { shouldShowSignupPrompt, getSignupPromptMessage } from '@/lib/guest-mode';

if (shouldShowSignupPrompt('collaborate')) {
  const message = getSignupPromptMessage('collaborate');
  // Show modal with message
}
```

### 3. Data Migration on Signup

**Automatic Migration**:
```typescript
import { migrateGuestTripsOnAuth } from '@/lib/guest-migration';

// Call after successful signup/login
const result = await migrateGuestTripsOnAuth();

if (result.success) {
  toast.success(`${result.migratedCount} trips imported!`);
} else {
  toast.error('Some trips could not be imported');
}
```

**Migration Banner**:
```tsx
import { MigrationBanner } from '@/components/guest/MigrationBanner';

// Add to authenticated dashboard layout
export default function DashboardLayout({ children }) {
  return (
    <>
      <MigrationBanner />
      {children}
    </>
  );
}
```

### 4. Analytics Tracking

**Track Key Events**:
```typescript
import { trackCTAClick, trackTripCreation, trackSignupPrompt } from '@/lib/guest-analytics';

// Track CTA clicks
trackCTAClick('hero', 'Start Planning Free');

// Track trip creation
trackTripCreation(tripId, {
  name: tripData.name,
  destinationCount: destinations.length,
  tagCount: tags.length,
});

// Track signup prompts
trackSignupPrompt('shown', 'engagement');
trackSignupPrompt('clicked', 'engagement');
```

**Conversion Metrics**:
```typescript
import { getConversionMetrics } from '@/lib/guest-analytics';

const metrics = getConversionMetrics();
// {
//   sessionDuration: 300000, // 5 minutes
//   tripsCreated: 2,
//   featuresUsed: ['trip_builder', 'trip_view'],
//   shouldPromptSignup: true
// }
```

### 5. Storage Error Handling

**Safe Storage Operations**:
```typescript
import { safeSetItem, safeGetItem } from '@/lib/guest-storage';

// Safe write with quota checking
const result = await safeSetItem('guest_trips', trips);
if (!result.success) {
  if (result.error === 'QUOTA_EXCEEDED') {
    alert('Storage full! Please sign up to save more trips.');
  }
}

// Safe read with error handling
const result = safeGetItem<GuestTrip[]>('guest_trips');
if (result.success) {
  const trips = result.data || [];
}
```

**Storage Health Monitoring**:
```typescript
import { getStorageHealthReport } from '@/lib/guest-storage';

const health = await getStorageHealthReport();
// {
//   available: true,
//   quota: '10 MB',
//   usage: '2.5 MB',
//   percentUsed: 25,
//   tripCount: 3,
//   recommendations: []
// }
```

## Integration Guide

### 1. Add Migration Banner to Dashboard

```tsx
// src/app/(dashboard)/layout.tsx
import { MigrationBanner } from '@/components/guest/MigrationBanner';

export default function DashboardLayout({ children }) {
  return (
    <>
      <MigrationBanner />
      <div className="dashboard">
        {children}
      </div>
    </>
  );
}
```

### 2. Track Analytics Events

```tsx
// src/components/landing/HeroSection.tsx
import { trackCTAClick } from '@/lib/guest-analytics';

export function HeroSection() {
  const handleCTAClick = () => {
    trackCTAClick('hero', 'Start Planning Free');
  };

  return (
    <button onClick={handleCTAClick}>
      Start Planning Free
    </button>
  );
}
```

### 3. Add Signup Conversion Tracking

```tsx
// src/app/register/page.tsx
import { trackSignupConversion } from '@/lib/guest-analytics';

export default function RegisterPage() {
  const handleSignup = async () => {
    // ... signup logic
    if (success) {
      trackSignupConversion('registration_page');
    }
  };
}
```

### 4. Monitor Storage Health

```tsx
// src/components/guest/StorageWarning.tsx
import { useEffect, useState } from 'react';
import { getStorageHealthReport } from '@/lib/guest-storage';

export function StorageWarning() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    getStorageHealthReport().then(setHealth);
  }, []);

  if (!health || health.percentUsed < 80) return null;

  return (
    <Alert>
      Storage is {health.percentUsed}% full.
      Sign up to save more trips!
    </Alert>
  );
}
```

## Configuration

### Environment Variables

```env
# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_MIXPANEL_TOKEN=xxxxx

# Feature flags
NEXT_PUBLIC_GUEST_MODE_ENABLED=true
NEXT_PUBLIC_AUTO_MIGRATION_ENABLED=true
```

### Analytics Provider Setup

**Google Analytics**:
```tsx
// src/app/layout.tsx
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
  `}
</Script>
```

## Testing

### Manual Testing Checklist

- [ ] Create trip without signup
- [ ] Trip saved to localStorage
- [ ] Navigate to trip list
- [ ] See trip in list
- [ ] Click trip card → redirects to detail
- [ ] Header shows "My Trips" link
- [ ] Create second trip
- [ ] See urgent signup prompt (2+ trips)
- [ ] Sign up → migration banner appears
- [ ] Click "Import Trips"
- [ ] All trips imported to database
- [ ] localStorage cleared
- [ ] Trips visible in authenticated dashboard

### Edge Cases to Test

- [ ] Private browsing mode (localStorage disabled)
- [ ] Storage quota exceeded
- [ ] Corrupted localStorage data
- [ ] Create 10+ trips (storage warning)
- [ ] Close browser and reopen (persistence)
- [ ] Multiple tabs open (race conditions)

## Performance Considerations

### localStorage Limits
- **Maximum size**: ~5-10MB per domain (varies by browser)
- **Read/write speed**: Synchronous (blocks main thread)
- **Quota exceeded**: Show error, prompt signup

### Optimization Tips
1. **Lazy load** trip data (only load when needed)
2. **Debounce** session updates (don't update every second)
3. **Compress** large trip descriptions
4. **Limit** trip count (e.g., max 20 guest trips)
5. **Archive** old trips (auto-delete after 30 days)

## Security Considerations

### Data Protection
- Guest data stored client-side only
- No sensitive information in localStorage
- Clear data on signup conversion
- No PII collected in guest mode

### Privacy
- Session ID is random UUID (not linkable)
- Analytics respect Do Not Track
- No cross-site tracking
- GDPR compliant (data deleted on request)

## Troubleshooting

### Common Issues

**Issue**: Trips not saving
- **Cause**: localStorage disabled (private browsing)
- **Fix**: Show warning, prompt to disable private browsing

**Issue**: Storage quota exceeded
- **Cause**: Too many trips or large descriptions
- **Fix**: Prompt signup, offer to delete old trips

**Issue**: Data corrupted
- **Cause**: Invalid JSON in localStorage
- **Fix**: Restore from backup, or clear and start fresh

**Issue**: Migration failed
- **Cause**: API error, network issue
- **Fix**: Retry migration, keep localStorage data

## Metrics to Track

### Conversion Funnel
1. Landing page visits
2. CTA clicks
3. Trip builder views
4. Trip creation completions
5. Signup prompt views
6. Signup prompt clicks
7. Signup completions
8. Migration completions

### Key Metrics
- **Guest→Signup conversion rate**
- **Average time to conversion**
- **Average trips before signup**
- **Most clicked signup trigger**
- **Migration success rate**

## Future Enhancements

### Planned Features
1. **Offline support** with Service Workers
2. **Cross-device sync** via magic link
3. **Progressive enhancement** - save drafts
4. **Smart suggestions** based on guest behavior
5. **A/B testing** for signup prompts
6. **Email reminders** for abandoned trips
7. **Export to PDF** for guest users (with watermark)

### Technical Improvements
1. **IndexedDB fallback** for large trips
2. **Compression** for trip data
3. **Background sync** for auto-save
4. **Conflict resolution** for multi-tab editing

## Support

### Documentation
- Full API reference: See inline JSDoc comments
- Component examples: See Storybook (if available)
- Integration guide: This document

### Contact
- **Email**: support@wanderplan.com
- **GitHub**: https://github.com/wanderplan/app/issues
- **Slack**: #guest-mode channel

---

**Last Updated**: November 24, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
