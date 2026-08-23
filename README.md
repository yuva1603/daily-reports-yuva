# 📊 Daily Reports Automation App (`daily-reports-yuva`)

An end-to-end, automated shift reporting system designed for production, maintenance, and operation teams. Built with React (Vite + Tailwind CSS), Node.js (Express + `node-schedule`), Supabase PostgreSQL, and automated messaging via Twilio WhatsApp & Telegram Bot API.

---

## 🌟 Key Features

* **⚡ Express Shift Reporting**: Form for submitting shift summaries, quality metrics, and maintenance notes with tag support.
* **📲 Multi-Channel Notifications**: Automatically dispatches submitted reports to designated managers via WhatsApp and Telegram.
* **⏰ Automated Shift Reminders**: In-app background scheduler calculates daily trigger times based on shift end windows and notifies team members.
* **🔐 Supabase Auth & RLS**: Secure user authentication and Row Level Security data isolation.
* **💡 Demo / Mock Storage Mode**: Runs out-of-the-box in offline demo mode even without third-party API keys configured.
* **🚀 100% Free Hosting Ready**: Complete guide and support for deploying on Supabase (DB), Render.com (Backend), and Vercel (Frontend).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite + TypeScript / JSX
- **Styling**: Tailwind CSS (Dark Glassmorphism Theme)
- **Icons**: Lucide React
- **Client**: Supabase JS Client

### Backend
- **Server**: Node.js + Express.js
- **Scheduler**: `node-schedule` (Cron Engine)
- **Integrations**: Twilio WhatsApp API, Telegram Bot API, Supabase SDK

### Database & Automation
- **Database**: Supabase (PostgreSQL with RLS & Indexes)
- **No-Code Automation**: n8n Workflow (`n8n-workflows/daily-report-workflow.json`)

---

## 📁 Repository Structure

```
daily-reports-yuva/
├── backend/            # Express backend & reminder scheduler
│   ├── src/index.js    # API routes, messaging helpers & cron scheduler
│   └── package.json
├── frontend/           # Vite React UI
│   ├── src/            # App.jsx, index.css, main.jsx
│   └── package.json
├── database/           # Supabase DDL SQL schema
│   └── schema.sql
├── n8n-workflows/      # Importable n8n workflow definition
│   └── daily-report-workflow.json
└── files (1)/          # Detailed documentation & setup guides
    ├── QUICK_START.md
    ├── DEPLOYMENT_GUIDE.md
    ├── API_REFERENCE.md
    └── DAILY_REPORTS_STACK_GUIDE.md
```

---

## 🚀 Quick Start (Local Setup)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/yuva1603/daily-reports-yuva.git
cd daily-reports-yuva

# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

### 2. Start Backend Server

```bash
cd backend
npm run dev
# Running at http://localhost:3000
```

### 3. Start Frontend App

```bash
cd frontend
npm run dev
# Running at http://localhost:5173
```

---

## 📄 Database Setup (Supabase)

1. Open your project on [Supabase](https://supabase.com).
2. Navigate to **SQL Editor**.
3. Copy & paste the contents of [`database/schema.sql`](database/schema.sql) and click **Run**.

---

## 📝 License

Licensed under the [MIT License](LICENSE).
