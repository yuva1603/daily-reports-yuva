const { supabase, mockStore, isValidUUID } = require('../config/database');
const { getSingleRecipient } = require('../services/reminderScheduler');
const { sendWhatsAppMessage } = require('../services/whatsappService');

function formatReportText(report, recipientName) {
  const authorName = report.author_name || 'Yuvaraj';
  const authorRole = report.author_role || 'Senior Engineer AI & Automation';
  const reportType = report.type || 'Daily Shift Report';
  const tagsText = Array.isArray(report.tags) && report.tags.length > 0
    ? `\n🏷️ *Tags:* ${report.tags.join(', ')}`
    : '';

  return `📊 *${reportType.toUpperCase()}*\n\n` +
    `👤 *Name:* ${authorName}\n` +
    `💼 *Role:* ${authorRole}\n` +
    `📅 *Date:* ${report.date}\n` +
    `⏰ *Time:* ${report.time || '18:00'}${tagsText}\n\n` +
    `📌 *Title:* ${report.title}\n\n` +
    `📝 *Details & Notes:*\n${report.content}\n\n` +
    `---\nAutomated via Daily Reports Platform`;
}

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
    const { userId, title, content, tags, type, date, time, author_name, author_role } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const reportObj = {
      id: `rep-${Date.now()}`,
      user_id: userId || 'demo-user-id',
      type: type || 'Daily Shift Report',
      author_name: author_name || 'Yuvaraj',
      author_role: author_role || 'Senior Engineer AI & Automation',
      title,
      content,
      tags: Array.isArray(tags) ? tags : [],
      date: date || new Date().toISOString().split('T')[0],
      time: time || new Date().toTimeString().slice(0, 5),
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

    // WhatsApp dispatch to recipient if configured
    const recipient = await getSingleRecipient(userId);
    let dispatchResult = null;

    if (recipient && recipient.whatsapp_enabled && recipient.phone_number) {
      const messageText = formatReportText(reportObj, recipient.name);
      dispatchResult = await sendWhatsAppMessage(recipient.phone_number, messageText);
    }

    res.json({
      success: true,
      report: reportObj,
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
