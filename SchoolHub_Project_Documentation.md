# SchoolHub - School Monitoring & Data Management Platform

## Project Documentation

---

# Plan

## SchoolHub Project Timeline (8-Week Development Cycle)

---

### Week 1: Project Setup & User Authentication

**Focus:** Database setup, user authentication system, and role-based access control.

#### Tasks:

**Day 1 (Monday)**
- Kick-off meeting to finalize requirements for user authentication and role hierarchy.
- Design wireframes for signup page (phone number, password, name, role selection) and login page.
- Set up PostgreSQL database schema for users table.

**Day 2 (Tuesday)**
- Build signup page with role selection (CEO, DEO, DDEO, AEO, Head Teacher, Teacher).
- Implement password hashing before storing data in the database.
- Set up login page with phone number and password authentication.

**Day 3 (Wednesday)**
- Implement role hierarchy system (CEO > DEO > DDEO/AEO > Head Teacher > Teacher).
- Build user profile setup forms with role-specific fields:
  - CEO: District assignment, contact details
  - DEO: District assignment, office location
  - DDEO/AEO: Cluster assignment, list of assigned schools
  - Head Teacher: School ID, School Name
  - Teacher: School assignment, subjects, grades

**Day 4 (Thursday)**
- Test signup and login process to ensure all roles can register and log in successfully.
- Implement session management and authentication context.
- Connect signup form to the database for storing user details securely.

**Day 5 (Friday)**
- Build role-based dashboard routing (redirect users to their respective dashboards).
- Document the authentication system and user registration flow.
- Internal review and testing of authentication module.

---

### Week 2: Dashboard Development & Navigation

**Focus:** Role-specific dashboards and navigation system.

#### Tasks:

**Day 1 (Monday)**
- Design and implement DEO Dashboard layout.
- Build navigation sidebar with role-specific menu items.
- Create responsive layout that works on mobile and desktop.

**Day 2 (Tuesday)**
- Develop Head Teacher Dashboard with school overview widgets.
- Implement Teacher Dashboard with basic functionality.
- Build CEO Dashboard with district-wide overview.

**Day 3 (Wednesday)**
- Create DDEO/AEO Dashboard with cluster-level monitoring.
- Implement dashboard card components with statistics display.
- Build theme toggle (light/dark mode) functionality.

**Day 4 (Thursday)**
- Test all dashboards for proper data loading and display.
- Implement dashboard customization modal for widget arrangement.
- Build draggable card components for dashboard organization.

**Day 5 (Friday)**
- Internal review and testing of all dashboard components.
- Prepare documentation for dashboard features.
- Fix any bugs found during testing.

---

### Week 3: School Management & Data Entry

**Focus:** School registration, school data management, and inventory tracking.

#### Tasks:

**Day 1 (Monday)**
- Design school data entry forms for Head Teachers.
- Build EditSchoolData page with comprehensive form fields.
- Set up database schema for schools table with all required fields.

**Day 2 (Tuesday)**
- Implement attendance tracking fields:
  - Total Students, Present Students, Absent Students
  - Total Teachers, Present Teachers, Absent Teachers
- Build auto-calculation for absent counts.

**Day 3 (Wednesday)**
- Add infrastructure monitoring fields:
  - Total Toilets, Working Toilets, Broken Toilets
  - Drinking Water Availability (Boolean)
- Implement inventory status tracking (New/In-Use/Broken):
  - Desks, Fans, Chairs, Blackboards, Computers

**Day 4 (Thursday)**
- Build SchoolsTable component for DEO Dashboard.
- Implement school list display with sorting and filtering.
- Add color-coded status indicators for attendance and infrastructure.

**Day 5 (Friday)**
- Test school data entry and retrieval.
- Implement data validation for all form fields.
- Document school management features.

---

### Week 4: Data Request System

**Focus:** Data request creation, assignment, and tracking with hierarchy-based permissions.

#### Tasks:

**Day 1 (Monday)**
- Design data request workflow and UI layout.
- Set up database schema for dataRequests and requestAssignees tables.
- Define permission rules for request assignment (assign down only).

**Day 2 (Tuesday)**
- Build CreateRequest page with form fields:
  - Title, Description, Priority, Due Date
  - Custom data fields specification
- Implement assignee selection with hierarchy filtering.

**Day 3 (Wednesday)**
- Develop DataRequests list page with status filters.
- Build ViewRequest page for detailed request view.
- Implement response submission for assignees.

**Day 4 (Thursday)**
- Add file upload capability for request responses.
- Build request status tracking (Pending, In Progress, Completed).
- Implement notification system for request updates.

**Day 5 (Friday)**
- Test data request workflow end-to-end.
- Internal review and testing of permissions.
- Document data request system.

---

### Week 5: School Visit Tracking

**Focus:** AEO visit logging, real-time tracking, and visit history management.

#### Tasks:

**Day 1 (Monday)**
- Design visit tracking interface and workflow.
- Set up database schema for visitLogs table.
- Build StartVisitModal for AEOs to initiate school visits.

**Day 2 (Tuesday)**
- Implement visit types:
  - Monitoring Visit
  - Mentoring Visit
  - Office Visit
  - Other Activity
- Build visit form pages for each visit type.

**Day 3 (Wednesday)**
- Develop ActiveVisitBanner to show ongoing visits.
- Build ActiveVisitsWidget for dashboard display.
- Implement real-time visit status updates.

**Day 4 (Thursday)**
- Create ViewVisit page for detailed visit history.
- Build SchoolVisits page listing all visits for a school.
- Add visit notes and observations functionality.

**Day 5 (Friday)**
- Implement evidence collection (photos, voice notes) during visits.
- Test visit tracking workflow.
- Document visit management features.

---

### Week 6: Smart Albums & Photo Management

**Focus:** Tag-based photo albums, comments, reactions, and broadcast functionality.

#### Tasks:

**Day 1 (Monday)**
- Design album system architecture and UI.
- Set up database schemas for schoolAlbums, albumPhotos, albumComments, albumReactions.
- Build album creation interface.

**Day 2 (Tuesday)**
- Implement photo upload with Multer.
- Build album detail view with photo grid.
- Add photo captions and timestamps.

**Day 3 (Wednesday)**
- Develop comment system for albums.
- Implement reaction system (likes, etc.).
- Build global broadcast functionality for DEO/DDEO albums.

**Day 4 (Thursday)**
- Create SchoolAlbum page for viewing albums.
- Implement album filtering by school and tags.
- Build album download features (ZIP, DOCX).

**Day 5 (Friday)**
- Test album creation, upload, and download.
- Internal review of photo management.
- Document album features.

---

### Week 7: Announcements, Alerts & Reporting

**Focus:** Announcement system, red flag alerts, and comprehensive reporting.

#### Tasks:

**Day 1 (Monday)**
- Design announcement system with priority levels.
- Set up database schema for announcements table.
- Build AnnouncementBar component with scrolling marquee.

**Day 2 (Tuesday)**
- Implement announcement creation for DEO/DDEO roles.
- Add priority-based color coding (High: Red, Medium: Amber, Low: Blue).
- Build dismissible announcements with auto-rotation.

**Day 3 (Wednesday)**
- Develop Red Flag Alert system for problem schools.
- Define alert triggers:
  - Low attendance (< 80%)
  - Broken toilets
  - No drinking water
  - Missing data updates
- Display red flag indicators on DEO dashboard.

**Day 4 (Thursday)**
- Build Excel export functionality (23-column comprehensive report).
- Implement CSV export for data requests.
- Create DOCX report generation for albums.

**Day 5 (Friday)**
- Test all reporting and export features.
- Internal review of announcement and alert systems.
- Document reporting features.

---

### Week 8: Final Testing & Launch Preparation

**Focus:** Comprehensive testing, optimization, and platform launch.

#### Tasks:

**Day 1 (Monday)**
- Start full platform testing: All user roles, all features.
- Test end-to-end workflows:
  - User registration to dashboard access
  - Data request creation to response submission
  - School visit initiation to completion

**Day 2 (Tuesday)**
- Test school data entry and retrieval accuracy.
- Verify attendance and infrastructure tracking.
- Test album creation, upload, and download functions.

**Day 3 (Wednesday)**
- Address bugs found during testing.
- Test real-time features (active visits, announcements).
- Verify permission system across all roles.

**Day 4 (Thursday)**
- Performance optimization and server load testing.
- Ensure secure storage of all user data and media.
- Final database integrity checks.

**Day 5 (Friday)**
- Platform go-live: Make platform accessible for all users.
- Monitor performance post-launch for any issues.
- Prepare user documentation and onboarding materials.

---

## Summary of the Timeline

| Week | Focus Area | Key Deliverables |
|------|------------|------------------|
| Week 1 | User Authentication & Setup | Signup, Login, Role Hierarchy, User Profiles |
| Week 2 | Dashboard Development | Role-specific Dashboards, Navigation, Theme Toggle |
| Week 3 | School Management | School Data Entry, Attendance, Infrastructure, Inventory |
| Week 4 | Data Request System | Request Creation, Assignment, Tracking, Responses |
| Week 5 | School Visit Tracking | Visit Logs, Real-time Tracking, Evidence Collection |
| Week 6 | Smart Albums | Photo Management, Comments, Reactions, Downloads |
| Week 7 | Announcements & Reporting | Alert System, Red Flags, Excel/CSV/DOCX Reports |
| Week 8 | Testing & Launch | QA, Optimization, Go-Live |

---

# Revised Plan

## Adjustments from Initial Timeline

Based on complexity analysis and dependency mapping, the following adjustments have been made to the initial 8-week timeline:

| Week | Original Focus | Revised Focus | Reason for Change |
|------|----------------|---------------|-------------------|
| Week 1 | Oct 29 – Nov 2 | Setup & Authentication | Basic app layout, database setup, login/signup flow initiated |
| Week 2 | Nov 3 – Nov 7 | Login/Signup Finalization + School Data Module | Finalize authentication, build school data entry with attendance and infrastructure tracking |
| Week 3 | Nov 10 – Nov 14 | Dashboard + Data Request System | Create role-specific dashboards with integrated data request functionality |
| Week 4 | Nov 17 – Nov 21 | School Visit Tracking Module | Connect visit tracking to AEO dashboard, add evidence upload, build DEO monitoring view |
| Week 5 | Nov 24 – Nov 28 | Smart Albums + Media Management | Add album creation, photo upload, comments, reactions, and download features |
| Week 6 | Dec 1 – Dec 5 | Announcements + Alert System | Build announcement marquee, red flag alerts, priority-based notifications |
| Week 7 | Dec 8 – Dec 12 | Reporting + Export Features | Comprehensive Excel export (23 columns), DOCX reports, ZIP downloads |
| Week 8 | Dec 15 – Dec 19 | Final QA + Launch | Full platform testing, deployment, and internal launch |

### Key Changes Summary:

1. **School Data Module** separated from Dashboard development to ensure proper dependency on user profile data
2. **Visit Tracking** moved earlier in the timeline as it's a core AEO functionality
3. **Albums & Media** shifted to Week 5 to build on evidence collection from visits
4. **Reporting Features** given dedicated week due to complexity of Excel/DOCX generation
5. **Extended buffer** added to final testing phase for comprehensive QA

### Dependencies Identified:

```
Authentication (Week 1)
    ↓
School Data Entry (Week 2) ← Depends on user roles being set up
    ↓
Dashboards (Week 3) ← Needs school data to display
    ↓
Visit Tracking (Week 4) ← Requires AEO profiles and school assignments
    ↓
Albums & Media (Week 5) ← Builds on evidence collection capability
    ↓
Announcements (Week 6) ← Needs dashboard infrastructure
    ↓
Reporting (Week 7) ← Requires all data sources to be complete
    ↓
Final QA & Launch (Week 8)
```

---

# Development Phases

## Phase 1: User Authentication & Role Management (Week 1)

### 1️⃣ Overview

The goal of this phase is to establish a secure, role-based authentication system that supports the organizational hierarchy of education field teams.

The system must be:
- Mobile-friendly (users may access from low-spec devices)
- Simple and intuitive for non-technical users
- Secure with proper password hashing and session management
- Scalable for future feature additions

### 2️⃣ Objectives & Success Metrics

| Objective | Success Metric |
|-----------|----------------|
| Allow users to self-register with role selection | > 95% successful self-sign-ups |
| Ensure accurate role and organizational data | > 95% profiles with complete fields |
| Maintain stable authentication | < 1% login failures due to session/auth issues |
| Achieve smooth navigation to correct dashboard | Users reach dashboard ≤ 3 steps from login |

### 3️⃣ User Stories

#### CEO
> As a CEO, I want to create my account and access a district-wide overview dashboard so I can monitor all schools and field teams under my jurisdiction.

**Acceptance Criteria:**
- Can sign up using phone number + password
- Selects CEO role during registration
- Completes profile: Name, District Assignment, Contact Details
- Can log in and view CEO Dashboard with district statistics
- Profile data persists and can be edited later

#### DEO (District Education Officer)
> As a DEO, I want to register and access my district dashboard so I can monitor schools, track AEO visits, and manage data requests.

**Acceptance Criteria:**
- Can sign up with DEO role selection
- Completes profile: Name, District, Office Location
- Dashboard shows all schools in district
- Can create announcements and data requests
- Can view AEO activity and school visit logs

#### DDEO/AEO (Deputy DEO / Academic Education Officer)
> As an AEO, I want to register and access my cluster dashboard so I can plan school visits, track attendance, and submit visit reports.

**Acceptance Criteria:**
- Can sign up with DDEO or AEO role selection
- Completes profile: Name, Cluster Assignment, Assigned Schools
- Dashboard shows cluster schools and pending tasks
- Can initiate and record school visits
- Can upload evidence (photos, voice notes)

#### Head Teacher
> As a Head Teacher, I want to register and access my school dashboard so I can update daily attendance, infrastructure status, and view data requests.

**Acceptance Criteria:**
- Can sign up with Head Teacher role
- Completes profile: Name, School ID, School Name, Contact
- Dashboard shows school statistics and pending requests
- Can update school data (attendance, infrastructure, inventory)
- Can view and respond to data requests

#### Teacher
> As a Teacher, I want to register and view my school information so I can stay informed about school activities and announcements.

**Acceptance Criteria:**
- Can sign up with Teacher role
- Completes profile: Name, School, Subjects, Grades
- Dashboard shows school information (view-only)
- Can view announcements and school albums
- Cannot edit school data (read-only access)

---

## Phase 2: Dashboard & Navigation System (Week 2)

### 1️⃣ Overview

This phase focuses on building role-specific dashboards that provide users with relevant information and quick access to their primary tasks.

### 2️⃣ Objectives & Success Metrics

| Objective | Success Metric |
|-----------|----------------|
| Provide role-appropriate dashboard views | 100% users see role-specific content |
| Enable easy navigation to all features | All features accessible within 2 clicks |
| Support mobile and desktop devices | Responsive design works on all screen sizes |
| Provide customization options | Users can arrange dashboard widgets |

### 3️⃣ Key Components

**CEO Dashboard:**
- District-wide statistics overview
- All schools summary with filter options
- DEO performance metrics
- System-wide announcements

**DEO Dashboard:**
- District schools table with status indicators
- Active AEO visits (real-time)
- Red flag alerts for problem schools
- Pending data requests
- Announcement management

**AEO Dashboard:**
- Assigned schools list
- Today's visit plan
- Pending visit reports
- Quick-start visit button
- Activity logs

**Head Teacher Dashboard:**
- School statistics (attendance, infrastructure)
- Pending data requests
- School album access
- Update school data button
- Announcements marquee

**Teacher Dashboard:**
- School information (view-only)
- Announcements
- School album access

---

## Phase 3: School Data Management (Week 3)

### 1️⃣ Overview

This phase implements comprehensive school data entry and tracking for attendance, infrastructure, and inventory.

### 2️⃣ Objectives & Success Metrics

| Objective | Success Metric |
|-----------|----------------|
| Enable daily attendance tracking | 100% schools report attendance daily |
| Track infrastructure status accurately | > 95% infrastructure data complete |
| Monitor inventory across schools | All inventory items tracked by status |
| Provide real-time data updates | DEO sees updates within 1 minute |

### 3️⃣ Data Categories

**Attendance Tracking:**
- Total Students / Present Students / Absent Students
- Total Teachers / Present Teachers / Absent Teachers
- Attendance percentage calculation
- Daily attendance history

**Infrastructure Monitoring:**
- Total Toilets / Working Toilets / Broken Toilets
- Drinking Water Availability (Yes/No)
- Infrastructure condition flags

**Inventory Status (New / In-Use / Broken):**
- Desks
- Fans
- Chairs
- Blackboards
- Computers

### 4️⃣ User Stories

#### Head Teacher - Daily Updates
> As a Head Teacher, I want to quickly update my school's attendance and infrastructure status so the DEO can monitor our school's condition.

**Acceptance Criteria:**
- Can access "Update School Data" from dashboard
- Form pre-fills previous day's data
- Auto-calculates absent counts
- Saves with timestamp for tracking
- DEO dashboard reflects updates immediately

---

## Phase 4: Data Request System (Week 4)

### 1️⃣ Overview

This phase implements a hierarchical data request system where users can request information from their subordinates.

### 2️⃣ Objectives & Success Metrics

| Objective | Success Metric |
|-----------|----------------|
| Enable data collection across hierarchy | > 90% requests receive responses |
| Maintain strict assignment permissions | 100% assignments follow hierarchy rules |
| Track request completion status | All requests have accurate status tracking |
| Support file attachments in responses | File upload success rate > 95% |

### 3️⃣ Permission Rules

| Role | Can Assign To |
|------|--------------|
| CEO | DEO |
| DEO | DDEO, AEO |
| DDEO | AEO, Head Teacher |
| AEO | Head Teacher |
| Head Teacher | Teacher |
| Teacher | None |

### 4️⃣ Request Workflow

1. Creator specifies request details (title, description, fields, due date)
2. Assignees receive notification
3. Assignees submit responses with optional file uploads
4. Creator reviews and marks complete
5. All actions logged for audit

### 5️⃣ User Stories

#### DEO - Creating Data Requests
> As a DEO, I want to create data requests and assign them to AEOs or DDEOs so I can collect specific information from schools in my district.

**Acceptance Criteria:**
- Can create request with title, description, and due date
- Can specify custom data fields to collect
- Can set priority level (High/Medium/Low)
- Can select multiple assignees from subordinates only
- Request appears in assignees' pending tasks

#### AEO - Responding to Data Requests
> As an AEO, I want to view assigned data requests and submit responses so I can fulfill my reporting obligations to the DEO.

**Acceptance Criteria:**
- Can see list of pending requests on dashboard
- Can view request details and required fields
- Can submit text responses and upload files
- Can track submission status (Pending/Submitted/Approved)
- Receives confirmation when response is accepted

#### Head Teacher - Submitting School Data
> As a Head Teacher, I want to respond to data requests from my AEO with accurate school information so I can keep supervisors informed.

**Acceptance Criteria:**
- Can view all requests assigned to me
- Can fill in required data fields
- Can attach documents (photos, spreadsheets) as evidence
- Can save draft and submit when complete
- Can view history of past responses

---

## Phase 5: School Visit Tracking (Week 5)

### 1️⃣ Overview

This phase enables AEOs to plan, execute, and document school visits with real-time tracking and evidence collection.

### 2️⃣ Objectives & Success Metrics

| Objective | Success Metric |
|-----------|----------------|
| Enable real-time visit tracking | 100% active visits visible on DEO dashboard |
| Support multiple visit types | All 4 visit types implemented and functional |
| Capture comprehensive evidence | > 90% visits include photo/voice evidence |
| Maintain accurate visit history | All visits logged with start/end times |

### 3️⃣ Visit Types

| Visit Type | Purpose |
|------------|---------|
| Monitoring Visit | Routine school inspection |
| Mentoring Visit | Teacher support and training |
| Office Visit | Administrative meetings |
| Other Activity | Community engagement, events |

### 4️⃣ Visit Workflow

1. AEO starts visit (records start time, location)
2. DEO dashboard shows "AEO ON-SITE" badge
3. AEO records observations and uploads evidence
4. AEO ends visit (records end time, notes)
5. Visit log saved for reporting

### 5️⃣ Evidence Collection

- Photo uploads with captions
- Voice note recordings
- Text observations and notes
- Timestamp and location data

### 6️⃣ User Stories

#### AEO - Starting a School Visit
> As an AEO, I want to start a visit log when I arrive at a school so my supervisor can see I'm on-site and I can record my observations.

**Acceptance Criteria:**
- Can select school from assigned schools list
- Can choose visit type (Monitoring/Mentoring/Office/Other)
- Visit start time is automatically recorded
- "Active Visit" banner appears on my dashboard
- DEO sees green "AEO ON-SITE" badge on school row

#### AEO - Recording Visit Observations
> As an AEO, I want to record observations and upload evidence during my visit so I have documentation of school conditions.

**Acceptance Criteria:**
- Can take and upload photos with captions
- Can record voice notes for observations
- Can add text notes and observations
- Can view all collected evidence before ending visit
- Evidence is saved even if connection is interrupted

#### AEO - Ending a School Visit
> As an AEO, I want to end my visit and save the complete log so I can track my activity history.

**Acceptance Criteria:**
- Can add final notes and summary
- Visit end time is automatically recorded
- Complete visit log is saved to database
- Visit appears in school's visit history
- DEO can view completed visit report

#### DEO - Monitoring Active Visits
> As a DEO, I want to see which schools currently have AEOs on-site so I can monitor field team activity in real-time.

**Acceptance Criteria:**
- Dashboard shows "AEO ON-SITE" badge for active visits
- Can see AEO name and visit start time
- Badge disappears when visit ends
- Can click to view visit details
- Active visits widget shows count and list

---

## Phase 6: Smart Albums & Media (Week 6)

### 1️⃣ Overview

This phase implements a tag-based photo album system for documenting school events and activities.

### 2️⃣ Objectives & Success Metrics

| Objective | Success Metric |
|-----------|----------------|
| Enable organized photo documentation | All photos organized in tagged albums |
| Support social engagement features | Comments and reactions functional |
| Enable global event broadcasting | DEO albums visible across all schools |
| Provide multiple download formats | ZIP and DOCX exports working |

### 3️⃣ Features

**Album Management:**
- Create albums with title and description
- Tag-based organization (e.g., "Sports Day", "Annual Function")
- School-specific and global broadcast albums

**Photo Features:**
- Multi-photo upload
- Captions and timestamps
- Comments and reactions
- Download as ZIP or DOCX report

**Broadcast System:**
- Albums created by DEO/DDEO/AEO auto-broadcast
- Global albums visible across all schools
- Promotes district-wide event sharing

### 4️⃣ User Stories

#### Head Teacher - Creating School Album
> As a Head Teacher, I want to create photo albums for school events so I can document activities and share them with my supervisors.

**Acceptance Criteria:**
- Can create album with title, description, and tag
- Can upload multiple photos at once
- Can add captions to each photo
- Album appears in school's album gallery
- Supervisors (AEO, DEO) can view the album

#### Head Teacher - Viewing Global Broadcasts
> As a Head Teacher, I want to see photo albums shared by the DEO so I can stay informed about district-wide events and announcements.

**Acceptance Criteria:**
- Can view albums marked as "Global Broadcast"
- Can see photos, comments, and reactions
- Can add comments and reactions to broadcasts
- Global albums clearly labeled as district announcements

#### DEO - Broadcasting District Events
> As a DEO, I want to create albums that automatically appear in all schools so I can share important district events and guidance.

**Acceptance Criteria:**
- Albums I create are automatically set as "Global Broadcast"
- All schools in district can view my albums
- Can see engagement (comments, reactions) from all viewers
- Can download album as ZIP or DOCX report

#### AEO - Documenting Visit Evidence
> As an AEO, I want to add photos taken during visits to school albums so evidence is organized and accessible.

**Acceptance Criteria:**
- Can upload visit photos to existing or new album
- Photos include timestamp and location metadata
- Can add descriptive captions
- Albums linked to school and visit records
- DEO can view albums as part of visit documentation

---

## Phase 7: Announcements, Alerts & Reporting (Week 7)

### 1️⃣ Overview

This phase implements district-wide communication through announcements, automatic alerts for problem schools, and comprehensive reporting capabilities.

### 2️⃣ Objectives & Success Metrics

| Objective | Success Metric |
|-----------|----------------|
| Enable district-wide communication | All users see relevant announcements |
| Automatically flag problem schools | 100% of issue conditions trigger alerts |
| Provide comprehensive reporting | Reports include all required data fields |
| Support multiple export formats | Excel, ZIP, DOCX exports functional |

### 3️⃣ Announcement System

**Features:**
- Scrolling marquee bar on all dashboards
- Priority levels (High/Medium/Low)
- Color-coded display
- Auto-rotation of multiple announcements
- Dismissible by users

### 4️⃣ Red Flag Alert System

**Alert Triggers:**
| Condition | Alert Type |
|-----------|------------|
| Attendance < 80% | Low Attendance |
| Broken Toilets > 0 | Infrastructure Issue |
| No Drinking Water | Critical Alert |
| Data not updated > 3 days | Stale Data |

**Display:**
- Red highlighting on school rows
- Alert badges on DEO dashboard
- Summary count of flagged schools

### 5️⃣ Reporting Features

**Excel Export:**
- 23-column comprehensive school report
- Includes attendance, infrastructure, inventory
- Filterable by district, cluster, school

**Album Downloads:**
- ZIP archive with all photos
- DOCX report with metadata and comments

### 6️⃣ User Stories

#### DEO - Creating Announcements
> As a DEO, I want to create announcements that appear on all user dashboards so I can communicate important information district-wide.

**Acceptance Criteria:**
- Can create announcement with title and message
- Can set priority level (High/Medium/Low)
- Announcement displays in scrolling marquee bar
- High priority announcements shown in red
- Can set expiration date for announcement
- Can delete or update announcements

#### DEO - Viewing Red Flag Alerts
> As a DEO, I want to see schools with problems highlighted automatically so I can prioritize which schools need attention.

**Acceptance Criteria:**
- Schools with low attendance (< 80%) shown in red
- Schools with broken toilets flagged
- Schools without drinking water flagged
- Schools with stale data (> 3 days) flagged
- Can filter table to show only flagged schools
- Alert summary shows count by alert type

#### DEO - Generating Reports
> As a DEO, I want to export comprehensive school data to Excel so I can analyze performance and share reports with leadership.

**Acceptance Criteria:**
- Can export all schools data to Excel
- Report includes 23 columns of data
- Includes attendance, infrastructure, inventory fields
- Can filter by date range and school status
- Report includes timestamp of generation
- File downloads with meaningful filename

#### Head Teacher - Viewing Announcements
> As a Head Teacher, I want to see district announcements on my dashboard so I stay informed about important updates.

**Acceptance Criteria:**
- Announcements appear in scrolling marquee bar
- Can see announcement priority by color
- Can dismiss announcements I've read
- Multiple announcements rotate automatically
- Can view full announcement details on click

#### AEO - Downloading Visit Reports
> As an AEO, I want to download my visit reports as documents so I can share them offline or print for records.

**Acceptance Criteria:**
- Can export album/visit as DOCX report
- Report includes visit details and photos
- Report includes timestamps and observations
- Can download album photos as ZIP file
- Downloads work on mobile devices

---

## Phase 8: Testing & Launch (Week 8)

### 1️⃣ Testing Checklist

**User Authentication:**
- [ ] All 6 roles can register successfully
- [ ] Login works with phone number + password
- [ ] Role-based dashboard routing works
- [ ] Session persistence and logout function

**School Management:**
- [ ] Head Teachers can update school data
- [ ] Attendance calculations are accurate
- [ ] Infrastructure tracking works
- [ ] Inventory status updates correctly

**Data Requests:**
- [ ] Requests can be created with custom fields
- [ ] Assignment follows hierarchy rules
- [ ] Responses can include file uploads
- [ ] Status tracking is accurate

**Visit Tracking:**
- [ ] AEOs can start/end visits
- [ ] Real-time status shows on DEO dashboard
- [ ] Evidence uploads work
- [ ] Visit history is accurate

**Albums & Media:**
- [ ] Photos upload and display correctly
- [ ] Comments and reactions work
- [ ] Downloads (ZIP/DOCX) function properly
- [ ] Broadcast albums appear globally

**Announcements & Alerts:**
- [ ] Marquee displays correctly
- [ ] Priority colors are accurate
- [ ] Red flags trigger appropriately
- [ ] Excel export includes all data

### 2️⃣ Performance Requirements

| Metric | Target |
|--------|--------|
| Page Load Time | < 3 seconds |
| API Response Time | < 500ms |
| Concurrent Users | 100+ |
| Mobile Responsiveness | All screen sizes |

### 3️⃣ Security Requirements

- Password hashing (bcrypt or equivalent)
- Session-based authentication
- Role-based access control enforced
- SQL injection prevention
- XSS protection
- Secure file uploads

---

# Technical Architecture

## System Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript |
| UI Framework | Tailwind CSS + shadcn/ui |
| Routing | Wouter |
| State Management | TanStack React Query |
| Backend | Node.js + Express |
| Database | PostgreSQL (Neon Serverless) |
| ORM | Drizzle ORM |
| Build Tool | Vite |

## Database Schema Summary

### Core Tables

| Table | Purpose |
|-------|---------|
| users | User accounts with role, school, district associations |
| schools | School data including attendance, infrastructure, inventory |
| dataRequests | Data collection requests with fields and status |
| requestAssignees | Request-to-user assignments with responses |
| visitLogs | AEO school visit tracking |
| schoolAlbums | Tag-based photo albums |
| albumPhotos | Individual photos in albums |
| albumComments | Comments on albums |
| albumReactions | Reactions (likes) on albums |
| announcements | District-wide announcements |

## Role Hierarchy

```
CEO (Level 5)
  └── DEO (Level 4)
       └── DDEO (Level 3)
       └── AEO (Level 3)
            └── Head Teacher (Level 2)
                 └── Teacher (Level 1)
```

---

# Success Metrics Summary

| Category | Metric | Target |
|----------|--------|--------|
| User Adoption | Self-registration success rate | > 95% |
| Data Quality | Complete school profiles | > 95% |
| Engagement | Daily attendance updates | > 90% schools |
| Performance | Page load time | < 3 seconds |
| Reliability | System uptime | > 99% |
| Security | Authentication failures | < 1% |

---

# Contact & Support

**Project:** SchoolHub - School Monitoring & Data Management Platform

**Purpose:** Comprehensive system for school monitoring and data management serving education field teams with role-based access controls, data request workflows, school visit management, and activity tracking.

---

*Document Version: 1.0*
*Last Updated: January 2026*
