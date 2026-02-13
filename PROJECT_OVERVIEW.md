# FreshCart - Collaborative Shopping List App

## 🎯 Project Overview

**FreshCart** is a modern, full-stack web application designed for households, roommates, and groups to collaboratively manage shopping lists, expenses, and budgets. Built with Next.js 16, React 19, TypeScript, Supabase, and Stripe integration.

---

## ✨ Key Features

### 1. **Group Management**
- Create shopping groups for households, roommates, or friends
- Generate unique invite codes (6-character codes)
- QR code generation for easy group joining
- Role-based access (Owner, Admin, Member)

### 2. **Shopping Lists**
- Create multiple shopping lists per group
- Add items with categories (produce, dairy, bakery, meat, frozen, beverages, snacks, household, other)
- Quantity, unit, and price estimates
- Real-time collaboration (items sync across devices)
- Check off items as you shop
- Track who added/checked each item

### 3. **Calendar & Events**
- Schedule shopping trips
- Set dates and assign to group members
- Track upcoming and past shopping events
- Mark events as completed

### 4. **Budget & Expense Tracking**
- Record group expenses
- Automatic expense splitting among group members
- Track who paid and who owes what
- View outstanding balances
- Budget management per group/month

### 5. **Payments Integration**
- Stripe payment integration for settling debts
- View payments you owe and payments owed to you
- Secure checkout flow
- Payment history tracking

### 6. **Group Chat**
- Real-time messaging within groups
- System notifications for group activities
- Chat history

### 7. **User Authentication**
- Secure sign-up and login with Supabase Auth
- Email verification
- User profiles with display names
- Session management

---

## 🏗️ Technical Architecture

### **Frontend**
- **Framework**: Next.js 16.1.6 (App Router)
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5.7.3
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: Next.js App Router with Server Components

### **Backend**
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime (WebSocket)
- **API**: Supabase REST API
- **Payments**: Stripe Checkout

### **Database Schema**
- **profiles**: User profile information
- **groups**: Shopping groups
- **group_members**: Group membership with roles
- **shopping_lists**: Shopping lists per group
- **list_items**: Items in shopping lists
- **shopping_events**: Calendar events
- **expenses**: Group expenses
- **expense_splits**: Expense splitting among members
- **budgets**: Monthly budgets per group
- **messages**: Group chat messages

### **Security**
- Row Level Security (RLS) policies on all tables
- User-based access control
- Secure API endpoints
- Environment variable management

---

## 🚀 How to Demo for Judges

### **Setup Steps** (Before Demo)

1. **Database Setup**
   - Run `scripts/setup-database.sql` in Supabase SQL Editor
   - Run `scripts/fix-group-members-policies.sql` to fix RLS policies
   - Verify all tables are created

2. **Environment Variables**
   - Create `.env.local` with:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `STRIPE_SECRET_KEY` (optional, for payments)
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional)

3. **Start the App**
   ```bash
   npm install --legacy-peer-deps
   npm run dev
   ```
   - App runs on `http://localhost:3000`

---

### **Demo Flow** (5-7 minutes)

#### **1. Introduction & Authentication** (1 min)
- Show the landing page
- **Sign up** a new account
- **Login** and show dashboard

**Key Points to Mention:**
- "Secure authentication with Supabase Auth"
- "Email verification for account security"
- "User profiles with display names"

#### **2. Group Management** (1.5 min)
- **Create a group** (e.g., "The Smiths Household")
- Show the **invite code** generated
- Show **QR code** option
- **Join a group** using invite code (if you have a second account)

**Key Points:**
- "Groups enable collaborative shopping"
- "Unique invite codes for easy sharing"
- "QR codes for mobile-friendly joining"
- "Role-based permissions (Owner/Admin/Member)"

#### **3. Shopping Lists** (2 min)
- **Create a shopping list** (e.g., "Weekly Groceries")
- **Add items** with categories:
  - "Milk" (Dairy, 2 gallons)
  - "Bread" (Bakery, 1 loaf)
  - "Apples" (Produce, 3 lbs)
- Show **real-time updates** (if possible, open in two browsers)
- **Check off items** as you shop
- Show **item details** (who added, price estimates)

**Key Points:**
- "Real-time collaboration - changes sync instantly"
- "Categorized items for better organization"
- "Track quantities, units, and price estimates"
- "Check off items as you shop"

#### **4. Calendar & Events** (1 min)
- **Schedule a shopping trip** for next week
- Show **upcoming events** list
- **Mark event as completed**

**Key Points:**
- "Plan shopping trips in advance"
- "Assign trips to group members"
- "Track upcoming and past events"

#### **5. Budget & Expenses** (1.5 min)
- **Create an expense** (e.g., "Grocery run - $150")
- Show **automatic splitting** among group members
- Go to **Payments page**
- Show **"You owe"** and **"Owed to you"** sections
- Click **"Pay now"** (show Stripe checkout if configured)

**Key Points:**
- "Automatic expense splitting"
- "Track who paid and who owes"
- "Stripe integration for secure payments"
- "Clear payment summaries"

#### **6. Group Chat** (30 sec)
- Send a **message** in the group chat
- Show **real-time messaging**

**Key Points:**
- "Real-time group communication"
- "Chat history"

#### **7. Dashboard Overview** (30 sec)
- Show the **dashboard home** page
- Highlight:
  - Quick stats (lists, events, payments, groups)
  - Recent items
  - Upcoming events
  - Recent expenses

**Key Points:**
- "Comprehensive overview of all activities"
- "Quick access to all features"

---

## 🎯 Key Selling Points for Judges

### **1. Real-World Problem Solving**
- Solves the common problem of shared shopping and expense management
- Useful for households, roommates, college students, families

### **2. Modern Tech Stack**
- Latest Next.js 16 with App Router
- React 19 with Server Components
- TypeScript for type safety
- Modern UI with Tailwind CSS

### **3. Scalable Architecture**
- Server-side rendering for performance
- Real-time updates with WebSockets
- Secure database with Row Level Security
- RESTful API design

### **4. Security & Best Practices**
- Row Level Security (RLS) policies
- Secure authentication
- Environment variable management
- Input validation

### **5. User Experience**
- Clean, modern UI
- Mobile-responsive design
- Intuitive navigation
- Real-time collaboration

### **6. Payment Integration**
- Stripe integration for real payments
- Secure checkout flow
- Payment tracking

---

## 📊 Technical Highlights

### **Performance**
- Server-side rendering (SSR)
- Static generation where possible
- Optimized database queries
- Efficient state management

### **Scalability**
- PostgreSQL database (Supabase)
- Horizontal scaling ready
- Efficient data relationships
- Optimized queries with indexes

### **Code Quality**
- TypeScript for type safety
- Component-based architecture
- Reusable UI components
- Clean code structure

---

## 🔧 Technical Challenges Solved

1. **Infinite Recursion in RLS Policies**
   - Created helper functions with `security definer` to avoid policy recursion
   - Fixed group_members policies to check groups table instead of itself

2. **Real-time Synchronization**
   - Implemented Supabase Realtime for live updates
   - WebSocket connections for instant collaboration

3. **Complex Data Relationships**
   - Proper foreign key relationships
   - Efficient joins and queries
   - Optimized data fetching

4. **Payment Flow**
   - Integrated Stripe Checkout
   - Secure payment processing
   - Payment tracking and settlement

---

## 📱 Features Summary

| Feature | Status | Description |
|---------|--------|-------------|
| User Authentication | ✅ | Sign up, login, email verification |
| Group Management | ✅ | Create, join, invite codes, QR codes |
| Shopping Lists | ✅ | Create lists, add items, check off |
| Real-time Updates | ✅ | Live sync across devices |
| Calendar Events | ✅ | Schedule shopping trips |
| Budget Tracking | ✅ | Track expenses and splits |
| Payments | ✅ | Stripe integration |
| Group Chat | ✅ | Real-time messaging |
| Dashboard | ✅ | Overview of all activities |
| Mobile Responsive | ✅ | Works on all devices |

---

## 🎤 Presentation Tips

1. **Start with the Problem**
   - "Managing shared shopping lists and expenses is a common challenge..."

2. **Show, Don't Tell**
   - Live demo is more impactful than slides
   - Show real functionality, not mockups

3. **Highlight Technical Excellence**
   - Mention modern tech stack
   - Emphasize security (RLS policies)
   - Show real-time features

4. **Demonstrate Real-World Use**
   - Use realistic data (not "test123")
   - Show actual workflows

5. **Be Prepared for Questions**
   - How does real-time sync work? (Supabase Realtime/WebSockets)
   - How is security handled? (RLS policies, authentication)
   - Can it scale? (PostgreSQL, efficient queries)
   - How are payments processed? (Stripe Checkout)

---

## 🚨 Common Issues & Solutions

### **If Database Errors Occur**
- Check if all SQL scripts were run
- Verify RLS policies are correct
- Check Supabase connection

### **If Real-time Doesn't Work**
- Verify tables are enabled for Realtime in Supabase
- Check WebSocket connection (console warnings are OK)

### **If Payments Don't Work**
- Stripe keys are optional (can demo without)
- Check Stripe dashboard for test mode

---

## 📝 Conclusion

**FreshCart** is a production-ready, full-stack application that demonstrates:
- Modern web development practices
- Real-time collaboration
- Secure data handling
- Payment integration
- Excellent user experience

Perfect for demonstrating technical skills, problem-solving abilities, and understanding of modern web architecture.

---

## 🔗 Quick Links

- **Local Dev**: http://localhost:3000
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Stripe Dashboard**: https://dashboard.stripe.com (if configured)

---

**Good luck with your presentation! 🎉**
