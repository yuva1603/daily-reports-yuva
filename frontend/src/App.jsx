// =============================================================================
// DAILY REPORTS AUTOMATION APP - REACT FRONTEND (Vite + Tailwind CSS)
// Free-Tier Deployment Ready (Vercel + Render + Supabase + Twilio/Telegram)
// =============================================================================

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  FileText, Users, Clock, Send, Plus, Trash2, CheckCircle2,
  AlertCircle, ShieldCheck, RefreshCw, Smartphone, MessageSquare,
  Sparkles, ExternalLink, HelpCircle, LogOut, Check, Zap
} from 'lucide-react';

// -----------------------------------------------------------------------------
// ENVIRONMENT & CLIENT CONFIGURATION
// -----------------------------------------------------------------------------

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Mock user for offline / initial demo mode
const DEMO_USER = {
  id: 'demo-user-id',
  email: 'yuva@endotherm.io',
  user_metadata: { full_name: 'Yuva (Demo Mode)' }
};

// -----------------------------------------------------------------------------
// REUSABLE UI COMPONENTS
// -----------------------------------------------------------------------------

const Card = ({ children, className = '' }) => (
  <div className={`glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, type = 'button' }) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variants = {
    primary: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 active:scale-[0.98]',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-[0.98]',
    outline: 'border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 active:scale-[0.98]',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 active:scale-[0.98]'
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ label, placeholder, value, onChange, type = 'text', hint = '', className = '' }) => (
  <div className="w-full space-y-1.5">
    {label && <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</label>}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2.5 rounded-xl glass-input text-slate-100 placeholder-slate-500 focus:outline-none text-sm transition ${className}`}
    />
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

const TextArea = ({ label, placeholder, value, onChange, rows = 4, className = '' }) => (
  <div className="w-full space-y-1.5">
    {label && <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</label>}
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`w-full px-4 py-2.5 rounded-xl glass-input text-slate-100 placeholder-slate-500 focus:outline-none text-sm transition ${className}`}
    />
  </div>
);

const Badge = ({ children, variant = 'neutral' }) => {
  const styles = {
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    sky: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      {children}
    </span>
  );
};

// -----------------------------------------------------------------------------
// AUTHENTICATION COMPONENT
// -----------------------------------------------------------------------------

const AuthPage = ({ onDemoLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    if (!isSupabaseConfigured) {
      setMsg('Supabase API keys not detected. Logging in using instant Demo Mode!');
      setTimeout(() => onDemoLogin(DEMO_USER), 800);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg('Signup successful! Check your inbox for confirmation link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setMsg(`Auth Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!isSupabaseConfigured) {
      onDemoLogin(DEMO_USER);
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Dynamic background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 mb-2 shadow-lg shadow-amber-500/20">
            <Zap className="w-8 h-8 font-bold" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Daily Reports Hub</h1>
          <p className="text-sm text-slate-400">Automate daily shift reports & WhatsApp notifications</p>
        </div>

        <Card className="border border-slate-800">
          {!isSupabaseConfigured && (
            <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Free Demo Mode Active:</strong> You can test all features right away without entering live API keys.
              </div>
            </div>
          )}

          {msg && (
            <div className="mb-4 p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200">
              {msg}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              placeholder="yuva@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-medium">Or continue with</span>
            </div>
          </div>

          <Button onClick={handleGoogleAuth} variant="secondary" className="w-full">
            <span className="mr-2">🔐</span> Continue with Google
          </Button>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <button
              onClick={() => onDemoLogin(DEMO_USER)}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4"
            >
              ⚡ Instant Demo Login (Skip Credentials)
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// DASHBOARD APP COMPONENT
// -----------------------------------------------------------------------------

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [settings, setSettings] = useState({
    shift_start: '09:00',
    shift_end: '18:00',
    reminder_minutes_before: 30,
    timezone: 'Asia/Kolkata'
  });
  const [loading, setLoading] = useState(false);
  const [backendHealth, setBackendHealth] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('production, maintenance');
  const [recName, setRecName] = useState('');
  const [recPhone, setRecPhone] = useState('');
  const [recTelegram, setRecTelegram] = useState('');

  // Check auth session
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) setUser(session.user);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
        setUser(session?.user || null);
      });
      return () => subscription?.unsubscribe();
    } else {
      // Default to demo mode for quick testing
      setUser(DEMO_USER);
    }
  }, []);

  // Fetch initial data & health check
  useEffect(() => {
    if (user) {
      loadData();
      checkBackendHealth();
    }
  }, [user]);

  const checkBackendHealth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) {
        const data = await res.json();
        setBackendHealth(data);
      }
    } catch {
      setBackendHealth({ status: 'offline' });
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const userId = user?.id || 'demo-user-id';
      
      const repRes = await fetch(`${API_BASE_URL}/api/reports?userId=${userId}`);
      if (repRes.ok) setReports(await repRes.json());

      const recRes = await fetch(`${API_BASE_URL}/api/recipients?userId=${userId}`);
      if (recRes.ok) setRecipients(await recRes.json());

      const setRes = await fetch(`${API_BASE_URL}/api/settings?userId=${userId}`);
      if (setRes.ok) {
        const data = await setRes.json();
        if (data) setSettings(data);
      }
    } catch (err) {
      console.warn('Backend load warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert('Please enter both title and details');

    setLoading(true);
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE_URL}/api/reports/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'demo-user-id',
          title,
          content,
          tags
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ Report submitted successfully! Sent to ${data.dispatchedCount} recipient(s).`);
        setTitle('');
        setContent('');
        loadData();
      } else {
        alert(`Error submitting report: ${data.error}`);
      }
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipient = async (e) => {
    e.preventDefault();
    if (!recName.trim() || !recPhone.trim()) return alert('Name and phone number are required');

    try {
      const res = await fetch(`${API_BASE_URL}/api/recipients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'demo-user-id',
          name: recName,
          phone_number: recPhone,
          telegram_chat_id: recTelegram,
          whatsapp_enabled: true,
          telegram_enabled: Boolean(recTelegram)
        })
      });

      if (res.ok) {
        setRecName('');
        setRecPhone('');
        setRecTelegram('');
        loadData();
      }
    } catch (err) {
      alert(`Error adding recipient: ${err.message}`);
    }
  };

  const handleDeleteRecipient = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/recipients/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'demo-user-id',
          ...settings
        })
      });
      if (res.ok) {
        alert('✅ Shift settings updated & reminder scheduled!');
        loadData();
      }
    } catch (err) {
      alert(`Error saving settings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerTestReminder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reminders/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || 'demo-user-id' })
      });
      const data = await res.json();
      alert(`✅ Test reminder triggered! Dispatched to recipients.`);
    } catch (err) {
      alert(`Test reminder error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <AuthPage onDemoLogin={setUser} />;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Daily Reports Hub
                {!isSupabaseConfigured && <Badge variant="amber">Demo Mode</Badge>}
              </h1>
              <p className="text-xs text-slate-400">Shift Automation & Delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {backendHealth?.status === 'ok' ? (
              <Badge variant="emerald">Backend Live</Badge>
            ) : (
              <Badge variant="amber">Backend Offline / Demo</Badge>
            )}

            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-slate-200">{user.email}</p>
              <p className="text-[10px] text-slate-400">Free Tier Account</p>
            </div>

            <Button onClick={() => setUser(null)} variant="secondary" size="sm">
              <LogOut className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="flex items-center gap-4 border border-amber-500/20">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Reports</p>
              <h3 className="text-2xl font-bold text-white">{reports.length}</h3>
            </div>
          </Card>

          <Card className="flex items-center gap-4 border border-emerald-500/20">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Active Recipients</p>
              <h3 className="text-2xl font-bold text-white">
                {recipients.filter(r => r.whatsapp_enabled || r.telegram_enabled).length}
              </h3>
            </div>
          </Card>

          <Card className="flex items-center gap-4 border border-sky-500/20">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Shift Reminder</p>
              <h3 className="text-base font-bold text-white">
                {settings.shift_end} ({settings.reminder_minutes_before}m lead)
              </h3>
            </div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-2 sm:gap-6 overflow-x-auto pb-1">
          {[
            { id: 'reports', label: '📋 Submit & Feed', icon: FileText },
            { id: 'recipients', label: '👥 Recipients', icon: Users },
            { id: 'settings', label: '⚙️ Shift Schedule', icon: Clock },
            { id: 'free-deploy', label: '🚀 100% Free Deployment', icon: Sparkles }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: REPORTS */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Submit Form */}
            <Card className="lg:col-span-2 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-amber-400" />
                  Submit Daily Report
                </h2>
                <Badge variant="amber">Auto WhatsApp & Telegram</Badge>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-4">
                <Input
                  label="Report Title"
                  placeholder="e.g. Production & Maintenance Daily Summary - 2026-08-23"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <TextArea
                  label="Shift Details / Achievements / Blocker Notes"
                  placeholder="Describe completed tasks, quality metrics, equipment status, and next day priorities..."
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />

                <Input
                  label="Tags (Comma separated)"
                  placeholder="production, quality, maintenance"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  hint="Tags help filter historical reports easily"
                />

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Submitting & Dispatching...' : '🚀 Submit & Dispatch to Recipients'}
                </Button>
              </form>
            </Card>

            {/* Reports Feed */}
            <Card className="border border-slate-800 flex flex-col">
              <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
                <span>Recent History</span>
                <button onClick={loadData} className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </h3>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[480px] pr-1">
                {reports.length === 0 ? (
                  <p className="text-xs text-slate-500 py-10 text-center">No reports submitted yet</p>
                ) : (
                  reports.map(r => (
                    <div key={r.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-white">{r.title}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">{r.date}</span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-3 whitespace-pre-line">{r.content}</p>
                      {r.tags && r.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {r.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 font-mono">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: RECIPIENTS */}
        {activeTab === 'recipients' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Recipient */}
            <Card className="border border-slate-800">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Add Recipient
              </h2>

              <form onSubmit={handleAddRecipient} className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="Manager / Stakeholder Name"
                  value={recName}
                  onChange={(e) => setRecName(e.target.value)}
                />

                <Input
                  label="WhatsApp Number (with country code)"
                  placeholder="+91 98765 43210"
                  value={recPhone}
                  onChange={(e) => setRecPhone(e.target.value)}
                  hint="Format: +91XXXXXXXXXX"
                />

                <Input
                  label="Telegram Chat ID (Optional Free Alternative)"
                  placeholder="e.g. 123456789"
                  value={recTelegram}
                  onChange={(e) => setRecTelegram(e.target.value)}
                  hint="Message @userinfobot on Telegram to get Chat ID"
                />

                <Button type="submit" className="w-full">
                  <Plus className="w-4 h-4 mr-1.5" /> Save Recipient
                </Button>
              </form>
            </Card>

            {/* Recipient List */}
            <Card className="lg:col-span-2 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-4">Active Distribution Contacts</h3>

              {recipients.length === 0 ? (
                <p className="text-xs text-slate-500 py-10 text-center">No recipients added yet</p>
              ) : (
                <div className="space-y-3">
                  {recipients.map(r => (
                    <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">{r.name}</h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{r.phone_number}</p>
                        {r.telegram_chat_id && (
                          <p className="text-[11px] text-sky-400 font-mono mt-0.5">Telegram ID: {r.telegram_chat_id}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {r.whatsapp_enabled && <Badge variant="emerald">WhatsApp Active</Badge>}
                        {r.telegram_enabled && <Badge variant="sky">Telegram Active</Badge>}
                        
                        <Button onClick={() => handleDeleteRecipient(r.id)} variant="danger" size="sm">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 3: SHIFT SETTINGS */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Shift Reminders Configuration
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Shift Start"
                  type="time"
                  value={settings.shift_start}
                  onChange={(e) => setSettings({ ...settings, shift_start: e.target.value })}
                />
                <Input
                  label="Shift End"
                  type="time"
                  value={settings.shift_end}
                  onChange={(e) => setSettings({ ...settings, shift_end: e.target.value })}
                />
              </div>

              <Input
                label="Reminder Lead Time (Minutes before shift end)"
                type="number"
                value={settings.reminder_minutes_before}
                onChange={(e) => setSettings({ ...settings, reminder_minutes_before: e.target.value })}
                hint="System sends notification reminder X minutes prior to shift end"
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-100 text-sm focus:outline-none"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST - India)</option>
                  <option value="UTC">UTC (Universal Time)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <Button onClick={handleSaveSettings} disabled={loading} className="flex-1">
                  Save Shift Schedule
                </Button>
                <Button onClick={handleTriggerTestReminder} variant="secondary" className="flex-1">
                  <Send className="w-3.5 h-3.5 mr-1" /> Test Reminder Now
                </Button>
              </div>
            </Card>

            {/* Shift Summary Info */}
            <Card className="border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-3">⏰ How Shift Reminders Work</h3>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>The backend background scheduler calculates daily trigger times based on your shift end window.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>At the scheduled time, reminders are pushed to all enabled WhatsApp contacts and Telegram channels.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Render Free Tier sleep periods are automatically handled via API health checks.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                <strong className="block text-amber-400">⚡ Pro Tip:</strong>
                <p>Use Telegram Bot API if you want 100% free unlimited instant push notifications without sandbox credit limits.</p>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: 100% FREE DEPLOYMENT GUIDE */}
        {activeTab === 'free-deploy' && (
          <Card className="border border-slate-800 space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-400" />
                100% Free Resource Deployment Guide
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Follow these exact steps to host your Daily Reports system online for $0/month total.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">Step 1 • Database</span>
                <h4 className="text-sm font-bold text-white">Supabase Free Tier</h4>
                <p className="text-xs text-slate-400">
                  Create a free project at <strong>supabase.com</strong>, go to SQL Editor, and paste the code from <code>database/schema.sql</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">Step 2 • Backend</span>
                <h4 className="text-sm font-bold text-white">Render.com Web Service</h4>
                <p className="text-xs text-slate-400">
                  Connect your GitHub repo to <strong>render.com</strong>, select Free Web Service, set root directory to <code>backend</code>, and deploy!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">Step 3 • Frontend</span>
                <h4 className="text-sm font-bold text-white">Vercel Free Hosting</h4>
                <p className="text-xs text-slate-400">
                  Connect repo to <strong>vercel.com</strong>, set root directory to <code>frontend</code>, and add <code>VITE_API_BASE_URL</code> environment variable.
                </p>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
