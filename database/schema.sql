-- =============================================================================
-- DAILY REPORTS AUTOMATION APP - SUPABASE / POSTGRESQL SCHEMA
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Recipients Table
CREATE TABLE IF NOT EXISTS public.recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  telegram_chat_id TEXT,
  whatsapp_enabled BOOLEAN DEFAULT true,
  telegram_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Shift Settings Table
CREATE TABLE IF NOT EXISTS public.shift_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shift_start TIME NOT NULL DEFAULT '09:00',
  shift_end TIME NOT NULL DEFAULT '18:00',
  reminder_minutes_before INT DEFAULT 30,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_shift_settings UNIQUE(user_id)
);

-- 4. Report Reminders Table (Tracking log)
CREATE TABLE IF NOT EXISTS public.report_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  channel TEXT DEFAULT 'whatsapp', -- 'whatsapp', 'telegram'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_reminders ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Reports
CREATE POLICY "Users can manage their own reports"
  ON public.reports FOR ALL
  USING (auth.uid() = user_id);

-- Recipients
CREATE POLICY "Users can manage their own recipients"
  ON public.recipients FOR ALL
  USING (auth.uid() = user_id);

-- Shift Settings
CREATE POLICY "Users can manage their own shift settings"
  ON public.shift_settings FOR ALL
  USING (auth.uid() = user_id);

-- Report Reminders
CREATE POLICY "Users can view their own reminders"
  ON public.report_reminders FOR ALL
  USING (auth.uid() = user_id);

-- 7. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_reports_user_date ON public.reports(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_recipients_user ON public.recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON public.report_reminders(status, scheduled_time);
