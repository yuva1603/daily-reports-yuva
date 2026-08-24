-- =============================================================================
-- DAILY REPORTS AUTOMATION APP - SUPABASE / POSTGRESQL SCHEMA
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. Profiles Table (User details & custom usernames)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  auth_provider TEXT DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_reminders ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

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

-- 7. Automatic New User Profile Trigger (Supports Google OAuth & Email Signups)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, auth_provider)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'preferred_username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_app_meta_data->>'provider'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_reports_user_date ON public.reports(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_recipients_user ON public.recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON public.report_reminders(status, scheduled_time);

