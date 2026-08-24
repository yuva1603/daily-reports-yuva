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
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Shift Schedule Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Fixed shift schedules and automatic reminders are <strong>completely optional</strong> for all team members.
          </p>
        </div>

        {/* Optional Toggle */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">Enable Fixed Shift Schedule & Reminders</p>
            <p className="text-[11px] text-slate-400">
              {settings.enabled
                ? 'Active — Automated shift reminders will trigger daily'
                : 'Disabled — Team works on flexible/general hours (Optional)'}
            </p>
          </div>
          <input
            type="checkbox"
            id="shiftEnabledCheck"
            checked={Boolean(settings.enabled)}
            onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
            className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
          />
        </div>

        <div className={`space-y-4 transition ${settings.enabled ? 'opacity-100' : 'opacity-50'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Shift Start Time"
              type="time"
              value={settings.shift_start || '09:00'}
              disabled={!settings.enabled}
              onChange={(e) => setSettings({ ...settings, shift_start: e.target.value })}
            />
            <Input
              label="Shift End Time"
              type="time"
              value={settings.shift_end || '18:00'}
              disabled={!settings.enabled}
              onChange={(e) => setSettings({ ...settings, shift_end: e.target.value })}
            />
          </div>

          <Input
            label="Reminder Lead Time (Minutes Before Shift End)"
            type="number"
            value={settings.reminder_minutes_before ?? 30}
            disabled={!settings.enabled}
            onChange={(e) => setSettings({ ...settings, reminder_minutes_before: Number(e.target.value) })}
            hint="Automatically reminds team members to submit reports before shift closes"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Timezone
            </label>
            <select
              value={settings.timezone || 'Asia/Kolkata'}
              disabled={!settings.enabled}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
            </select>
          </div>
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
            <span className="text-slate-400">Shift Schedule Mode:</span>
            <span className={`font-bold ${settings.enabled ? 'text-emerald-400' : 'text-amber-400'}`}>
              {settings.enabled ? 'Fixed Shift Window' : 'Flexible / General (Optional)'}
            </span>
          </div>
          {settings.enabled ? (
            <>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Current Shift Window:</span>
                <span className="font-bold text-white">{settings.shift_start} — {settings.shift_end}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Reminder Timing:</span>
                <span className="font-bold text-amber-400">{settings.reminder_minutes_before} mins prior to end</span>
              </div>
            </>
          ) : (
            <div className="py-2 text-[11px] text-slate-400">
              ℹ️ No fixed shift timings enforced. Team members can submit shift reports at any time during the day.
            </div>
          )}
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Configured Timezone:</span>
            <span className="font-bold text-sky-400">{settings.timezone || 'Asia/Kolkata'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
