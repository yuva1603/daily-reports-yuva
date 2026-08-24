const { supabase, mockStore, isValidUUID } = require('../config/database');
const { scheduleUserReminders } = require('../services/reminderScheduler');

exports.getSettings = async (req, res) => {
  try {
    const { userId } = req.query;
    const defaultSettings = {
      shift_start: '09:00',
      shift_end: '18:00',
      reminder_minutes_before: 30,
      timezone: 'Asia/Kolkata',
      enabled: false
    };

    if (!userId) {
      return res.json(defaultSettings);
    }

    if (supabase && isValidUUID(userId)) {
      const { data, error } = await supabase
        .from('shift_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return res.json(data || defaultSettings);
    }

    // In-memory isolated lookup by userId
    const userSettings = mockStore.shift_settings[userId] || defaultSettings;
    res.json(userSettings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.saveSettings = async (req, res) => {
  try {
    const { userId, shift_start, shift_end, reminder_minutes_before, timezone, enabled } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const settingsObj = {
      user_id: userId,
      shift_start: shift_start || '09:00',
      shift_end: shift_end || '18:00',
      reminder_minutes_before: reminder_minutes_before !== undefined ? Number(reminder_minutes_before) : 30,
      timezone: timezone || 'Asia/Kolkata',
      enabled: Boolean(enabled),
      updated_at: new Date().toISOString()
    };

    if (supabase && isValidUUID(userId)) {
      const { data, error } = await supabase
        .from('shift_settings')
        .upsert([settingsObj], { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      if (settingsObj.enabled) await scheduleUserReminders(userId);
      return res.json({ success: true, settings: data });
    }

    mockStore.shift_settings[userId] = settingsObj;
    if (settingsObj.enabled) await scheduleUserReminders(userId);
    res.json({ success: true, settings: settingsObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = (req, res) => {
  try {
    const { userId, full_name, role, email } = req.body;
    let user = mockStore.users.find(u => u.id === userId || (email && u.email.toLowerCase() === email.toLowerCase()));
    if (user) {
      if (full_name) user.name = full_name.trim();
      if (role) user.role = role.trim();
    } else {
      user = {
        id: userId || `usr-${Date.now()}`,
        name: full_name || 'Yuvaraj',
        role: role || 'Senior Engineer AI & Automation',
        email: email || 'yuvaraj@company.io',
        is_admin: true
      };
      mockStore.users.push(user);
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
