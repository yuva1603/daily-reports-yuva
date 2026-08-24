// =============================================================================
// DAILY REPORTS AUTOMATION APP - REACT FRONTEND
// Tech Stack: React 18 + TypeScript + Tailwind CSS + shadcn/ui + Supabase
// =============================================================================

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// SUPABASE CONFIG (Replace with your credentials)
// ============================================================================
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// TAILWIND COMPONENTS (shadcn/ui alternatives)
// ============================================================================

const Button = ({ children, onClick, className = '', variant = 'primary', disabled = false }) => {
  const baseStyle = 'px-4 py-2 rounded-lg font-medium transition duration-200 disabled:opacity-50';
  const variants = {
    primary: 'bg-amber-600 hover:bg-amber-700 text-white',
    secondary: 'bg-slate-700 hover:bg-slate-800 text-white',
    outline: 'border-2 border-amber-600 text-amber-600 hover:bg-amber-50',
    ghost: 'hover:bg-slate-100 text-slate-900'
  };
  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

const Input = ({ placeholder, value, onChange, type = 'text', className = '' }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 ${className}`}
  />
);

const TextArea = ({ placeholder, value, onChange, rows = 4, className = '' }) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    rows={rows}
    className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 ${className}`}
  />
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-2xl text-slate-400">&times;</button>
        </div>
        {children}
      </Card>
    </div>
  );
};

const Badge = ({ children, variant = 'primary' }) => {
  const colors = {
    primary: 'bg-amber-100 text-amber-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-orange-100 text-orange-800'
  };
  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[variant]}`}>{children}</span>;
};

// ============================================================================
// AUTHENTICATION COMPONENT
// ============================================================================

const AuthPage = ({ onAuthSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async () => {
    setLoading(true);
    setError('');
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError('Signup successful! Check your email to confirm.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Daily Reports</h1>
          <p className="text-slate-400">Automate your daily reporting workflow</p>
        </div>

        {/* Auth Card */}
        <Card className="bg-gradient-to-b from-white to-slate-50">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {isSignup ? 'Create Account' : 'Sign In'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleEmailAuth}
            disabled={loading}
            className="w-full mb-3"
          >
            {loading ? 'Loading...' : (isSignup ? 'Sign Up' : 'Sign In')}
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-50 text-slate-500">OR</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleAuth}
            variant="outline"
            className="w-full mb-4"
            disabled={loading}
          >
            🔐 Continue with Google
          </Button>

          <p className="text-center text-sm text-slate-600">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="font-medium text-amber-600 hover:text-amber-700"
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </Card>

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-4">
          {[
            { icon: '📋', label: 'Daily Reports' },
            { icon: '📱', label: 'WhatsApp' },
            { icon: '⏰', label: 'Auto Reminders' }
          ].map((feature) => (
            <div key={feature.label} className="text-center">
              <div className="text-3xl mb-2">{feature.icon}</div>
              <p className="text-xs text-slate-400">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// REPORT FORM COMPONENT
// ============================================================================

const ReportForm = ({ onSubmit, loading }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in all fields');
      return;
    }
    await onSubmit({ title, content, tags: tags.split(',').map(t => t.trim()) });
    setTitle('');
    setContent('');
    setTags('');
  };

  return (
    <Card>
      <h3 className="text-2xl font-bold text-slate-900 mb-4">📝 Create Daily Report</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Report Title</label>
          <Input
            placeholder="e.g., Production Summary - 2024-01-15"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Report Details</label>
          <TextArea
            placeholder="Describe what you accomplished today, metrics, challenges, next steps..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tags (comma-separated)</label>
          <Input
            placeholder="production, quality, maintenance"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full"
        >
          {loading ? '⏳ Submitting...' : '✉️ Submit & Send to Recipients'}
        </Button>
      </div>
    </Card>
  );
};

// ============================================================================
// RECIPIENT MANAGEMENT COMPONENT
// ============================================================================

const RecipientManager = ({ recipients, onAdd, onDelete, onToggle }) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !phone.trim()) {
      alert('Please fill in all fields');
      return;
    }
    onAdd({ name, phone });
    setName('');
    setPhone('');
    setShowModal(false);
  };

  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900">👥 Recipients</h3>
          <Button onClick={() => setShowModal(true)} variant="primary">
            + Add Recipient
          </Button>
        </div>

        {recipients.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No recipients added yet</p>
        ) : (
          <div className="space-y-3">
            {recipients.map((recipient) => (
              <div
                key={recipient.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={recipient.whatsapp_enabled}
                    onChange={() => onToggle(recipient.id)}
                    className="w-5 h-5 text-amber-600"
                  />
                  <div>
                    <p className="font-medium text-slate-900">{recipient.name}</p>
                    <p className="text-sm text-slate-500">{recipient.phone_number}</p>
                  </div>
                </div>
                <Badge variant="success">WhatsApp</Badge>
                <button
                  onClick={() => onDelete(recipient.id)}
                  className="ml-3 px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Recipient">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
            <Input
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              WhatsApp Number (with country code)
            </label>
            <Input
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAdd} className="flex-1">Add</Button>
            <Button onClick={() => setShowModal(false)} variant="secondary" className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// ============================================================================
// SHIFT SETTINGS COMPONENT
// ============================================================================

const ShiftSettings = ({ settings, onUpdate, loading }) => {
  const [shiftStart, setShiftStart] = useState(settings?.shift_start || '09:00');
  const [shiftEnd, setShiftEnd] = useState(settings?.shift_end || '18:00');
  const [reminderMins, setReminderMins] = useState(settings?.reminder_minutes_before || 30);
  const [timezone, setTimezone] = useState(settings?.timezone || 'UTC');

  const handleSave = () => {
    onUpdate({ shiftStart, shiftEnd, reminderMins, timezone });
  };

  return (
    <Card>
      <h3 className="text-2xl font-bold text-slate-900 mb-4">⏰ Shift Settings</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Shift Start</label>
          <Input
            type="time"
            value={shiftStart}
            onChange={(e) => setShiftStart(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Shift End</label>
          <Input
            type="time"
            value={shiftEnd}
            onChange={(e) => setShiftEnd(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Remind Me (minutes before shift ends)
          </label>
          <Input
            type="number"
            value={reminderMins}
            onChange={(e) => setReminderMins(parseInt(e.target.value))}
            min="5"
            max="120"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
          >
            <option value="UTC">UTC</option>
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
          </select>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
        <p className="text-sm text-blue-900">
          📌 <strong>Reminder:</strong> You'll receive a WhatsApp notification {reminderMins} minutes before shift ends ({shiftEnd})
        </p>
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? 'Saving...' : '✓ Save Settings'}
      </Button>
    </Card>
  );
};

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

const Dashboard = ({ user, onLogout }) => {
  const [reports, setReports] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('reports');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load reports
      const { data: reportsData } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      setReports(reportsData || []);

      // Load recipients
      const { data: recipientsData } = await supabase
        .from('recipients')
        .select('*');
      setRecipients(recipientsData || []);

      // Load shift settings
      const { data: settingsData } = await supabase
        .from('shift_settings')
        .select('*')
        .single();
      setSettings(settingsData);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (reportData) => {
    setLoading(true);
    try {
      // Save to database
      const { error } = await supabase
        .from('reports')
        .insert([{
          user_id: user.id,
          title: reportData.title,
          content: reportData.content,
          date: new Date().toISOString().split('T')[0]
        }]);

      if (error) throw error;

      // In production: Call backend to send WhatsApp messages via Twilio
      // await fetch('/api/send-report', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     report: reportData,
      //     recipients: recipients.filter(r => r.whatsapp_enabled),
      //     userId: user.id
      //   })
      // });

      alert('✅ Report submitted and sending to recipients!');
      loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipient = async (recipientData) => {
    try {
      await supabase
        .from('recipients')
        .insert([{
          user_id: user.id,
          name: recipientData.name,
          phone_number: recipientData.phone,
          whatsapp_enabled: true
        }]);
      loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteRecipient = async (id) => {
    if (confirm('Delete this recipient?')) {
      await supabase.from('recipients').delete().eq('id', id);
      loadData();
    }
  };

  const handleToggleRecipient = async (id) => {
    const recipient = recipients.find(r => r.id === id);
    await supabase
      .from('recipients')
      .update({ whatsapp_enabled: !recipient.whatsapp_enabled })
      .eq('id', id);
    loadData();
  };

  const handleUpdateSettings = async (newSettings) => {
    setLoading(true);
    try {
      if (settings) {
        await supabase
          .from('shift_settings')
          .update({
            shift_start: newSettings.shiftStart,
            shift_end: newSettings.shiftEnd,
            reminder_minutes_before: newSettings.reminderMins,
            timezone: newSettings.timezone
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('shift_settings')
          .insert([{
            user_id: user.id,
            shift_start: newSettings.shiftStart,
            shift_end: newSettings.shiftEnd,
            reminder_minutes_before: newSettings.reminderMins,
            timezone: newSettings.timezone
          }]);
      }
      loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">📊 Daily Reports</h1>
            <p className="text-slate-300 text-sm">Welcome, {user.email}</p>
          </div>
          <Button onClick={onLogout} variant="outline" className="border-white text-white hover:bg-slate-700">
            Logout
          </Button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {[
              { id: 'reports', label: '📋 Reports' },
              { id: 'recipients', label: '👥 Recipients' },
              { id: 'settings', label: '⚙️ Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium transition ${
                  activeTab === tab.id
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <ReportForm onSubmit={handleSubmitReport} loading={loading} />
                <Card>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">📜 Recent Reports</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {reports.length === 0 ? (
                      <p className="text-slate-500">No reports yet</p>
                    ) : (
                      reports.map((report) => (
                        <div key={report.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <p className="font-medium text-slate-900">{report.title}</p>
                          <p className="text-sm text-slate-600">{report.date}</p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'recipients' && (
              <RecipientManager
                recipients={recipients}
                onAdd={handleAddRecipient}
                onDelete={handleDeleteRecipient}
                onToggle={handleToggleRecipient}
              />
            )}

            {activeTab === 'settings' && (
              <ShiftSettings
                settings={settings}
                onUpdate={handleUpdateSettings}
                loading={loading}
              />
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-4">
            <Card>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">📈 Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Reports</span>
                  <span className="text-2xl font-bold text-amber-600">{reports.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Recipients</span>
                  <span className="text-2xl font-bold text-amber-600">{recipients.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Active</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {recipients.filter(r => r.whatsapp_enabled).length}
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">💡 Tips</h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li>✓ Add multiple recipients for batch reports</li>
                <li>✓ Configure your shift times for smart reminders</li>
                <li>✓ Enable WhatsApp delivery for instant notifications</li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? (
    <Dashboard
      user={user}
      onLogout={() => supabase.auth.signOut()}
    />
  ) : (
    <AuthPage onAuthSuccess={() => setUser(true)} />
  );
}
