# n8n Webhook & WhatsApp Integration Guide

This directory contains ready-to-import n8n workflows for receiving Daily Reports via Webhook and dispatching them to WhatsApp.

---

## 1. JSON Payload Format (Sent to n8n Webhook)

When you submit a report from the app or send via the webhook connector, the app generates and POSTs this JSON structure:

```json
{
  "employeeName": "Yuvaraj",
  "date": "2026-08-25",
  "completed": "1. Finished authentication integration\n2. Tested n8n webhook connection\n3. Automated WhatsApp message dispatch",
  "pending": "1. Review code pull request\n2. Documentation update",
  "issues": "None",
  "tomorrow": "1. Deploy to cloud staging server\n2. Perform end-to-end testing",
  "title": "Daily Report - Yuvaraj (2026-08-25)",
  "formattedMessage": "Daily Report\n\nEmployee: Yuvaraj\nDate: 2026-08-25\n\nCompleted:\n1. Finished authentication integration\n2. Tested n8n webhook connection\n3. Automated WhatsApp message dispatch\n\nPending:\n1. Review code pull request\n2. Documentation update\n\nIssues:\nNone\n\nTomorrow:\n1. Deploy to cloud staging server\n2. Perform end-to-end testing",
  "recipientPhone": "917358859792",
  "recipientName": "Operations Lead",
  "submittedAt": "2026-08-25T07:00:00.000Z"
}
```

---

## 2. WhatsApp Message Format Template in n8n

In n8n, you can access the variables with expressions using `{{ $json.fieldName }}`:

```text
Daily Report

Employee: {{ $json.employeeName }}
Date: {{ $json.date }}

Completed:
{{ $json.completed }}

Pending:
{{ $json.pending }}

Issues:
{{ $json.issues }}

Tomorrow:
{{ $json.tomorrow }}
```

---

## 3. How to Import the Workflow in n8n

1. Open your **n8n instance** (e.g. `http://localhost:5678` or your n8n cloud dashboard).
2. Click **Add Workflow** (`+` button) or **Workflows** → **Import from File**.
3. Select [`n8n-workflows/daily-report-webhook-whatsapp.json`](file:///c:/Users/Yuva/Yuva%20Daily%20Reports%20Self%20version/daily-reports-yuva-main/n8n-workflows/daily-report-webhook-whatsapp.json).
4. Double-click the **n8n Webhook Trigger** node to copy your **Test URL** or **Production URL**:
   - `http://localhost:5678/webhook-test/daily-report` (for testing)
   - `http://localhost:5678/webhook/daily-report` (for production)
5. In the Daily Reports web app, paste the URL under **"n8n Webhook URL Integration"** and click **Test Webhook Connection 🚀**.
6. Activate the workflow toggle in n8n (switch to **Active**).
