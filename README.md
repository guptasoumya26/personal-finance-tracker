# 💰 Finance Tracker

A modern, feature-rich personal finance tracking application built with Next.js and Supabase. Track your monthly expenses and investments with a beautiful, responsive interface, powerful analytics, and secure multi-user authentication.

## ✨ Features

### 🎯 **Core Functionality**
- 📊 **Monthly Expense Tracking** - Log and categorize your expenses by month
- 💎 **Investment Tracking** - Monitor your investment portfolio growth
- 📝 **Monthly Notes** - Add notes and observations for each month
- 📈 **Trend Analytics** - Beautiful line charts showing expense and investment trends over time
- 📉 **Expense Distribution** - Interactive pie chart showing expense breakdown by category

### 🏗️ **Dual Template System**
- 🎨 **Expense Template** - Create one master template for recurring expenses
- 💰 **Investment Template** - Separate template system for recurring investments
- 🔄 **One-Click Fill** - Instantly populate monthly data from your templates
- 🛡️ **Independent Editing** - Edit monthly entries without affecting the template
- 🧠 **Smart Duplicate Detection** - Fuzzy matching prevents duplicate entries when filling from template
- 🗂️ **Predefined Categories** - Organized expense and investment categories for consistency

### 🔐 **Authentication & Security**
- 👤 **User Authentication** - Secure login and signup system with JWT tokens
- 🔒 **Password Hashing** - bcrypt encryption for secure password storage
- 👥 **Multi-User Support** - Each user has their own isolated data
- 🛡️ **Protected Routes** - Middleware-based route protection
- 🚪 **Session Management** - Secure cookie-based sessions with auto-logout

### 👨‍💼 **Admin Panel**
- 🎛️ **User Management Dashboard** - View and manage all users
- 🔄 **User Status Control** - Enable/disable user accounts
- 📊 **User Activity Tracking** - View user creation and last login dates
- 🔐 **Role-Based Access** - Admin-only protected routes and features

### 💱 **Localized for India**
- ₹ **INR Currency Format** - All amounts displayed in Indian Rupees
- 🔢 **Indian Number System** - Properly formatted with commas (₹1,00,000)
- 🏷️ **Relevant Categories** - Expense categories tailored for Indian users

### 🎨 **Modern Interface**
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🌙 **Dark Theme** - Easy on the eyes with a sleek dark interface
- 🧭 **Sidebar Navigation** - Intuitive navigation between views
- ⚡ **Real-time Updates** - Instant chart updates as you add/edit data
- 🎊 **Toast Notifications** - Beautiful, non-intrusive feedback messages
- ⚙️ **Template Badges** - Visual indicators for template-generated entries

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (with Turbopack), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Charts**: Chart.js 4.5 with react-chartjs-2
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
cd finance-tracker/finance-tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the `finance-tracker` directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_generated_jwt_secret_key
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Set Up Database
Run the SQL schema in your Supabase SQL editor:
```sql
-- Check database/schema.sql for the complete schema
```

### 5. Start Development Server
```bash
cd finance-tracker
npm run dev
```

Visit `http://localhost:3000` to see your application! 🎉

### 6. Create Your First Admin User
After setting up, you'll need to create an admin user:
1. Sign up through the UI at `/signup`
2. Manually update the user's role in Supabase:
   ```sql
   UPDATE users SET role = 'admin' WHERE username = 'your_username';
   ```
3. Log out and log back in to access admin features

## 📱 Usage Guide

### 🔐 **Getting Started**
1. **Sign Up** - Create a new account at `/signup`
2. **Log In** - Access your dashboard at `/login`
3. **Your Data** - All your financial data is private and isolated from other users

### 🏠 **Monthly View**
1. **Navigate Months** - Use arrow buttons to switch between months or click "Go to current month"
2. **Add Expenses** - Click "Add Expense" to log new expenses
3. **Add Investments** - Click "Add Investment" to track investments
4. **Fill from Templates** - Use "Fill with Fixed Expenses" or "Fill with Recurring Investments" to populate from your templates
5. **Add Notes** - Type in the notes section (auto-saves after 500ms)
6. **View Analytics** - Scroll down to see trend charts and pie chart distribution

### ⚙️ **Expense Template Management**
1. **Access Template** - Click "Expense Template" in the sidebar
2. **Add Template Items** - Create recurring expense items with name, amount, and category
3. **Edit/Delete** - Manage your template items
4. **Apply to Months** - Return to Monthly View and use the fill button

### 💰 **Investment Template Management**
1. **Access Template** - Click "Investment Template" in the sidebar
2. **Add Investment Items** - Create recurring investment items
3. **Manage Items** - Edit or delete as needed
4. **Apply to Months** - Fill monthly investments from your template

### 📊 **Analytics & Insights**
- **Line Charts** - View year-long trend charts for both expenses and investments
- **Pie Chart** - See expense distribution by category for the current month
- **Statistics** - View lowest, highest, and average amounts
- **Real-time Updates** - Charts update instantly as you modify data

### 👨‍💼 **Admin Features** (Admin users only)
1. **Access Admin Panel** - Navigate to `/admin`
2. **View All Users** - See complete user list with details
3. **Manage Users** - Enable/disable user accounts
4. **Track Activity** - View user creation dates and last login times

## 🏗️ Project Structure

```
finance-tracker/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   │   ├── login/
│   │   │   │   ├── signup/
│   │   │   │   └── logout/
│   │   │   ├── admin/        # Admin-only endpoints
│   │   │   │   └── users/
│   │   │   ├── central-template/         # Expense template CRUD
│   │   │   ├── central-investment-template/  # Investment template CRUD
│   │   │   ├── expenses/     # Expense CRUD
│   │   │   ├── investments/  # Investment CRUD
│   │   │   └── notes/        # Notes CRUD
│   │   ├── login/            # Login page
│   │   ├── signup/           # Signup page
│   │   ├── admin/            # Admin dashboard
│   │   └── page.tsx          # Main application page
│   ├── components/            # React components
│   │   ├── CentralTemplateManager.tsx
│   │   ├── CentralInvestmentTemplateManager.tsx
│   │   ├── ExpenseForm.tsx
│   │   ├── InvestmentForm.tsx
│   │   ├── TrendChart.tsx
│   │   ├── ExpensePieChart.tsx
│   │   ├── Toast.tsx
│   │   └── LoadingSpinner.tsx
│   ├── lib/                   # Utilities and configurations
│   │   ├── api.ts            # API client functions
│   │   ├── auth.ts           # JWT authentication
│   │   ├── auth-utils.ts     # Auth helper functions
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
- **users** - User accounts with authentication credentials, roles, and status
- **central_templates** - Stores the central expense template (per user)
- **central_investment_templates** - Stores the central investment template (per user)
- **expenses** - Monthly expense records (per user)
- **investments** - Monthly investment records (per user)
- **notes** - Monthly notes and observations (per user)

All data tables include `user_id` foreign keys to ensure data isolation between users.

## 🎨 Key Features Explained

### 🔄 **Dual Template System**
Unlike traditional finance apps, this tracker uses a **dual central template** approach:
- Create separate master templates for expenses and investments
- Apply them to any month with one click each
- Edit monthly entries independently without affecting the templates
- Fuzzy name matching prevents duplicate entries when filling from templates
- Visual "Template" badges identify template-generated items
- Template protection ensures data integrity

### 📈 **Smart Analytics**
- **Line Charts** - Track expense and investment trends across the entire year (2025)
- **Pie Chart** - Visualize expense distribution by category for the current month
- Charts automatically update when you add/edit data
- Calculates meaningful statistics (min, max, average)
- Color-coded visualizations with interactive tooltips
- Percentage breakdowns in pie chart tooltips
- Uses real data from your database, filtered by year

### 🔐 **Multi-User Authentication**
- **JWT-based authentication** with secure HTTP-only cookies
- **bcrypt password hashing** for maximum security
- **Role-based access control** (admin vs. regular users)
- **User isolation** - Each user sees only their own data
- **Session management** with automatic token validation
- **Protected routes** at both frontend and API levels

### 💾 **Auto-Save Notes**
- Notes are automatically saved 500ms after you stop typing
- No need to manually save
- Per-month note storage
- Debounced API calls reduce server load

### 🎊 **Toast Notifications**
- Beautiful, non-intrusive feedback messages
- Success, info, and warning variants with distinct colors
- Auto-dismiss after 3 seconds
- Smooth animations with Tailwind CSS
- User can manually dismiss notifications

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
| `JWT_SECRET` | Secret key for JWT token signing (generate a secure random string) | ✅ |

**Note**: You can generate a secure JWT_SECRET using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🔒 Security Best Practices

This application implements several security measures:

### ✅ **What's Implemented**
- **Password Hashing**: All passwords are hashed using bcrypt (10 salt rounds)
- **JWT Authentication**: Secure token-based authentication with HTTP-only cookies
- **User Isolation**: Row-level data isolation via user_id foreign keys
- **Role-Based Access**: Admin-only routes and features protected at API level
- **Input Validation**: Server-side validation for all user inputs
- **Protected Routes**: Middleware checks for valid authentication tokens

### ⚠️ **Production Recommendations**
1. **Use Strong JWT Secret**: Generate a cryptographically secure random string
2. **Enable HTTPS**: Always use HTTPS in production (automatic with Vercel)
3. **Set Secure Cookie Flags**: Cookies are HTTP-only and secure in production
4. **Rate Limiting**: Consider adding rate limiting for login attempts (not implemented)
5. **Password Requirements**: Implement password complexity requirements if needed
6. **Regular Updates**: Keep dependencies updated for security patches
7. **Environment Variables**: Never commit `.env.local` to version control

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

## 🎯 Feature Highlights Summary

| Feature | Description | Status |
|---------|-------------|--------|
| 🔐 Multi-User Auth | JWT + bcrypt authentication system | ✅ |
| 👨‍💼 Admin Panel | User management dashboard | ✅ |
| 📊 Expense Tracking | Monthly expense logging with categories | ✅ |
| 💰 Investment Tracking | Monthly investment portfolio tracking | ✅ |
| 🎨 Dual Templates | Separate templates for expenses & investments | ✅ |
| 🧠 Smart Duplicate Detection | Fuzzy matching prevents duplicate entries | ✅ |
| 📈 Trend Analytics | Year-long line charts for trends | ✅ |
| 📉 Pie Chart | Category distribution visualization | ✅ |
| 📝 Auto-Save Notes | Debounced auto-saving notes per month | ✅ |
| 🎊 Toast Notifications | Beautiful feedback messages | ✅ |
| 📱 Responsive Design | Mobile, tablet, and desktop optimized | ✅ |
| 🌙 Dark Theme | Eye-friendly dark interface | ✅ |
| ₹ INR Formatting | Indian currency format with proper commas | ✅ |
| ⚡ Real-time Updates | Instant chart updates on data changes | ✅ |

---

**Happy tracking! 💰📊✨**

*Built with ❤️ for personal finance management*