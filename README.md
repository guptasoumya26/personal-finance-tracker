# 💰 Finance Tracker

A modern, feature-rich personal finance tracking application built with Next.js and Supabase. Track your monthly expenses and investments with a beautiful, responsive interface and powerful analytics.

## ✨ Features

### 🎯 **Core Functionality**
- 📊 **Monthly Expense Tracking** - Log and categorize your expenses by month
- 💎 **Investment Tracking** - Monitor your investment portfolio growth
- 📝 **Monthly Notes** - Add notes and observations for each month
- 📈 **Trend Analytics** - Beautiful charts showing expense and investment trends

### 🏗️ **Central Template System**
- 🎨 **Single Central Template** - Create one master template for recurring expenses
- 🔄 **One-Click Fill** - Instantly populate monthly expenses from your template
- 🛡️ **Independent Editing** - Edit monthly entries without affecting the template
- 🗂️ **Predefined Categories** - Organized expense categories for consistency

### 💱 **Localized for India**
- ₹ **INR Currency Format** - All amounts displayed in Indian Rupees
- 🔢 **Indian Number System** - Properly formatted with commas (₹1,00,000)
- 🏷️ **Relevant Categories** - Expense categories tailored for Indian users

### 🎨 **Modern Interface**
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🌙 **Dark Theme** - Easy on the eyes with a sleek dark interface
- 🧭 **Sidebar Navigation** - Intuitive navigation between monthly view and template management
- ⚡ **Real-time Updates** - Instant chart updates as you add/edit data

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/finance-tracker.git
cd finance-tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database
Run the SQL schema in your Supabase SQL editor:
```sql
-- Check database/schema.sql for the complete schema
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see your application! 🎉

## 📱 Usage Guide

### 🏠 **Monthly View**
1. **Navigate Months** - Use arrow buttons to switch between months
2. **Add Expenses** - Click "Add Expense" to log new expenses
3. **Add Investments** - Click "Add Investment" to track investments
4. **Fill from Template** - Use "Fill with Fixed Expenses" to populate from your template
5. **Add Notes** - Type in the notes section (auto-saves)

### ⚙️ **Central Template**
1. **Access Template** - Click "Central Template" in the sidebar
2. **Add Template Items** - Create recurring expense items
3. **Edit/Delete** - Manage your template items
4. **Apply to Months** - Use the template to fill monthly expenses

### 📊 **Analytics**
- View trend charts for both expenses and investments
- See lowest, highest, and average amounts
- Real-time updates as you modify data

## 🏗️ Project Structure

```
finance-tracker/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── central-template/
│   │   │   ├── expenses/
│   │   │   ├── investments/
│   │   │   └── notes/
│   │   └── page.tsx           # Main application page
│   ├── components/            # React components
│   │   ├── CentralTemplateManager.tsx
│   │   ├── ExpenseForm.tsx
│   │   ├── InvestmentForm.tsx
│   │   ├── TrendChart.tsx
│   │   └── LoadingSpinner.tsx
│   ├── lib/                   # Utilities and configurations
│   │   ├── api.ts            # API functions
│   │   └── supabase.ts       # Supabase client
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   └── utils/                 # Utility functions
│       └── currency.ts        # INR formatting
├── database/
│   └── schema.sql            # Database schema
└── public/                   # Static assets
```

## 🗄️ Database Schema

The application uses the following tables:
- **central_templates** - Stores the central expense template
- **expenses** - Monthly expense records
- **investments** - Monthly investment records
- **notes** - Monthly notes and observations

## 🎨 Key Features Explained

### 🔄 **Template System**
Unlike traditional finance apps, this tracker uses a **single central template** approach:
- Create one master template with recurring expenses
- Apply it to any month with one click
- Edit monthly entries independently without affecting the template
- Template protection ensures data integrity

### 📈 **Smart Analytics**
- Charts automatically update when you add/edit data
- Shows trends across the entire year
- Calculates meaningful statistics (min, max, average)
- Uses real data from your database, not static examples

### 💾 **Auto-Save Notes**
- Notes are automatically saved 500ms after you stop typing
- No need to manually save
- Per-month note storage

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
     ```

3. **Deploy**: Vercel will automatically build and deploy your app!

## 📧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | ✅ |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using Next.js and Supabase
- Icons by [Lucide](https://lucide.dev/)
- Charts powered by [Chart.js](https://www.chartjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub or reach out to the maintainers.

---

**Happy tracking! 💰📊**