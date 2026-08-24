const { supabase, mockStore, isValidUUID } = require('../config/database');

exports.getAdminStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    let usersList = [...mockStore.users];

    // Fetch from Supabase if connected
    if (supabase) {
      try {
        const { data: dbUsers } = await supabase.from('user_credentials').select('*').order('created_at', { ascending: false });
        if (dbUsers && dbUsers.length > 0) {
          usersList = dbUsers.map(u => ({
            id: u.id,
            name: u.full_name || u.name,
            email: u.email,
            password: u.password,
            role: u.role,
            is_admin: u.is_admin,
            phone: u.phone_number,
            created_at: u.created_at,
            last_login_at: u.last_login_at
          }));
        }
      } catch (dbErr) {
        console.warn('Supabase fetch notice for admin stats:', dbErr.message);
      }
    }

    const totalUsers = usersList.length;
    const totalReports = mockStore.reports.length;
    const todayReports = mockStore.reports.filter(r => r.date === todayStr).length;

    const usersWithStats = usersList.map(u => {
      const userReports = mockStore.reports.filter(r => r.user_id === u.id || r.author_name === u.name);
      return {
        ...u,
        reports_count: userReports.length
      };
    });

    const categoryCounts = {};
    mockStore.reports.forEach(r => {
      const type = r.type || 'Daily Shift Report';
      categoryCounts[type] = (categoryCounts[type] || 0) + 1;
    });

    res.json({
      success: true,
      totalUsers,
      totalReports,
      todayReports,
      users: usersWithStats,
      categoryCounts,
      allReports: mockStore.reports
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [CREATE] Admin Create New User
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, is_admin, phone_number } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password: password || 'DefaultPass@123',
      role: role || 'Senior Engineer AI & Automation',
      is_admin: Boolean(is_admin),
      phone: phone_number || '',
      created_at: new Date().toISOString()
    };

    // Save to Supabase if connected
    if (supabase) {
      try {
        const { data, error } = await supabase.from('user_credentials').insert([{
          username: cleanEmail.split('@')[0],
          name: newUser.name,
          full_name: newUser.name,
          email: cleanEmail,
          password: newUser.password,
          role: newUser.role,
          phone_number: newUser.phone,
          is_admin: newUser.is_admin,
          last_login_at: new Date().toISOString()
        }]).select().single();

        if (error) throw error;
        if (data) newUser.id = data.id;
      } catch (dbErr) {
        console.warn('Supabase create user error:', dbErr.message);
      }
    }

    mockStore.users.push(newUser);
    res.json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [UPDATE] Admin Update Existing User
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, is_admin, phone_number } = req.body;

    let user = mockStore.users.find(u => u.id === id || u.email.toLowerCase() === (email || '').toLowerCase());
    if (user) {
      if (name) user.name = name.trim();
      if (email) user.email = email.trim().toLowerCase();
      if (password) user.password = password;
      if (role) user.role = role.trim();
      if (is_admin !== undefined) user.is_admin = Boolean(is_admin);
      if (phone_number !== undefined) user.phone = phone_number;
    }

    // Update in Supabase if connected
    if (supabase) {
      try {
        const updatePayload = {};
        if (name) { updatePayload.name = name.trim(); updatePayload.full_name = name.trim(); }
        if (email) { updatePayload.email = email.trim().toLowerCase(); updatePayload.username = email.split('@')[0]; }
        if (password) updatePayload.password = password;
        if (role) updatePayload.role = role.trim();
        if (is_admin !== undefined) updatePayload.is_admin = Boolean(is_admin);
        if (phone_number !== undefined) updatePayload.phone_number = phone_number;
        updatePayload.updated_at = new Date().toISOString();

        if (isValidUUID(id)) {
          await supabase.from('user_credentials').update(updatePayload).eq('id', id);
        } else if (email) {
          await supabase.from('user_credentials').update(updatePayload).eq('email', email.trim().toLowerCase());
        }
      } catch (dbErr) {
        console.warn('Supabase update user error:', dbErr.message);
      }
    }

    res.json({ success: true, user: user || { id, ...req.body } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [DELETE] Admin Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    mockStore.users = mockStore.users.filter(u => u.id !== id && (!email || u.email.toLowerCase() !== email.toLowerCase()));

    // Delete in Supabase if connected
    if (supabase) {
      try {
        if (isValidUUID(id)) {
          await supabase.from('user_credentials').delete().eq('id', id);
        } else if (email) {
          await supabase.from('user_credentials').delete().eq('email', email.toLowerCase());
        }
      } catch (dbErr) {
        console.warn('Supabase delete user error:', dbErr.message);
      }
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
