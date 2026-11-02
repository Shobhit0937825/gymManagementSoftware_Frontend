import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import api from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { MemberFormModal } from '../components/members/MemberFormModal';
import { MemberDetailModal } from '../components/members/MemberDetailModal';
import { PaymentModal } from '../components/payments/PaymentModal';
import { CheckInModal } from '../components/attendance/CheckInModal';
import { Member } from '../types';
import {
  formatCurrency,
  formatDate,
  formatTimeOnly,
  getDaysRemaining,
} from '../utils/formatters';
import { sendMessage } from '../store/slices/messageSlice';
import {
  hardcodedWeeklyAttendance,
  hardcodedHourlyOccupancy,
} from '../utils/mockData';
import {
  Users,
  CreditCard,
  Fingerprint,
  AlertTriangle,
  UserPlus,
  QrCode,
  Building2,
  Send,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Activity,
  Flame,
  Zap,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { branches, activeBranchId, organization } = useAppSelector((state) => state.branch);
  const { members } = useAppSelector((state) => state.member);
  const { payments } = useAppSelector((state) => state.payment);
  const { records: attendanceRecords } = useAppSelector((state) => state.attendance);

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [weeklyAttendanceData, setWeeklyAttendanceData] = useState<any[]>(hardcodedWeeklyAttendance);
  const [hourlyOccupancyData, setHourlyOccupancyData] = useState<any[]>(hardcodedHourlyOccupancy);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboardAPI() {
      try {
        const branchParam = activeBranchId === 'all' ? '' : `?branchId=${activeBranchId}`;
        const [statsRes, occRes, weekRes] = await Promise.allSettled([
          api.get(`/dashboard/stats${branchParam}`),
          api.get(`/dashboard/occupancy`),
          api.get(`/dashboard/weekly-attendance`),
        ]);

        if (isMounted) {
          if (statsRes.status === 'fulfilled' && statsRes.value.data?.data) {
            setLiveStats(statsRes.value.data.data);
            setIsLiveConnected(true);
          }
          if (occRes.status === 'fulfilled' && occRes.value.data?.data) {
            setHourlyOccupancyData(occRes.value.data.data);
          }
          if (weekRes.status === 'fulfilled' && weekRes.value.data?.data) {
            setWeeklyAttendanceData(weekRes.value.data.data);
          }
        }
      } catch (e) {
        console.warn('Dashboard API fallback to local state', e);
      }
    }

    fetchDashboardAPI();
    return () => {
      isMounted = false;
    };
  }, [activeBranchId]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Branch Scoped Data
  const isAll = activeBranchId === 'all';
  const currentBranch = branches.find((b) => b.id === activeBranchId);

  const scopedMembers = isAll
    ? members
    : members.filter((m) => m.branchId === activeBranchId);

  const scopedPayments = isAll
    ? payments
    : payments.filter((p) => p.branchId === activeBranchId);

  const scopedAttendance = isAll
    ? attendanceRecords
    : attendanceRecords.filter((a) => a.branchId === activeBranchId);

  // Metrics (Use Live API if available, fallback to computed state)
  const activeMembersCount = liveStats ? liveStats.activeMembers : scopedMembers.filter((m) => m.status === 'active').length;
  const totalRevenue = liveStats ? liveStats.totalRevenue : scopedPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const todayAttendanceCount = liveStats ? (liveStats.todayCheckIns || scopedAttendance.length) : scopedAttendance.length;
  const floorOccupancyCount = liveStats?.currentlyCheckedIn ?? scopedAttendance.filter((a) => !a.checkOut).length;

  const expiringMembers = scopedMembers.filter((m) => {
    const days = getDaysRemaining(m.planEndDate);
    return days >= 0 && days <= 7;
  });

  const recentAttendance = scopedAttendance.slice(0, 6);

  const handleQuickWhatsAppReminder = (member: Member) => {
    const days = getDaysRemaining(member.planEndDate);
    const content = `Hi ${member.name}, your membership at IronPulse expires in ${days} days. Please renew to continue your training without interruptions!`;
    dispatch(
      sendMessage({
        memberId: member.id,
        memberName: member.name,
        memberPhone: member.phone,
        branchId: member.branchId,
        channel: 'whatsapp',
        templateType: 'reminder_due',
        content,
        triggeredBy: 'manual',
      })
    );
    api.post('/messages/send', {
      memberId: member.id,
      memberName: member.name,
      memberPhone: member.phone,
      branchId: member.branchId,
      channel: 'whatsapp',
      templateType: 'reminder_due',
      content,
    }).catch((err) => console.warn('Message API note:', err.message));

    showToast(`WhatsApp reminder dispatched to ${member.name}!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl animate-in slide-in-from-top-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>
              {isAll
                ? 'Chain Overview (All Branches)'
                : `${currentBranch?.name || 'Branch'} — ${currentBranch?.city || ''}`}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Gym Management Console
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time biometric attendance, memberships, revenue ledger & automated WhatsApp alerts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={() => setIsCheckInOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            Check-In Kiosk
          </button>

          <button
            onClick={() => setIsPaymentOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
          >
            <CreditCard className="w-4 h-4 text-amber-400" />
            Record Fee
          </button>

          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            New Member (Webcam)
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Members"
          value={activeMembersCount}
          subtitle={`Out of ${scopedMembers.length} registered members`}
          icon={Users}
          color="emerald"
          trend={{ value: '14% this month', isPositive: true }}
        />

        <StatCard
          title="Collected Revenue"
          value={formatCurrency(totalRevenue, organization.currency)}
          subtitle={`${scopedPayments.length} recorded transactions`}
          icon={CreditCard}
          color="amber"
          trend={{ value: '9.2% vs last month', isPositive: true }}
        />

        <StatCard
          title="Today's Punches"
          value={todayAttendanceCount}
          subtitle="Biometric turnstile check-ins"
          icon={Fingerprint}
          color="blue"
        />

        <StatCard
          title="Expiring Soon (7d)"
          value={expiringMembers.length}
          subtitle="Requires renewal follow-up"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Visual Analytics Row: Weekly Attendance Trends & Peak Hours Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Attendance Bar Chart Visualizer (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Weekly Turnstile Check-In Trends
              </h3>
              <p className="text-xs text-slate-400">
                Daily member punch-ins across gym floor & biometric gates
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Punches (Avg 158/day)
              </span>
            </div>
          </div>

          {/* Live Attendance Bar Chart Visualizer */}
          <div className="pt-4 flex items-end justify-between gap-3 h-48 border-b border-slate-800 pb-2">
            {weeklyAttendanceData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition duration-150">
                  {item.count}
                </span>
                <div className="w-full max-w-[42px] bg-slate-950 rounded-t-xl overflow-hidden h-full flex flex-col justify-end p-1">
                  <div
                    className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-lg transition-all duration-500 group-hover:from-amber-500 group-hover:to-amber-300 shadow-sm"
                    style={{ height: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-amber-400 transition">
                  {item.day}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-medium">Busiest Day</span>
              <span className="font-bold text-white">Wednesday (195 Punches)</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-medium">Total Weekly Footfall</span>
              <span className="font-bold text-emerald-400">1,111 Workouts</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-medium">Retention Rate</span>
              <span className="font-bold text-amber-400">94.8% Active</span>
            </div>
          </div>
        </div>

        {/* Peak Hours Gym Density / Occupancy (1 Col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Floor Occupancy Heatmap
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Status
              </span>
            </div>
            <p className="text-xs text-slate-400">Gym floor capacity across peak hours</p>

            <div className="space-y-3 pt-4">
              {hourlyOccupancyData.slice(0, 5).map((slot, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{slot.hour}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{slot.occupancy}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        slot.level > 80
                          ? 'bg-rose-500'
                          : slot.level > 50
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${slot.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-white block">Optimal Workout Slot:</span>
              <span className="text-slate-400">11:00 AM – 3:30 PM (Light Density)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Per-Branch Comparison (Visible when viewing All Branches / Owner) */}
      {isAll && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                Cross-Branch Performance Ledger (Multi-Branch Core)
              </h3>
              <p className="text-xs text-slate-400">
                Real-time aggregated health statistics per branch location
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branches.map((b) => {
              const bMembers = members.filter((m) => m.branchId === b.id);
              const bRevenue = payments
                .filter((p) => p.branchId === b.id)
                .reduce((sum, p) => sum + p.amount, 0);
              const bAttendance = attendanceRecords.filter((a) => a.branchId === b.id).length;

              return (
                <div
                  key={b.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-white block">{b.name}</span>
                      <span className="text-[11px] text-slate-400">{b.city}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-900/80 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Members</span>
                      <span className="font-bold text-slate-200">{bMembers.length}</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Revenue</span>
                      <span className="font-bold text-amber-400 text-[11px]">
                        {formatCurrency(bRevenue, organization.currency)}
                      </span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Today's In</span>
                      <span className="font-bold text-emerald-400">{bAttendance}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Today's Check-ins & Expiring Memberships */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Attendance Activity (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                Live Turnstile Attendance Stream
              </h3>
              <p className="text-xs text-slate-400">
                Recent biometric and verified desk check-ins
              </p>
            </div>
            <button
              onClick={() => setIsCheckInOpen(true)}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              Open Kiosk <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {recentAttendance.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                No check-in activity recorded yet today.
              </p>
            ) : (
              recentAttendance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={record.memberPhoto || 'https://via.placeholder.com/80'}
                      alt={record.memberName}
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-800 shadow"
                    />
                    <div>
                      <h5 className="font-bold text-xs text-white">
                        {record.memberName}
                      </h5>
                      <span className="text-[10px] text-slate-400">
                        {record.memberPhone} • Punch via{' '}
                        <span className="text-amber-400 capitalize font-medium">{record.source}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 block font-mono">
                      {formatTimeOnly(record.checkIn)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {record.checkOut ? `Out: ${formatTimeOnly(record.checkOut)}` : 'On Floor'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expiring Memberships & Follow-up (1 Col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Expiring Soon
              </h3>
              <p className="text-xs text-slate-400">Send 1-click renewal alerts</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {expiringMembers.length} due
            </span>
          </div>

          <div className="space-y-2.5">
            {expiringMembers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                No memberships expiring in the next 7 days!
              </p>
            ) : (
              expiringMembers.slice(0, 5).map((member) => {
                const days = getDaysRemaining(member.planEndDate);
                return (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <h6 className="text-xs font-bold text-white">{member.name}</h6>
                          <span className="text-[10px] text-slate-400">
                            {member.planName}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                        {days === 0 ? 'Expires today' : `${days}d left`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-500">
                        Exp: {formatDate(member.planEndDate)}
                      </span>
                      <button
                        onClick={() => handleQuickWhatsAppReminder(member)}
                        className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
                        title="Send WhatsApp Reminder"
                      >
                        <Send className="w-3 h-3" /> WhatsApp Alert
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Global Modals triggered from dashboard */}
      <MemberFormModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
      />

      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />

      <MemberDetailModal
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        onEdit={(m) => {
          setSelectedMember(null);
        }}
        onRecordPayment={(m) => {
          setSelectedMember(null);
          setIsPaymentOpen(true);
        }}
      />
    </div>
  );
};
