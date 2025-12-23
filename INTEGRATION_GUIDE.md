# Quick Integration Guide

## 🚀 Steps to Complete Implementation

### 1. Database Migration (REQUIRED FIRST)
```bash
# When database is accessible, run:
npm run db:push
```
This will create all new tables and add columns to existing tables.

### 2. Update App.tsx to Add Announcement Bar

```tsx
// File: client/src/App.tsx
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { useAuth } from '@/contexts/auth';

function App() {
  const { user } = useAuth();

  return (
    <div>
      {/* Add this at the very top of your app */}
      {user && <AnnouncementBar districtId={user.districtId} />}

      {/* Rest of your app */}
    </div>
  );
}
```

### 3. Add Route for School Data Editor

```tsx
// File: client/src/App.tsx (in your router setup)
import EditSchoolData from '@/pages/EditSchoolData';

// Add this route:
<Route path="/edit-school-data" component={EditSchoolData} />
```

### 4. Update DEO Dashboard to Use New SchoolsTable

```tsx
// File: client/src/pages/DEODashboard.tsx
import { SchoolsTable } from '@/components/deo/SchoolsTable';

// Replace the existing schools list section with:
<SchoolsTable districtId={user.districtId} />
```

### 5. Add Navigation Button to Dashboard

```tsx
// File: client/src/pages/Dashboard.tsx
// Add a button for headmasters to update school data

{user?.role === 'HEAD_TEACHER' && (
  <Button onClick={() => navigate('/edit-school-data')}>
    Update School Data
  </Button>
)}
```

### 6. Optional: Add Announcement Creation UI for DEOs

```tsx
// File: client/src/pages/DEODashboard.tsx or create new page
// Add a form to create announcements

const createAnnouncement = async (message: string, priority: string) => {
  await fetch('/api/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      priority,
      createdBy: user.id,
      createdByName: user.name,
      createdByRole: user.role,
      districtId: user.districtId,
      isActive: true,
    }),
  });
};
```

### 7. Test the System

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Test as DEO:**
   - View schools table with red flags
   - Export to Excel
   - Create announcement
   - View live AEO visits

3. **Test as Headmaster:**
   - Navigate to "Update School Data"
   - Update attendance, infrastructure, inventory
   - See auto-calculated absents
   - Save changes

4. **Test as AEO:**
   - Start a visit (create visit log)
   - Check DEO dashboard shows green badge
   - End visit
   - Badge disappears

## 📊 Example API Calls

### Create a Visit Log
```javascript
// When AEO opens school detail page
const response = await fetch('/api/visits', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    schoolId: school.id,
    schoolName: school.name,
    aeoId: user.id,
    aeoName: user.name,
    visitStartTime: new Date().toISOString(),
    isActive: true,
  }),
});
```

### End a Visit
```javascript
// When AEO leaves school
await fetch(`/api/visits/${visitId}/end`, {
  method: 'PATCH',
});
```

### Create Album with Global Broadcast
```javascript
const response = await fetch('/api/albums', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    schoolId: school.id,
    schoolName: school.name,
    title: 'Plantation Day', // Tag for grouping
    description: 'School plantation drive',
    createdBy: user.id,
    createdByName: user.name,
    createdByRole: user.role,
    isGlobalBroadcast: ['DEO', 'DDEO', 'AEO'].includes(user.role),
  }),
});
```

### Add Photos to Album
```javascript
// After creating album, add photos
const albumId = createdAlbum.id;

for (const photo of photos) {
  await fetch(`/api/albums/${albumId}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      photoUrl: photo.url, // Your uploaded photo URL
      photoFileName: photo.name,
      caption: photo.caption,
    }),
  });
}
```

### Download Album as DOCX
```javascript
const response = await fetch(`/api/albums/${albumId}/download/docx`);
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'album-report.docx';
a.click();
```

## 🎨 Styling Notes

### Red Flag Colors
The system automatically applies light red background (`bg-red-50`) to school rows when:
- Student attendance < 80%
- Broken toilets > 0
- No drinking water

### Live Visit Indicator
- Green badge with pulse animation
- Shows AEO name
- Auto-refreshes every 10 seconds

### Announcement Bar Colors
- **High Priority:** Red background (`bg-red-600`)
- **Medium Priority:** Amber background (`bg-amber-500`)
- **Low Priority:** Blue background (`bg-blue-600`)

## 🔧 Configuration Options

### Polling Interval
```tsx
// In SchoolsTable.tsx, line ~17
const interval = setInterval(loadActiveVisits, 10000); // 10 seconds
// Change to desired interval
```

### Announcement Rotation Speed
```tsx
// In AnnouncementBar.tsx, line ~40
const interval = setInterval(() => {
  setCurrentIndex((prev) => (prev + 1) % announcements.length);
}, 5000); // 5 seconds - adjust as needed
```

## 📱 Mobile Responsiveness

All components use Tailwind's responsive classes:
- `md:grid-cols-2` - 2 columns on medium screens
- `lg:grid-cols-3` - 3 columns on large screens
- Tables scroll horizontally on mobile via `overflow-x-auto`

## 🐛 Troubleshooting

### "Failed to load schools"
- Check database connection
- Verify `npm run db:push` was executed
- Check browser console for errors

### "Active visit not showing"
- Verify visit was created with `isActive: true`
- Check polling interval is running
- Inspect network tab for API calls

### "Excel export not downloading"
- Check response headers
- Verify `xlsx` library is installed
- Check browser download settings

## 📚 Additional Resources

- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Comprehensive documentation
- [shared/schema.ts](./shared/schema.ts) - Database schema
- [server/routes.ts](./server/routes.ts) - API endpoints
- [server/storage.ts](./server/storage.ts) - Database operations

## ✅ Verification Checklist

After integration, verify:
- [ ] Announcement bar appears at top
- [ ] School data edit form accessible
- [ ] DEO dashboard shows new table
- [ ] Red flags appear for problem schools
- [ ] Excel export downloads successfully
- [ ] Visit logs create and display correctly
- [ ] Permissions work (headmaster can only edit own school)
- [ ] Auto-calculations work (absent counts)
- [ ] Album downloads work (ZIP/DOCX)

## 🎯 Quick Win: Test with Sample Data

Create a test school with red flags:
```sql
UPDATE schools SET
  totalStudents = 100,
  presentStudents = 70, -- 70% attendance (< 80% = red flag)
  totalToilets = 5,
  workingToilets = 3,
  brokenToilets = 2, -- Broken toilets = red flag
  isDrinkingWaterAvailable = false -- No water = red flag
WHERE id = 'test-school-id';
```

The school should now appear with light red background on DEO dashboard!

---

**Need Help?** Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for detailed documentation.
