import React, { useState, useEffect } from 'react';
import {
  BarChart3, Users, FileText, TrendingUp, RefreshCw, Clock,
  Plus, Edit, Trash2, Key, ShieldCheck, X, Check
} from 'lucide-react';
import { Card, Button, Input, PasswordInput, Badge } from '../common';
import { reportsService } from '../../api/reportsService';

export const AdminDashboardTab = ({ onLoginAsUser }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    todayReports: 0,
    users: [],
    categoryCounts: {},
    allReports: []
  });
  const [loading, setLoading] = useState(false);

  // CRUD Modal State
  const [userModal, setUserModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    id: null,
    name: '',
    email: '',
    password: '',
    role: 'Senior Engineer AI & Automation',
    is_admin: false,
    phone_number: ''
  });

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getAdminStats();
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error('Admin stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // [CREATE / UPDATE] Submit user form
  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userModal.name.trim() || !userModal.email.trim()) {
      return alert('⚠️ Name and Email are required.');
    }

    try {
      if (userModal.mode === 'create') {
        const res = await reportsService.createUser({
          name: userModal.name.trim(),
          email: userModal.email.trim(),
          password: userModal.password || 'DefaultPass@123',
          role: userModal.role.trim(),
          is_admin: userModal.is_admin,
          phone_number: userModal.phone_number.trim()
        });
        if (res.success) {
          alert(`✅ User created and saved to Supabase: ${userModal.email}`);
        } else {
          alert(`Error creating user: ${res.error}`);
        }
      } else {
        const res = await reportsService.updateUser(userModal.id, {
          name: userModal.name.trim(),
          email: userModal.email.trim(),
          password: userModal.password || undefined,
          role: userModal.role.trim(),
          is_admin: userModal.is_admin,
          phone_number: userModal.phone_number.trim()
        });
        if (res.success) {
          alert(`✅ User profile updated in Supabase: ${userModal.email}`);
        } else {
          alert(`Error updating user: ${res.error}`);
        }
      }

      setUserModal({ ...userModal, isOpen: false });
      loadStats();
    } catch (err) {
      alert(`Operation error: ${err.message}`);
    }
  };

  // [DELETE] Delete user
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`⚠️ Are you sure you want to delete user "${user.name}" (${user.email}) from Supabase?`)) return;

    try {
      const res = await reportsService.deleteUser(user.id, user.email);
      if (res.success) {
        alert(`🗑️ User deleted successfully.`);
        loadStats();
      } else {
        alert(`Error deleting user: ${res.error}`);
      }
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const openCreateModal = () => {
    setUserModal({
      isOpen: true,
      mode: 'create',
      id: null,
      name: '',
      email: '',
      password: '',
      role: 'Senior Engineer AI & Automation',
      is_admin: false,
      phone_number: ''
    });
  };

  const openEditModal = (u) => {
    setUserModal({
      isOpen: true,
      mode: 'edit',
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password || '',
      role: u.role || 'Senior Engineer AI & Automation',
      is_admin: Boolean(u.is_admin),
      phone_number: u.phone || ''
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-amber-500/20 bg-[#0a0d14]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Registered Users</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalUsers}</h3>
            </div>
          </div>
        </Card>

        <Card className="border border-emerald-500/20 bg-[#0a0d14]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Reports Filed</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalReports}</h3>
            </div>
          </div>
        </Card>

        <Card className="border border-sky-500/20 bg-[#0a0d14]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Today's Reports</p>
              <h3 className="text-2xl font-bold text-white">{stats.todayReports}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* User Management Roster Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            User Management & Supabase Database CRUD
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full admin control: Create, Edit, Inspect, Reset Passwords, or Delete user accounts in Supabase DB.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreateModal} size="sm" className="gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold">
            <Plus className="w-4 h-4" />
            Add New User
          </Button>
          <Button onClick={loadStats} disabled={loading} variant="secondary" size="sm" className="gap-1">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Users CRUD Table */}
      <Card className="border border-slate-800 bg-[#0a0d14] overflow-x-auto p-0">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 font-semibold">User Details</th>
              <th className="py-3.5 px-4 font-semibold">Designation / Role</th>
              <th className="py-3.5 px-4 font-semibold">Email & Phone</th>
              <th className="py-3.5 px-4 font-semibold text-center">Reports Filed</th>
              <th className="py-3.5 px-4 font-semibold text-right">Admin Actions (CRUD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {stats.users.map((u, i) => (
              <tr key={u.id || i} className="hover:bg-slate-900/50 transition">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{u.name}</span>
                    {u.is_admin && <Badge variant="amber">Admin</Badge>}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">ID: {u.id?.slice(0, 16) || 'usr'}</span>
                </td>
                <td className="py-3.5 px-4 text-amber-400 font-medium">{u.role || 'Senior Engineer AI & Automation'}</td>
                <td className="py-3.5 px-4 font-mono text-slate-400">
                  <div>{u.email}</div>
                  {u.phone && <div className="text-[10px] text-slate-500">📱 {u.phone}</div>}
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                    {u.reports_count || 0}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {onLoginAsUser && (
                      <button
                        onClick={() => onLoginAsUser(u)}
                        className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition cursor-pointer"
                        title="Login as this user to inspect reports"
                      >
                        🔑 Inspect
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 transition cursor-pointer"
                      title="Edit user details & password"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition cursor-pointer"
                      title="Delete user from database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Global Reports Stream */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          Master Shift Reports Stream across all users ({stats.allReports?.length || 0})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
          {stats.allReports && stats.allReports.map((r) => (
            <Card key={r.id} className="border border-slate-800 bg-[#0a0d14] space-y-2 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-xs">{r.title}</h4>
                <Badge variant="amber">{r.type || 'Daily Report'}</Badge>
              </div>
              <div className="text-[11px] text-amber-400/90 font-medium">
                👤 {r.author_name || 'Team Member'} • <em>{r.author_role || 'Engineer'}</em>
              </div>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{r.content}</p>
              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-800/60">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  {r.date} at {r.time || '18:00'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* [MODAL] Create / Edit User Dialog */}
      {userModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <Card className="w-full max-w-md border border-amber-500/30 bg-[#0a0d14] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                {userModal.mode === 'create' ? 'Create New Team Member' : 'Edit User Profile & Credentials'}
              </h3>
              <button
                onClick={() => setUserModal({ ...userModal, isOpen: false })}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5">
              <Input
                label="Full Name"
                placeholder="e.g. Alex Chen"
                value={userModal.name}
                onChange={(e) => setUserModal({ ...userModal, name: e.target.value })}
              />

              <Input
                label="Work Email Address"
                type="email"
                placeholder="Enter the email id"
                value={userModal.email}
                onChange={(e) => setUserModal({ ...userModal, email: e.target.value })}
              />

              <PasswordInput
                label={userModal.mode === 'create' ? 'Assign Password' : 'Reset Password'}
                placeholder="Enter password"
                value={userModal.password}
                onChange={(e) => setUserModal({ ...userModal, password: e.target.value })}
                hint="Minimum 6 characters"
              />

              <Input
                label="Designation / Job Role"
                placeholder="e.g. Shift Supervisor / Operations Lead"
                value={userModal.role}
                onChange={(e) => setUserModal({ ...userModal, role: e.target.value })}
              />

              <Input
                label="WhatsApp Mobile Number (Optional)"
                placeholder="e.g. +917358859792"
                value={userModal.phone_number}
                onChange={(e) => setUserModal({ ...userModal, phone_number: e.target.value })}
              />

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isAdminCheck"
                  checked={userModal.is_admin}
                  onChange={(e) => setUserModal({ ...userModal, is_admin: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="isAdminCheck" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Grant Administrator Privileges (Admin Role)
                </label>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <Button type="submit" className="flex-1">
                  {userModal.mode === 'create' ? 'Create User in Supabase' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setUserModal({ ...userModal, isOpen: false })}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
