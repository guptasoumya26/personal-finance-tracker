# 📝 Notes Feature Update Guide

## Overview
The notes feature has been updated with two major changes:
1. **Save Button Added** - Manual save instead of auto-save
2. **Global Notes** - Notes now persist across all months

---

## 🔧 Changes Made

### 1. Database Migration
**File:** `database/migrations/make_notes_global.sql`

The migration script:
- Removes the `month` column from the `notes` table
- Drops the `(user_id, month)` unique constraint
- Adds new `(user_id)` unique constraint (one note per user)
- Cleans up duplicate notes (keeps most recent)
- Removes the `idx_notes_month` index

**⚠️ IMPORTANT: Run this migration in your Supabase SQL Editor:**
```sql
-- Copy and run the entire file from:
-- database/migrations/make_notes_global.sql
```

### 2. API Route Changes
**File:** `src/app/api/notes/route.ts`

Changes:
- `GET /api/notes` - No longer requires `month` parameter
- `POST /api/notes` - Removed `month` from request body
- `PUT /api/notes` - Removed `month` parameter
- All queries now filter by `user_id` only (no month)

### 3. API Client Changes
**File:** `src/lib/api.ts`

```typescript
// OLD:
export async function fetchNote(month: string)
export async function saveNote(content: string, month: string, credit_card_tracker_title?: string)

// NEW:
export async function fetchNote()
export async function saveNote(content: string, credit_card_tracker_title?: string)
```

### 4. Frontend Changes
**File:** `src/app/page.tsx`

**State Changes:**
```typescript
// Removed:
const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

// Added:
const [hasUnsavedNotes, setHasUnsavedNotes] = useState(false);
const [savingNotes, setSavingNotes] = useState(false);
```

**Logic Changes:**
- Notes loaded once on initial page load (not on every month change)
- Auto-save debounce removed
- New `handleSaveNotes()` function for manual save
- `handleNotesChange()` now just updates state and sets `hasUnsavedNotes = true`

**UI Changes:**
- Header: "📝 Notes" (removed month)
- Subheader: "(Persists across all months)"
- Save button with 3 states:
  - "Save Notes" (blue, enabled when unsaved changes)
  - "Saving..." (disabled during save)
  - "Saved" (gray, disabled when no changes)
- Warning text: "⚠️ You have unsaved changes" (shown when hasUnsavedNotes)
- Increased textarea rows from 4 to 6
- Updated placeholder text

### 5. TypeScript Types
**File:** `src/types/index.ts`

```typescript
// OLD:
export interface Note {
  id: string;
  content: string;
  month: Date;  // ← Removed
  createdAt: Date;
  updatedAt: Date;
}

// NEW:
export interface Note {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🚀 Deployment Steps

### Step 1: Run Database Migration
1. Open your Supabase SQL Editor
2. Copy the entire contents of `database/migrations/make_notes_global.sql`
3. Run the migration
4. Verify success (no errors)

**What happens:**
- Existing notes are consolidated (most recent note per user is kept)
- Month column is removed
- Schema is updated for global notes

### Step 2: Deploy Code Changes
1. Commit all changes:
   ```bash
   git add .
   git commit -m "✨ Update notes: add save button and make global"
   git push
   ```

2. If using Vercel:
   - Automatic deployment will start
   - Wait for deployment to complete

3. If self-hosting:
   - Rebuild the application
   - Restart the server

### Step 3: Verify Changes
1. Log in to your Finance Tracker
2. Navigate to the Notes section
3. Verify:
   - ✅ Header shows "Notes (Persists across all months)"
   - ✅ Save button is visible
   - ✅ Typing in notes shows "Save Notes" button (blue)
   - ✅ Clicking save shows "Saving..." then "Saved"
   - ✅ Warning appears when there are unsaved changes
   - ✅ Notes remain the same when switching months
   - ✅ Toast notification appears on successful save

---

## 📊 Behavior Comparison

### Before (Auto-Save, Per-Month)
```
User Action:          → Type in notes
Behavior:            → Auto-saves after 500ms
Persistence:         → Per month (different notes per month)
User Feedback:       → None (silent save)
Month Navigation:    → Notes change per month
```

### After (Manual Save, Global)
```
User Action:          → Type in notes
Behavior:            → Button shows "Save Notes" (blue)
Persistence:         → Global (same notes across all months)
User Feedback:       → "⚠️ You have unsaved changes"
Month Navigation:    → Notes stay the same
Save Action:         → Click "Save Notes" button
Save Feedback:       → Toast: "Notes saved successfully!"
```

---

## 🎨 UI States

### Save Button States

1. **No Changes (Initial/Saved)**
   - Text: "Saved"
   - Color: Gray (bg-gray-700)
   - State: Disabled
   - Cursor: Not allowed

2. **Unsaved Changes**
   - Text: "Save Notes"
   - Color: Blue (bg-blue-600)
   - State: Enabled
   - Cursor: Pointer
   - Below: "⚠️ You have unsaved changes" (yellow)

3. **Saving**
   - Text: "Saving..."
   - Color: Blue
   - State: Disabled
   - Cursor: Not allowed

---

## 🔄 Data Migration Notes

**What happens to existing notes?**

When you run the migration:
1. **Multiple notes per user:** Only the most recent note is kept
2. **Single note per user:** That note is preserved
3. **No notes:** No changes

**Example:**
```
Before Migration:
- User 1, Jan 2025: "January notes"
- User 1, Feb 2025: "February notes"
- User 1, Mar 2025: "March notes"

After Migration:
- User 1: "March notes" (most recent kept)
```

**Recommendation:**
If you have important notes in different months, manually consolidate them before running the migration.

---

## 🐛 Troubleshooting

### Issue: Migration fails with "column does not exist"
**Solution:** The migration has safety checks (`IF EXISTS`). If it fails, check:
1. Are you running it in the correct database?
2. Does the `notes` table exist?
3. Run: `SELECT * FROM notes LIMIT 1;` to verify structure

### Issue: "Failed to save notes" toast
**Solution:**
1. Check browser console for errors
2. Verify API route is accessible: `GET /api/notes`
3. Check authentication token is valid
4. Verify database connection

### Issue: Notes not persisting across months
**Solution:**
1. Hard refresh the page (Ctrl+Shift+R)
2. Check if migration was successful
3. Verify `month` column was removed from database

### Issue: Old notes are missing
**Solution:**
1. Check database: `SELECT * FROM notes WHERE user_id = 'your-user-id'`
2. Verify migration kept the most recent note
3. If data was lost, restore from backup and consolidate manually before re-running migration

---

## 🔒 Security Notes

**No security changes** - All existing security measures remain:
- JWT authentication required
- User isolation (users only see their own notes)
- HTTP-only cookies
- Server-side validation

---

## 📱 Responsive Design

The notes section is fully responsive:
- **Mobile:** Button stacks below header, full-width
- **Desktop:** Button aligned right, inline with header
- **Textarea:** Expands to full width on all devices

---

## ✅ Testing Checklist

After deployment, test these scenarios:

- [ ] Load page - notes load correctly
- [ ] Type in notes - "Save Notes" button appears (blue)
- [ ] Click save - toast shows "Notes saved successfully!"
- [ ] Refresh page - notes persist
- [ ] Navigate to different month - notes remain the same
- [ ] Edit notes - unsaved changes warning appears
- [ ] Save again - warning disappears
- [ ] Open in incognito - notes are empty (user isolation)
- [ ] Test with multiple users - each user has separate notes

---

## 💡 Benefits

### For Users:
✅ Clear feedback on save status
✅ Control over when notes are saved
✅ Notes available across all months (no need to copy/paste)
✅ No accidental overwrites
✅ Visual warning for unsaved changes

### For Developers:
✅ Simplified database schema (no month field)
✅ Reduced API calls (no auto-save polling)
✅ Cleaner code (no debounce logic)
✅ Better UX feedback

---

## 🔮 Future Enhancements (Optional)

Consider these improvements:
1. **Keyboard shortcut:** Save with Ctrl+S / Cmd+S
2. **Auto-save option:** Toggle in settings
3. **Note history:** Version control for notes
4. **Rich text:** Markdown support
5. **Note search:** Full-text search within notes
6. **Export notes:** Download as .txt or .md

---

## 📞 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review browser console for errors
3. Check Supabase logs for database errors
4. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Browser and OS details

---

**Last Updated:** 2025-10-25
**Version:** 2.0.0 (Notes Feature Update)
