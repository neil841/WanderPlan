# WanderPlan - Manual Testing Checklist (Phase 1-5.4)
**Server**: http://localhost:3001

---

## 🚀 Pre-Testing Setup

### 1. Start the Development Server
```bash
npm run dev
```
**Expected**: Server running on http://localhost:3001

### 2. Verify Database Connection
- Open http://localhost:3001
- Should load without errors

---

## ✅ PHASE 1: Authentication & User Management

### 1.1-1.6: User Registration
**URL**: http://localhost:3001/register

**Test Steps**:
1. ✅ Navigate to registration page
2. ✅ Fill in form:
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john.doe@example.com"
   - Password: "Password123!" (must meet strength requirements)
3. ✅ Click "Create Account"
4. ✅ Should redirect to `/verify-email` page
5. ✅ Check console - email sending may fail (expected without SMTP config)

**Expected Results**:
- ✅ Form validation works (red errors for invalid input)
- ✅ Password strength indicator appears
- ✅ Success message shown
- ✅ User created in database

---

### 1.7-1.8: Login Flow
**URL**: http://localhost:3001/login

**Test Steps**:
1. ✅ Navigate to login page
2. ✅ Enter credentials:
   - Email: "john.doe@example.com"
   - Password: "Password123!"
3. ✅ Click "Sign In"
4. ✅ Should redirect to `/dashboard`

**Expected Results**:
- ✅ Login successful
- ✅ Session created (you're logged in)
- ✅ Dashboard shows your name
- ⚠️ May show "email not verified" warning (expected)

---

### 1.9: Email Verification
**URL**: http://localhost:3001/verify-email

**Test Steps**:
1. ✅ Navigate to verify-email page
2. ✅ Should show message about verification email sent
3. ✅ Click "Resend Verification Email"

**Expected Results**:
- ⚠️ Email sending will fail without SMTP config (expected)
- ✅ UI should handle gracefully with error message

---

### 1.10: Password Reset
**URL**: http://localhost:3001/forgot-password

**Test Steps**:
1. ✅ Navigate to forgot password page
2. ✅ Enter email: "john.doe@example.com"
3. ✅ Click "Send Reset Link"
4. ✅ Navigate to http://localhost:3001/reset-password

**Expected Results**:
- ⚠️ Email sending will fail without SMTP config (expected)
- ✅ UI should handle gracefully

---

### 1.11: User Profile & Settings
**URL**: http://localhost:3001/settings/profile

**Test Steps**:
1. ✅ Navigate to profile settings page
2. ✅ Verify all fields load:
   - ✅ First Name
   - ✅ Last Name
   - ✅ Email
   - ✅ Bio (optional)
   - ✅ Phone (optional)
   - ✅ Timezone selector
3. ✅ Update your first name to "Jane"
4. ✅ Click "Save Changes"
5. ✅ Refresh page - changes should persist

**Expected Results**:
- ✅ All form fields render correctly
- ✅ Data loads from database
- ✅ Updates save successfully
- ✅ Password change form is accessible

---

### 1.12: Dashboard Layout & Navigation
**URL**: http://localhost:3001/dashboard

**Test Steps**:
1. ✅ Verify sidebar navigation shows:
   - Dashboard
   - My Trips
   - Profile
   - Settings
2. ✅ Verify header shows:
   - User avatar/initials
   - User dropdown menu
3. ✅ Click each navigation item - routes should work
4. ✅ Click user dropdown - should show "Logout" option
5. ✅ Test mobile view (resize browser to < 768px width)
   - ✅ Hamburger menu appears
   - ✅ Sidebar slides out

**Expected Results**:
- ✅ All navigation items functional
- ✅ Active route highlighted
- ✅ Mobile navigation works
- ✅ Logout redirects to login page

---

## ✅ PHASE 2: Trip Management

### 2.1-2.2: Trip List
**URL**: http://localhost:3001/trips

**Test Steps**:
1. ✅ Navigate to trips page
2. ✅ If no trips: Should show "Create Your First Trip" button
3. ✅ If trips exist: Should show trip cards with:
   - Trip title
   - Destination
   - Dates
   - Cover image (if set)
4. ✅ Test search bar (type trip name)
5. ✅ Test filters (upcoming/past/archived)

**Expected Results**:
- ✅ Trip list loads
- ✅ Empty state shows if no trips
- ✅ Search and filters work

---

### 2.3-2.4: Create New Trip
**URL**: http://localhost:3001/trips (click "Create Trip")

**Test Steps**:
1. ✅ Click "Create Your First Trip" or "New Trip" button
2. ✅ Fill in trip creation form:
   - **Title**: "Summer Vacation 2025"
   - **Destination**: "Paris, France"
   - **Start Date**: Tomorrow's date
   - **End Date**: 7 days from tomorrow
   - **Description**: "A wonderful summer trip"
   - **Budget** (optional): 5000 USD
3. ✅ Click "Create Trip"
4. ✅ Should redirect to trip details page

**Expected Results**:
- ✅ Trip creation form appears
- ✅ Date picker works
- ✅ Destination autocomplete works (may need internet)
- ✅ Trip is created and saved to database
- ✅ Trip appears in trips list

---

### 2.5-2.6: View Trip Details
**URL**: http://localhost:3001/trips/[tripId]

**Test Steps**:
1. ✅ Click on a trip from the trips list
2. ✅ Verify trip details page shows:
   - ✅ Trip title and destination
   - ✅ Trip dates
   - ✅ Trip description
   - ✅ Cover image (if set)
   - ✅ Collaborators section
   - ✅ Quick stats (0 events, 0 expenses initially)
3. ✅ Verify tabs are visible:
   - Overview
   - Itinerary
   - Calendar
   - Map
   - Budget
   - Collaborators
   - Ideas
   - Messages
   - Polls
   - Activity

**Expected Results**:
- ✅ Trip details load correctly
- ✅ All tabs are clickable
- ✅ Overview tab shows summary

---

### 2.7-2.8: Edit Trip
**URL**: Trip details page → "Edit Trip" button

**Test Steps**:
1. ✅ Click "Edit Trip" button
2. ✅ Update trip title to "Amazing Summer Vacation 2025"
3. ✅ Click "Save Changes"
4. ✅ Verify title updates on page

**Expected Results**:
- ✅ Edit dialog opens
- ✅ Form pre-filled with existing data
- ✅ Updates save successfully

---

### 2.9: Archive/Delete Trip
**URL**: Trip details page → Menu → "Archive" or "Delete"

**Test Steps**:
1. ✅ Click trip menu (three dots)
2. ✅ Click "Archive Trip"
3. ✅ Confirm archival
4. ✅ Trip should move to "Archived" filter in trips list
5. ✅ Go back to trip, click "Unarchive"
6. ✅ Try "Delete Trip" (creates confirmation dialog)

**Expected Results**:
- ✅ Archive/unarchive works
- ✅ Delete shows confirmation
- ✅ Permissions enforced (only owner can delete)

---

### 2.10: Trip Duplication
**URL**: Trip details page → Menu → "Duplicate"

**Test Steps**:
1. ✅ Click trip menu → "Duplicate Trip"
2. ✅ New trip should be created with title "[Original] (Copy)"
3. ✅ Navigate to trips list
4. ✅ Verify duplicated trip exists

**Expected Results**:
- ✅ Trip duplicated successfully
- ✅ Events copied (if any exist)
- ✅ Expenses NOT copied (correct behavior)

---

### 2.11: Trip Sharing
**URL**: Trip details page → "Share Trip" button

**Test Steps**:
1. ✅ Click "Share Trip" button
2. ✅ Generate share link
3. ✅ Copy share link
4. ✅ Open link in incognito/private window
5. ✅ Should show read-only trip view

**Expected Results**:
- ✅ Share link generated
- ✅ Public view accessible without login
- ✅ Public view is read-only

---

### 2.12: Trip Tags
**URL**: Trip creation/edit form

**Test Steps**:
1. ✅ Edit a trip
2. ✅ Add tags: "Adventure", "Beach", "Culture"
3. ✅ Save changes
4. ✅ Tags should appear on trip card
5. ✅ Go to trips list
6. ✅ Filter by tag "Beach"

**Expected Results**:
- ✅ Tags can be added/removed
- ✅ Tag autocomplete works
- ✅ Tag filtering works

---

### 2.13: Bulk Trip Operations
**URL**: http://localhost:3001/trips

**Test Steps**:
1. ✅ Select multiple trips (checkboxes appear)
2. ✅ Click "Bulk Actions" toolbar
3. ✅ Try "Archive Selected"
4. ✅ Try "Add Tags to Selected"
5. ✅ Try "Delete Selected" (with confirmation)

**Expected Results**:
- ✅ Bulk selection works
- ✅ Bulk archive works
- ✅ Bulk tag works
- ✅ Bulk delete shows confirmation

---

## ✅ PHASE 3: Itinerary & Events

### 3.1: Event CRUD - Create Event
**URL**: Trip details → Itinerary tab → "Add Event"

**Test Steps**:
1. ✅ Navigate to a trip's Itinerary tab
2. ✅ Click "Add Event"
3. ✅ Test creating each event type:

   **Flight Event**:
   - Type: Flight
   - Airline: "United Airlines"
   - Flight Number: "UA123"
   - Departure Airport: "JFK"
   - Arrival Airport: "CDG"
   - Departure Time: Tomorrow 10:00 AM
   - Arrival Time: Tomorrow 10:00 PM
   - Cost: $800

   **Hotel Event**:
   - Type: Hotel
   - Hotel Name: "Le Grand Hotel"
   - Check-in Date: Tomorrow
   - Check-out Date: +3 days
   - Confirmation Number: "ABC123"
   - Cost: $300/night

   **Activity Event**:
   - Type: Activity
   - Activity Name: "Eiffel Tower Tour"
   - Start Time: Tomorrow 2:00 PM
   - Duration: 2 hours
   - Location: "Eiffel Tower, Paris"
   - Cost: $50

   **Restaurant Event**:
   - Type: Restaurant
   - Restaurant Name: "Le Jules Verne"
   - Reservation Time: Tomorrow 7:00 PM
   - Cuisine Type: "French"
   - Location: "Eiffel Tower"
   - Cost: $150

   **Transportation Event**:
   - Type: Transportation
   - Transportation Type: "Train"
   - Departure Time: Tomorrow 9:00 AM
   - Arrival Time: Tomorrow 11:00 AM
   - From: "Paris"
   - To: "Lyon"
   - Cost: $80

   **Destination Event**:
   - Type: Destination
   - Place Name: "Louvre Museum"
   - Visit Date: Tomorrow
   - Location: "Paris, France"

4. ✅ Click "Create Event" for each

**Expected Results**:
- ✅ Each event type form shows appropriate fields
- ✅ Location autocomplete works (needs internet)
- ✅ Date/time pickers work
- ✅ Events are created successfully
- ✅ Events appear in itinerary

---

### 3.2: Event Reordering (Drag & Drop)
**URL**: Trip details → Itinerary tab

**Test Steps**:
1. ✅ Create multiple events for same day
2. ✅ Drag an event card up/down within the same day
3. ✅ Drop event in new position
4. ✅ Verify order persists after page refresh

**Expected Results**:
- ✅ Drag and drop works smoothly
- ✅ Visual feedback during drag
- ✅ Order saves automatically
- ✅ Touch support on mobile devices

---

### 3.3: Itinerary Builder - Day View
**URL**: Trip details → Itinerary tab

**Test Steps**:
1. ✅ Verify day-by-day columns appear
2. ✅ Each day shows date header
3. ✅ Events grouped by day
4. ✅ Unscheduled events section visible
5. ✅ Drag event from one day to another
6. ✅ Verify event moves to new day

**Expected Results**:
- ✅ Days displayed correctly
- ✅ Events sorted by time within each day
- ✅ Cross-day drag and drop works
- ✅ Empty day shows "Add Event" prompt

---

### 3.4: Event Edit & Delete
**URL**: Trip details → Itinerary tab → Click event

**Test Steps**:
1. ✅ Click on an event card
2. ✅ Click "Edit Event"
3. ✅ Update event details
4. ✅ Save changes
5. ✅ Click event again → "Delete Event"
6. ✅ Confirm deletion

**Expected Results**:
- ✅ Edit dialog pre-filled with event data
- ✅ Updates save successfully
- ✅ Delete confirmation appears
- ✅ Event removed after deletion

---

### 3.5-3.7: Calendar View
**URL**: Trip details → Calendar tab

**Test Steps**:
1. ✅ Navigate to Calendar tab
2. ✅ Verify FullCalendar renders
3. ✅ Events appear on calendar dates
4. ✅ Switch views: Month / Week / Day
5. ✅ Click on an event - detail popup appears
6. ✅ Click on empty date - "Add Event" dialog opens
7. ✅ Try dragging event to different date

**Expected Results**:
- ✅ Calendar displays correctly
- ✅ Events color-coded by type
- ✅ View switching works
- ✅ Event details popup works
- ✅ Drag to reschedule works
- ✅ Timezone handling correct

---

### 3.8-3.11: Map View
**URL**: Trip details → Map tab

**Test Steps**:
1. ✅ Navigate to Map tab
2. ✅ Verify Leaflet map loads (OpenStreetMap)
3. ✅ Markers appear for events with locations
4. ✅ Markers use different icons by event type
5. ✅ Click on a marker - popup shows event details
6. ✅ If multiple events nearby - marker clustering works
7. ✅ Map auto-fits to show all markers

**POI Search**:
8. ✅ Search for "restaurants near Eiffel Tower"
9. ✅ POI results appear on map
10. ✅ Click POI → "Add to Itinerary" button
11. ✅ Add POI as event

**Route Visualization**:
12. ✅ Toggle "Show Route" button
13. ✅ Route line connects events in order
14. ✅ Route distance and duration shown

**Expected Results**:
- ✅ Map renders correctly
- ✅ Markers display properly
- ✅ Clustering works for dense areas
- ✅ POI search functional (needs internet)
- ✅ Route visualization works (needs internet for OSRM)

---

### 3.9: POI Search
**URL**: Trip details → Map tab → Search bar

**Test Steps**:
1. ✅ Type "restaurants" in search
2. ✅ Select a category filter (e.g., "Restaurants")
3. ✅ Results appear on map
4. ✅ Click a result
5. ✅ Click "Add to Trip"
6. ✅ Event created from POI

**Expected Results**:
- ✅ Search works (OSM Overpass or Foursquare)
- ✅ Category filters available
- ✅ POI details shown
- ✅ Can add POI as event

---

### 3.10: Destination Guides
**URL**: http://localhost:3001/destinations/paris (example)

**Test Steps**:
1. ✅ From trip details, click destination name link
2. ✅ Destination guide page loads
3. ✅ Content from Wikipedia API displays
4. ✅ Top attractions listed
5. ✅ "Add to Trip" button available

**Expected Results**:
- ✅ Destination guide renders
- ✅ Wikipedia content loads (needs internet)
- ✅ Can save destination to trip

---

### 3.11: Weather Forecast
**URL**: Trip details → Overview tab (Weather Widget)

**Test Steps**:
1. ✅ Navigate to trip overview
2. ✅ Weather widget should appear
3. ✅ Shows forecast for trip dates
4. ✅ Temperature, conditions, precipitation shown
5. ✅ Weather icons display

**Expected Results**:
- ⚠️ Requires OPENWEATHER_API_KEY in .env
- ✅ If configured: Shows weather forecast
- ⚠️ If not configured: Shows error or placeholder

---

## ✅ PHASE 4: Collaboration & Communication

### 4.1-4.2: Invite Collaborator
**URL**: Trip details → Collaborators tab

**Test Steps**:
1. ✅ Navigate to Collaborators tab
2. ✅ Click "Invite Collaborator"
3. ✅ Enter email: "collaborator@example.com"
4. ✅ Select role: VIEWER / EDITOR / ADMIN
5. ✅ Click "Send Invitation"
6. ✅ Pending invitation appears in list

**Expected Results**:
- ✅ Invite dialog appears
- ✅ Role selector works
- ⚠️ Email sending fails without SMTP (expected)
- ✅ Invitation created in database
- ✅ Invitation appears as "Pending"

---

### 4.3: Real-time Infrastructure
**Test**: Check if Socket.io is running

**Test Steps**:
1. ✅ Open browser console
2. ✅ Check for Socket.io connection message
3. ✅ Look for WebSocket connection in Network tab

**Expected Results**:
- ✅ Socket.io client connects
- ✅ WebSocket connection established (ws://localhost:3001)
- ✅ No connection errors in console

---

### 4.4-4.5: Real-time Messaging
**URL**: Trip details → Messages tab

**Test Steps**:
1. ✅ Navigate to Messages tab
2. ✅ Type a message: "Hello, this is a test message!"
3. ✅ Click "Send" or press Enter
4. ✅ Message appears in chat
5. ✅ Open same trip in another browser/tab (incognito)
6. ✅ Send message from second tab
7. ✅ Message should appear in first tab in real-time

**Advanced Tests**:
8. ✅ Click "Reply" on a message (threading)
9. ✅ Edit your own message (click edit icon)
10. ✅ Delete your own message (click delete icon)
11. ✅ Scroll up to load older messages (infinite scroll)

**Expected Results**:
- ✅ Message input works
- ✅ Messages appear immediately
- ✅ Real-time updates work (test with 2 tabs)
- ✅ Message threading works
- ✅ Edit/delete works for own messages
- ✅ Infinite scroll loads older messages
- ✅ Typing indicator shows (if implemented)

---

### 4.6-4.7: Ideas/Suggestions with Voting
**URL**: Trip details → Ideas tab

**Test Steps**:
1. ✅ Navigate to Ideas tab
2. ✅ Click "Add Idea"
3. ✅ Create idea:
   - Title: "Visit the Louvre at night"
   - Description: "Special evening tour"
   - Category: "Activity"
4. ✅ Click "Submit Idea"
5. ✅ Idea appears in list
6. ✅ Click upvote (👍) button
7. ✅ Vote count increases
8. ✅ Click downvote (👎) button
9. ✅ Click "Convert to Event" (if admin/owner)

**Expected Results**:
- ✅ Ideas can be created
- ✅ Voting works (upvote/downvote)
- ✅ Vote count updates
- ✅ Ideas can be filtered by status
- ✅ Can convert idea to event
- ✅ Status badges (Pending/Approved/Rejected) show

---

### 4.8-4.9: Polls
**URL**: Trip details → Polls tab or Messages tab

**Test Steps**:
1. ✅ Navigate to Polls section
2. ✅ Click "Create Poll"
3. ✅ Create poll:
   - Question: "Which museum should we visit first?"
   - Options:
     - "Louvre Museum"
     - "Musée d'Orsay"
     - "Centre Pompidou"
   - Poll Type: Single Choice
4. ✅ Click "Create Poll"
5. ✅ Poll appears in list
6. ✅ Vote on an option
7. ✅ Results bar chart updates
8. ✅ Try closing poll (owner only)

**Expected Results**:
- ✅ Poll creation works
- ✅ Options can be added/removed
- ✅ Single/multiple choice toggles
- ✅ Voting works
- ✅ Results visualized with bar chart
- ✅ Closed polls move to archive

---

### 4.10-4.11: Activity Feed
**URL**: Trip details → Activity tab

**Test Steps**:
1. ✅ Navigate to Activity tab
2. ✅ Verify activity timeline shows:
   - ✅ Trip created
   - ✅ Events added
   - ✅ Collaborators invited
   - ✅ Messages sent
   - ✅ Ideas created
   - ✅ Polls created
3. ✅ Verify activities grouped by date
4. ✅ Verify actor avatars appear
5. ✅ Test filter by activity type
6. ✅ Scroll down - more activities load (infinite scroll)

**Expected Results**:
- ✅ Activity feed displays
- ✅ Activities in reverse chronological order
- ✅ Grouped by date (Today, Yesterday, etc.)
- ✅ Actor information shown
- ✅ Filter works
- ✅ Infinite scroll works
- ✅ Real-time updates (new activities appear)

---

### 4.12-4.13: In-App Notifications
**URL**: Header → Notification Bell Icon

**Test Steps**:
1. ✅ Perform an action that triggers notification:
   - Create a poll
   - Send a message
   - Invite a collaborator
2. ✅ Check notification bell in header
3. ✅ Unread count badge should appear
4. ✅ Click bell icon
5. ✅ Notification dropdown appears
6. ✅ Click a notification
7. ✅ Should mark as read and navigate to source
8. ✅ Click "Mark All as Read"

**Expected Results**:
- ✅ Notification bell shows unread count
- ✅ Dropdown lists notifications
- ✅ Click notification navigates to source
- ✅ Mark as read works
- ✅ Real-time updates (test with 2 tabs)

---

### 4.14: Email Notification Settings
**URL**: http://localhost:3001/settings/notifications

**Test Steps**:
1. ✅ Navigate to notification settings
2. ✅ Toggle email preferences:
   - Instant notifications
   - Daily digest
   - Off
3. ✅ Toggle notification types:
   - New messages
   - New collaborators
   - Poll created
   - Idea status changed
4. ✅ Click "Save Preferences"

**Expected Results**:
- ✅ Settings page loads
- ✅ Toggles work
- ✅ Preferences save
- ⚠️ Email sending requires SMTP config

---

### 4.15: Invitation Acceptance
**URL**: http://localhost:3001/invitations/[token]

**Test Steps**:
1. ✅ Create invitation from step 4.1-4.2
2. ✅ Get invitation token from database (or email if SMTP configured)
3. ✅ Navigate to: http://localhost:3001/invitations/[token]
4. ✅ Click "Accept Invitation"
5. ✅ Should redirect to trip
6. ✅ User added as collaborator

**OR Test Decline**:
4. ✅ Click "Decline Invitation"
5. ✅ Invitation removed from database

**Expected Results**:
- ✅ Invitation page loads
- ✅ Trip details shown
- ✅ Accept adds user as collaborator
- ✅ Decline removes invitation

---

### 4.16: Permission Checks
**URL**: Throughout app

**Test Steps**:
1. ✅ As trip OWNER:
   - ✅ Can edit trip
   - ✅ Can delete trip
   - ✅ Can invite collaborators
   - ✅ Can remove collaborators
   - ✅ Can change roles

2. ✅ As ADMIN collaborator:
   - ✅ Can edit trip
   - ✅ Can add events
   - ✅ Can invite collaborators
   - ❌ Cannot delete trip

3. ✅ As EDITOR collaborator:
   - ✅ Can add events
   - ✅ Can edit events
   - ❌ Cannot invite collaborators
   - ❌ Cannot delete trip

4. ✅ As VIEWER collaborator:
   - ✅ Can view trip
   - ❌ Cannot edit anything
   - ❌ Cannot add events

**Expected Results**:
- ✅ UI buttons hidden based on permissions
- ✅ API enforces permissions (test via network tab)
- ✅ 403 errors for unauthorized actions

---

## ✅ PHASE 5: Budget & Expenses (5.1-5.4)

### 5.1-5.2: Budget Management
**URL**: Trip details → Budget tab

**Test Steps**:
1. ✅ Navigate to Budget tab
2. ✅ Click "Edit Budget"
3. ✅ Set budget categories:
   - Accommodation: $2000
   - Food: $1000
   - Activities: $800
   - Transportation: $600
   - Other: $400
4. ✅ Total budget: $4800
5. ✅ Click "Save Budget"
6. ✅ Verify budget overview displays:
   - Total budget
   - Category breakdown with progress bars
   - Spent vs budget for each category

**Expected Results**:
- ✅ Budget edit dialog works
- ✅ Category amounts editable
- ✅ Total calculates automatically
- ✅ Budget overview displays correctly
- ✅ Progress bars show (0% initially)

---

### 5.3-5.4: Expense Tracking
**URL**: Trip details → Budget tab → Expenses section

**Test Steps**:
1. ✅ Click "Add Expense"
2. ✅ Create expense:
   - Description: "Hotel Le Grand"
   - Amount: $600
   - Currency: USD
   - Category: Accommodation
   - Date: Tomorrow
   - Link to event: (select hotel event if created)
   - Upload receipt: (optional)
3. ✅ Click "Create Expense"
4. ✅ Expense appears in list
5. ✅ Budget progress bar updates (600/2000 = 30%)
6. ✅ Create more expenses:
   - "Eiffel Tower Tickets" - $50 - Activities
   - "Dinner at Le Jules Verne" - $150 - Food
   - "Train to Lyon" - $80 - Transportation
7. ✅ Verify total spent updates
8. ✅ Click expense to edit
9. ✅ Click expense to delete

**Expected Results**:
- ✅ Expense creation works
- ✅ Category dropdown populated from budget
- ✅ Link to event works
- ✅ Receipt upload works (if implemented)
- ✅ Expenses list displays correctly
- ✅ Budget bars update in real-time
- ✅ Over-budget warnings show (if exceeded)
- ✅ Edit/delete expense works
- ✅ Total expenses calculate correctly

**Advanced Test - Multi-Currency**:
10. ✅ Create expense in EUR: "Café au Lait" - €5 - Food
11. ✅ Verify currency displayed correctly

**Expected Results**:
- ✅ Multi-currency support works
- ✅ Currency symbols display correctly
- ⚠️ Currency conversion may require API (optional)

---

## 📊 Testing Summary Checklist

### Phase 1: Authentication ✅
- [ ] Registration
- [ ] Login
- [ ] Email Verification (⚠️ needs SMTP)
- [ ] Password Reset (⚠️ needs SMTP)
- [ ] User Profile
- [ ] Dashboard Navigation

### Phase 2: Trip Management ✅
- [ ] Trip List
- [ ] Create Trip
- [ ] View Trip Details
- [ ] Edit Trip
- [ ] Archive/Delete Trip
- [ ] Duplicate Trip
- [ ] Share Trip
- [ ] Trip Tags
- [ ] Bulk Operations

### Phase 3: Itinerary & Events ✅
- [ ] Create Events (all 6 types)
- [ ] Event Reordering (drag & drop)
- [ ] Edit/Delete Events
- [ ] Calendar View
- [ ] Map View with Markers
- [ ] POI Search (⚠️ needs internet)
- [ ] Route Visualization (⚠️ needs internet)
- [ ] Destination Guides (⚠️ needs internet)
- [ ] Weather Forecast (⚠️ needs API key)

### Phase 4: Collaboration ✅
- [ ] Invite Collaborator
- [ ] Real-time Messaging
- [ ] Ideas with Voting
- [ ] Polls
- [ ] Activity Feed
- [ ] In-App Notifications
- [ ] Email Settings (⚠️ needs SMTP)
- [ ] Invitation Acceptance
- [ ] Permission Checks

### Phase 5.1-5.4: Budget & Expenses ✅
- [ ] Budget Management
- [ ] Budget Categories
- [ ] Expense Tracking
- [ ] Multi-Currency Expenses

---

## 🔧 Known Limitations (Expected)

### Features Requiring Configuration:
1. ⚠️ **Email Sending** - Requires RESEND_API_KEY or SMTP config
2. ⚠️ **Weather Forecast** - Requires OPENWEATHER_API_KEY
3. ⚠️ **POI Search** - May fallback if FOURSQUARE_API_KEY not set
4. ⚠️ **Route Visualization** - Requires internet connection (OSRM API)
5. ⚠️ **Destination Guides** - Requires internet connection (Wikipedia API)

### Working Without Configuration:
✅ All Phase 1-2 features (Authentication, Trip Management)
✅ Event management (local features)
✅ Calendar view (local)
✅ Map view with markers (OpenStreetMap works without API key)
✅ Collaboration features (real-time via Socket.io)
✅ Budget and expense tracking

---

## 🎯 Quick Testing Order (Recommended)

**30-Minute Quick Test**:
1. Register → Login (5 min)
2. Create Trip (3 min)
3. Add 2-3 Events (5 min)
4. View Calendar and Map (3 min)
5. Send Message (2 min)
6. Create Budget + Expense (5 min)
7. Test Collaborator Invite (2 min)
8. Create Idea + Poll (5 min)

**Complete Testing** (~2-3 hours):
Follow all steps in order from Phase 1 → Phase 5.4

---

**Happy Testing! 🚀**

All features should work on localhost:3001 with minimal configuration.
