const axios = require('axios');
const { supabase, mockStore, isValidUUID } = require('../config/database');
const { getSingleRecipient } = require('../services/reminderScheduler');
const { sendWhatsAppMessage } = require('../services/whatsappService');

function formatReportText(report, recipientName) {
  const authorName = report.employeeName || report.author_name || 'Yuvaraj';
  const reportDate = report.date || new Date().toISOString().split('T')[0];

  // If structured fields are provided, format with exact requested n8n WhatsApp template
  if (report.completed !== undefined || report.pending !== undefined || report.issues !== undefined || report.tomorrow !== undefined) {
    const completed = (report.completed || '').trim() || '- None';
    const pending = (report.pending || '').trim() || '- None';
    const issues = (report.issues || '').trim() || 'None';
    const tomorrow = (report.tomorrow || '').trim() || '- None';

    return `Daily Report\n\n` +
      `Employee: ${authorName}\n` +
      `Date: ${reportDate}\n\n` +
      `Completed:\n${completed}\n\n` +
      `Pending:\n${pending}\n\n` +
      `Issues:\n${issues}\n\n` +
      `Tomorrow:\n${tomorrow}`;
  }

  // Fallback for generic content format
  const authorRole = report.author_role || 'Senior Engineer AI & Automation';
  const reportType = report.type || 'Daily Shift Report';
  const tagsText = Array.isArray(report.tags) && report.tags.length > 0
    ? `\n🏷️ *Tags:* ${report.tags.join(', ')}`
    : '';

  return `📊 *${reportType.toUpperCase()}*\n\n` +
    `👤 *Name:* ${authorName}\n` +
    `💼 *Role:* ${authorRole}\n` +
    `📅 *Date:* ${reportDate}\n` +
    `⏰ *Time:* ${report.time || '18:00'}${tagsText}\n\n` +
    `📌 *Title:* ${report.title || 'Daily Update'}\n\n` +
    `📝 *Details & Notes:*\n${report.content || ''}\n\n` +
    `---\nAutomated via Daily Reports Platform`;
}

exports.formatReportText = formatReportText;

exports.getReports = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.json([]);
    }

    if (supabase && isValidUUID(userId)) {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json(data || []);
    }

    // Isolate by userId strictly
    const filtered = mockStore.reports.filter(r => r.user_id === userId);
    res.json(filtered.slice().reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitReport = async (req, res) => {
  try {
    const {
      userId,
      employeeName,
      author_name,
      author_role,
      date,
      time,
      type,
      shift,
      title,
      content,
      completed,
      pending,
      issues,
      tomorrow,
      tags,
      n8nWebhookUrl
    } = req.body;

    const finalEmployeeName = (employeeName || author_name || 'Yuvaraj').trim();
    const finalDate = date || new Date().toISOString().split('T')[0];
    const finalTime = time || new Date().toTimeString().slice(0, 5);

    // Build structured text or content
    let finalContent = content;
    if (!finalContent && (completed || pending || issues || tomorrow)) {
      finalContent = `Completed:\n${completed || 'None'}\n\nPending:\n${pending || 'None'}\n\nIssues:\n${issues || 'None'}\n\nTomorrow:\n${tomorrow || 'None'}`;
    }

    const finalTitle = title ? title.trim() : `Daily Report - ${finalEmployeeName} (${finalDate})`;

    if (!finalContent && !completed && !pending) {
      return res.status(400).json({ error: 'Report details or completed tasks are required' });
    }

    const reportObj = {
      id: `rep-${Date.now()}`,
      user_id: userId || 'demo-user-id',
      employeeName: finalEmployeeName,
      author_name: finalEmployeeName,
      author_role: author_role || 'Senior Engineer AI & Automation',
      type: type || 'Daily Shift Report',
      shift: shift || 'General',
      title: finalTitle,
      content: finalContent,
      completed: completed || '',
      pending: pending || '',
      issues: issues || '',
      tomorrow: tomorrow || '',
      tags: Array.isArray(tags) ? tags : [],
      date: finalDate,
      time: finalTime,
      created_at: new Date().toISOString()
    };

    if (supabase && isValidUUID(reportObj.user_id)) {
      const { data, error } = await supabase
        .from('reports')
        .insert([{
          user_id: reportObj.user_id,
          title: reportObj.title,
          content: reportObj.content,
          tags: reportObj.tags,
          date: reportObj.date
        }])
        .select()
        .single();

      if (error) throw error;
      reportObj.id = data.id;
    } else {
      mockStore.reports.push(reportObj);
    }

    // Get recipient if configured
    const recipient = await getSingleRecipient(userId);

    // Formatted WhatsApp message string
    const formattedMessage = formatReportText(reportObj, recipient?.name);

    // Standard n8n JSON payload
    const n8nPayload = {
      employeeName: finalEmployeeName,
      date: finalDate,
      completed: reportObj.completed,
      pending: reportObj.pending,
      issues: reportObj.issues,
      tomorrow: reportObj.tomorrow,
      title: finalTitle,
      formattedMessage,
      tags: reportObj.tags,
      recipientPhone: recipient?.phone_number || req.body.recipientPhone || '',
      recipientName: recipient?.name || req.body.recipientName || '',
      submittedAt: new Date().toISOString()
    };

    // Forward to n8n Webhook URL if provided in request or environment
    let n8nResult = null;
    const webhookUrl = n8nWebhookUrl || process.env.N8N_WEBHOOK_URL;
    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        console.log(`📡 Forwarding report JSON to n8n webhook: ${webhookUrl}`);
        const n8nResponse = await axios.post(webhookUrl, n8nPayload, {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        });
        n8nResult = {
          success: true,
          status: n8nResponse.status,
          data: n8nResponse.data
        };
      } catch (webhookErr) {
        console.error('⚠️ n8n webhook forwarding error:', webhookErr.message);
        n8nResult = {
          success: false,
          error: webhookErr.message
        };
      }
    }

    // WhatsApp dispatch to recipient if enabled
    let dispatchResult = null;
    if (recipient && recipient.whatsapp_enabled && recipient.phone_number) {
      dispatchResult = await sendWhatsAppMessage(recipient.phone_number, formattedMessage);
    }

    res.json({
      success: true,
      report: reportObj,
      n8nPayload,
      n8nResult,
      recipient: recipient ? { name: recipient.name, phone: recipient.phone_number } : null,
      whatsapp: dispatchResult
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (supabase && isValidUUID(id)) {
      const { error } = await supabase.from('reports').delete().eq('id', id);
      if (error) throw error;
    } else {
      mockStore.reports = mockStore.reports.filter(r => r.id !== id);
    }

    res.json({ success: true, message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
