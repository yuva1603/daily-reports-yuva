# 📊 Daily Reports Automation App (`daily-reports-yuva`)

An end-to-end, automated shift reporting system designed for production, maintenance, and operations teams. Built with React (Vite + Tailwind CSS), Node.js (Express + `whatsapp-web.js` + `node-schedule`), Firebase Authentication, Supabase PostgreSQL, and automated messaging via personal WhatsApp & n8n.

---

## 🌟 Key Features

* **⚡ Express Shift Reporting**: Form for submitting shift summaries, quality metrics, and maintenance notes with dynamic author & job role customization per report.
* **📲 Personal WhatsApp Automation**: Dispatches submitted reports and shift reminders directly via personal WhatsApp Web and 1-Click WhatsApp modal.
* **🔥 Firebase Authentication**: Secure sign-in with Email & Password, Passwordless Sign-In Link, and real Email Verification (`sendEmailVerification`).
* **👁️ Password Visibility & Match Verification**: Eye icon toggle (`Eye / EyeOff`) and Confirm Password verification on registration.
* **⏰ Automated Shift Reminders**: Background scheduler (`node-schedule`) triggers daily reminders prior to shift closure.
* **🛡️ Full MVC Architecture**: Cleanly separated Controllers, Services, Models, Routes, and View Components for both Frontend and Backend.
* **📊 Admin & Reporting Dashboard**: Overview of team members, total reports, daily activity, and global shift streams.

---

## 📁 Modular MVC Architecture

```
daily-reports-yuva-main/
├── backend/
│   ├── src/
│   │   ├── config/              # Database (Supabase & in-memory store)
│   │   │   └── database.js
│   │   ├── controllers/         # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── reportsController.js
│   │   │   ├── recipientController.js
│   │   │   ├── settingsController.js
│   │   │   └── adminController.js
│   │   ├── routes/              # Express API route definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── reportsRoutes.js
│   │   │   ├── recipientRoutes.js
│   │   │   ├── settingsRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   └── whatsappRoutes.js
│   │   ├── services/            # WhatsApp & Scheduler services
│   │   │   ├── whatsappService.js
│   │   │   └── reminderScheduler.js
│   │   └── index.js             # Clean Express application entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # Client API services (Fetch & Firebase)
│   │   │   ├── apiClient.js
│   │   │   ├── authService.js
│   │   │   ├── reportsService.js
│   │   │   └── recipientService.js
│   │   ├── components/          # Reusable Views & Feature Tabs
│   │   │   ├── common/index.jsx # Card, Button, Input, PasswordInput, Badge
│   │   │   ├── auth/AuthPage.jsx
│   │   │   ├── reports/ReportSubmitForm.jsx
│   │   │   ├── reports/ReportsFeed.jsx
│   │   │   ├── reports/WhatsAppModal.jsx
│   │   │   ├── recipient/RecipientTab.jsx
│   │   │   ├── settings/ShiftScheduleTab.jsx
│   │   │   ├── profile/ProfileTab.jsx
│   │   │   └── admin/AdminDashboardTab.jsx
│   │   ├── utils/formatters.js  # Formatters & Validators
│   │   ├── firebase.js          # Firebase SDK Configuration
│   │   └── App.jsx              # Main View Router & State Orchestrator
│   └── package.json
│
├── database/
│   └── schema.sql               # Supabase PostgreSQL schema
└── n8n-workflows/
    └── daily-report-workflow.json # n8n automated reporting workflow
```

---

## 🚀 Quick Start (Local Setup)

### 1. Backend Server
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:3000` (Health Check: `/health`)*

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

### 3. WhatsApp Integration
1. Open the terminal running the backend.
2. Scan the generated QR code in WhatsApp (*WhatsApp -> Settings -> Linked Devices -> Link a Device*).
3. All shift reports and automated reminders will be delivered directly!
