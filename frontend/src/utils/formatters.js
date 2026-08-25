// Utility helpers for formatting messages and validating inputs

export function formatReportWhatsAppMessage(report, recipientName, user) {
  const authorName = report?.employeeName || report?.author_name || user?.name || 'Yuvaraj';
  const reportDate = report?.date || new Date().toISOString().split('T')[0];

  // If structured fields exist, use the exact clean format
  if (report?.completed !== undefined || report?.pending !== undefined || report?.issues !== undefined || report?.tomorrow !== undefined) {
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

  const authorRole = report?.author_role || user?.role || 'Senior Engineer AI & Automation';
  const reportType = report?.type || 'Daily Shift Report';
  const tagsText = Array.isArray(report?.tags) && report.tags.length > 0
    ? `\n🏷️ *Tags:* ${report.tags.join(', ')}`
    : '';
  const reportTime = report?.time || new Date().toTimeString().slice(0, 5);

  return `📊 *${reportType.toUpperCase()}*\n\n` +
    `👤 *Name:* ${authorName}\n` +
    `💼 *Role:* ${authorRole}\n` +
    `📅 *Date:* ${reportDate}\n` +
    `⏰ *Time:* ${reportTime}${tagsText}\n\n` +
    `📌 *Title:* ${report?.title || 'Daily Summary'}\n\n` +
    `📝 *Details & Notes:*\n${report?.content || ''}\n\n` +
    `---\nAutomated via Daily Reports Platform`;
}

export function openWhatsAppDirectly(phoneNumber, text) {
  const cleanPhone = (phoneNumber || '').replace(/\D/g, '');
  if (!cleanPhone) {
    alert('⚠️ Please set a recipient phone number first in the WhatsApp Recipient tab!');
    return false;
  }
  const url = `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(text)}&type=phone_number&app_absent=0`;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

export function isValidEmailAddress(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(str).trim());
}

export function isValidPhoneNumber(str) {
  const clean = String(str).replace(/[\s\-\(\)]/g, '');
  return /^\+?\d{8,15}$/.test(clean);
}
