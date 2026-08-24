import React, { useState, useEffect } from 'react';
import { ShieldCheck, User } from 'lucide-react';
import { Card, Button, Input } from '../common';
import { settingsService } from '../../api/recipientService';

export const ProfileTab = ({ profile, setProfile, user, setUser }) => {
  const [name, setName] = useState(profile?.name || user?.name || '');
  const [role, setRole] = useState(profile?.role || user?.role || '');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(profile?.name || user?.name || '');
    setRole(profile?.role || user?.role || '');
  }, [user, profile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('⚠️ Name cannot be empty.');

    setLoading(true);
    try {
      const data = await settingsService.updateProfile(user?.id, name.trim(), role.trim(), user?.email);
      if (data.success) {
        setProfile({ name: name.trim(), role: role.trim(), email: user?.email });
        setUser(prev => ({ ...prev, name: name.trim(), role: role.trim() }));
        setMsg('✅ Profile & role updated successfully!');
        setTimeout(() => setMsg(''), 4000);
      } else {
        alert(`Update failed: ${data.error}`);
      }
    } catch (err) {
      alert(`Error updating profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border border-slate-800 bg-[#0a0d14] space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            Account & Role Designation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Update your default name and job role. This is displayed on all submitted shift reports and WhatsApp messages.
          </p>
        </div>

        {msg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
            {msg}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Yuvaraj"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Job Role / Designation"
            placeholder="e.g. Senior Engineer AI & Automation"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            hint="You can also adjust your role dynamically per report on the submit form"
          />

          <Input
            label="Registered Work Email"
            value={user?.email || profile?.email || ''}
            disabled
            hint="Account email address (managed via Firebase / Auth)"
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Updating Profile...' : 'Save Profile & Role Changes'}
          </Button>
        </form>
      </Card>

      <Card className="border border-slate-800 bg-[#0a0d14] space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-amber-400" />
          Current Profile Badge
        </h3>
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div>
            <span className="text-xs text-slate-400">Team Member Name</span>
            <p className="text-lg font-bold text-white">{name}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Designation</span>
            <p className="text-sm font-semibold text-amber-400">{role}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Account Type</span>
            <p className="text-xs font-mono text-emerald-400">
              {user?.is_admin ? '🛡️ Administrator Access' : '👤 Standard Team Access'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
