# Finance Tracker - Database Setup Guide

## 🚀 Quick Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the database to be provisioned (2-3 minutes)

### 2. Set up Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the content from `database/schema.sql`
3. Paste it in the SQL Editor and click **Run**
4. This will create all necessary tables and indexes

### 3. Configure Environment Variables
1. In Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**
3. Create `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Test the Application
1. Start the development server: `npm run dev`
2. Try creating a central template
3. Add some expenses and investments
4. Check Supabase dashboard to see data being saved

### 5. Deploy to Vercel
1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 📊 Database Schema

### Tables Created:
- **central_templates** - Single template with JSONB items
- **expenses** - Monthly expenses with categories
- **investments** - Monthly investments
- **notes** - Monthly notes (one per month)

### Features:
- ✅ Auto-generated UUIDs
- ✅ Timestamps with auto-update triggers
- ✅ Optimized indexes for performance
- ✅ JSONB storage for flexible template items
- ✅ Ready for Row Level Security (RLS) if needed

## 🔧 API Endpoints

### Central Template
- `GET /api/central-template` - Fetch template
- `POST /api/central-template` - Create/update template
- `PUT /api/central-template` - Update template

### Expenses
- `GET /api/expenses?month=YYYY-MM` - Fetch expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses` - Update expense
- `DELETE /api/expenses?id=uuid` - Delete expense

### Investments
- `GET /api/investments?month=YYYY-MM` - Fetch investments
- `POST /api/investments` - Create investment
- `PUT /api/investments` - Update investment
- `DELETE /api/investments?id=uuid` - Delete investment

### Notes
- `GET /api/notes?month=YYYY-MM` - Fetch note
- `POST /api/notes` - Create/update note

## 🎯 Next Steps
After database setup, the next phase is integrating these APIs into the React components to replace the current useState-based data management.