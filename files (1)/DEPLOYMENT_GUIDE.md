# Daily Reports Automation App - Complete Deployment Guide

## 🚀 Quick Overview

This guide walks you through deploying a **production-ready daily report automation system** with:
- ✅ Professional React dashboard
- ✅ Node.js scheduling backend
- ✅ Supabase authentication & database
- ✅ Twilio WhatsApp integration
- ✅ n8n workflow automation (optional)

**Total setup time: ~2-3 hours**

---

## 📋 Phase 1: Prerequisites & Accounts Setup

### 1.1 Create Required Accounts

| Service | Purpose | Cost | Time |
|---------|---------|------|------|
| **Supabase** | Database + Auth | Free tier (generous) | 5 min |
| **Twilio** | WhatsApp API | $0.0079/msg, $20 trial credit | 10 min |
| **Firebase** | Google OAuth | Free | 5 min |
| **n8n** (optional) | Workflow automation | Free self-hosted or $25/mo cloud | 10 min |

### 1.2 Supabase Setup (Database + Auth)

```bash
# Step 1: Create Supabase project
1. Go to https://supabase.com
2. Sign up with Google or email
3. Create new project (Region: India is IST/Singapore is SGT)
4. Save Project URL and anon key

# Step 2: Run SQL migrations
1. In Supabase, go to SQL Editor
2. Copy-paste the schema from DAILY_REPORTS_STACK_GUIDE.md
3. Execute all queries
4. Verify tables created: reports, recipients, shift_settings, report_reminders

# Step 3: Enable Google OAuth
1. Go to Authentication > Providers
2. Enable Google provider
3. Get your OAuth credentials from Google Cloud Console
4. Add to Supabase Google provider settings
```

**Supabase Credentials:**
```
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_ANON_KEY = eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGc... (keep secret!)
```

### 1.3 Twilio Setup (WhatsApp)

```bash
# Step 1: Create Twilio account
1. Go to https://www.twilio.com/console
2. Sign up (use business email)
3. Create new project
4. Get Account SID and Auth Token

# Step 2: Enable WhatsApp sandbox
1. Go to Messaging > WhatsApp > Send a WhatsApp message
2. Click "Sandbox"
3. Join sandbox by texting the WhatsApp number shown
4. Get TWILIO_WHATSAPP_NUMBER (format: whatsapp:+1234567890)

# Step 3: Test connection
Twilio provides free sandbox mode for testing
Production requires WhatsApp Business Account setup
```

**Twilio Credentials:**
```
TWILIO_ACCOUNT_SID = AC...
TWILIO_AUTH_TOKEN = xxxxxxxx
TWILIO_WHATSAPP_NUMBER = whatsapp:+1415...  # Provided by Twilio
```

### 1.4 Firebase Setup (Google OAuth Alternative)

```bash
# This is optional if using Supabase's native Google OAuth
1. Go to https://console.firebase.google.com
2. Create project
3. Enable Google provider
4. Get Client ID from project settings
5. Add redirect URI: https://your-domain.com/auth/callback
```

---

## 📂 Phase 2: Frontend Setup (React)

### 2.1 Project Initialization

```bash
# Create Vite React project
npm create vite@latest daily-reports-frontend -- --template react-ts
cd daily-reports-frontend

# Install dependencies
npm install
npm install @supabase/supabase-js react-router-dom @tanstack/react-query zod axios
npm install -D tailwindcss postcss autoprefixer typescript @types/react @types/react-dom

# Initialize Tailwind
npx tailwindcss init -p

# Install shadcn/ui (optional for pre-built components)
npm install next-themes class-variance-authority clsx tailwind-merge
```

### 2.2 Copy Frontend Code

```bash
# Replace src/App.tsx with the provided ReportAutomationApp.jsx
# Update imports as needed for your project structure

# File structure:
daily-reports-frontend/
├── src/
│   ├── App.tsx          (use ReportAutomationApp.jsx)
│   ├── components/      (split into separate files if preferred)
│   ├── types/
│   ├── services/
│   │   └── supabase.ts
│   └── main.tsx
├── .env.local
├── tailwind.config.js
└── package.json
```

### 2.3 Configure Environment Variables

```bash
# Create .env.local in frontend root
cat > .env.local << 'EOF'
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_BASE_URL=http://localhost:3000
EOF
```

### 2.4 Test Frontend

```bash
# Start development server
npm run dev

# Should open at http://localhost:5173
# Test:
# ✓ Login with Google works
# ✓ Email/password signup works
# ✓ Form validation works
```

---

## 🔧 Phase 3: Backend Setup (Node.js)

### 3.1 Project Initialization

```bash
# Create backend project
mkdir daily-reports-backend
cd daily-reports-backend

# Initialize npm
npm init -y

# Install dependencies
npm install \
  express \
  cors \
  helmet \
  dotenv \
  node-schedule \
  @supabase/supabase-js \
  twilio \
  axios

# Dev dependencies
npm install -D \
  typescript \
  ts-node \
  @types/node \
  @types/express \
  nodemon

# Initialize TypeScript
npx tsc --init
```

### 3.2 Copy Backend Code

```bash
# Copy the provided backend-server.js to src/index.js
mkdir src
cp ../backend-server.js src/index.js
```

### 3.3 Configure Environment Variables

```bash
# Create .env in backend root
cat > .env << 'EOF'
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+1415...

# Server
PORT=3000
NODE_ENV=development
EOF
```

### 3.4 Update package.json Scripts

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "build": "tsc"
  }
}
```

### 3.5 Test Backend

```bash
# Start development server
npm run dev

# Should output:
# 🚀 Daily Reports Backend Server
# 📡 Listening on port 3000
# ⚙️  Initializing scheduled jobs...
# ✅ Server ready!

# Test health check
curl http://localhost:3000/health
# Response: {"status":"ok","scheduledJobs":0}
```

### 3.6 Test WhatsApp Integration

```bash
# Test sending message via API
curl -X POST http://localhost:3000/api/reminders/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id"
  }'

# Check Twilio logs for delivery status
# Go to https://www.twilio.com/console/sms/logs
```

---

## 🔄 Phase 4: Integration Testing

### 4.1 Connect Frontend to Backend

Update frontend environment:
```
VITE_API_BASE_URL=http://localhost:3000
```

### 4.2 Test Full Flow

```bash
# Terminal 1: Start backend
cd daily-reports-backend
npm run dev

# Terminal 2: Start frontend
cd daily-reports-frontend
npm run dev

# Browser: Open http://localhost:5173
# Test sequence:
1. ✅ Sign up with email
2. ✅ Go to Settings, configure shift (9:00 AM - 6:00 PM)
3. ✅ Go to Recipients, add a WhatsApp number
4. ✅ Go to Reports, create a report
5. ✅ Click Submit
6. ✅ Check WhatsApp for message
7. ✅ Manually trigger reminder: curl -X POST http://localhost:3000/api/reminders/send
```

### 4.3 Verify Scheduled Jobs

```bash
# After 30 seconds (default reminder time), should send automatically
# Check backend logs for: "✅ Reminder sent to user {id}"

# Check database
# In Supabase, go to report_reminders table
# Should see entry with status: "sent"
```

---

## 🚀 Phase 5: Deployment Options

### Option A: Deploy to Vercel + Render (Recommended for You)

#### Frontend on Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# From frontend directory
cd daily-reports-frontend
vercel

# Follow prompts
# Set environment variables in Vercel dashboard
```

#### Backend on Render
```bash
# 1. Push code to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/daily-reports-backend.git
git push -u origin main

# 2. Create new Web Service on render.com
# - Connect GitHub repo
# - Select "Node"
# - Build command: npm install
# - Start command: npm start
# - Add environment variables
# - Deploy

# 3. Update frontend API URL to Render backend URL
# VITE_API_BASE_URL=https://your-app.onrender.com
```

### Option B: Docker Deployment

```dockerfile
# Dockerfile for backend
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

EXPOSE 3000
CMD ["node", "src/index.js"]
```

```bash
# Build and run
docker build -t daily-reports-backend .
docker run -p 3000:3000 --env-file .env daily-reports-backend
```

### Option C: Self-Hosted on VPS

```bash
# On your VPS (Ubuntu 22.04)
sudo apt update && sudo apt install -y nodejs npm

# Clone and setup
git clone https://github.com/YOUR-USERNAME/daily-reports-backend.git
cd daily-reports-backend
npm install

# Use PM2 for process management
sudo npm install -g pm2
pm2 start src/index.js --name "daily-reports"
pm2 save
pm2 startup

# Setup Nginx reverse proxy
# ... (nginx config)
```

---

## 🔗 Phase 6: n8n Automation Setup (Optional but Recommended)

### 6.1 Self-Hosted n8n Setup

```bash
# Using Docker (easiest)
docker run -it --rm \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Access at http://localhost:5678
```

### 6.2 Import Workflow

```bash
# 1. In n8n UI, go to Workflows
# 2. Click "Import from URL"
# 3. Upload n8n-daily-report-workflow.json
# 4. Add credentials:
#    - Supabase: API key from Supabase
#    - Twilio: Account SID + Auth Token
#    - Slack: (optional) for error notifications
# 5. Activate workflow
# 6. Configure schedule (Daily at 17:30 IST, etc.)
```

### 6.3 Test Workflow

```bash
# Click "Execute workflow" button
# Check:
# ✓ Supabase query returns shift settings
# ✓ Recipients fetched successfully
# ✓ WhatsApp messages sent via Twilio
# ✓ Reminder logged in database
```

---

## 📊 Phase 7: Production Checklist

### Security
- [ ] Use HTTPS everywhere (vercel/render handle this)
- [ ] Rotate API keys regularly
- [ ] Enable Supabase RLS policies
- [ ] Set up rate limiting
- [ ] Enable CORS only for your domain
- [ ] Use environment variables, never hardcode secrets

### Performance
- [ ] Test with 100+ recipients
- [ ] Monitor backend response times
- [ ] Set up database indexes (especially on user_id, created_at)
- [ ] Enable caching where appropriate
- [ ] Monitor Twilio API usage

### Monitoring & Alerts
- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Monitor Supabase quota usage
- [ ] Set up alerts for failed reminders
- [ ] Track WhatsApp delivery rates
- [ ] Monitor server uptime

### Database
- [ ] Set up automated backups (Supabase does this)
- [ ] Implement data retention policies
- [ ] Clean up old reminders periodically

```sql
-- Cleanup query (run weekly)
DELETE FROM report_reminders 
WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## 🆘 Troubleshooting

### WhatsApp messages not sending
```bash
# Check Twilio logs
# Verify phone number format: +91XXXXX43210
# Ensure WhatsApp sandbox is active
# Check Twilio account balance
curl -X GET https://api.twilio.com/2010-04-01/Accounts/YOUR_SID/Messages.json \
  -u YOUR_SID:YOUR_AUTH_TOKEN
```

### Scheduled jobs not triggering
```bash
# Check backend logs for "Running reminder for user"
# Verify shift_settings exist in database
# Restart backend: npm run dev
# Check system timezone matches configured timezone
```

### Supabase auth not working
```bash
# Verify Google OAuth redirect URI is correct
# Clear browser cache
# Check VITE_SUPABASE_URL format (must include https://)
# Verify anon key in .env file
```

### n8n workflows not executing
```bash
# Check n8n logs: docker logs [container-id]
# Verify Supabase credentials in n8n
# Check Twilio credentials are correct
# Ensure schedule/cron expression is valid
```

---

## 📈 Scaling Considerations

### For 1,000+ users
- [ ] Add database connection pooling
- [ ] Implement job queuing (Bull, RabbitMQ)
- [ ] Distribute scheduling across multiple instances
- [ ] Use Twilio webhook for delivery tracking
- [ ] Implement retry logic for failed messages

### Example: Job Queue with Bull
```javascript
const Queue = require('bull');
const reportQueue = new Queue('daily-reports', {
  redis: { host: 'localhost', port: 6379 }
});

reportQueue.process(async (job) => {
  await sendReportToRecipients(job.data);
});

// Add to queue
reportQueue.add({ userId, reportId }, { repeat: { cron: '0 17 * * *' } });
```

---

## 📚 Next Steps for Production

1. **Analytics Dashboard**
   - Add reports submitted per day
   - WhatsApp delivery success rate
   - User engagement metrics

2. **Advanced Features**
   - Report templates
   - Team/department support
   - Report approvals workflow
   - PDF export

3. **Mobile App**
   - React Native version
   - Offline support

4. **Compliance**
   - GDPR/Privacy policy
   - Data retention
   - Audit logs

---

## 🤝 Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Twilio SDK**: https://www.twilio.com/docs/libraries/node
- **n8n Docs**: https://docs.n8n.io
- **Express.js**: https://expressjs.com
- **React**: https://react.dev

---

**You're all set! 🎉 The application is ready for production use.**

**Next: Monitor usage, gather feedback, and plan Phase 2 enhancements.**
