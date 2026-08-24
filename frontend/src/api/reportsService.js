import { apiRequest } from './apiClient';

export const reportsService = {
  // Fetch reports for a user
  async getReports(userId) {
    const res = await apiRequest(`/api/reports?userId=${userId || 'demo-user-id'}`);
    if (!res.ok) throw new Error(`Failed to load reports: ${res.statusText}`);
    return res.json();
  },

  // Submit new report
  async submitReport(payload) {
    const res = await apiRequest('/api/reports/submit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Delete a report
  async deleteReport(reportId, userId) {
    const res = await apiRequest(`/api/reports/${reportId}?userId=${userId || 'demo-user-id'}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Fetch admin stats & all reports
  async getAdminStats() {
    const res = await apiRequest('/api/admin/stats');
    if (!res.ok) throw new Error(`Failed to load admin stats: ${res.statusText}`);
    return res.json();
  }
};
