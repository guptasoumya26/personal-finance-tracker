# Troubleshooting: Investment Type Not Copying from Template

## Issue
When filling monthly investments from template, all investments show as "Self" even though template items have different investment types (Combined/Other).

## Root Cause
Template items in the database (JSONB) might not have the `investmentType` field if they were created/edited before the feature was fully deployed.

## Solution Steps

### Step 1: Verify Template Items Have investmentType
Open browser console (F12) and check the logs when you view the Investment Template page.

**What to look for:**
```javascript
// In browser console, run:
console.log(centralInvestmentTemplate.items);

// Each item should have:
{
  id: "...",
  name: "Monthly SIP",
  amount: 5000,
  category: "Mutual Funds",
  investmentType: "Self"  // <-- This field must exist
}
```

### Step 2: Re-save Template Items

**If investmentType is missing from template items:**

1. Go to **Investment Template** page
2. **Edit each template item** one by one:
   - Click the edit (pencil) icon
   - The form will populate with the item's data
   - **Select the Investment Type** from dropdown (even if it appears selected)
   - Click **Update Item**
3. Repeat for all template items
4. Go to Monthly View and try filling again

**Why this works:** When you edit and save each item, the new code will include `investmentType` in the JSONB data.

### Step 3: Verify Fill Operation (Advanced)

After deployment, when you click "Fill with Recurring Investments":

1. Open browser console (F12)
2. Click the fill button
3. Check console logs for:
   ```
   Template item: Monthly SIP investmentType: Self
   Template item: Joint Account investmentType: Combined
   ```

**If you see `investmentType: undefined`:**
- The template item doesn't have the field
- Follow Step 2 to re-save the item

### Step 4: Check Database Directly (Supabase)

Run this query in Supabase SQL Editor:

```sql
-- Check your investment template
SELECT items FROM central_investment_templates WHERE user_id = 'your-user-id';

-- The result should look like:
-- [
--   {"id": "1", "name": "SIP", "amount": 5000, "category": "Mutual Funds", "investmentType": "Self"},
--   {"id": "2", "name": "Joint", "amount": 3000, "category": "Stocks", "investmentType": "Combined"}
-- ]
```

**If investmentType is missing:**
- Delete the template items via UI
- Re-create them with investment type selection
- The new items will have the field

### Step 5: Quick Fix - Recreate Template

**Fastest solution if you have few template items:**

1. Go to Investment Template page
2. Note down all your template items (name, amount, category, type)
3. Delete all template items
4. Add them again with correct investment types
5. Try filling monthly investments again

## Verification Checklist

After fixing, verify:

- [ ] Investment Template items show investment type badges (Green/Purple/Gray)
- [ ] Browser console shows `investmentType` field when logging template items
- [ ] When filling monthly investments, console logs show correct investmentType values
- [ ] Filled investments appear with correct badges in monthly view
- [ ] Investment Type Pie Chart shows correct distribution
- [ ] Self Investment Trend Chart shows correct values

## Expected Behavior

### Investment Template Page
```
Monthly SIP                [Self ↓]    ₹5,000  [Edit] [Delete]
Category: Mutual Funds
```

### After Filling Monthly Investments
```
Monthly SIP  [Template] [Self]    ₹5,000  [Edit] [Delete]
Category: Mutual Funds
```

### Browser Console (When Filling)
```
Template item: Monthly SIP investmentType: Self
Template item: Joint Investment investmentType: Combined
```

## Still Not Working?

### Check API Response
Open browser DevTools → Network tab:

1. Fill monthly investments
2. Find POST request to `/api/investments`
3. Check Request Payload:
   ```json
   {
     "name": "Monthly SIP",
     "amount": 5000,
     "category": "Mutual Funds",
     "investment_type": "Self",  // <-- Should match template
     "month": "2025-10",
     "source_type": "template"
   }
   ```

### Check Database Records
After filling, check the created investments:

```sql
SELECT name, investment_type, source_type
FROM investments
WHERE source_type = 'template'
AND month = '2025-10'
ORDER BY created_at DESC;
```

## Known Issues

1. **Old template items** (created before the feature): Won't have `investmentType`, will default to 'Self'
2. **Browser cache**: Hard refresh (Ctrl+Shift+R) after deployment
3. **JSONB flexibility**: Template items are stored as JSONB, so structure can vary

## Prevention

Going forward:
- Always use the Investment Type dropdown when creating/editing template items
- The field is required, so new items will always have it
- Database will store the `investmentType` in JSONB
- Filling will correctly copy the type

## Quick Test

**Test that everything works:**

1. Create new template item:
   - Name: "Test Investment"
   - Amount: 100
   - Category: Other
   - Investment Type: **Combined** ← Select this

2. Go to Monthly View
3. Click "Fill with Recurring Investments"
4. Check the filled investment has **Purple "Combined" badge**

If the badge is **Green "Self"**, the template item doesn't have investmentType - follow Step 2 above.

---

**Last Updated**: After deployment with console logging
**Status**: Deployed with fallback to 'Self' and debug logging
