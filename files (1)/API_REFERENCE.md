# Daily Reports API Reference & Quick Guide

## 🔌 Base URL
```
Development: http://localhost:3000
Production: https://your-app.onrender.com
```

---

## 📡 API Endpoints

### Authentication

#### Verify Token
```http
POST /api/auth/verify
Authorization: Bearer <JWT_TOKEN>

Response: 200 OK
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": { ... }
  }
}
```

---

### Reports

#### Submit Report
```http
POST /api/reports/submit
Content-Type: application/json

{
  "userId": "user-uuid",
  "title": "Daily Summary - Jan 15",
  "content": "Completed tasks:\n- Task 1\n- Task 2",
  "tags": ["production", "quality"]
}

Response: 200 OK
{
  "success": true,
  "report": {
    "id": "report-uuid",
    "user_id": "user-uuid",
    "title": "Daily Summary - Jan 15",
    "created_at": "2024-01-15T10:30:00Z",
    "date": "2024-01-15"
  },
  "sentTo": [
    {
      "recipientId": "recipient-uuid",
      "recipientName": "John Doe",
      "success": true,
      "sid": "SM..."
    }
  ],
  "message": "Report submitted and sent to 2 recipients"
}
```

#### Get All Reports
```http
GET /api/reports?userId=user-uuid

Response: 200 OK
[
  {
    "id": "report-uuid",
    "user_id": "user-uuid",
    "title": "Daily Summary - Jan 15",
    "content": "...",
    "date": "2024-01-15",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### Recipients

#### Add Recipient
```http
POST /api/recipients
Content-Type: application/json

{
  "userId": "user-uuid",
  "name": "John Doe",
  "phone_number": "+91 98765 43210"
}

Response: 201 Created
{
  "id": "recipient-uuid",
  "user_id": "user-uuid",
  "name": "John Doe",
  "phone_number": "+91 98765 43210",
  "whatsapp_enabled": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Get Recipients
```http
GET /api/recipients?userId=user-uuid

Response: 200 OK
[
  {
    "id": "recipient-uuid",
    "user_id": "user-uuid",
    "name": "John Doe",
    "phone_number": "+91 98765 43210",
    "whatsapp_enabled": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

#### Update Recipient
```http
PATCH /api/recipients/recipient-uuid
Content-Type: application/json

{
  "name": "John Doe Jr.",
  "whatsapp_enabled": false
}

Response: 200 OK
{
  "id": "recipient-uuid",
  "user_id": "user-uuid",
  "name": "John Doe Jr.",
  "phone_number": "+91 98765 43210",
  "whatsapp_enabled": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Delete Recipient
```http
DELETE /api/recipients/recipient-uuid

Response: 200 OK
{
  "success": true
}
```

---

### Settings

#### Get Shift Settings
```http
GET /api/settings?userId=user-uuid

Response: 200 OK
{
  "id": "settings-uuid",
  "user_id": "user-uuid",
  "shift_start": "09:00",
  "shift_end": "18:00",
  "reminder_minutes_before": 30,
  "timezone": "Asia/Kolkata",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### Save/Update Shift Settings
```http
POST /api/settings
Content-Type: application/json

{
  "userId": "user-uuid",
  "shift_start": "09:00",
  "shift_end": "18:00",
  "reminder_minutes_before": 30,
  "timezone": "Asia/Kolkata"
}

Response: 200 OK
{
  "id": "settings-uuid",
  "user_id": "user-uuid",
  "shift_start": "09:00",
  "shift_end": "18:00",
  "reminder_minutes_before": 30,
  "timezone": "Asia/Kolkata",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:35:00Z"
}
```

---

### Reminders

#### Manually Trigger Reminder
```http
POST /api/reminders/send
Content-Type: application/json

{
  "userId": "user-uuid"
}

Response: 200 OK
{
  "success": true,
  "result": [
    {
      "recipientId": "recipient-uuid",
      "recipientName": "John Doe",
      "success": true,
      "sid": "SM..."
    }
  ]
}
```

---

### Health Check

#### Server Status
```http
GET /health

Response: 200 OK
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "scheduledJobs": 5
}
```

---

## 🧪 Example Workflows

### Complete User Flow

#### 1. Sign Up & Initialize
```javascript
// Frontend
const { data: { session } } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

const userId = session.user.id;
```

#### 2. Save Shift Settings
```javascript
const response = await fetch('http://localhost:3000/api/settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId,
    shift_start: '09:00',
    shift_end: '18:00',
    reminder_minutes_before: 30,
    timezone: 'Asia/Kolkata'
  })
});
```

#### 3. Add Recipients
```javascript
const response = await fetch('http://localhost:3000/api/recipients', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId,
    name: 'Manager 1',
    phone_number: '+91 98765 43210'
  })
});
```

#### 4. Submit Daily Report
```javascript
const response = await fetch('http://localhost:3000/api/reports/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId,
    title: 'Daily Summary - Jan 15',
    content: 'Completed:\n- Production: 500 units\n- Quality: 99.5%',
    tags: ['production', 'quality']
  })
});

const { success, sentTo } = await response.json();
console.log(`Sent to ${sentTo.length} recipients`);
```

#### 5. Verify Reminder Scheduled
```javascript
// Backend automatically schedules reminder based on shift_end and reminder_minutes_before
// Should receive WhatsApp at 17:30 (18:00 - 30 minutes)

// To manually test:
const response = await fetch('http://localhost:3000/api/reminders/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId })
});
```

---

## 🔄 Cron Job Format (node-schedule)

For manual job scheduling, use this format:

```
Second 0-59
Minute 0-59
Hour 0-23
Date 1-31
Month 0-11 (0=Jan)
Day 0-6 (0=Sunday)

Examples:
'0 17 * * *'   → Daily at 5:00 PM
'0 9,12,17 * * *'  → Multiple times
'*/15 * * * *'  → Every 15 minutes
'0 0 * * 0'    → Every Sunday at midnight
```

---

## 🛡️ Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields",
  "details": ["userId", "phone_number"]
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid token",
  "message": "Token has expired or is invalid"
}
```

### 404 Not Found
```json
{
  "error": "Recipient not found",
  "id": "recipient-uuid"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

---

## 📱 WhatsApp Message Format

### Reminder Message
```
⏰ *Daily Report Reminder*

It's 30 minutes before shift ends!
Don't forget to submit your daily report.

👤 Recipients ready: 3

---
This is an automated message.
```

### Report Delivery Message
```
📊 *Daily Report*

Hi John,

📋 *Production Summary - Jan 15*
📅 Date: 2024-01-15
📝 Details:
Completed tasks:
- Production: 500 units
- Quality: 99.5%
- Maintenance: 2 issues

---
This is an automated message.
```

---

## 🔐 Security Headers

All responses include:
```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

---

## 📊 Rate Limiting

Current limits (can be configured):
```
- 100 requests per minute per IP
- 1000 requests per hour per user
- 10 WhatsApp messages per minute per user
```

---

## 🔧 Common Issues & Solutions

### Issue: "Invalid phone number format"
```javascript
// ❌ Wrong
'+919876543210'
'919876543210'
'9876543210'

// ✅ Correct
'+91 98765 43210'
'+91 9876 543 210'
```

### Issue: "Recipient not found for deletion"
```bash
# Verify recipient exists first
GET /api/recipients?userId=user-uuid

# Then delete with correct ID
DELETE /api/recipients/correct-recipient-uuid
```

### Issue: "Settings not found"
```bash
# Check if user has settings
GET /api/settings?userId=user-uuid

# If empty, create first
POST /api/settings
{
  "userId": "user-uuid",
  "shift_start": "09:00",
  "shift_end": "18:00",
  "reminder_minutes_before": 30,
  "timezone": "Asia/Kolkata"
}
```

### Issue: "WhatsApp message not sending"
```bash
# Check Twilio credentials
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN
echo $TWILIO_WHATSAPP_NUMBER

# Test manually
curl -X POST http://localhost:3000/api/reminders/send \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id"}'

# Check Twilio logs for errors
# https://www.twilio.com/console/sms/logs
```

---

## 📈 Performance Optimization Tips

### Database Queries
```sql
-- Add indexes for faster queries
CREATE INDEX idx_reports_user_date ON reports(user_id, date);
CREATE INDEX idx_recipients_user_enabled ON recipients(user_id, whatsapp_enabled);
CREATE INDEX idx_reminders_user_date ON report_reminders(user_id, created_at);
```

### Caching Strategy
```javascript
// Cache shift settings (changes infrequently)
const cache = new Map();
const CACHE_TTL = 3600000; // 1 hour

async function getShiftSettings(userId) {
  const cached = cache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const settings = await supabase
    .from('shift_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  cache.set(userId, { data: settings, timestamp: Date.now() });
  return settings;
}
```

### Batch Operations
```javascript
// Send to multiple recipients efficiently
async function batchSendReports(reports, recipients) {
  const messages = reports.flatMap(report =>
    recipients.map(r => ({
      body: formatMessage(report),
      to: r.phone_number
    }))
  );
  
  // Send in parallel but rate-limited
  const batches = chunk(messages, 10);
  for (const batch of batches) {
    await Promise.all(batch.map(msg => sendWhatsApp(msg)));
    await sleep(1000); // Rate limiting
  }
}
```

---

## 🚀 Deployment Checklist

- [ ] All environment variables set
- [ ] HTTPS enabled on backend
- [ ] Database backups configured
- [ ] Error logging set up (Sentry/LogRocket)
- [ ] Rate limiting enabled
- [ ] CORS configured for frontend domain only
- [ ] Twilio production account (not sandbox)
- [ ] WhatsApp Business Account approved
- [ ] Database indexes created
- [ ] Monitoring alerts configured
- [ ] Team trained on operations
- [ ] Rollback plan documented

---

## 📞 Getting Help

**Documentation:**
- API Errors: Check response status code + error message
- Twilio: https://www.twilio.com/docs
- Supabase: https://supabase.com/docs
- n8n: https://docs.n8n.io

**Debug Mode:**
```javascript
// Add to backend for detailed logging
process.env.DEBUG = 'daily-reports:*';

// In code
console.log('[DEBUG]', 'Variable:', variable);
```

---

**Last Updated: 2024-01-15**
**Version: 1.0**
