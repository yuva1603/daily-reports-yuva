const { supabase, mockStore, isValidUUID } = require('../config/database');

exports.getRecipient = async (req, res) => {
  try {
    const { userId } = req.query;
    if (supabase && isValidUUID(userId)) {
      const { data, error } = await supabase
        .from('recipients')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return res.json(data || null);
    }
    res.json(mockStore.recipient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.saveRecipient = async (req, res) => {
  try {
    const { userId, name, phone_number, whatsapp_enabled } = req.body;
    if (!name || !phone_number) {
      return res.status(400).json({ error: 'Name and phone number are required' });
    }

    const recipientObj = {
      name,
      phone_number: phone_number.replace(/\D/g, ''),
      whatsapp_enabled: whatsapp_enabled !== undefined ? whatsapp_enabled : true,
      updated_at: new Date().toISOString()
    };

    if (supabase && isValidUUID(userId)) {
      const { data, error } = await supabase
        .from('recipients')
        .upsert([{ user_id: userId, ...recipientObj }], { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, recipient: data });
    }

    mockStore.recipient = { user_id: userId || 'demo-user-id', ...recipientObj };
    res.json({ success: true, recipient: mockStore.recipient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearRecipient = async (req, res) => {
  try {
    const { userId } = req.query;
    if (supabase && isValidUUID(userId)) {
      await supabase.from('recipients').delete().eq('user_id', userId);
    } else {
      mockStore.recipient = null;
    }
    res.json({ success: true, message: 'Recipient cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
