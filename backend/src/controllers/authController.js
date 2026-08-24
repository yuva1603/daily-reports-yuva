const { mockStore } = require('../config/database');
const { sendWhatsAppMessage } = require('../services/whatsappService');

const otpStore = {};

exports.sendOtp = async (req, res) => {
  try {
    const { identifier, phone, email } = req.body;
    const target = (identifier || phone || email || '').trim();
    if (!target) {
      return res.status(400).json({ error: 'Mobile phone number or email is required' });
    }

    const cleanTarget = target.toLowerCase();
    const cleanPhoneDigits = target.replace(/\D/g, '');

    // Require registered account
    const user = mockStore.users.find(u => 
      u.email.toLowerCase() === cleanTarget ||
      (u.phone && u.phone.replace(/\D/g, '') === cleanPhoneDigits)
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `No registered account found for "${target}". Please check your email or click '+ Register' to create your account.`
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[cleanTarget] = {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    };

    const isPhone = !target.includes('@') && cleanPhoneDigits.length >= 8;
    let sentToWhatsApp = false;

    if (isPhone || phone) {
      const cleanPhone = (phone || target).replace(/\s+/g, '');
      const waMsg = `🔐 *Daily Reports Hub Login Code*\n\nYour verification code is: *${otp}*\n\n⏱️ This code is valid for 10 minutes. Do not share it with anyone.`;
      const waRes = await sendWhatsAppMessage(cleanPhone, waMsg);
      sentToWhatsApp = waRes?.success && !waRes?.mock;
      console.log(`\n📱 [MOBILE/WHATSAPP AUTH] Sent OTP code to ${cleanPhone}: [ ${otp} ]\n`);
    } else {
      console.log(`\n📧 [EMAIL AUTH] Sent OTP code to ${cleanTarget}: [ ${otp} ]\n`);
    }

    res.json({
      success: true,
      sentTo: target,
      sentViaWhatsApp: sentToWhatsApp,
      message: `Verification code sent to ${target}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyOtp = (req, res) => {
  try {
    const { identifier, email, phone, otp, name, role } = req.body;
    const target = (identifier || phone || email || '').trim().toLowerCase();
    if (!target || !otp) {
      return res.status(400).json({ error: 'Mobile / Email and verification code are required' });
    }

    const record = otpStore[target];
    if (!record || record.code !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid verification code. Please check your code and try again.' });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[target];
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    delete otpStore[target];

    let user = mockStore.users.find(u => u.email.toLowerCase() === target || u.phone === target);
    if (!user) {
      user = {
        id: `usr-${Date.now()}`,
        name: name || (target.includes('@') ? target.split('@')[0] : 'Engineer'),
        email: target.includes('@') ? target : `${target.replace(/\D/g, '')}@mobile.user`,
        phone: !target.includes('@') ? target : undefined,
        role: role || (target.includes('admin') ? 'Operations Admin' : 'Senior Engineer AI & Automation'),
        is_admin: target.includes('admin'),
        created_at: new Date().toISOString()
      };
      mockStore.users.push(user);
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.register = (req, res) => {
  try {
    const { name, role, email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existingUser = mockStore.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: name || email.split('@')[0],
      email: email.trim().toLowerCase(),
      role: role || 'Senior Engineer AI & Automation',
      is_admin: email.toLowerCase().includes('admin') || (role && role.toLowerCase().includes('admin')),
      created_at: new Date().toISOString()
    };

    mockStore.users.push(newUser);
    res.json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = mockStore.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(404).json({
        error: `No registered account found with "${email}". Please click '+ Register' to register your account.`
      });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
