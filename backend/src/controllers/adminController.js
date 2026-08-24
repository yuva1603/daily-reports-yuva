const { supabase, mockStore } = require('../config/database');

exports.getAdminStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    let usersList = [...mockStore.users];

    // Fetch from Supabase if connected
    if (supabase) {
      try {
        const { data: dbUsers } = await supabase.from('user_credentials').select('*');
        if (dbUsers && dbUsers.length > 0) {
          usersList = dbUsers.map(u => ({
            id: u.id,
            name: u.full_name,
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
