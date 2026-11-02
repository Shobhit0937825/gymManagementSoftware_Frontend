import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { CheckInModal } from '../components/attendance/CheckInModal';
import { checkOutMember, setAttendance } from '../store/slices/attendanceSlice';
import api from '../services/api';
import { StatCard } from '../components/common/StatCard';
import {
  formatDate,
  formatTimeOnly,
} from '../utils/formatters';
import {
  Fingerprint,
  QrCode,
  UserCheck,
  Search,
  Clock,
  LogOut,
  Building2,
  CheckCircle2,
  Wifi,
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { records, devices } = useAppSelector((state) => state.attendance);
  const { branches, activeBranchId } = useAppSelector((state) => state.branch);

  const [search, setSearch] = useState('');
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'inside' | 'completed'>('all');

  useEffect(() => {
    const branchParam = activeBranchId === 'all' ? '' : `?branchId=${activeBranchId}`;
    api
      .get(`/attendance${branchParam}`)
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          dispatch(setAttendance(res.data.data));
        }
      })
      .catch((e) => console.warn('Attendance fetch note:', e));
  }, [activeBranchId, dispatch]);

  const scopedAttendance = records.filter((r) => {
    if (activeBranchId === 'all') return true;
    return r.branchId === activeBranchId;
  });

  const filteredAttendance = scopedAttendance.filter((r) => {
    const matchesSearch =
      r.memberName.toLowerCase().includes(search.toLowerCase()) ||
      r.memberPhone.includes(search);

    let matchesStatus = true;
    if (selectedFilter === 'inside') matchesStatus = !r.checkOut;
    else if (selectedFilter === 'completed') matchesStatus = !!r.checkOut;

    return matchesSearch && matchesStatus;
  });

  const activeOnFloorCount = scopedAttendance.filter((r) => !r.checkOut).length;
  const completedTodayCount = scopedAttendance.filter((r) => !!r.checkOut).length;

  const getBranchName = (bId: string) =>
    branches.find((b) => b.id === bId)?.name || 'Branch';

  const handlePunchOut = (id: string) => {
    dispatch(checkOutMember(id));
    api.put(`/attendance/${id}/check-out`).catch((err) =>
      console.warn('Backend checkout note:', err.message)
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Punch-In & Biometric Attendance
          </h2>
          <p className="text-xs text-slate-400">
            Real-time biometric turnstile logs, attendance monitoring & entry verification
          </p>
        </div>

        <button
          onClick={() => setIsCheckInOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition active:scale-95"
        >
          <QrCode className="w-4 h-4" />
          <span>Launch Check-In Kiosk</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Currently on Gym Floor"
          value={activeOnFloorCount}
          subtitle="Checked in and working out"
          icon={UserCheck}
          color="emerald"
        />

        <StatCard
          title="Total Check-Ins Today"
          value={scopedAttendance.length}
          subtitle="Cumulative punches for today"
          icon={Fingerprint}
          color="amber"
        />

        <StatCard
          title="Completed Workouts"
          value={completedTodayCount}
          subtitle="Punched out members"
          icon={Clock}
          color="blue"
        />
      </div>

      {/* Hardware Device Status Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Connected Attendance Devices (Biometric / RFID)
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Auto-sync: 15s</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {devices.map((device) => {
            const devBranch = branches.find((b) => b.id === device.branchId);
            return (
              <div
                key={device.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-xs text-white">{device.deviceName}</div>
                  <div className="text-[10px] text-slate-400">
                    {devBranch?.name} • {device.ipAddress}:{device.port}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {device.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search member by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All Punches' },
            { id: 'inside', label: 'Still Inside' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Attendance Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Member (Photo Verified)</th>
                <th className="py-3.5 px-4">Branch</th>
                <th className="py-3.5 px-4">Punch Source</th>
                <th className="py-3.5 px-4">Check-In Time</th>
                <th className="py-3.5 px-4">Check-Out Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No attendance records for today.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((rec) => {
                  const isCheckedIn = !rec.checkOut;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={rec.memberPhoto || 'https://via.placeholder.com/80'}
                            alt={rec.memberName}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800"
                          />
                          <div>
                            <div className="font-bold text-white">{rec.memberName}</div>
                            <div className="text-[10px] text-slate-400">{rec.memberPhone}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {getBranchName(rec.branchId)}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-amber-400 capitalize text-[10px] font-semibold">
                          <Fingerprint className="w-3 h-3" />
                          {rec.source}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-200">
                        {formatTimeOnly(rec.checkIn)}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-400">
                        {rec.checkOut ? formatTimeOnly(rec.checkOut) : '—'}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            isCheckedIn
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isCheckedIn ? 'Active On Floor' : 'Completed'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isCheckedIn && (
                          <button
                            onClick={() => handlePunchOut(rec.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Punch Out</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
      />
    </div>
  );
};
