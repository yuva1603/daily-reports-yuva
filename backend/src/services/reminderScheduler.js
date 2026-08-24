const schedule = require('node-schedule');
const { supabase, mockStore, isValidUUID } = require('../config/database');
const { sendWhatsAppMessage } = require('./whatsappService');

const scheduledJobs = new Map();

async function getSingleRecipient(userId) {
  if (!userId) return null;
  if (supabase && isValidUUID(userId)) {
    const { data } = await supabase.from('recipients').select('*').eq('user_id', userId).maybeSingle();
    return data;
  }
  return mockStore.recipients[userId] || null;
}

async function triggerUserReminder(userId) {
  let settings;
  if (supabase && isValidUUID(userId)) {
    const { data } = await supabase.from('shift_settings').select('*').eq('user_id', userId).maybeSingle();
    settings = data;
  } else {
    settings = mockStore.shift_settings[userId];
  }

  if (!settings) {
    console.log(`No shift settings found for user ${userId}`);
    return;
  }

  const recipient = await getSingleRecipient(userId);
  if (!recipient) {
    console.log(`No recipient configured for user ${userId}`);
    return;
  }

  const reminderMsg = `⏰ *Daily Report Reminder*\n\n` +
    `Your shift ends in ${settings.reminder_minutes_before} minutes (${settings.shift_end}).\n` +
    `Please log in to submit your daily report!`;

  const results = [];
  if (recipient.whatsapp_enabled && recipient.phone_number) {
    const res = await sendWhatsAppMessage(recipient.phone_number, reminderMsg);
    results.push({ channel: 'whatsapp', recipient: recipient.name, ...res });
  }

  const logEntry = {
    user_id: userId,
    scheduled_time: new Date().toISOString(),
    sent_at: new Date().toISOString(),
    status: 'sent',
    channel: 'whatsapp'
  };

  if (supabase && isValidUUID(userId)) {
    await supabase.from('report_reminders').insert([logEntry]);
  } else {
    mockStore.reminders.push({ id: `rem-${Date.now()}`, ...logEntry });
  }

  return results;
}

async function scheduleUserReminders(userId) {
  let settings;
  if (supabase && isValidUUID(userId)) {
    const { data } = await supabase.from('shift_settings').select('*').eq('user_id', userId).maybeSingle();
    settings = data;
  } else {
    settings = mockStore.shift_settings[userId];
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

  const cronExp = `${remMinute} ${remHour} * * *`;
  console.log(`📅 Scheduled reminder for user ${userId} daily at ${remHour.toString().padStart(2, '0')}:${remMinute.toString().padStart(2, '0')}`);

  const job = schedule.scheduleJob(cronExp, async () => {
    await triggerUserReminder(userId);
  });

  scheduledJobs.set(jobKey, job);
}

module.exports = {
  scheduleUserReminders,
  triggerUserReminder,
  getSingleRecipient
};
