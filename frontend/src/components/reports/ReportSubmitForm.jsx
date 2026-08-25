import React, { useState, useEffect } from 'react';
import { Send, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { Card, Button, Input, TextArea } from '../common';
import { reportsService } from '../../api/reportsService';
import { formatReportWhatsAppMessage, openWhatsAppDirectly } from '../../utils/formatters';

export const ReportSubmitForm = ({ user, profile, recipient, onReportSubmitted, onOpenWhatsAppModal }) => {
  const [employeeName, setEmployeeName] = useState(profile?.name || user?.name || '');
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Core structured report fields:
  const [completed, setCompleted] = useState('');
  const [pending, setPending] = useState('');
  const [issues, setIssues] = useState('None');
  const [tomorrow, setTomorrow] = useState('');

  const [loading, setLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  // Sync author name when user or profile changes
  useEffect(() => {
    const name = profile?.name || user?.name || user?.email?.split('@')[0] || '';
    if (name && !employeeName) {
      setEmployeeName(name);
    }
  }, [user, profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!completed.trim() && !pending.trim()) {
      return alert('⚠️ Please enter your completed or pending tasks.');
    }

    setLoading(true);
    setSuccessBanner('');
    try {
      const payload = {
        userId: user?.id || 'demo-user-id',
        employeeName: employeeName.trim() || profile?.name || user?.name || 'Employee',
        author_name: employeeName.trim() || profile?.name || user?.name || 'Employee',
        author_role: profile?.role || user?.role || 'Team Member',
        date: reportDate,
        completed: completed.trim() || 'None',
        pending: pending.trim() || 'None',
        issues: issues.trim() || 'None',
        tomorrow: tomorrow.trim() || 'None',
        recipientPhone: recipient?.phone_number || '',
        recipientName: recipient?.name || ''
      };

      const data = await reportsService.submitReport(payload);
      if (data.success) {
        setCompleted('');
        setPending('');
        setIssues('None');
        setTomorrow('');
        
        setSuccessBanner('✅ Daily report submitted and dispatched to recipient!');
        setTimeout(() => setSuccessBanner(''), 7000);

        if (onOpenWhatsAppModal) {
          const formattedText = `Daily Report\n\n` +
            `Employee: ${payload.employeeName}\n` +
            `Date: ${payload.date}\n\n` +
            `Completed:\n${payload.completed}\n\n` +
            `Pending:\n${payload.pending}\n\n` +
            `Issues:\n${payload.issues}\n\n` +
            `Tomorrow:\n${payload.tomorrow}`;

          onOpenWhatsAppModal({
            isOpen: true,
            report: data.report,
            text: formattedText,
            recipientName: recipient?.name || 'Manager',
            phoneNumber: recipient?.phone_number || ''
          });
        }

        onReportSubmitted();
      } else {
        alert(`Error submitting report: ${data.error}`);
      }
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-slate-800 bg-[#0a0d14]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-amber-400" />
            Submit Daily Report
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Enter your daily tasks and updates to dispatch to your recipient
          </p>
        </div>
        {recipient && (
          <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 self-start sm:self-auto">
            To: {recipient.name} ({recipient.phone_number})
          </span>
        )}
      </div>

      {successBanner && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          {successBanner}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Employee Name & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-xl bg-slate-950 border border-slate-800/90">
          <Input
            label="Employee Name"
            placeholder="e.g. Yuvaraj"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Report Date
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* 1. Completed Tasks */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Completed Tasks Today
          </label>
          <TextArea
            placeholder={`1. Completed assigned shift duties\n2. Resolved open tickets\n3. Equipment inspection`}
            value={completed}
            onChange={(e) => setCompleted(e.target.value)}
            rows={3}
          />
        </div>

        {/* 2. Pending Tasks */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
            Pending / In Progress Tasks
          </label>
          <TextArea
            placeholder={`1. Waiting for vendor approval\n2. Documentation in progress`}
            value={pending}
            onChange={(e) => setPending(e.target.value)}
            rows={2}
          />
        </div>

        {/* 3. Issues / Blockers */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider">
            Issues / Blockers
          </label>
          <TextArea
            placeholder="None (or describe any blockers encountered)"
            value={issues}
            onChange={(e) => setIssues(e.target.value)}
            rows={2}
          />
        </div>

        {/* 4. Plan for Tomorrow */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider">
            Plan for Tomorrow
          </label>
          <TextArea
            placeholder={`1. Resume pending task items\n2. Shift handover meeting`}
            value={tomorrow}
            onChange={(e) => setTomorrow(e.target.value)}
            rows={2}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full gap-2 text-sm font-bold py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20">
          <Send className="w-4 h-4" />
          {loading ? 'Submitting Report...' : 'Submit Daily Report 🚀'}
        </Button>
      </form>
    </Card>
  );
};


