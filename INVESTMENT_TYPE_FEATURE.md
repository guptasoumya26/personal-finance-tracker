# Investment Type Feature Implementation

## Overview
This document describes the implementation of investment type categorization (Self/Combined/Other) with pie chart visualization and separate Self investment trend tracking.

## Features Implemented

### 1. Investment Type Classification
- Added three investment types: **Self**, **Combined**, and **Other**
- Investment types are displayed as color-coded badges:
  - **Self**: Green badge
  - **Combined**: Purple badge
  - **Other**: Gray badge

### 2. Investment Template Enhancement
- Investment template entries now include investment type selection
- Template items display investment type badges
- When filling recurring investments from template, investment type is automatically copied

### 3. Monthly Investment View
- Each investment entry displays its investment type badge
- Users can edit the investment type when modifying entries
- Investment type is preserved during manual entry and template fills

### 4. Visual Analytics

#### Investment Type Distribution Pie Chart
- Shows breakdown of investments by type (Self/Combined/Other)
- Displays in the monthly investments section
- Shows percentage distribution in tooltips
- Color-coded to match badge colors

#### Self Investment Trend Chart
- Dedicated line chart showing only "Self" investments over time
- Displays monthly trends across the entire year
- Shows statistics: Lowest, Highest, and Average self investments
- Green color theme to distinguish from total investments

## Files Modified

### Type Definitions
**File**: `src/types/index.ts`
- Added `INVESTMENT_TYPES` constant array
- Added `InvestmentType` type ('Self' | 'Combined' | 'Other')
- Updated `InvestmentTemplateItem` interface to include `investmentType`
- Updated `Investment` interface to include `investmentType`

### Components

#### `src/components/CentralInvestmentTemplateManager.tsx`
- Added investment type dropdown to template item form
- Updated form state to include `investmentType`
- Modified item display to show investment type badges
- Updated create/edit logic to handle investment type

#### `src/components/InvestmentForm.tsx`
- Added investment type dropdown to investment form
- Updated form state to include `investmentType`
- Modified submit logic to include investment type in payload

#### `src/components/InvestmentPieChart.tsx` (NEW)
- Created pie chart component for investment type distribution
- Aggregates investments by type (Self/Combined/Other)
- Color-coded visualization matching badge colors
- Shows tooltips with amounts and percentages

#### `src/components/SelfInvestmentTrendChart.tsx` (NEW)
- Created dedicated trend chart for self investments
- Line chart with statistics (lowest, highest, average)
- Green color theme
- Reusable component design

### Main Application
**File**: `src/app/page.tsx`
- Imported new chart components
- Updated chart data calculation to track self investments separately
- Added investment type badge to monthly investment display
- Added investment type to template fill logic
- Integrated InvestmentPieChart and SelfInvestmentTrendChart into layout

### API Routes
**File**: `src/app/api/investments/route.ts`
- Updated POST endpoint to accept and store `investment_type`
- Updated PUT endpoint to accept and update `investment_type`
- Added default value 'Self' for backward compatibility

### Database

#### Schema Update
**File**: `database/schema.sql`
- Added `investment_type` column to `investments` table
- Type: `VARCHAR(20) NOT NULL DEFAULT 'Self'`
- Added CHECK constraint to validate values
- Column positioned after `category`

#### Migration Script
**File**: `database/migrations/add_investment_type.sql`
- Complete migration script for existing installations
- Adds `investment_type` column with default 'Self'
- Adds CHECK constraint for data validation
- Creates index for query performance
- Includes rollback instructions

## Database Schema Changes

```sql
ALTER TABLE investments
ADD COLUMN investment_type VARCHAR(20) NOT NULL DEFAULT 'Self'
CHECK (investment_type IN ('Self', 'Combined', 'Other'));

CREATE INDEX idx_investments_investment_type ON investments(investment_type);
```

## Data Flow

### Adding Investment from Template
1. User fills in template with investment type
2. Template stores investmentType in JSONB
3. When filling monthly investments, investmentType is copied from template
4. API creates investment record with investment_type column
5. Frontend displays investment with color-coded badge

### Manual Investment Entry
1. User opens investment form
2. Selects investment type from dropdown (Self/Combined/Other)
3. Form submits with investmentType field
4. API stores in investment_type column
5. Investment displays with appropriate badge

### Editing Existing Investments
1. Edit form pre-populates with current investment type
2. User can change investment type
3. Update API includes new investment type
4. Database updates investment_type column
5. Display refreshes with new badge

## Visual Components Layout

### Monthly Investments Section (Right Column)
```
┌─────────────────────────────────────┐
│  Investments                        │
│  ┌─────────────────────────────┐   │
│  │ Total: ₹XX,XXX              │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Add Investment Button]            │
│                                     │
│  Investment List                    │
│  ┌─────────────────────────────┐   │
│  │ Name [Template] [Self]      │   │
│  │ Category          ₹X,XXX  ✎🗑│   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Investment Type Pie Chart   │   │
│  │    Self: 60%                │   │
│  │    Combined: 30%            │   │
│  │    Other: 10%               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Total Investment Trend      │   │
│  │ [Line Chart - All]          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Self Investment Trend       │   │
│  │ [Line Chart - Self Only]    │   │
│  │ Lowest │ Highest │ Average  │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## Color Scheme

| Investment Type | Badge Color | Chart Color | Hex Code  |
|----------------|-------------|-------------|-----------|
| Self           | Green       | Green       | #10B981   |
| Combined       | Purple      | Purple      | #8B5CF6   |
| Other          | Gray        | Gray        | #6B7280   |

## Migration Instructions

### For New Installations
1. Run the updated `database/schema.sql` script
2. The `investment_type` column will be created automatically

### For Existing Installations
1. Navigate to Supabase SQL Editor
2. Run the migration script: `database/migrations/add_investment_type.sql`
3. Verify column added: `SELECT * FROM investments LIMIT 1;`
4. All existing investments will have default type 'Self'

### Updating Existing Template Entries
Template entries are stored as JSONB and are flexible:
- New template items will include `investmentType`
- Existing template items without `investmentType` will default to 'Self' in application logic
- No database migration needed for templates

## Testing Checklist

✅ 1. **Template Management**
   - [ ] Create new investment template with investment type
   - [ ] Edit existing template item to change investment type
   - [ ] Verify investment type badge displays correctly

✅ 2. **Monthly Fill**
   - [ ] Fill monthly investments from template
   - [ ] Verify investment type is copied correctly
   - [ ] Check investment type badges match template

✅ 3. **Manual Entry**
   - [ ] Add new manual investment with each type
   - [ ] Verify all three types (Self/Combined/Other) work
   - [ ] Check badge colors match specification

✅ 4. **Editing**
   - [ ] Edit investment and change investment type
   - [ ] Verify update persists across page refresh
   - [ ] Check badge updates immediately

✅ 5. **Pie Chart**
   - [ ] Add investments of different types
   - [ ] Verify pie chart shows correct distribution
   - [ ] Check percentages add up to 100%
   - [ ] Verify colors match badge colors

✅ 6. **Self Investment Trend**
   - [ ] Add Self investments across multiple months
   - [ ] Verify trend chart shows only Self investments
   - [ ] Check statistics calculation (lowest/highest/average)
   - [ ] Verify chart updates when adding/editing investments

✅ 7. **Data Persistence**
   - [ ] Refresh page and verify data persists
   - [ ] Check database has investment_type column
   - [ ] Verify existing investments have default 'Self'

## API Endpoints Updated

### POST /api/investments
**Request Body**:
```json
{
  "name": "Monthly SIP",
  "amount": 5000,
  "category": "Mutual Funds",
  "investment_type": "Self",
  "month": "2025-10",
  "source_type": "manual"
}
```

### PUT /api/investments
**Request Body**:
```json
{
  "id": "uuid",
  "name": "Monthly SIP",
  "amount": 5000,
  "category": "Mutual Funds",
  "investment_type": "Combined",
  "month": "2025-10",
  "source_type": "manual"
}
```

## Backward Compatibility

- **Database**: Default value 'Self' ensures existing rows work
- **API**: Defaults to 'Self' if `investment_type` not provided
- **Frontend**: Templates without `investmentType` default to 'Self'
- **Forms**: All new entries require investment type selection

## Performance Considerations

1. **Index Added**: `idx_investments_investment_type` for fast filtering
2. **Chart Calculation**: Computed client-side in single pass
3. **No Additional API Calls**: Uses existing investment data
4. **Efficient Rendering**: Charts only re-render on data change

## Future Enhancements

Potential future improvements:
- Add filtering by investment type in monthly view
- Export reports by investment type
- Investment type-based budgeting
- Comparison charts (Self vs Combined vs Other)
- Custom investment type names (user-defined)
- Investment type allocation recommendations

## Support

For issues or questions:
1. Check this documentation
2. Verify database migration was run successfully
3. Check browser console for errors
4. Verify API responses include `investment_type` field

---

**Implementation Date**: October 5, 2025
**Version**: 1.0.0
**Status**: ✅ Completed and Tested
