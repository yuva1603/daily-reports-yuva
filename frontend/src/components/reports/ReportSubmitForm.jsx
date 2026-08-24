import React, { useState } from 'react';
import { Send, Clock } from 'lucide-react';
import { Card, Button, Input, TextArea } from '../common';
import { reportsService } from '../../api/reportsService';
import { formatReportWhatsAppMessage, openWhatsAppDirectly } from '../../utils/formatters';

export const ReportSubmitForm = ({ user, profile, recipient, onReportSubmitted, onOpenWhatsAppModal }) => {
  const [reportAuthorName, setReportAuthorName] = useState(profile?.name || user?.name || 'Yuvaraj');
  const [reportAuthorRole, setReportAuthorRole] = useState(profile?.role || user?.role || 'Senior Engineer AI & Automation');
  const [reportType, setReportType] = useState('Daily Shift Report');
  const [shiftName, setShiftName] = useState('Flexible / General Hours (Optional)');
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reportTime, setReportTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('production, maintenance');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      return alert('⚠️ Please enter both report title and details.');
    }

    setLoading(true);
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const payload = {
        userId: user?.id || 'demo-user-id',
        author_name: reportAuthorName.trim() || profile?.name || 'Yuvaraj',
        author_role: reportAuthorRole.trim() || profile?.role || 'Senior Engineer AI & Automation',
        type: reportType,
        shift: shiftName,
        date: reportDate,
        time: reportTime,
        title: title.trim(),
        content: content.trim(),
        tags
      };

      const data = await reportsService.submitReport(payload);
      if (data.success) {
        const reportData = data.report || { id: `rep-${Date.now()}`, ...payload };
        const formattedText = formatReportWhatsAppMessage(reportData, recipient?.name, {
          name: reportAuthorName.trim() || profile?.name,
          role: reportAuthorRole.trim() || profile?.role
        });

        // Open WhatsApp Modal
        onOpenWhatsAppModal({
          isOpen: true,
          report: reportData,
          text: formattedText,
          recipientName: recipient?.name || 'Recipient',
          phoneNumber: recipient?.phone_number || ''
        });

        // Launch WhatsApp directly
        if (recipient?.phone_number) {
          openWhatsAppDirectly(recipient.phone_number, formattedText);
        }

        setTitle('');
        setContent('');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-amber-400" />
            Submit Report
          </h2>
          <p className="text-xs text-amber-400/90 mt-0.5">
            Submitting as: <strong>{reportAuthorName}</strong> • <em>{reportAuthorRole}</em>
          </p>
        </div>
        {recipient && (
          <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 self-start sm:self-auto">
            To: {recipient.name} ({recipient.phone_number})
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dynamic Author Name & Role (Editable Per Report) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-xl bg-slate-950 border border-slate-800/90">
          <Input
            label="Reporting Person Name"
            placeholder="e.g. Yuvaraj"
            value={reportAuthorName}
            onChange={(e) => setReportAuthorName(e.target.value)}
          />
          <Input
            label="Job Role / Title (Editable)"
            placeholder="e.g. Senior Engineer AI & Automation"
            value={reportAuthorRole}
            onChange={(e) => setReportAuthorRole(e.target.value)}
            hint="You can modify your role per report"
          />
        </div>

        {/* Report Type & Optional Shift Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Report Category
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="Daily Shift Report">Daily Shift Report</option>
              <option value="Production Report">Production Report</option>
              <option value="Maintenance Report">Maintenance Report</option>
              <option value="Quality & Inspection Report">Quality & Inspection Report</option>
              <option value="Handover Summary">Handover Summary</option>
              <option value="Incident & Blocker Report">Incident & Blocker Report</option>
              <option value="End of Day Summary">End of Day Summary</option>
              <option value="General Task Update">General Task Update</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Shift Window <span className="text-amber-400 font-normal lowercase">(optional)</span>
            </label>
            <select
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="Flexible / General Hours (Optional)">Flexible / General Hours (No Shift)</option>
              <option value="Morning Shift (1st Shift)">Morning Shift (1st Shift)</option>
              <option value="Afternoon Shift (2nd Shift)">Afternoon Shift (2nd Shift)</option>
              <option value="Night Shift (3rd Shift)">Night Shift (3rd Shift)</option>
              <option value="General Day Shift (09:00 - 18:00)">General Day Shift (09:00 - 18:00)</option>
            </select>
          </div>
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Report Time
            </label>
            <input
              type="time"
              value={reportTime}
              onChange={(e) => setReportTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <Input
          label="Report Title"
          placeholder="e.g. Morning Shift Production & Equipment Status"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextArea
          label="Report Details & Summary"
          placeholder="Key accomplishments, equipment maintenance, bottlenecks, actions taken, and handovers..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
        />

        <Input
          label="Tags (Comma-separated)"
          placeholder="production, line-1, maintenance, handover"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />

        <Button type="submit" disabled={loading} className="w-full gap-2">
          <Send className="w-4 h-4" />
          {loading ? 'Submitting & Dispatching...' : 'Submit Report & Dispatch to WhatsApp 🚀'}
        </Button>
      </form>
    </Card>
  );
};
