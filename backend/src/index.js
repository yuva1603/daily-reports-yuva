// =============================================================================
// DAILY REPORTS AUTOMATION BACKEND (MVC ARCHITECTURE)
// Clean entry point: routes, middleware, and services
// =============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const { initWhatsApp } = require('./services/whatsappService');
const { scheduleUserReminders } = require('./services/reminderScheduler');

// Import Modular Routes
const authRoutes = require('./routes/authRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const recipientRoutes = require('./routes/recipientRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'daily-reports-backend-mvc'
  });
});

// Register Modular API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/recipient', recipientRoutes);
app.use('/api', settingsRoutes); // /api/settings & /api/profile
app.use('/api/admin', adminRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Server Startup
app.listen(PORT, async () => {
  console.log(`\n==================================================`);
  console.log(`🚀 DAILY REPORTS BACKEND (MVC ARCHITECTURE) RUNNING`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`==================================================\n`);

  // Start WhatsApp Client & Shift Reminder Scheduler
  initWhatsApp();
  await scheduleUserReminders('demo-user-id');
});

module.exports = app;
