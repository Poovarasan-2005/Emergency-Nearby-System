import React, { useState } from 'react';
import {
  Shield,
  Activity,
  Users,
  AlertTriangle,
  Server,
  Zap,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertOctagon,
  Eye,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Mock telemetry data
  const telemetry = {
    totalUsers: 1420,
    activeSessionsCount: 3,
    totalEmergenciesToday: 19,
    apiHealth: '99.98%',
    placesApiLatency: '42ms',
    databaseLatency: '18ms',
    abuseAlertsToday: 1,
  };

  const activeEmergencies = [
    {
      id: 'SOS-94A2',
      category: 'Medical Emergency',
      coords: '40.7128, -74.0060',
      time: '4 mins ago',
      status: 'Active Tracking',
      contactsAlerted: 2,
    },
    {
      id: 'SOS-88K1',
      category: 'Traffic Accident',
      coords: '40.7580, -73.9855',
      time: '12 mins ago',
      status: 'En Route to Hospital',
      contactsAlerted: 3,
    },
    {
      id: 'SOS-77B9',
      category: 'Fire Incident',
      coords: '40.7829, -73.9654',
      time: '24 mins ago',
      status: 'First Responders on Scene',
      contactsAlerted: 1,
    },
  ];

  const auditLogs = [
    { id: 'log-1', action: 'SOS Session Started', user: 'usr_8923 (Sarah C.)', time: '10:41:02', ip: '198.51.100.24' },
    { id: 'log-2', action: 'Tokenized Live Share Created', user: 'usr_8923 (Sarah C.)', time: '10:41:05', ip: '198.51.100.24' },
    { id: 'log-3', action: 'Emergency Contact SMS Triggered', user: 'System Worker', time: '10:41:06', ip: 'Internal CAD' },
    { id: 'log-4', action: 'Rate Limit Warning (5 requests/sec)', user: 'usr_3310 (Unknown)', time: '10:28:19', ip: '203.0.113.88' },
    { id: 'log-5', action: 'Role Elevated to ADMIN', user: 'director.vance@emergency.system', time: '09:15:00', ip: 'Internal VPN' },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Emergency Operations Center & Telemetry
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            System health, active distress signals, rate limit enforcement, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-3 py-1.5 rounded-xl">
            Logged in as: {user?.role}
          </span>
          <button
            onClick={handleRefresh}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Active SOS Now</span>
            <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <span className="text-3xl font-black text-white">{telemetry.activeSessionsCount}</span>
          <span className="text-[11px] text-rose-400 block mt-1 font-semibold">Broadcasting live</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Emergencies Today</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-black text-white">{telemetry.totalEmergenciesToday}</span>
          <span className="text-[11px] text-slate-400 block mt-1">16 resolved safely</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">API & System Uptime</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-emerald-400">{telemetry.apiHealth}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Places latency: {telemetry.placesApiLatency}</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Abuse Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-3xl font-black text-white">{telemetry.abuseAlertsToday}</span>
          <span className="text-[11px] text-emerald-400 block mt-1 font-semibold">Rate limiter mitigated</span>
        </div>
      </div>

      {/* Active Emergencies List */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            Real-Time Active Emergency Sessions
          </h3>
          <span className="text-xs text-slate-400 font-semibold">Minimal-Necessary Telemetry Only</span>
        </div>

        <div className="space-y-3">
          {activeEmergencies.map((emg) => (
            <div
              key={emg.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-white text-sm">{emg.id}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {emg.category}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">({emg.coords})</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Started {emg.time} • {emg.contactsAlerted} Contacts Pinged
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  {emg.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-400" />
          Security Audit & Authorization Logs
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Security Action</th>
                <th className="pb-3">Principal</th>
                <th className="pb-3">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-950/40">
                  <td className="py-2.5 text-slate-400">{log.time}</td>
                  <td className="py-2.5 font-bold text-white font-sans">{log.action}</td>
                  <td className="py-2.5 text-indigo-300">{log.user}</td>
                  <td className="py-2.5 text-slate-400">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
