const { mockStore } = require('../config/database');
const axios = require('axios');

exports.getAdminStats = (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const totalUsers = mockStore.users.length;
    const totalReports = mockStore.reports.length;
    const todayReports = mockStore.reports.filter(r => r.date === todayStr).length;

    const usersWithStats = mockStore.users.map(u => {
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
