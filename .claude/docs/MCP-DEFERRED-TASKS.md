# MCP Deferred Tasks - For Future Re-validation

**Purpose**: This document tracks all frontend tasks and component installations that should be re-validated with MCP servers (chromedevtools, shadcn) when normal Claude usage resets.

**Status**: Claude Code for Web (no MCP support) - tracking for future re-validation

**Last Updated**: 2025-11-12

---

## 📋 Tasks Requiring Chrome DevTools MCP Validation

### Phase 1 - Foundation & Authentication (Completed)

| Task ID | Description | Files Modified | Validation Status |
|---------|-------------|----------------|-------------------|
| task-1-6-registration-ui | Registration form UI | `src/app/(auth)/register/page.tsx` | ⏸️ Deferred |
| task-1-8-login-ui | Login form UI | `src/app/(auth)/login/page.tsx` | ⏸️ Deferred |
| task-1-12-dashboard-layout | Dashboard layout with sidebar | `src/app/(dashboard)/layout.tsx`, `src/components/layout/*` | ⏸️ Deferred |

**Chrome DevTools Validation Needed**:
- Test on 3 viewports (Desktop 1920x1080, Tablet 768x1024, Mobile 375x667)
- Console error checks
- Performance trace (Core Web Vitals)
- Accessibility audit
- Screenshot capture for documentation

---

### Phase 2 - Trip Management Core (Completed)

| Task ID | Description | Files Modified | Validation Status |
|---------|-------------|----------------|-------------------|
| task-2-2-trip-list-ui | Trip list page with filters | `src/app/(dashboard)/trips/page.tsx`, `src/components/trips/TripList.tsx`, `src/components/trips/TripCard.tsx`, `src/components/trips/TripFilters.tsx` | ⏸️ Deferred |
| task-2-4-trip-create-ui | Create trip dialog | `src/components/trips/CreateTripDialog.tsx` | ⏸️ Deferred |
| task-2-6-trip-overview-ui | Trip details page | `src/app/(dashboard)/trips/[tripId]/page.tsx`, `src/components/trips/TripOverview.tsx`, `src/components/trips/TripHeader.tsx`, `src/components/trips/TripTabs.tsx` | ⏸️ Deferred |
| task-2-8-trip-edit-ui | Edit trip dialog | `src/components/trips/EditTripDialog.tsx` | ⏸️ Deferred |

**Chrome DevTools Validation Needed**:
- Test all CRUD operations on 3 viewports
- Verify drag-and-drop interactions (if any)
- Test form validation UX
- Check loading states and skeleton loaders
- Performance audit for list rendering
- Accessibility testing for dialogs and forms

---

### Phase 3 - Itinerary & Events (In Progress)

| Task ID | Description | Files Modified | Validation Status |
|---------|-------------|----------------|-------------------|
| task-3-3-itinerary-day-view | Itinerary Builder UI with drag-and-drop | `src/app/(dashboard)/trips/[tripId]/itinerary/page.tsx`, `src/components/itinerary/ItineraryBuilder.tsx`, `src/components/itinerary/DayColumn.tsx`, `src/components/itinerary/EventCard.tsx`, `src/components/itinerary/DraggableEvent.tsx`, `src/components/itinerary/UnscheduledEvents.tsx`, `src/components/itinerary/EmptyDay.tsx`, `src/hooks/useItineraryData.ts`, `src/hooks/useEventReorder.ts` | ⏸️ Deferred |
| task-3-4-event-forms | Event Creation Forms for all 6 event types | `src/components/events/CreateEventDialog.tsx`, `src/components/events/FlightForm.tsx`, `src/components/events/HotelForm.tsx`, `src/components/events/ActivityForm.tsx`, `src/components/events/RestaurantForm.tsx`, `src/components/events/TransportationForm.tsx`, `src/components/events/DestinationForm.tsx`, `src/components/events/LocationAutocomplete.tsx`, `src/components/events/CostInput.tsx`, `src/hooks/useCreateEvent.ts`, `src/hooks/useLocationSearch.ts` | ⏸️ Deferred |
| task-3-5-event-edit-delete | Event Edit & Delete functionality | `src/components/events/CreateEventDialog.tsx` (modified for edit mode), `src/components/events/EditEventDialog.tsx`, `src/components/events/DeleteEventDialog.tsx`, `src/components/itinerary/EventCard.tsx` (added edit/delete buttons), `src/hooks/useUpdateEvent.ts`, `src/hooks/useDeleteEvent.ts` | ⏸️ Deferred |
| task-3-6-calendar-view | Calendar View Integration with FullCalendar | `src/app/(dashboard)/trips/[tripId]/calendar/page.tsx`, `src/components/calendar/TripCalendar.tsx`, `src/hooks/useCalendarEvents.ts` | ⏸️ Deferred |
| task-3-7-map-markers | Map View with Event Markers using Leaflet | `src/app/(dashboard)/trips/[tripId]/map/page.tsx`, `src/components/map/TripMap.tsx`, `src/components/map/EventPopup.tsx`, `src/lib/map/icons.ts`, `src/styles/globals.css` (Leaflet styles) | ⏸️ Deferred |
| task-3-8-map-routes | Route Visualization with OSRM | `src/app/api/trips/[tripId]/route/route.ts`, `src/lib/map/osrm.ts`, `src/components/map/RouteLayer.tsx`, `src/components/map/TripMap.tsx` (modified) | ⏸️ Deferred |
| task-3-9-poi-search | POI Search Integration (OSM + Foursquare) | `src/app/api/search/poi/route.ts`, `src/lib/search/overpass.ts`, `src/lib/search/foursquare.ts`, `src/components/search/POISearch.tsx`, `src/components/search/POIResult.tsx`, `src/app/(dashboard)/trips/[tripId]/map/page.tsx` (modified) | ⏸️ Deferred |
| task-3-10-destination-guides | Destination Guides with Wikipedia API | `src/app/api/destinations/[slug]/route.ts`, `src/lib/destinations/wikipedia.ts`, `src/app/(public)/destinations/[slug]/page.tsx`, `src/components/destinations/DestinationGuide.tsx` | ⏸️ Deferred |
| task-3-11-weather | Weather Forecast Integration with OpenWeatherMap | `src/app/api/trips/[tripId]/weather/route.ts`, `src/lib/weather/openweather.ts`, `src/components/trips/WeatherWidget.tsx`, `src/components/trips/TripOverview.tsx` (modified) | ⏸️ Deferred |

**Chrome DevTools Validation Needed**:
- Test drag-and-drop on 3 viewports (Desktop 1920x1080, Tablet 768x1024, Mobile 375x667)
- Test touch interactions for mobile drag-and-drop
- Verify event card rendering and animations
- Test auto-save functionality
- Performance testing with 50+ events
- Keyboard navigation testing for accessibility
- Screen reader compatibility testing
- Console error checks
- Core Web Vitals measurement
- **task-3-4-event-forms specific**:
  - Test all 6 event type forms on 3 viewports
  - Test location autocomplete with Nominatim API
  - Test form validation for each event type
  - Test cost input with currency selector
  - Test date/time pickers
  - Verify tab transitions and animations
  - Test keyboard navigation through tabs and form fields
  - Screen reader testing for form accessibility
  - Test form submission (success/error states)
  - Performance testing with location search debouncing
- **task-3-5-event-edit-delete specific**:
  - Test edit dialog on 3 viewports (Desktop 1920x1080, Tablet 768x1024, Mobile 375x667)
  - Test delete confirmation dialog with keyboard navigation
  - Test edit/delete buttons visibility (hover on desktop, always on mobile)
  - Test optimistic updates (immediate UI feedback)
  - Test error rollback (when API call fails)
  - Test edit form pre-filling for all 6 event types
  - Test permission checks (canEdit prop)
  - Verify toast notifications (success/error states)
  - Test button click event propagation (stopPropagation)
  - Accessibility testing for dialogs and buttons
- **task-3-6-calendar-view specific**:
  - Test calendar view switching (month/week/day) on 3 viewports
  - Test event drag-and-drop to reschedule dates
  - Test event resize functionality (if enabled)
  - Test date click to create new event
  - Test event click to open edit dialog
  - Test "+N more" link when multiple events on same day
  - Test calendar navigation (prev/next month, today button)
  - Test timezone handling
  - Verify event colors match itinerary colors
  - Test responsive layout (toolbar stacking on mobile)
  - Test with 50+ events (performance)
  - Keyboard navigation testing
  - Screen reader testing for calendar controls
  - Console error checks
  - Performance trace (calendar rendering)
- **task-3-7-map-markers specific**:
  - Test map rendering on 3 viewports (Desktop 1920x1080, Tablet 768x1024, Mobile 375x667)
  - Test custom marker icons display correctly for all 6 event types
  - Test marker clustering with 100+ events (performance)
  - Verify cluster expansion/collapse on zoom
  - Test marker click to open event popup
  - Test popup content rendering (title, date, location, cost)
  - Test "View Details" button in popup
  - Test auto-fit bounds to show all markers
  - Test map controls (zoom +/-, pan with drag)
  - Test scroll wheel zoom
  - Test touch gestures on mobile (pinch zoom, pan)
  - Verify OpenStreetMap tiles load correctly
  - Test with no events (empty state)
  - Test with events without location data
  - Test map legend visibility and accuracy
  - Test event count badge
  - Console error checks
  - Performance testing with 50+ markers
  - Memory leak testing (add/remove markers repeatedly)
  - Responsive layout (legend and badges stack on mobile)
- **task-3-8-map-routes specific**:
  - Test route rendering on 3 viewports (Desktop 1920x1080, Tablet 768x1024, Mobile 375x667)
  - Test route visibility toggle (show/hide route)
  - Test profile switching (car/bike/foot) updates route
  - Verify OSRM API integration (route calculation)
  - Test route polyline rendering (blue line on map)
  - Test distance and duration display accuracy
  - Test route with 2 events (minimum)
  - Test route with 10+ events (waypoint simplification)
  - Test route with 25+ events (OSRM limit handling)
  - Verify route auto-fits bounds when shown
  - Test route API error handling (OSRM down, invalid coordinates)
  - Test route caching (5-minute cache)
  - Test profile icon buttons (car/bike/foot)
  - Verify route updates when profile changes
  - Test responsive layout (route control panel on mobile)
  - Console error checks
  - Performance testing with complex routes
  - Test API endpoint directly (GET /api/trips/[id]/route)
- **task-3-9-poi-search specific**:
  - Test POI search panel on 3 viewports (Desktop 1920x1080, Tablet 768x1024, Mobile 375x667)
  - Test search button toggle (show/hide panel)
  - Test text search input and submission
  - Test category filter buttons (8 categories)
  - Test radius slider (1-10km)
  - Verify OSM Overpass API integration
  - Test Foursquare fallback (when Overpass fails)
  - Test POI result rendering (name, category, address, rating, price)
  - Test "Add to Itinerary" button
  - Test POI to event conversion (correct event type mapping)
  - Test event creation from POI (location, notes populated)
  - Test with no results (empty state)
  - Test with API errors (error handling)
  - Test search result scrolling (many results)
  - Test responsive layout (panel width on mobile)
  - Verify source badge (OSM vs Foursquare)
  - Test category emoji icons
  - Console error checks
  - Test API endpoint directly (GET /api/search/poi)
  - Performance testing with 50+ results
- **task-3-10-destination-guides specific**:
  - Test destination guide page on 3 viewports (Desktop 1920x1080, Tablet 768x1024, Mobile 375x667)
  - Test Wikipedia API integration (fetch destination data)
  - Test image rendering (Wikipedia thumbnail)
  - Test overview section display
  - Test "Best Time to Visit" section
  - Test "Budget Tips" list rendering
  - Test "Add to Trip" button (redirects to trips)
  - Test "View on Wikipedia" button (opens in new tab)
  - Test with valid destination slug (e.g., "paris", "tokyo")
  - Test with invalid destination (404 error handling)
  - Test loading state
  - Test error state (destination not found)
  - Test navigation (back button)
  - Test responsive image hero section
  - Test coordinates display (if available)
  - Test Wikipedia attribution footer
  - Verify 24-hour cache headers
  - Console error checks
  - Test API endpoint directly (GET /api/destinations/[slug])
  - Performance testing (Wikipedia API latency)
- **task-3-11-weather specific**:
  - Test weather widget on 3 viewports (Desktop 1920x1080, Tablet 768x1024, Mobile 375x667)
  - Test OpenWeatherMap API integration
  - Test with valid trip (has events with location data)
  - Test with trip without location data (empty state)
  - Test loading state (spinner display)
  - Test error state (API key not configured)
  - Test weather data display (date, temp min/max, conditions, description)
  - Test weather icons (rain, snow, cloud, sun)
  - Test additional weather details (precipitation, wind speed)
  - Test responsive layout (stacks properly on mobile)
  - Verify 1-hour cache headers
  - Test API endpoint directly (GET /api/trips/[tripId]/weather)
  - Test with trip dates in past/future
  - Test with trip duration >7 days (forecast limit)
  - Console error checks
  - Performance testing (API response time)

---

## 🎨 shadcn Components Installed (Manual CLI)

### Phase 1 Components

| Component | Installation Command | Used In | Date Added |
|-----------|---------------------|---------|------------|
| button | `npx shadcn@latest add button` | Multiple forms/dialogs | Phase 1 |
| input | `npx shadcn@latest add input` | Auth forms | Phase 1 |
| label | `npx shadcn@latest add label` | Forms | Phase 1 |
| form | `npx shadcn@latest add form` | Auth forms | Phase 1 |
| card | `npx shadcn@latest add card` | Dashboard layout | Phase 1 |
| avatar | `npx shadcn@latest add avatar` | User profile | Phase 1 |
| dropdown-menu | `npx shadcn@latest add dropdown-menu` | User menu | Phase 1 |
| separator | `npx shadcn@latest add separator` | Layouts | Phase 1 |

### Phase 2 Components

| Component | Installation Command | Used In | Date Added |
|-----------|---------------------|---------|------------|
| dialog | `npx shadcn@latest add dialog` | Create/Edit trip modals | Phase 2 |
| select | `npx shadcn@latest add select` | Trip filters | Phase 2 |
| popover | `npx shadcn@latest add popover` | Date picker, filters | Phase 2 |
| calendar | `npx shadcn@latest add calendar` | Date selection | Phase 2 |
| badge | `npx shadcn@latest add badge` | Tags, status labels | Phase 2 |
| tabs | `npx shadcn@latest add tabs` | Trip detail tabs | Phase 2 |
| checkbox | `npx shadcn@latest add checkbox` | Bulk operations | Phase 2 |
| tooltip | `npx shadcn@latest add tooltip` | Info hints | Phase 2 |
| alert-dialog | `npx shadcn@latest add alert-dialog` | Delete confirmations | Phase 2 |

### Phase 3 Components

| Component | Installation Command | Used In | Status |
|-----------|---------------------|---------|--------|
| _To be tracked as needed_ | | | |

**Note**: This section tracks components that should be verified with shadcn MCP for correct registry versions and customizations.

---

## 🔄 Re-validation Workflow (Future)

When Claude normal usage resets and MCP servers are available:

### Step 1: Re-enable MCP in Config
```json
// .claude/config/validation-config.json
{
  "chromeDevToolsValidation": {
    "enabled": true,
    "validateAfterEveryUITask": true
  }
}
```

### Step 2: Run Chrome DevTools Validation on All Deferred Tasks

**Phase 1 Tasks** (3 tasks):
```bash
# For each task marked ⏸️ Deferred:
1. Start dev server: npm run dev
2. Connect Chrome DevTools MCP
3. Test task-1-6-registration-ui:
   - Navigate to /register
   - Test 3 viewports
   - Capture screenshots
   - Check console errors
   - Run performance trace
   - Generate validation report
4. Repeat for task-1-8-login-ui, task-1-12-dashboard-layout
```

**Phase 2 Tasks** (4 tasks):
```bash
# For each task:
1. Test trip list page (task-2-2)
2. Test create dialog (task-2-4)
3. Test trip overview (task-2-6)
4. Test edit dialog (task-2-8)
5. Generate comprehensive report
```

**Phase 3 Tasks** (TBD):
```bash
# Will be tracked as completed
```

### Step 3: Verify shadcn Components

```bash
# Use shadcn MCP to verify all installed components
# Check for:
- Correct registry versions
- Missing customizations
- Deprecated patterns
- Better alternatives available
```

### Step 4: Fix Issues Found

```bash
# Address any issues discovered:
- UI bugs on specific viewports
- Performance issues
- Accessibility violations
- Component version mismatches
```

---

## 📊 Estimated Re-validation Time

| Phase | UI Tasks | Time per Task | Total Time |
|-------|----------|---------------|------------|
| Phase 1 | 3 tasks | 15 min | 45 min |
| Phase 2 | 4 tasks | 15 min | 60 min |
| Phase 3 | TBD | 15 min | TBD |
| **Total** | **7+** | **15 min** | **~2 hours** |

**Note**: This is for comprehensive re-validation only. Not blocking current development.

---

## 🎯 Priority for Re-validation

### HIGH Priority (User-facing, complex interactions)
- ⏸️ task-2-2-trip-list-ui - Main list page with filters
- ⏸️ task-2-6-trip-overview-ui - Trip details page
- ⏸️ task-1-12-dashboard-layout - Main layout/navigation

### MEDIUM Priority (Dialogs, forms)
- ⏸️ task-2-4-trip-create-ui - Create trip modal
- ⏸️ task-2-8-trip-edit-ui - Edit trip modal
- ⏸️ task-1-6-registration-ui - Registration form
- ⏸️ task-1-8-login-ui - Login form

### LOW Priority (Simple, well-tested components)
- None yet (all UI is important)

---

## 📝 Notes

### Chrome DevTools MCP Capabilities
- Automated viewport testing (Desktop, Tablet, Mobile)
- Screenshot capture for documentation
- Console error detection
- Performance trace (LCP, FID, CLS)
- Network request monitoring
- Accessibility audit integration
- Element inspection and interaction testing

### shadcn MCP Capabilities
- Component registry lookup
- Automatic installation from registry
- Version verification
- Customization extraction
- Dependency management
- Component documentation

### Why Deferred?
- Claude Code for Web doesn't support MCP servers
- Development continues without blocking on manual validation
- Re-validation can be batched when MCP is available
- Current development relies on code review + automated tests

---

## ✅ Completion Checklist (Future)

When re-validating with MCP:

- [ ] Re-enable Chrome DevTools validation in config
- [ ] Connect to Chrome DevTools MCP server
- [ ] Connect to shadcn MCP server
- [ ] Run validation on all Phase 1 deferred tasks (3 tasks)
- [ ] Run validation on all Phase 2 deferred tasks (4 tasks)
- [ ] Run validation on all Phase 3 deferred tasks (TBD)
- [ ] Verify all shadcn components are up-to-date
- [ ] Generate comprehensive re-validation report
- [ ] Fix all issues found (if any)
- [ ] Mark all tasks as ✅ Validated
- [ ] Update project quality score

---

**Current Status**: Tracking enabled, development proceeding normally without MCP validation requirements.

**Next Update**: When Phase 3 UI tasks are completed.
