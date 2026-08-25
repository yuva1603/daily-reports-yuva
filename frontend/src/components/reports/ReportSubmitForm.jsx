import React, { useState, useEffect } from 'react';
import {
  Send, Clock, CheckCircle, Code, Copy, Check, ExternalLink,
  Globe, Sparkles, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { Card, Button, Input, TextArea } from '../common';
import { reportsService } from '../../api/reportsService';
import { formatReportWhatsAppMessage, openWhatsAppDirectly } from '../../utils/formatters';

export const ReportSubmitForm = ({ user, profile, recipient, onReportSubmitted, onOpenWhatsAppModal }) => {
  const [employeeName, setEmployeeName] = useState(profile?.name || user?.name || '');
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Core Structured Fields matching n8n template:
  const [completed, setCompleted] = useState('');
  const [pending, setPending] = useState('');
  const [issues, setIssues] = useState('None');
  const [tomorrow, setTomorrow] = useState('');

  // Optional n8n Webhook URL configuration
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState(() => {
    return localStorage.getItem('n8n_webhook_url') || 'http://localhost:5678/webhook-test/ce875611-0f59-40da-8cc0-b3fbb54d6921';
  });
  const [showN8nConfig, setShowN8nConfig] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState(null);

  const [loading, setLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  // Sync author name when user or profile changes
  useEffect(() => {
    const name = profile?.name || user?.name || user?.email?.split('@')[0] || '';
    if (name && !employeeName) {
      setEmployeeName(name);
    }
  }, [user, profile]);

  // Persist n8n webhook URL
  const handleWebhookUrlChange = (val) => {
    setN8nWebhookUrl(val);
    localStorage.setItem('n8n_webhook_url', val);
  };

  // Generate current JSON object payload for n8n
  const generatedJsonPayload = {
    employeeName: employeeName.trim() || 'Employee',
    date: reportDate,
    completed: completed.trim() || '- None',
    pending: pending.trim() || '- None',
    issues: issues.trim() || 'None',
    tomorrow: tomorrow.trim() || '- None',
    recipientPhone: recipient?.phone_number || '',
    recipientName: recipient?.name || '',
    submittedAt: new Date().toISOString()
  };

  const jsonString = JSON.stringify(generatedJsonPayload, null, 2);

  const formattedWhatsAppPreview = `Daily Report\n\n` +
    `Employee: ${generatedJsonPayload.employeeName}\n` +
    `Date: ${generatedJsonPayload.date}\n\n` +
    `Completed:\n${generatedJsonPayload.completed}\n\n` +
    `Pending:\n${generatedJsonPayload.pending}\n\n` +
    `Issues:\n${generatedJsonPayload.issues}\n\n` +
    `Tomorrow:\n${generatedJsonPayload.tomorrow}`;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  const handleTestWebhook = async () => {
    if (!n8nWebhookUrl.trim()) {
      return alert('⚠️ Please enter your n8n Webhook URL first.');
    }
    setTestingWebhook(true);
    setWebhookStatus(null);
    try {
      const res = await fetch(n8nWebhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonString
      });
      if (res.ok) {
        setWebhookStatus({ success: true, message: `✅ Successfully received by n8n (Status: ${res.status})` });
      } else {
        setWebhookStatus({ success: false, message: `⚠️ n8n responded with status ${res.status}` });
      }
    } catch (err) {
      setWebhookStatus({ success: false, message: `❌ Failed to connect to n8n webhook: ${err.message}` });
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!completed.trim() && !pending.trim()) {
      return alert('⚠️ Please fill in at least the "Completed" or "Pending" tasks section.');
    }

    setLoading(true);
    setSuccessBanner('');
    setWebhookStatus(null);
    try {
      const payload = {
        userId: user?.id || 'demo-user-id',
        employeeName: employeeName.trim() || profile?.name || user?.name || 'Employee',
        author_name: employeeName.trim() || profile?.name || user?.name || 'Employee',
        author_role: profile?.role || user?.role || 'Team Member',
        date: reportDate,
        completed: completed.trim(),
        pending: pending.trim(),
        issues: issues.trim() || 'None',
        tomorrow: tomorrow.trim(),
        n8nWebhookUrl: n8nWebhookUrl.trim(),
        recipientPhone: recipient?.phone_number || '',
        recipientName: recipient?.name || ''
      };

      const data = await reportsService.submitReport(payload);
      if (data.success) {
        setCompleted('');
        setPending('');
        setIssues('None');
        setTomorrow('');
        
        let msg = '✅ Daily Report generated and saved successfully!';
        if (data.n8nResult?.success) {
          msg += ' Webhook dispatched to n8n 🚀';
        }
        setSuccessBanner(msg);
        setTimeout(() => setSuccessBanner(''), 7000);

        if (onOpenWhatsAppModal) {
          onOpenWhatsAppModal({
            isOpen: true,
            report: data.report,
            text: formattedWhatsAppPreview,
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
            Generates structured JSON for <span className="text-amber-400 font-semibold font-mono">n8n Webhook</span> &amp; WhatsApp dispatch
          </p>
        </div>
        {recipient && (
          <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 self-start sm:self-auto">
            Target: {recipient.name} ({recipient.phone_number})
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

        {/* 1. Completed Field */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>✅ Completed Tasks Today</span>
            <span className="text-slate-500 text-[11px] font-mono normal-case font-normal">($json.completed)</span>
          </label>
          <TextArea
            placeholder={`1. Completed authentication flow\n2. Built n8n webhook connector\n3. Tested WhatsApp notification`}
            value={completed}
            onChange={(e) => setCompleted(e.target.value)}
            rows={3}
          />
        </div>

        {/* 2. Pending Field */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>⏳ Pending / In Progress Tasks</span>
            <span className="text-slate-500 text-[11px] font-mono normal-case font-normal">($json.pending)</span>
          </label>
          <TextArea
            placeholder={`1. Waiting for API key approval\n2. Documentation review`}
            value={pending}
            onChange={(e) => setPending(e.target.value)}
            rows={2}
          />
        </div>

        {/* 3. Issues Field */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>⚠️ Issues / Blockers</span>
            <span className="text-slate-500 text-[11px] font-mono normal-case font-normal">($json.issues)</span>
          </label>
          <TextArea
            placeholder="None (or specify blockers encountered)"
            value={issues}
            onChange={(e) => setIssues(e.target.value)}
            rows={2}
          />
        </div>

        {/* 4. Tomorrow Field */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>🎯 Plan for Tomorrow</span>
            <span className="text-slate-500 text-[11px] font-mono normal-case font-normal">($json.tomorrow)</span>
          </label>
          <TextArea
            placeholder={`1. Deploy workflow to n8n cloud\n2. Verify WhatsApp delivery`}
            value={tomorrow}
            onChange={(e) => setTomorrow(e.target.value)}
            rows={2}
          />
        </div>

        {/* n8n Webhook Configuration Accordion */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <button
            type="button"
            onClick={() => setShowN8nConfig(!showN8nConfig)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-amber-400 transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>n8n Webhook URL Integration</span>
              {n8nWebhookUrl && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Configured
                </span>
              )}
            </span>
            {showN8nConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showN8nConfig && (
            <div className="mt-3 space-y-3 pt-3 border-t border-slate-800">
              <Input
                label="n8n Webhook POST URL"
                placeholder="e.g. https://your-n8n.instance.com/webhook/daily-report"
                value={n8nWebhookUrl}
                onChange={(e) => handleWebhookUrlChange(e.target.value)}
                hint="When submitting the report, this exact JSON will be posted automatically to your n8n webhook."
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={testingWebhook || !n8nWebhookUrl.trim()}
                  variant="secondary"
                  className="text-xs py-1.5"
                >
                  {testingWebhook ? 'Testing...' : 'Test Webhook Connection 🚀'}
                </Button>
              </div>
              {webhookStatus && (
                <p className={`text-xs font-semibold ${webhookStatus.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {webhookStatus.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Live n8n JSON Preview & Copy Accordion */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowJsonPreview(!showJsonPreview)}
              className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-amber-400 transition cursor-pointer"
            >
              <Code className="w-4 h-4 text-sky-400" />
              <span>Live Generated JSON (For n8n Webhook)</span>
              {showJsonPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleCopyJson}
              className="text-amber-400 hover:text-amber-300 text-xs font-mono flex items-center gap-1 cursor-pointer bg-slate-900 px-2 py-1 rounded-md border border-slate-700"
            >
              {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedJson ? 'Copied JSON!' : 'Copy JSON'}
            </button>
          </div>

          {showJsonPreview && (
            <div className="mt-3 space-y-2 pt-2 border-t border-slate-800">
              <pre className="p-3 rounded-lg bg-[#05070a] border border-slate-800 text-amber-300/90 font-mono text-[11px] overflow-x-auto whitespace-pre leading-relaxed">
                {jsonString}
              </pre>
              <p className="text-[11px] text-slate-400">
                💡 In n8n WhatsApp node or Set node, you can directly access fields using:
                <code className="text-amber-400 ml-1">{`{{ $json.employeeName }}`}, {`{{ $json.completed }}`}, {`{{ $json.pending }}`}, {`{{ $json.issues }}`}, {`{{ $json.tomorrow }}`}</code>
              </p>
            </div>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full gap-2 text-sm font-bold py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20">
          <Send className="w-4 h-4" />
          {loading ? 'Generating JSON & Submitting...' : 'Submit Report & Dispatch to n8n / WhatsApp 🚀'}
        </Button>
      </form>
    </Card>
  );
};

