import { apiRequest } from './apiClient';

export const recipientService = {
  // Get current single recipient
  async getRecipient(userId) {
    const res = await apiRequest(`/api/recipient?userId=${userId || 'demo-user-id'}`);
    if (!res.ok) return null;
    return res.json();
  },

  // Save recipient
  async saveRecipient(userId, name, phone_number) {
    const res = await apiRequest('/api/recipient', {
      method: 'POST',
      body: JSON.stringify({ userId: userId || 'demo-user-id', name, phone_number })
    });
    return res.json();
  },

  // Clear recipient
  async clearRecipient(userId) {
    const res = await apiRequest(`/api/recipient?userId=${userId || 'demo-user-id'}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};

export const settingsService = {
  // Get shift schedule settings
  async getSettings(userId) {
    const res = await apiRequest(`/api/settings?userId=${userId || 'demo-user-id'}`);
    if (!res.ok) return null;
    return res.json();
  },

  // Save shift schedule settings
  async saveSettings(userId, settings) {
    const res = await apiRequest('/api/settings', {
      method: 'POST',
      body: JSON.stringify({ userId: userId || 'demo-user-id', ...settings })
    });
    return res.json();
  },

  // Update profile
  async updateProfile(userId, full_name, role, email) {
    const res = await apiRequest('/api/profile', {
      method: 'POST',
      body: JSON.stringify({ userId: userId || 'demo-user-id', full_name, role, email })
    });
    return res.json();
  }
};
