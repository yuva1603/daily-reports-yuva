// =============================================================================
// DAILY REPORTS AUTOMATION APP - NODEJS / EXPRESS BACKEND
// Deployment: Ready for Render.com Free Tier & Local Execution
// Features: Twilio WhatsApp + Telegram Bot API + Supabase DB + node-schedule
// =============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const schedule = require('node-schedule');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const twilio = require('twilio');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// -----------------------------------------------------------------------------
// CLIENT INITIALIZATIONS WITH DEMO FALLBACKS
// -----------------------------------------------------------------------------

// Supabase client (with demo guard)
const hasSupabaseKeys = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = hasSupabaseKeys
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

if (!hasSupabaseKeys) {
  console.warn('⚠️  Supabase environment variables missing. Running in DEMO/MOCK storage mode.');
}

// Twilio client (with demo guard)
const hasTwilioKeys = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;
const twilioClient = hasTwilioKeys
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

// Telegram bot guard
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// In-Memory Demo Storage (used if Supabase is not configured yet)
const mockStore = {
  reports: [],
  recipients: [
    {
      id: 'demo-recipient-1',
      user_id: 'demo-user-id',
      name: 'Demo Operations Manager',
      phone_number: '+91 98765 43210',
      telegram_chat_id: '',
      whatsapp_enabled: true,
      telegram_enabled: false
    }
  ],
  shift_settings: {
    id: 'demo-settings-1',
    user_id: 'demo-user-id',
    shift_start: '09:00',
    shift_end: '18:00',
    reminder_minutes_before: 30,
    timezone: 'Asia/Kolkata'
  },
  reminders: []
};

// -----------------------------------------------------------------------------
// MESSAGING HELPERS
// -----------------------------------------------------------------------------

/**
 * Send WhatsApp via Twilio API
 */
async function sendWhatsAppMessage(toPhoneNumber, message) {
  if (!twilioClient) {
    console.log(`[MOCK WHATSAPP SENT TO ${toPhoneNumber}]:\n${message}`);
    return { success: true, mock: true, sid: `mock_${Date.now()}` };
  }

  try {
    const formattedNumber = toPhoneNumber.startsWith('whatsapp:')
      ? toPhoneNumber
      : `whatsapp:${toPhoneNumber.replace(/\s+/g, '')}`;

    const res = await twilioClient.messages.create({
      body: message,
      from: TWILIO_WHATSAPP_NUMBER,
      to: formattedNumber
    });

    console.log(`✅ Twilio WhatsApp sent to ${toPhoneNumber}: ${res.sid}`);
    return { success: true, sid: res.sid };
  } catch (err) {
    console.error(`❌ Twilio WhatsApp error (${toPhoneNumber}):`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send Telegram Message (100% Free alternative)
 */
async function sendTelegramMessage(chatId, message) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log(`[MOCK TELEGRAM SENT TO ${chatId}]:\n${message}`);
    return { success: true, mock: true };
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });

    console.log(`✅ Telegram sent to chat ${chatId}`);
    return { success: true, messageId: res.data.result?.message_id };
  } catch (err) {
    console.error(`❌ Telegram error (${chatId}):`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Format report into WhatsApp / Telegram markdown format
 */
function formatReportText(report, recipientName) {
  const tagsText = report.tags && report.tags.length > 0
    ? `\n🏷️ Tags: ${report.tags.join(', ')}`
    : '';

  return `📊 *Daily Shift Report*\n\n` +
    `Hello ${recipientName},\n\n` +
    `📌 *${report.title}*\n` +
    `📅 Date: ${report.date || new Date().toISOString().split('T')[0]}${tagsText}\n\n` +
    `📝 *Details:*\n${report.content}\n\n` +
    `---\nAutomated via Daily Reports Platform`;
}

// -----------------------------------------------------------------------------
// CRON SCHEDULER FOR SHIFT REMINDERS
// -----------------------------------------------------------------------------

const scheduledJobs = new Map();

async function triggerUserReminder(userId) {
  console.log(`⏰ Executing shift reminder notification for user: ${userId}`);

  let settings;
  let recipients = [];

  if (supabase) {
    const { data: sData } = await supabase.from('shift_settings').select('*').eq('user_id', userId).single();
    const { data: rData } = await supabase.from('recipients').select('*').eq('user_id', userId);
    settings = sData;
    recipients = rData || [];
  } else {
    settings = mockStore.shift_settings;
    recipients = mockStore.recipients;
  }

  if (!settings) {
    console.log(`No shift settings found for user ${userId}`);
    return;
  }

  const reminderMsg = `⏰ *Daily Report Reminder*\n\n` +
    `Your shift ends in ${settings.reminder_minutes_before} minutes (${settings.shift_end}).\n` +
    `Please log in to submit your daily report!`;

  const results = [];
  for (const recipient of recipients) {
    if (recipient.whatsapp_enabled) {
      const res = await sendWhatsAppMessage(recipient.phone_number, reminderMsg);
      results.push({ channel: 'whatsapp', recipient: recipient.name, ...res });
    }
    if (recipient.telegram_enabled && recipient.telegram_chat_id) {
      const res = await sendTelegramMessage(recipient.telegram_chat_id, reminderMsg);
      results.push({ channel: 'telegram', recipient: recipient.name, ...res });
    }
  }

  // Log reminder
  const logEntry = {
    user_id: userId,
    scheduled_time: new Date().toISOString(),
    sent_at: new Date().toISOString(),
    status: 'sent',
    channel: 'whatsapp/telegram'
  };

  if (supabase) {
    await supabase.from('report_reminders').insert([logEntry]);
  } else {
    mockStore.reminders.push({ id: `rem-${Date.now()}`, ...logEntry });
  }

  return results;
}

async function scheduleUserReminders(userId) {
  let settings;
  if (supabase) {
    const { data } = await supabase.from('shift_settings').select('*').eq('user_id', userId).single();
    settings = data;
  } else {
    settings = mockStore.shift_settings;
  }

  if (!settings || !settings.shift_end) return;

  const [endHour, endMinute] = settings.shift_end.split(':').map(Number);
  let remMinute = endMinute - settings.reminder_minutes_before;
  let remHour = endHour;

  if (remMinute < 0) {
    remMinute += 60;
    remHour = (remHour - 1 + 24) % 24;
  }

  const jobKey = `reminder-${userId}`;
  if (scheduledJobs.has(jobKey)) {
    scheduledJobs.get(jobKey).cancel();
  }

  // Cron schedule: minute hour * * *
  const cronExp = `${remMinute} ${remHour} * * *`;
  console.log(`📅 Scheduled reminder for user ${userId} daily at ${remHour.toString().padStart(2, '0')}:${remMinute.toString().padStart(2, '0')}`);

  const job = schedule.scheduleJob(cronExp, async () => {
    await triggerUserReminder(userId);
  });

  scheduledJobs.set(jobKey, job);
}

// -----------------------------------------------------------------------------
// REST API ROUTES
// -----------------------------------------------------------------------------

// 1. Health & Render Keep-Alive Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    supabaseConnected: !!supabase,
    twilioConfigured: !!twilioClient,
    telegramConfigured: !!TELEGRAM_BOT_TOKEN,
    scheduledJobsCount: scheduledJobs.size
  });
});

// 2. Submit Report
app.post('/api/reports/submit', async (req, res) => {
  try {
    const { userId, title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const reportObj = {
      id: `rep-${Date.now()}`,
      user_id: userId || 'demo-user-id',
      title,
      content,
      tags: Array.isArray(tags) ? tags : [],
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('reports')
        .insert([{
          user_id: reportObj.user_id,
          title: reportObj.title,
          content: reportObj.content,
          tags: reportObj.tags,
          date: reportObj.date
        }])
        .select()
        .single();

      if (error) throw error;
      reportObj.id = data.id;
    } else {
      mockStore.reports.unshift(reportObj);
    }

    // Get recipients to notify
    let recipients = [];
    if (supabase) {
      const { data } = await supabase.from('recipients').select('*').eq('user_id', reportObj.user_id);
      recipients = data || [];
    } else {
      recipients = mockStore.recipients;
    }

    // Send notifications to enabled recipients
    const dispatchResults = [];
    for (const r of recipients) {
      const messageText = formatReportText(reportObj, r.name);

      if (r.whatsapp_enabled && r.phone_number) {
        const waRes = await sendWhatsAppMessage(r.phone_number, messageText);
        dispatchResults.push({ recipient: r.name, channel: 'whatsapp', ...waRes });
      }

      if (r.telegram_enabled && r.telegram_chat_id) {
        const tgRes = await sendTelegramMessage(r.telegram_chat_id, messageText);
        dispatchResults.push({ recipient: r.name, channel: 'telegram', ...tgRes });
      }
    }

    res.json({
      success: true,
      report: reportObj,
      dispatchedCount: dispatchResults.length,
      dispatchResults
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Reports
app.get('/api/reports', async (req, res) => {
  try {
    const userId = req.query.userId || 'demo-user-id';

    if (supabase) {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json(data);
    }

    res.json(mockStore.reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Recipients CRUD
app.get('/api/recipients', async (req, res) => {
  try {
    const userId = req.query.userId || 'demo-user-id';
    if (supabase) {
      const { data, error } = await supabase.from('recipients').select('*').eq('user_id', userId);
      if (error) throw error;
      return res.json(data);
    }
    res.json(mockStore.recipients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/recipients', async (req, res) => {
  try {
    const { userId, name, phone_number, telegram_chat_id, whatsapp_enabled, telegram_enabled } = req.body;
    const recipient = {
      id: `rec-${Date.now()}`,
      user_id: userId || 'demo-user-id',
      name,
      phone_number,
      telegram_chat_id: telegram_chat_id || '',
      whatsapp_enabled: whatsapp_enabled !== false,
      telegram_enabled: !!telegram_enabled
    };

    if (supabase) {
      const { data, error } = await supabase.from('recipients').insert([{
        user_id: recipient.user_id,
        name: recipient.name,
        phone_number: recipient.phone_number,
        telegram_chat_id: recipient.telegram_chat_id,
        whatsapp_enabled: recipient.whatsapp_enabled,
        telegram_enabled: recipient.telegram_enabled
      }]).select().single();

      if (error) throw error;
      return res.json(data);
    }

    mockStore.recipients.push(recipient);
    res.json(recipient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/recipients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      const { error } = await supabase.from('recipients').delete().eq('id', id);
      if (error) throw error;
    } else {
      mockStore.recipients = mockStore.recipients.filter(r => r.id !== id);
    }
    res.json({ success: true, deletedId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Shift Settings
app.get('/api/settings', async (req, res) => {
  try {
    const userId = req.query.userId || 'demo-user-id';
    if (supabase) {
      const { data, error } = await supabase.from('shift_settings').select('*').eq('user_id', userId).single();
      if (error && error.code !== 'PGRST116') throw error;
      return res.json(data || null);
    }
    res.json(mockStore.shift_settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const { userId, shift_start, shift_end, reminder_minutes_before, timezone } = req.body;
    const settingsObj = {
      user_id: userId || 'demo-user-id',
      shift_start: shift_start || '09:00',
      shift_end: shift_end || '18:00',
      reminder_minutes_before: Number(reminder_minutes_before) || 30,
      timezone: timezone || 'Asia/Kolkata'
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('shift_settings')
        .upsert([settingsObj], { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      await scheduleUserReminders(settingsObj.user_id);
      return res.json(data);
    }

    mockStore.shift_settings = { ...mockStore.shift_settings, ...settingsObj };
    await scheduleUserReminders(settingsObj.user_id);
    res.json(mockStore.shift_settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Manual Test Trigger for Reminder
app.post('/api/reminders/send', async (req, res) => {
  try {
    const userId = req.body.userId || 'demo-user-id';
    const results = await triggerUserReminder(userId);
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// SERVER STARTUP
// -----------------------------------------------------------------------------

app.listen(PORT, async () => {
  console.log(`\n==================================================`);
  console.log(`🚀 DAILY REPORTS BACKEND RUNNING`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`==================================================\n`);

  // Initialize demo reminder schedule
  await scheduleUserReminders('demo-user-id');
});

module.exports = app;
