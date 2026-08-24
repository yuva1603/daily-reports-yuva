import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, TrendingUp, RefreshCw, Clock } from 'lucide-react';
import { Card, Button, Badge } from '../common';
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

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            Registered Team Members & Supabase Credentials Roster
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Admin inspection view: Monitor active users, credentials, and access accounts for report troubleshooting.
          </p>
        </div>
        <Button onClick={loadStats} disabled={loading} variant="secondary" size="sm" className="gap-1">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>

      {/* Users Table */}
      <Card className="border border-slate-800 bg-[#0a0d14] overflow-x-auto p-0">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 font-semibold">User Name</th>
              <th className="py-3.5 px-4 font-semibold">Designation / Role</th>
              <th className="py-3.5 px-4 font-semibold">Email</th>
              <th className="py-3.5 px-4 font-semibold text-center">Reports Filed</th>
              <th className="py-3.5 px-4 font-semibold text-right">Admin Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {stats.users.map((u, i) => (
              <tr key={u.id || i} className="hover:bg-slate-900/50 transition">
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                  <span>{u.name}</span>
                  {u.is_admin && <Badge variant="amber">Admin</Badge>}
                </td>
                <td className="py-3.5 px-4 text-amber-400 font-medium">{u.role || 'Senior Engineer AI & Automation'}</td>
                <td className="py-3.5 px-4 font-mono text-slate-400">{u.email}</td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                    {u.reports_count || 0}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {onLoginAsUser && (
                    <button
                      onClick={() => onLoginAsUser(u)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-semibold transition cursor-pointer"
                      title="Inspect user reports and troubleshoot"
                    >
                      🔑 Login / Inspect
                    </button>
                  )}
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
    </div>
  );
};
