#!/usr/bin/env node

/**
 * Model Context Protocol (MCP) Server for Hosted Daily Reports App
 * Connects directly to https://daily-reports-yuva.onrender.com over HTTPS
 */

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');

const CLOUD_API_BASE = process.env.DAILY_REPORTS_CLOUD_URL || 'https://daily-reports-yuva.onrender.com';

const server = new McpServer({
  name: 'daily-reports-cloud',
  version: '1.0.0'
});

// Tool 1: Submit Daily Report to Hosted App
server.tool(
  'submit_daily_report',
  'Submits a structured daily shift report to the hosted Daily Reports app and triggers recipient dispatch',
  {
    employeeName: z.string().describe('Name of the employee submitting the report'),
    completed: z.string().describe('Tasks completed today (bulleted or multi-line text)'),
    pending: z.string().describe('Pending / in-progress tasks'),
    issues: z.string().optional().default('None').describe('Blockers or issues encountered'),
    tomorrow: z.string().describe('Plan and key priorities for tomorrow'),
    date: z.string().optional().describe('Report date in YYYY-MM-DD format (defaults to today)'),
    recipientPhone: z.string().optional().describe('Recipient WhatsApp number with country code')
  },
  async ({ employeeName, completed, pending, issues, tomorrow, date, recipientPhone }) => {
    const reportDate = date || new Date().toISOString().split('T')[0];
    const formattedContent = `Daily Report\n\n` +
      `Employee: ${employeeName}\n` +
      `Date: ${reportDate}\n\n` +
      `Completed:\n${completed}\n\n` +
      `Pending:\n${pending}\n\n` +
      `Issues:\n${issues || 'None'}\n\n` +
      `Tomorrow:\n${tomorrow}`;

    const payload = {
      userId: 'demo-user-id',
      author_name: employeeName,
      employeeName,
      title: `Daily Report - ${employeeName} (${reportDate})`,
      content: formattedContent,
      completed,
      pending,
      issues: issues || 'None',
      tomorrow,
      date: reportDate,
      recipientPhone: recipientPhone || ''
    };

    try {
      const response = await fetch(`${CLOUD_API_BASE}/api/reports/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: response.ok ? 'success' : 'error',
              cloudApi: CLOUD_API_BASE,
              data: result
            }, null, 2)
          }
        ]
      };
    } catch (err) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ status: 'failed', error: err.message }, null, 2)
          }
        ],
        isError: true
      };
    }
  }
);

// Tool 2: Get Recent Reports from Hosted App
server.tool(
  'get_daily_reports',
  'Retrieves submitted daily reports from the hosted cloud database',
  {
    userId: z.string().optional().default('demo-user-id').describe('User ID to filter reports')
  },
  async ({ userId }) => {
    try {
      const response = await fetch(`${CLOUD_API_BASE}/api/reports?userId=${encodeURIComponent(userId)}`);
      const reports = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ count: reports.length, reports }, null, 2)
          }
        ]
      };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error fetching reports: ${err.message}` }],
        isError: true
      };
    }
  }
);

// Tool 3: Get Admin Dashboard Stats from Hosted App
server.tool(
  'get_admin_stats',
  'Fetches platform metrics, total reports, and today submission stats from the hosted app',
  {},
  async () => {
    try {
      const response = await fetch(`${CLOUD_API_BASE}/api/admin/stats`);
      const stats = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(stats, null, 2)
          }
        ]
      };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error fetching stats: ${err.message}` }],
        isError: true
      };
    }
  }
);

// Tool 4: Check Hosted Cloud Server Health
server.tool(
  'check_cloud_health',
  'Checks the live status and responsiveness of the hosted Render application',
  {},
  async () => {
    try {
      const response = await fetch(`${CLOUD_API_BASE}/health`);
      const data = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              url: CLOUD_API_BASE,
              status: response.status,
              health: data
            }, null, 2)
          }
        ]
      };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Cloud server unreachable: ${err.message}` }],
        isError: true
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`🚀 Daily Reports Cloud MCP Server connected to ${CLOUD_API_BASE}`);
}

main().catch((err) => {
  console.error('Fatal MCP Server Error:', err);
  process.exit(1);
});
