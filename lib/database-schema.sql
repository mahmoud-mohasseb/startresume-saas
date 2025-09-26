-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Clerk user data)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  preview_url TEXT,
  html_template TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumes table
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  html_content TEXT NOT NULL,
  json_content JSONB,
  template_id UUID REFERENCES templates(id),
  theme_color TEXT DEFAULT '#3b82f6',
  profile_picture_url TEXT,
  ats_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cover letters table
CREATE TABLE cover_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  html_content TEXT NOT NULL,
  json_content JSONB,
  job_title TEXT,
  company_name TEXT,
  job_description TEXT,
  theme_color TEXT DEFAULT '#3B82F6',
  template_type TEXT DEFAULT 'professional',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview sessions table
CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  experience_level TEXT NOT NULL CHECK (experience_level IN ('entry', 'mid', 'senior')),
  questions JSONB NOT NULL,
  answers JSONB NOT NULL,
  overall_score INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'basic', 'standard', 'pro')),
  credits INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'inactive')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mock interviews table
CREATE TABLE mock_interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  questions JSONB NOT NULL,
  responses JSONB,
  score NUMERIC,
  feedback JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_created_at ON resumes(created_at DESC);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_mock_interviews_user_id ON mock_interviews(user_id);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

CREATE INDEX idx_cover_letters_user_id ON cover_letters(user_id);
CREATE INDEX idx_cover_letters_created_at ON cover_letters(created_at DESC);
CREATE INDEX idx_cover_letters_updated_at ON cover_letters(updated_at DESC);

CREATE INDEX idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX idx_interview_sessions_created_at ON interview_sessions(created_at DESC);
CREATE INDEX idx_interview_sessions_overall_score ON interview_sessions(overall_score DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cover_letters_updated_at BEFORE UPDATE ON cover_letters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_sessions_updated_at BEFORE UPDATE ON interview_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');

-- Resumes policies
CREATE POLICY "Users can view own resumes" ON resumes
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can create own resumes" ON resumes
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own resumes" ON resumes
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete own resumes" ON resumes
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

-- Cover letters policies
CREATE POLICY "Users can view own cover letters" ON cover_letters
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can create own cover letters" ON cover_letters
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own cover letters" ON cover_letters
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete own cover letters" ON cover_letters
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

-- Interview sessions policies
CREATE POLICY "Users can view own interview sessions" ON interview_sessions
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can create own interview sessions" ON interview_sessions
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own interview sessions" ON interview_sessions
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete own interview sessions" ON interview_sessions
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

-- Templates are publicly readable
CREATE POLICY "Templates are publicly readable" ON templates
  FOR SELECT USING (true);

-- Insert sample templates
INSERT INTO templates (name, category, html_template, is_premium) VALUES
('Modern Professional', 'modern', '<div class="resume-template modern"><!-- Template HTML --></div>', false),
('Executive Leader', 'executive', '<div class="resume-template executive"><!-- Template HTML --></div>', true),
('Creative Designer', 'creative', '<div class="resume-template creative"><!-- Template HTML --></div>', false),
('Technical Engineer', 'technical', '<div class="resume-template technical"><!-- Template HTML --></div>', false),
('Sales & Marketing', 'sales', '<div class="resume-template sales"><!-- Template HTML --></div>', true),
('Academic Research', 'academic', '<div class="resume-template academic"><!-- Template HTML --></div>', true);
