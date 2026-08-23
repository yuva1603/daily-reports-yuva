# Daily Report Automation App - Tech Stack & Setup Guide

## 🎯 Complete Tech Stack Recommendation

### Frontend Stack
```
React 18 + TypeScript + Vite
├── Tailwind CSS (styling)
├── shadcn/ui (component library - professional)
├── Supabase Client (auth + real-time)
├── React Router (navigation)
├── React Query (data fetching)
└── Zod (form validation)
```

### Backend Stack (Choose One)

#### Option A: Node.js (Recommended for Speed) ⭐
```
Express.js + Node.js
├── node-schedule (cron jobs)
├── dotenv (env config)
├── cors, helmet (security)
├── Supabase SDK
└── Twilio SDK
```

#### Option B: Python (If sticking with Django ecosystem)
```
FastAPI + Python
├── APScheduler (task scheduling)
├── Pydantic (validation)
├── python-supabase (client)
└── twilio (WhatsApp)
```

### Database & Authentication
```
Supabase (PostgreSQL)
├── Row Level Security (RLS)
├── Realtime subscriptions
├── Google OAuth (Firebase alternative)
└── JWT tokens
```

### Automation & Notifications
```
Option 1: n8n (Visual Workflow) ⭐ RECOMMENDED
├── Self-hosted or Cloud
├── Supabase trigger
├── Twilio node
└── Schedule node

Option 2: Node-cron (Simple Backend Jobs)
├── In-app scheduler
├── Twilio integration
└── No external service needed

Option 3: Zapier (Premium SaaS)
├── No-code
├── Cloud-hosted
└── Built-in Twilio support
```

### WhatsApp Integration
```
Twilio WhatsApp Business API
├── Sandbox mode (free testing)
├── Production API (paid)
├── Message templates
└── Media support
```

---

## 📦 Folder Structure

```
daily-reports-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/ (LoginForm, SignupForm, GoogleAuth)
│   │   │   ├── Dashboard/ (DashboardLayout, ReportForm)
│   │   │   ├── Recipients/ (RecipientManager, RecipientList)
│   │   │   ├── Settings/ (ShiftSettings, NotificationSettings)
│   │   │   └── shared/ (Button, Card, Modal, etc.)
│   │   ├── pages/ (Dashboard, Settings, Analytics)
│   │   ├── hooks/ (useAuth, useReports, useRecipients)
│   │   ├── services/ (supabase.ts, api.ts)
│   │   ├── types/ (index.ts)
│   │   └── styles/ (globals.css)
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── reports.ts
│   │   │   ├── recipients.ts
│   │   │   └── notifications.ts
│   │   ├── services/
│   │   │   ├── supabase.ts
│   │   │   ├── twilio.ts (WhatsApp)
│   │   │   ├── scheduler.ts (node-schedule)
│   │   │   └── sendReport.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── types/
│   │   └── index.ts (Express app)
│   ├── .env.example
│   └── package.json
│
├── n8n-workflows/
│   └── daily-report-reminder.json
│
└── database/
    └── migrations/ (SQL files)
```

---

## 🚀 Quick Start Commands

### 1. Frontend Setup
```bash
npm create vite@latest daily-reports-frontend -- --template react-ts
cd daily-reports-frontend
npm install
npm install @supabase/supabase-js react-router-dom @tanstack/react-query
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install next-themes # For dark mode
```

### 2. Backend Setup (Node.js)
```bash
mkdir daily-reports-backend && cd daily-reports-backend
npm init -y
npm install express cors helmet dotenv node-schedule @supabase/supabase-js twilio axios
npm install -D typescript ts-node @types/node @types/express
npx tsc --init
```

### 3. Supabase Setup
- Create account at supabase.com
- Create new project
- Get API URL & anon key
- Run SQL migrations (provided below)

### 4. Twilio Setup
- Sign up at twilio.com
- Get Account SID, Auth Token
- Request WhatsApp Business Account
- Create message templates

---

## 🗄️ Database Schema (SQL)

```sql
-- Users table (created by Supabase Auth automatically)

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Recipients table
CREATE TABLE recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  whatsapp_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Shift settings
CREATE TABLE shift_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shift_start TIME NOT NULL,
  shift_end TIME NOT NULL,
  reminder_minutes_before INT DEFAULT 30,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Report reminders (tracking)
CREATE TABLE report_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS for security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own recipients"
  ON recipients FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 🔑 Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:3000
```

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
NODE_ENV=development
PORT=3000
```

---

## 📱 Integration Checklist

- [ ] Supabase project created with tables
- [ ] Google OAuth configured in Supabase
- [ ] Twilio account with WhatsApp enabled
- [ ] Environment variables configured
- [ ] Frontend built with shadcn/ui
- [ ] Backend with Express & node-schedule
- [ ] n8n workflow deployed (optional)
- [ ] Testing with Twilio sandbox
- [ ] Database RLS policies enabled

---

## 💡 Key Features to Implement

### Phase 1 (MVP)
1. ✅ Login/Signup with Google
2. ✅ Report form submission
3. ✅ Recipient management
4. ✅ Basic scheduling (fixed time reminders)

### Phase 2 (Enhancement)
1. ✅ Shift-based custom reminders
2. ✅ WhatsApp delivery
3. ✅ Report history/analytics
4. ✅ Email delivery option

### Phase 3 (Advanced)
1. ✅ n8n workflow templates
2. ✅ Batch reporting
3. ✅ Team management
4. ✅ Custom report templates

---

## 🎨 Design System (Tailwind)

**Color Palette:**
- Primary: Deep Navy (#1E3A5F)
- Accent: Premium Gold (#D4AF37)
- Secondary: Slate (#475569)
- Background: Almost Black (#0F172A)
- Success: Emerald (#10B981)
- Warning: Amber (#F59E0B)

**Typography:**
- Display: Inter Bold (headers)
- Body: Inter Regular (content)
- Mono: JetBrains Mono (code, data)

---

## 🚨 Security Notes

1. Always use Supabase RLS policies
2. Validate inputs with Zod
3. Use HTTPS in production
4. Rotate API keys regularly
5. Never commit .env files
6. Use rate limiting on backend
7. Implement CORS properly

---

## 📚 Resources

- Supabase Docs: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com
- node-schedule: https://github.com/node-schedule/node-schedule
- Twilio SDK: https://www.twilio.com/docs/libraries/node
- n8n Docs: https://docs.n8n.io
