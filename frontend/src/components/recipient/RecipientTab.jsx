import React, { useState, useEffect } from 'react';
import { Users, Trash2, Smartphone } from 'lucide-react';
import { Card, Button, Input } from '../common';
import { recipientService } from '../../api/recipientService';

export const RecipientTab = ({ recipient, user, onRecipientUpdated }) => {
  const [name, setName] = useState(recipient?.name || '');
  const [phone, setPhone] = useState(recipient?.phone_number || '');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(recipient?.name || '');
    setPhone(recipient?.phone_number || '');
  }, [recipient]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      return alert('⚠️ Please enter recipient name and WhatsApp number.');
    }

    setLoading(true);
    try {
      const data = await recipientService.saveRecipient(user?.id, name.trim(), phone.trim());
      if (data.success) {
        setMsg('✅ WhatsApp recipient saved successfully!');
        setTimeout(() => setMsg(''), 4000);
        onRecipientUpdated(data.recipient);
      } else {
        alert(`Save failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`Error saving recipient: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Remove the current WhatsApp recipient?')) return;
    try {
      await recipientService.clearRecipient(user?.id);
      setName('');
      setPhone('');
      onRecipientUpdated(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border border-slate-800 bg-[#0a0d14] space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            WhatsApp Delivery Recipient
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure the recipient phone number where reports and shift reminders will be sent.
          </p>
        </div>

        {msg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
            {msg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Recipient Name / Designation"
            placeholder="e.g. Operations Manager / Plant Lead"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="WhatsApp Number (with country code)"
            placeholder="e.g. +917358859792 or 917358859792"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            hint="Include country code (e.g. +91 for India, +1 for USA)"
          />

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save Recipient Details'}
            </Button>
            {recipient && (
              <Button type="button" onClick={handleClear} variant="danger">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card className="border border-slate-800 bg-[#0a0d14] space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-amber-400" />
          Active WhatsApp Recipient Preview
        </h3>

        {recipient ? (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Status</span>
              <span className="text-xs text-emerald-400 font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30">
                Active & Connected
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-400">Recipient Name</p>
              <p className="text-base font-bold text-white">{recipient.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">WhatsApp Number</p>
              <p className="text-sm font-mono text-amber-400">{recipient.phone_number}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm text-slate-400 font-medium">No recipient configured yet.</p>
            <p className="text-xs text-slate-400 mt-1">Fill in the form on the left to set your default recipient.</p>
          </div>
        )}
      </Card>
    </div>
  );
};
