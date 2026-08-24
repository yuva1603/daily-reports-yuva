import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { Card, Button, Input } from '../common';
import { settingsService } from '../../api/recipientService';

export const ShiftScheduleTab = ({ settings, setSettings, user }) => {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await settingsService.saveSettings(user?.id, settings);
      alert('✅ Shift schedule settings updated successfully!');
    } catch (err) {
      alert(`Save error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border border-slate-800 bg-[#0a0d14] space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          Shift Schedule & Automated Reminders
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Shift Start Time"
            type="time"
            value={settings.shift_start}
            onChange={(e) => setSettings({ ...settings, shift_start: e.target.value })}
          />
          <Input
            label="Shift End Time"
            type="time"
            value={settings.shift_end}
            onChange={(e) => setSettings({ ...settings, shift_end: e.target.value })}
          />
        </div>

        <Input
          label="Reminder Lead Time (Minutes Before Shift End)"
          type="number"
          value={settings.reminder_minutes_before}
          onChange={(e) => setSettings({ ...settings, reminder_minutes_before: Number(e.target.value) })}
          hint="Automatically reminds team members to submit reports before shift closes"
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
            <option value="Europe/London">Europe/London (GMT/BST)</option>
            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
            <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
          </select>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? 'Saving Changes...' : 'Save Shift Settings'}
        </Button>
      </Card>

      <Card className="border border-slate-800 bg-[#0a0d14] space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          Shift Summary Preview
        </h3>
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs text-slate-300">
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Current Shift Window:</span>
            <span className="font-bold text-white">{settings.shift_start} — {settings.shift_end}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Reminder Timing:</span>
            <span className="font-bold text-amber-400">{settings.reminder_minutes_before} mins prior to end</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Configured Timezone:</span>
            <span className="font-bold text-sky-400">{settings.timezone}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
