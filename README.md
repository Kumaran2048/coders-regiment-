# FreshCart - Collaborative Shopping List App

A modern, full-stack web application for groups to collaboratively manage shopping lists, expenses, budgets, and payments.

![FreshCart](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase)

## 🚀 Features

- **Group Management** - Create groups, invite via codes/QR codes
- **Shopping Lists** - Real-time collaborative lists with categories
- **Calendar** - Schedule shopping trips and events
- **Budget Tracking** - Track expenses and auto-split costs
- **Payments** - Stripe integration for settling debts
- **Group Chat** - Real-time messaging
- **Dashboard** - Overview of all activities

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime (WebSockets)
- **Payments**: Stripe Checkout
- **UI Components**: shadcn/ui, Radix UI

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- (Optional) Stripe account for payments

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd shopping-list-app
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → **New query**
3. Copy and run `scripts/setup-database.sql` (creates all tables)
4. Copy and run `scripts/fix-group-members-policies.sql` (fixes RLS policies)
5. (Optional) Run `scripts/enable-realtime.sql` (enables real-time features)

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional: Auth redirect in development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

**Get your Supabase keys:**
- Go to Supabase Dashboard → Project Settings → API
- Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
shopping-list-app/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   └── *.tsx              # Feature components
├── lib/                   # Utilities and clients
│   └── supabase/          # Supabase client setup
├── scripts/               # SQL setup scripts
│   ├── setup-database.sql
│   ├── fix-group-members-policies.sql
│   └── enable-realtime.sql
└── public/                # Static assets
```

## 🗄️ Database Schema

The app uses the following main tables:

- `profiles` - User profiles
- `groups` - Shopping groups
- `group_members` - Group membership with roles
- `shopping_lists` - Shopping lists per group
- `list_items` - Items in shopping lists
- `shopping_events` - Calendar events
- `expenses` - Group expenses
- `expense_splits` - Expense splitting
- `budgets` - Monthly budgets
- `messages` - Group chat messages

All tables have Row Level Security (RLS) policies enabled.

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

Make sure to set all environment variables in your hosting platform.

## 🧪 Testing

1. **Create an account** - Sign up with email
2. **Create a group** - Generate invite code
3. **Add items** - Create shopping lists
4. **Test real-time** - Open in two browsers to see sync
5. **Test payments** - Create expenses and view payment page

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔒 Security

- Row Level Security (RLS) on all database tables
- Secure authentication with Supabase Auth
- Environment variables for sensitive data
- Input validation and sanitization

## 🐛 Troubleshooting

### Database Errors
- Ensure all SQL scripts are run in order
- Check Supabase connection in dashboard
- Verify RLS policies are correct

### Realtime Not Working
- Run `scripts/enable-realtime.sql`
- Check Supabase Dashboard → Database → Replication
- Chat will fallback to polling if Realtime fails

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install --legacy-peer-deps`

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

Your Name
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database powered by [Supabase](https://supabase.com/)
- Payments by [Stripe](https://stripe.com/)

---

**Made with ❤️ for collaborative shopping**
