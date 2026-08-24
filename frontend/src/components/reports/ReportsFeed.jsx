import React from 'react';
import { FileText, Clock, Trash2, ExternalLink } from 'lucide-react';
import { Card, Button, Badge } from '../common';
import { reportsService } from '../../api/reportsService';
import { formatReportWhatsAppMessage, openWhatsAppDirectly } from '../../utils/formatters';

export const ReportsFeed = ({ reports, user, profile, recipient, onReportDeleted, onOpenWhatsAppModal }) => {
  const handleDelete = async (reportId) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      await reportsService.deleteReport(reportId, user?.id);
      onReportDeleted();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleResend = (report) => {
    const formatted = formatReportWhatsAppMessage(report, recipient?.name, profile);
    onOpenWhatsAppModal({
      isOpen: true,
      report,
      text: formatted,
      recipientName: recipient?.name || 'Recipient',
      phoneNumber: recipient?.phone_number || ''
    });
    if (recipient?.phone_number) {
      openWhatsAppDirectly(recipient.phone_number, formatted);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          Recent Shift Reports ({reports.length})
        </h2>
      </div>

      {reports.length === 0 ? (
        <Card className="text-center py-12 text-slate-500 border border-dashed border-slate-800 bg-[#0a0d14]">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium text-slate-400">No shift reports submitted yet.</p>
          <p className="text-xs text-slate-400 mt-1">Submit your first report using the form on the left.</p>
        </Card>
      ) : (
        <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
          {reports.map((report) => {
            const author = report.author_name || user?.name || 'Yuvaraj';
            const role = report.author_role || user?.role || 'Senior Engineer AI & Automation';

            return (
              <Card key={report.id} className="space-y-3 hover:border-amber-500/30 transition-all border border-slate-800 bg-[#0a0d14]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/80 pb-2">
                  <div>
                    <h3 className="font-bold text-white text-sm">{report.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium mt-0.5">
                      <span>👤 {author}</span>
                      <span>•</span>
                      <span className="text-slate-400">{role}</span>
                    </div>
                  </div>
                  <Badge variant="amber">{report.type || 'Daily Shift Report'}</Badge>
                </div>

                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {report.content}
                </p>

                {report.tags && report.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {report.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {report.date || new Date().toISOString().split('T')[0]} at {report.time || '18:00'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResend(report)}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition cursor-pointer"
                      title="Resend this report via WhatsApp"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="text-slate-400 hover:text-red-400 transition cursor-pointer p-1"
                      title="Delete report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
