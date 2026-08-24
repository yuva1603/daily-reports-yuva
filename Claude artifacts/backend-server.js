// =============================================================================
// DAILY REPORTS AUTOMATION APP - NODEJS/EXPRESS BACKEND
// Tech Stack: Express.js + node-schedule + Twilio + Supabase
// =============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const schedule = require('node-schedule');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const twilio = require('twilio');

// Load environment variables
dotenv.config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER; // format: whatsapp:+1234567890

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/*
interface Report {
  id: string;
  user_id: string;
  title: string;
  content: string;
  date: string;
  created_at: timestamp;
}

interface Recipient {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  whatsapp_enabled: boolean;
}

interface ShiftSettings {
  id: string;
  user_id: string;
  shift_start: time;
  shift_end: time;
  reminder_minutes_before: int;
  timezone: string;
}
*/

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Send WhatsApp message via Twilio
 * @param {string} toPhoneNumber - Recipient phone number (with country code)
 * @param {string} message - Message content
 */
async function sendWhatsAppMessage(toPhoneNumber, message) {
  try {
    // Format phone number: ensure it starts with 'whatsapp:'
    const formattedNumber = toPhoneNumber.startsWith('whatsapp:')
      ? toPhoneNumber
      : `whatsapp:${toPhoneNumber}`;

    const msg = await twilioClient.messages.create({
      body: message,
      from: TWILIO_WHATSAPP_NUMBER,
      to: formattedNumber
    });

    console.log(`✅ WhatsApp sent to ${toPhoneNumber}: ${msg.sid}`);
    return { success: true, sid: msg.sid };
  } catch (error) {
    console.error(`❌ Failed to send WhatsApp to ${toPhoneNumber}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Format report for WhatsApp message
 */
function formatReportForWhatsApp(report, recipientName) {
  return `📊 *Daily Report*\n\nHi ${recipientName},\n\n` +
    `📋 *${report.title}*\n` +
    `📅 Date: ${report.date}\n` +
    `📝 Details:\n${report.content}\n\n` +
    `---\nThis is an automated message.`;
}

/**
 * Calculate next reminder time based on shift settings
 */
function getNextReminderTime(shiftSettings, timezone = 'UTC') {
  const now = new Date();
  const [endHour, endMinute] = shiftSettings.shift_end.split(':');
  const reminderMinutes = shiftSettings.reminder_minutes_before;

  // Create today's reminder time
  const reminderTime = new Date();
  reminderTime.setHours(parseInt(endHour));
  reminderTime.setMinutes(parseInt(endMinute) - reminderMinutes);

  // If reminder time has passed, schedule for next day
  if (reminderTime < now) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }

  return reminderTime;
}

/**
 * Send reminder notification to user
 */
async function sendReminderNotification(userId, settings) {
  try {
    // Get user email
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError) throw userError;

    // Get user's recipients
    const { data: recipients, error: recipientsError } = await supabase
      .from('recipients')
      .select('*')
      .eq('user_id', userId)
      .eq('whatsapp_enabled', true);

    if (recipientsError) throw recipientsError;

    const reminderMessage = `⏰ *Daily Report Reminder*\n\n` +
      `It's ${settings.reminder_minutes_before} minutes before shift ends!\n` +
      `Don't forget to submit your daily report.\n\n` +
      `👤 Recipients ready: ${recipients.length}`;

    // Send reminders to all enabled recipients
    const results = [];
    for (const recipient of recipients) {
      const result = await sendWhatsAppMessage(recipient.phone_number, reminderMessage);
      results.push(result);
    }

    // Log reminder sent
    await supabase
      .from('report_reminders')
      .insert([{
        user_id: userId,
        scheduled_time: new Date().toISOString(),
        sent_at: new Date().toISOString(),
        status: 'sent'
      }]);

    console.log(`✅ Reminder sent to user ${userId}`);
    return results;
  } catch (error) {
    console.error(`❌ Error sending reminder to ${userId}:`, error.message);
    await supabase
      .from('report_reminders')
      .insert([{
        user_id: userId,
        scheduled_time: new Date().toISOString(),
        sent_at: new Date().toISOString(),
        status: 'failed'
      }]);
  }
}

// ============================================================================
// SCHEDULED JOBS
// ============================================================================

const scheduledJobs = new Map(); // Keep track of scheduled jobs

/**
 * Schedule reminders for a user based on their shift settings
 */
async function scheduleUserReminders(userId) {
  try {
    // Get user's shift settings
    const { data: settings, error } = await supabase
      .from('shift_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !settings) {
      console.log(`No shift settings found for user ${userId}`);
      return;
    }

    // Cancel existing job if any
    const jobKey = `reminder-${userId}`;
    if (scheduledJobs.has(jobKey)) {
      scheduledJobs.get(jobKey).cancel();
    }

    // Calculate next reminder time
    const reminderTime = getNextReminderTime(settings, settings.timezone);
    console.log(`📅 Scheduling reminder for ${userId} at ${reminderTime}`);

    // Schedule recurring job (every day at reminder time)
    const job = schedule.scheduleJob(
      `${reminderTime.getMinutes()} ${reminderTime.getHours()} * * *`, // Cron: HH MM daily
      async () => {
        console.log(`⏰ Running reminder for user ${userId}`);
        await sendReminderNotification(userId, settings);
      }
    );

    scheduledJobs.set(jobKey, job);
  } catch (error) {
    console.error(`Error scheduling reminders for ${userId}:`, error.message);
  }
}

/**
 * Initialize all scheduled jobs on server start
 */
async function initializeScheduledJobs() {
  try {
    // Get all users with shift settings
    const { data: settings, error } = await supabase
      .from('shift_settings')
      .select('user_id');

    if (error) throw error;

    // Schedule reminders for each user
    for (const setting of settings) {
      await scheduleUserReminders(setting.user_id);
    }

    console.log(`✅ Initialized ${settings.length} scheduled jobs`);
  } catch (error) {
    console.error('Error initializing scheduled jobs:', error.message);
  }
}

// ============================================================================
// API ROUTES - AUTHENTICATION
// ============================================================================

/**
 * Verify JWT token and return user
 */
app.post('/api/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// API ROUTES - REPORTS
// ============================================================================

/**
 * Submit a report and send to recipients
 * POST /api/reports/submit
 * Body: { title, content, tags[] }
 */
app.post('/api/reports/submit', async (req, res) => {
  try {
    const userId = req.body.userId; // In production, extract from JWT
    const { title, content, tags } = req.body;

    if (!userId || !title || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save report to database
    const { data: report, error: saveError } = await supabase
      .from('reports')
      .insert([{
        user_id: userId,
        title,
        content,
        date: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (saveError) throw saveError;

    // Get recipients
    const { data: recipients, error: recipientsError } = await supabase
      .from('recipients')
      .select('*')
      .eq('user_id', userId)
      .eq('whatsapp_enabled', true);

    if (recipientsError) throw recipientsError;

    // Send to each recipient
    const sendResults = [];
    for (const recipient of recipients) {
      const message = formatReportForWhatsApp(report, recipient.name);
      const result = await sendWhatsAppMessage(recipient.phone_number, message);
      sendResults.push({
        recipientId: recipient.id,
        recipientName: recipient.name,
        ...result
      });
    }

    res.json({
      success: true,
      report,
      sentTo: sendResults,
      message: `Report submitted and sent to ${sendResults.filter(r => r.success).length} recipients`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get user's reports
 * GET /api/reports
 */
app.get('/api/reports', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// API ROUTES - RECIPIENTS
// ============================================================================

/**
 * Add recipient
 * POST /api/recipients
 */
app.post('/api/recipients', async (req, res) => {
  try {
    const { userId, name, phone_number } = req.body;
    if (!userId || !name || !phone_number) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('recipients')
      .insert([{
        user_id: userId,
        name,
        phone_number,
        whatsapp_enabled: true
      }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get user's recipients
 * GET /api/recipients
 */
app.get('/api/recipients', async (req, res) => {
  try {
    const userId = req.query.userId;
    const { data, error } = await supabase
      .from('recipients')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update recipient
 * PATCH /api/recipients/:id
 */
app.patch('/api/recipients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('recipients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete recipient
 * DELETE /api/recipients/:id
 */
app.delete('/api/recipients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('recipients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// API ROUTES - SHIFT SETTINGS
// ============================================================================

/**
 * Get shift settings
 * GET /api/settings
 */
app.get('/api/settings', async (req, res) => {
  try {
    const userId = req.query.userId;
    const { data, error } = await supabase
      .from('shift_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    res.json(data || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Save shift settings
 * POST /api/settings
 */
app.post('/api/settings', async (req, res) => {
  try {
    const { userId, shift_start, shift_end, reminder_minutes_before, timezone } = req.body;

    // Try to update, if no row exists, insert
    const { data: existing } = await supabase
      .from('shift_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('shift_settings')
        .update({ shift_start, shift_end, reminder_minutes_before, timezone })
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('shift_settings')
        .insert([{ user_id: userId, shift_start, shift_end, reminder_minutes_before, timezone }])
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    // Re-schedule this user's reminders
    await scheduleUserReminders(userId);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// API ROUTES - REMINDERS (MANUAL TRIGGER)
// ============================================================================

/**
 * Manually trigger a reminder for testing
 * POST /api/reminders/send
 */
app.post('/api/reminders/send', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Get settings
    const { data: settings } = await supabase
      .from('shift_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!settings) {
      return res.status(404).json({ error: 'Shift settings not found' });
    }

    const result = await sendReminderNotification(userId, settings);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    scheduledJobs: scheduledJobs.size
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, async () => {
  console.log(`\n🚀 Daily Reports Backend Server`);
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`\n⚙️  Initializing scheduled jobs...`);

  await initializeScheduledJobs();

  console.log(`\n✅ Server ready!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down...');
  scheduledJobs.forEach(job => job.cancel());
  process.exit(0);
});

module.exports = app;
