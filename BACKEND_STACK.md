# Backend Stack - FreshCart

## 🏗️ Architecture Overview

FreshCart uses a **serverless, full-stack architecture** with Next.js App Router and Supabase as the primary backend services.

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  React 19 + TypeScript + Tailwind CSS                   │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐   ┌────────▼────────┐
│   Supabase     │   │  Next.js Server │
│   (Backend)    │   │   Components    │
└────────────────┘   └─────────────────┘
        │                     │
        │                     │
┌───────▼────────┐   ┌────────▼────────┐
│   PostgreSQL   │   │  Stripe API    │
│   Database     │   │  (Payments)     │
└────────────────┘   └─────────────────┘
```

---

## 🔧 Backend Components

### 1. **Supabase (Primary Backend)**

**What it provides:**
- PostgreSQL Database
- Authentication & Authorization
- Real-time subscriptions (WebSockets)
- REST API (auto-generated)
- Row Level Security (RLS)

**Services Used:**

#### **Database (PostgreSQL)**
- **Location**: Supabase Cloud (managed PostgreSQL)
- **Schema**: 10 tables with relationships
- **Features**:
  - Foreign key constraints
  - Check constraints
  - Unique constraints
  - Triggers (auto-create profiles)
  - Functions (helper functions for RLS)

**Tables:**
```sql
- profiles          -- User profiles
- groups            -- Shopping groups
- group_members     -- Group membership & roles
- shopping_lists    -- Shopping lists
- list_items        -- Items in lists
- shopping_events   -- Calendar events
- expenses          -- Group expenses
- expense_splits    -- Expense splitting
- budgets           -- Monthly budgets
- messages          -- Group chat
```

#### **Authentication**
- **Service**: Supabase Auth
- **Method**: Email/password with email verification
- **Session Management**: JWT tokens stored in HTTP-only cookies
- **Features**:
  - Sign up / Sign in
  - Email verification
  - Password reset (can be added)
  - Session refresh via middleware

**Implementation:**
```typescript
// Server-side auth
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

// Client-side auth
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
await supabase.auth.signUp({ email, password })
```

#### **Real-time (WebSockets)**
- **Service**: Supabase Realtime
- **Protocol**: WebSocket (WSS)
- **Use Cases**:
  - Live chat messages
  - Shopping list updates
  - Real-time item checking

**Implementation:**
```typescript
const channel = supabase
  .channel('chat-group-id')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: 'group_id=eq.group-id'
  }, (payload) => {
    // Handle new message
  })
  .subscribe()
```

#### **Row Level Security (RLS)**
- **Purpose**: Database-level security
- **Implementation**: PostgreSQL policies
- **Features**:
  - User-based access control
  - Group-based permissions
  - Role-based access (owner/admin/member)

**Example Policy:**
```sql
CREATE POLICY "groups_select" ON public.groups
FOR SELECT
USING (
  created_by = auth.uid()
  OR id IN (
    SELECT group_id FROM public.group_members 
    WHERE user_id = auth.uid()
  )
);
```

---

### 2. **Next.js Server Components & Actions**

**What it provides:**
- Server-side rendering (SSR)
- Server Components (React Server Components)
- Server Actions (form handling)
- API routes (if needed)
- Middleware (auth protection)

#### **Server Components**
- **Location**: `app/**/page.tsx` (async components)
- **Purpose**: Fetch data on server, render HTML
- **Benefits**: 
  - Faster initial load
  - SEO friendly
  - Secure (API keys never exposed)

**Example:**
```typescript
// app/dashboard/groups/page.tsx
export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: groups } = await supabase
    .from('groups')
    .select('*')
  
  return <GroupsClient groups={groups} />
}
```

#### **Server Actions**
- **Location**: `app/actions/*.ts` (marked with `'use server'`)
- **Purpose**: Handle form submissions, mutations
- **Security**: Runs on server, can use secret keys

**Example:**
```typescript
// app/actions/stripe.ts
'use server'

export async function startPaymentSession(...) {
  const session = await stripe.checkout.sessions.create({
    // Stripe API call (uses secret key)
  })
  return session.client_secret
}
```

#### **Middleware**
- **Location**: `middleware.ts`
- **Purpose**: 
  - Protect routes (redirect if not authenticated)
  - Refresh auth sessions
  - Run before every request

**Example:**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}
```

---

### 3. **Stripe (Payment Processing)**

**What it provides:**
- Payment processing
- Checkout sessions
- Payment intents

**Implementation:**
- **Server-side**: Stripe SDK with secret key
- **Client-side**: Stripe.js with publishable key
- **Flow**: Embedded Checkout

**Files:**
- `lib/stripe.ts` - Stripe client (server-only)
- `app/actions/stripe.ts` - Server action for creating sessions
- `components/payment-checkout.tsx` - Client component

**Flow:**
```
1. User clicks "Pay now"
2. Server Action creates Stripe Checkout Session
3. Returns client_secret
4. Client renders Stripe Embedded Checkout
5. User completes payment
6. Stripe webhook (optional) updates database
```

---

## 📊 Data Flow

### **Read Operations (Queries)**
```
Client Component
    ↓
Server Component (page.tsx)
    ↓
Supabase Client (server)
    ↓
PostgreSQL Database
    ↓
RLS Policies Check
    ↓
Return Data
```

### **Write Operations (Mutations)**
```
Client Component
    ↓
Form Submit / Button Click
    ↓
Supabase Client (client) OR Server Action
    ↓
Supabase REST API / Stripe API
    ↓
PostgreSQL Database / Stripe
    ↓
RLS Policies Check
    ↓
Return Result
```

### **Real-time Updates**
```
Database Change (INSERT/UPDATE/DELETE)
    ↓
Supabase Realtime Service
    ↓
WebSocket Connection
    ↓
Client Component (subscription callback)
    ↓
Update UI
```

---

## 🔐 Security Architecture

### **Authentication Flow**
1. User signs up → Supabase Auth creates user
2. JWT token generated → Stored in HTTP-only cookie
3. Middleware validates token on each request
4. Server components use token to query database
5. RLS policies enforce user-level access

### **Authorization (RLS Policies)**
- **User-level**: Users can only see their own data
- **Group-level**: Users can see data from their groups
- **Role-based**: Owners/admins have more permissions

### **API Security**
- **Supabase**: Uses anon key (public) + RLS policies
- **Stripe**: Uses secret key (server-only)
- **Environment Variables**: Never exposed to client

---

## 🗄️ Database Schema

### **Relationships**
```
auth.users (Supabase managed)
    ↓
profiles (1:1)
    ↓
group_members (many:many)
    ↓
groups (1:many)
    ├── shopping_lists
    │   └── list_items
    ├── shopping_events
    ├── expenses
    │   └── expense_splits
    ├── budgets
    └── messages
```

### **Key Constraints**
- Foreign keys with CASCADE deletes
- Unique constraints (invite codes, group members)
- Check constraints (status values, role values)

---

## 🚀 API Endpoints

### **Supabase REST API** (Auto-generated)
```
GET    /rest/v1/groups
POST   /rest/v1/groups
GET    /rest/v1/shopping_lists
POST   /rest/v1/shopping_lists
GET    /rest/v1/messages
POST   /rest/v1/messages
... (all tables)
```

**Base URL**: `https://your-project.supabase.co/rest/v1/`

### **Supabase Auth API**
```
POST   /auth/v1/signup
POST   /auth/v1/token
POST   /auth/v1/logout
GET    /auth/v1/user
```

### **Stripe API**
```
POST   /v1/checkout/sessions (via Stripe SDK)
```

---

## 📦 Backend Dependencies

### **Core Backend Packages**
```json
{
  "@supabase/ssr": "^0.6.1",        // Supabase SSR helpers
  "@supabase/supabase-js": "^2.49.1", // Supabase client
  "stripe": "^17.5.0",              // Stripe server SDK
  "@stripe/stripe-js": "^5.5.0",    // Stripe client SDK
  "@stripe/react-stripe-js": "^3.2.0", // Stripe React components
  "server-only": "^0.0.1"            // Ensures server-only code
}
```

### **Next.js Backend Features**
- Built-in (no extra packages needed)
- Server Components
- Server Actions
- Middleware
- API Routes (if needed)

---

## 🔄 Backend Services Summary

| Service | Purpose | Type | Location |
|---------|---------|------|----------|
| **Supabase** | Database, Auth, Real-time | Cloud (Managed) | supabase.com |
| **PostgreSQL** | Relational Database | Via Supabase | Supabase Cloud |
| **Next.js Server** | SSR, Server Components | Self-hosted | Your server/Vercel |
| **Stripe** | Payment Processing | Cloud (API) | stripe.com |
| **Supabase Realtime** | WebSocket Service | Via Supabase | Supabase Cloud |

---

## 💡 Key Backend Features

### ✅ **What the Backend Handles**

1. **Data Storage**
   - All app data in PostgreSQL
   - Relationships and constraints
   - Indexes for performance

2. **Authentication**
   - User sign-up/login
   - Session management
   - Password hashing

3. **Authorization**
   - RLS policies
   - Role-based access
   - Group permissions

4. **Real-time Updates**
   - WebSocket connections
   - Live data sync
   - Event subscriptions

5. **Payment Processing**
   - Stripe integration
   - Secure checkout
   - Payment tracking

6. **Server-side Rendering**
   - Fast initial load
   - SEO optimization
   - Secure API calls

---

## 🎯 Backend Architecture Benefits

1. **Serverless**: No server management needed
2. **Scalable**: Supabase handles scaling automatically
3. **Secure**: RLS policies at database level
4. **Real-time**: Built-in WebSocket support
5. **Type-safe**: TypeScript throughout
6. **Fast**: Server-side rendering + edge functions

---

## 📝 Backend Code Structure

```
lib/
├── supabase/
│   ├── server.ts      # Server-side Supabase client
│   ├── client.ts       # Client-side Supabase client
│   └── middleware.ts   # Auth session management
├── stripe.ts          # Stripe server client
└── utils.ts           # Utility functions

app/
├── actions/
│   └── stripe.ts      # Server actions (Stripe)
├── dashboard/
│   └── **/page.tsx    # Server Components (data fetching)
└── middleware.ts      # Route protection

scripts/
└── *.sql              # Database schema & policies
```

---

## 🔗 Backend Service URLs

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Supabase API**: `https://your-project.supabase.co/rest/v1/`
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Stripe API**: `https://api.stripe.com/v1/`

---

**This is a modern, serverless backend architecture that requires minimal infrastructure management! 🚀**
