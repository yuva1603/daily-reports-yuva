const { supabase, mockStore } = require('../config/database');
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

    // Check Supabase first if available
    let user = null;
    if (supabase) {
      const { data } = await supabase
        .from('user_credentials')
        .select('*')
        .or(`email.ilike.${cleanTarget},phone_number.eq.${cleanPhoneDigits}`)
        .maybeSingle();
      if (data) {
        user = {
          id: data.id,
          name: data.full_name,
          email: data.email,
          phone: data.phone_number,
          role: data.role,
          is_admin: data.is_admin
        };
      }
    }

    // Fallback to mockStore
    if (!user) {
      user = mockStore.users.find(u => 
        u.email.toLowerCase() === cleanTarget ||
        (u.phone && u.phone.replace(/\D/g, '') === cleanPhoneDigits)
      );
    }

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
      otpPreview: otp, // Provides immediate code preview so user is never blocked
      message: `Verification code sent to ${target}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
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

    // Sync to Supabase user_credentials DB table
    if (supabase) {
      try {
        await supabase.from('user_credentials').upsert([{
          email: user.email,
          password: '[OTP Verified Session]',
          full_name: user.name,
          role: user.role,
          is_admin: user.is_admin,
          phone_number: user.phone || null,
          last_login_at: new Date().toISOString()
        }], { onConflict: 'email' });
      } catch (dbErr) {
        console.warn('Supabase sync notice on OTP verify:', dbErr.message);
      }
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, role, email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = mockStore.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      existingUser.password = password || existingUser.password;
    }

    const newUser = existingUser || {
      id: `usr-${Date.now()}`,
      name: name || email.split('@')[0],
      email: cleanEmail,
      password: password || '',
      role: role || 'Senior Engineer AI & Automation',
      is_admin: cleanEmail.includes('admin') || (role && role.toLowerCase().includes('admin')),
      created_at: new Date().toISOString()
    };

    if (!existingUser) {
      mockStore.users.push(newUser);
    }

    // 💾 Store Registration Details & Password into Supabase DB Table
    if (supabase) {
      try {
        await supabase.from('user_credentials').upsert([{
          username: cleanEmail.split('@')[0],
          name: newUser.name,
          full_name: newUser.name,
          email: cleanEmail,
          password: password || '******',
          role: newUser.role,
          is_admin: newUser.is_admin,
          last_login_at: new Date().toISOString()
        }], { onConflict: 'email' });
        console.log(`\n💾 [SUPABASE DB] Saved registration details for user: ${cleanEmail} (Name: ${newUser.name}, Role: ${newUser.role})\n`);
      } catch (dbErr) {
        console.warn('Supabase sync notice on register:', dbErr.message);
      }
    }

    res.json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = mockStore.users.find(u => u.email.toLowerCase() === cleanEmail);

    // If Supabase is connected, check credentials
    if (supabase) {
      try {
        const { data } = await supabase
          .from('user_credentials')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (data) {
          user = {
            id: data.id,
            name: data.name || data.full_name,
            email: data.email,
            password: data.password,
            role: data.role,
            is_admin: data.is_admin
          };
        }
      } catch (dbErr) {
        console.warn('Supabase login check notice:', dbErr.message);
      }
    }

    if (!user) {
      return res.status(404).json({
        error: `No registered account found with "${email}". Please click '+ Register' to register your account.`
      });
    }

    // Update password & last login in Supabase
    if (password) {
      user.password = password;
      if (supabase) {
        try {
          await supabase.from('user_credentials').upsert([{
            username: cleanEmail.split('@')[0],
            name: user.name,
            full_name: user.name,
            email: cleanEmail,
            password: password,
            role: user.role,
            is_admin: user.is_admin,
            last_login_at: new Date().toISOString()
          }], { onConflict: 'email' });
          console.log(`\n💾 [SUPABASE DB] Updated login credential for: ${cleanEmail}\n`);
        } catch (dbErr) {
          console.warn('Supabase update notice on login:', dbErr.message);
        }
      }
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
