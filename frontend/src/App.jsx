import React, { useState, useEffect } from 'react';
import {
  FileText, Users, Clock, ShieldCheck, BarChart3, LogOut, Zap
} from 'lucide-react';
import { Card, Button } from './components/common';
import { AuthPage } from './components/auth/AuthPage';
import { ReportSubmitForm } from './components/reports/ReportSubmitForm';
import { ReportsFeed } from './components/reports/ReportsFeed';
import { WhatsAppModal } from './components/reports/WhatsAppModal';
import { RecipientTab } from './components/recipient/RecipientTab';
import { ShiftScheduleTab } from './components/settings/ShiftScheduleTab';
import { ProfileTab } from './components/profile/ProfileTab';
import { AdminDashboardTab } from './components/admin/AdminDashboardTab';

import { reportsService } from './api/reportsService';
import { recipientService, settingsService } from './api/recipientService';
import { authService } from './api/authService';
import { auth, isSignInWithEmailLink, signInWithEmailLink } from './firebase';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [recipient, setRecipient] = useState(null);
  const [settings, setSettings] = useState({
    shift_start: '09:00',
    shift_end: '18:00',
    reminder_minutes_before: 30,
    timezone: 'Asia/Kolkata'
  });
  const [profile, setProfile] = useState({
    name: 'Yuvaraj',
    role: 'Senior Engineer AI & Automation',
    email: ''
  });

  // Direct WhatsApp Modal State
  const [waModal, setWaModal] = useState({
    isOpen: false,
    report: null,
    text: '',
    recipientName: '',
    phoneNumber: ''
  });

  // Check Firebase Email Sign-In Link on page load
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailForSignIn = window.localStorage.getItem('emailForSignIn');
      if (!emailForSignIn) {
        emailForSignIn = window.prompt('Please confirm your email address to complete sign-in:');
      }
      if (emailForSignIn) {
        signInWithEmailLink(auth, emailForSignIn, window.location.href)
          .then((result) => {
            window.localStorage.removeItem('emailForSignIn');
            setUser({
              id: result.user.uid,
              name: result.user.displayName || emailForSignIn.split('@')[0],
              email: result.user.email,
              role: 'Senior Engineer AI & Automation'
            });
          })
          .catch((err) => console.error('Firebase Email Link sign-in error:', err));
      }
    }
  }, []);

  // Fetch initial data when user logs in
  useEffect(() => {
    if (user) {
      const uName = user.name || user.full_name || 'Yuvaraj';
      const uRole = user.role || 'Senior Engineer AI & Automation';
      setProfile({ name: uName, role: uRole, email: user.email || '' });
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const userId = user?.id || 'demo-user-id';
      const [userReports, recData, settData] = await Promise.all([
        reportsService.getReports(userId).catch(() => []),
        recipientService.getRecipient(userId).catch(() => null),
        settingsService.getSettings(userId).catch(() => null)
      ]);

      if (userReports) setReports(userReports);
      if (recData) setRecipient(recData);
      if (settData) setSettings(settData);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setActiveTab('reports');
  };

  // If user is not authenticated, render the modular AuthPage
  if (!user) {
    return <AuthPage onLogin={(authenticatedUser) => setUser(authenticatedUser)} />;
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 p-4 sm:p-6 lg:p-8 selection:bg-amber-500 selection:text-black">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Zap className="w-6 h-6 font-bold" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Daily Reports Hub
              </h1>
              <p className="text-xs text-slate-400">Shift Automation & WhatsApp Delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">{profile.name}</p>
              <p className="text-[11px] text-amber-400 font-medium">{profile.role}</p>
            </div>
            <Button onClick={handleLogout} variant="secondary" size="sm" className="gap-1.5 border-slate-800 hover:border-red-500/40 hover:text-red-400">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="flex items-center gap-4 border border-amber-500/20 bg-[#0a0d14]">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">My Reports Filed</p>
              <h3 className="text-xl font-bold text-white">{reports.length}</h3>
            </div>
          </Card>

          <Card className="flex items-center gap-4 border border-emerald-500/20 bg-[#0a0d14]">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">WhatsApp Recipient</p>
              <h3 className="text-sm font-bold text-white truncate max-w-[180px]">
                {recipient ? `${recipient.name} (${recipient.phone_number})` : 'Not configured'}
              </h3>
            </div>
          </Card>

          <Card className="flex items-center gap-4 border border-sky-500/20 bg-[#0a0d14]">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Shift Timing (Optional)</p>
              <h3 className="text-sm font-bold text-white">
                {settings.enabled
                  ? `${settings.shift_start} - ${settings.shift_end}`
                  : 'Flexible / General Hours'}
              </h3>
            </div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-2 sm:gap-6 overflow-x-auto pb-1">
          {[
            { id: 'reports', label: '📋 Submit & Feed', icon: FileText },
            { id: 'recipient', label: '📱 WhatsApp Recipient', icon: Users },
            { id: 'settings', label: '⚙️ Shift Schedule', icon: Clock },
            { id: 'profile', label: '👤 Account & Role', icon: ShieldCheck },
            { id: 'admin', label: '🛡️ Admin Overview', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modular View Router */}
        <main>
          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ReportSubmitForm
                  user={user}
                  profile={profile}
                  recipient={recipient}
                  onReportSubmitted={loadUserData}
                  onOpenWhatsAppModal={setWaModal}
                />
              </div>
              <div>
                <ReportsFeed
                  reports={reports}
                  user={user}
                  profile={profile}
                  recipient={recipient}
                  onReportDeleted={loadUserData}
                  onOpenWhatsAppModal={setWaModal}
                />
              </div>
            </div>
          )}

          {activeTab === 'recipient' && (
            <RecipientTab
              recipient={recipient}
              user={user}
              onRecipientUpdated={(rec) => setRecipient(rec)}
            />
          )}

          {activeTab === 'settings' && (
            <ShiftScheduleTab
              settings={settings}
              setSettings={setSettings}
              user={user}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              profile={profile}
              setProfile={setProfile}
              user={user}
              setUser={setUser}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboardTab
              onLoginAsUser={(targetUser) => {
                setUser({
                  id: targetUser.id,
                  name: targetUser.name,
                  email: targetUser.email,
                  role: targetUser.role,
                  is_admin: targetUser.is_admin
                });
                setActiveTab('reports');
              }}
            />
          )}
        </main>
      </div>

      {/* WhatsApp Dispatch Modal */}
      <WhatsAppModal
        modal={waModal}
        onClose={() => setWaModal({ isOpen: false, report: null, text: '', recipientName: '', phoneNumber: '' })}
      />
    </div>
  );
}
