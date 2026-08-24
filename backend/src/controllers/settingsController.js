const { supabase, mockStore, isValidUUID } = require('../config/database');
const { scheduleUserReminders } = require('../services/reminderScheduler');

exports.getSettings = async (req, res) => {
  try {
    const { userId } = req.query;
    if (supabase && isValidUUID(userId)) {
      const { data, error } = await supabase
        .from('shift_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return res.json(data || null);
    }
    res.json(mockStore.shift_settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.saveSettings = async (req, res) => {
  try {
    const { userId, shift_start, shift_end, reminder_minutes_before, timezone } = req.body;
    const settingsObj = {
      shift_start: shift_start || '09:00',
      shift_end: shift_end || '18:00',
      reminder_minutes_before: reminder_minutes_before !== undefined ? Number(reminder_minutes_before) : 30,
      timezone: timezone || 'Asia/Kolkata',
      updated_at: new Date().toISOString()
    };

    if (supabase && isValidUUID(userId)) {
      const { data, error } = await supabase
        .from('shift_settings')
        .upsert([{ user_id: userId, ...settingsObj }], { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      await scheduleUserReminders(userId);
      return res.json({ success: true, settings: data });
    }

    mockStore.shift_settings = { user_id: userId || 'demo-user-id', ...settingsObj };
    await scheduleUserReminders(userId || 'demo-user-id');
    res.json({ success: true, settings: mockStore.shift_settings });
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
