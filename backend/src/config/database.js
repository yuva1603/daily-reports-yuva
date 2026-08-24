const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const hasSupabaseKeys = Boolean(process.env.SUPABASE_URL && supabaseKey);
const supabase = hasSupabaseKeys
  ? createClient(process.env.SUPABASE_URL, supabaseKey)
  : null;

if (!hasSupabaseKeys) {
  console.warn('⚠️  Supabase API key missing in .env. Running in DEMO/MOCK storage mode.');
} else {
  console.log('✅ Connected to Supabase Project:', process.env.SUPABASE_URL);
}

const mockStore = {
  reports: [
    {
      id: 'rep-demo-1',
      user_id: 'usr-admin-master',
      type: 'Daily Shift Report',
      author_name: 'Yuvaraj (Chief Admin)',
      author_role: 'Chief Systems & Operations Administrator',
      title: 'Morning Shift Handover & Line-1 Calibration',
      content: 'Line 1 completed morning run with 99.2% efficiency. Routine maintenance performed on sensor array.',
      tags: ['production', 'maintenance', 'handover'],
      date: '2026-08-24',
      time: '09:30',
      created_at: new Date().toISOString()
    }
  ],
  recipient: {
    name: 'Shift Supervisor',
    phone_number: '917358859792',
    whatsapp_enabled: true
  },
  shift_settings: {
    shift_start: '09:00',
    shift_end: '18:00',
    reminder_minutes_before: 30,
    timezone: 'Asia/Kolkata'
  },
  reminders: [],
  users: [
    {
      id: 'usr-admin-master',
      name: 'Yuvaraj (Chief Admin)',
      email: 'admin@dailyreports.hub',
      password: 'YuvaAdmin#2026',
      role: 'Chief Systems & Operations Administrator',
      phone: '917358859792',
      is_admin: true,
      created_at: '2026-08-24T00:00:00Z'
    },
    {
      id: 'usr-yuva-personal',
      name: 'Yuvaraj',
      email: 'yuvaraj@company.io',
      password: 'YuvaAdmin#2026',
      role: 'Senior Engineer AI & Automation',
      phone: '917358859792',
      is_admin: true,
      created_at: '2026-08-24T00:00:00Z'
    },
    {
      id: 'usr-admin-alt',
      name: 'System Administrator',
      email: 'admin@company.io',
      password: 'YuvaAdmin#2026',
      role: 'System Administrator',
      is_admin: true,
      created_at: '2026-08-24T00:00:00Z'
    }
  ]
};

// Auto-seed Super Admin into Supabase DB Table on startup
async function seedAdminCredentials() {
  if (supabase) {
    try {
      for (const u of mockStore.users) {
        await supabase.from('user_credentials').upsert([{
          username: u.email.split('@')[0],
          name: u.name,
          full_name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
          phone_number: u.phone,
          is_admin: u.is_admin,
          last_login_at: new Date().toISOString()
        }], { onConflict: 'email' });
      }
      console.log('👑 Super Administrator credentials synced into Supabase DB.');
    } catch (err) {
      console.warn('Supabase admin seed notice:', err.message);
    }
  }
}

// Trigger admin seed
seedAdminCredentials();

function isValidUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

module.exports = {
  supabase,
  mockStore,
  isValidUUID,
  seedAdminCredentials
};
