const { supabase, mockStore, isValidUUID } = require('../config/database');

exports.getRecipient = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.json(null);
    }

    if (supabase && isValidUUID(userId)) {
      const { data, error } = await supabase
        .from('recipients')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return res.json(data || null);
    }

    // In-memory isolated lookup by userId
    const userRecipient = mockStore.recipients[userId] || null;
    res.json(userRecipient);
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
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const recipientObj = {
      user_id: userId,
      name: name.trim(),
      phone_number: phone_number.replace(/\D/g, ''),
      whatsapp_enabled: whatsapp_enabled !== undefined ? whatsapp_enabled : true,
      updated_at: new Date().toISOString()
    };

    if (supabase && isValidUUID(userId)) {
      const { data, error } = await supabase
        .from('recipients')
        .upsert([recipientObj], { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, recipient: data });
    }

    // In-memory isolated storage by userId
    mockStore.recipients[userId] = recipientObj;
    res.json({ success: true, recipient: recipientObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearRecipient = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.json({ success: true, message: 'No recipient to clear' });
    }

    if (supabase && isValidUUID(userId)) {
      await supabase.from('recipients').delete().eq('user_id', userId);
    } else {
      delete mockStore.recipients[userId];
    }
    res.json({ success: true, message: 'Recipient cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
