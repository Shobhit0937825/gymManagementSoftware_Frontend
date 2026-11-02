import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { setMembers } from '../store/slices/memberSlice';
import api from '../services/api';
import { MemberFormModal } from '../components/members/MemberFormModal';
import { MemberDetailModal } from '../components/members/MemberDetailModal';
import { PaymentModal } from '../components/payments/PaymentModal';
import { Badge } from '../components/common/Badge';
import { Member } from '../types';
import {
  formatDate,
  getDaysRemaining,
} from '../utils/formatters';
import {
  Search,
  UserPlus,
  Phone,
  Building2,
  LayoutGrid,
  List,
  AlertCircle,
  Camera,
} from 'lucide-react';

export const MembersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { members } = useAppSelector((state) => state.member);
  const { branches, activeBranchId } = useAppSelector((state) => state.branch);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [paymentMember, setPaymentMember] = useState<Member | null>(null);

  useEffect(() => {
    const branchParam = activeBranchId === 'all' ? '' : `?branchId=${activeBranchId}`;
    api
      .get(`/members${branchParam}`)
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          dispatch(setMembers(res.data.data));
        }
      })
      .catch((e) => console.warn('Members fetch note:', e));
  }, [activeBranchId, dispatch]);

  // Filter members by active branch context
  const branchScopedMembers = members.filter((m) => {
    if (activeBranchId === 'all') {
      if (selectedBranchFilter !== 'all') {
        return m.branchId === selectedBranchFilter;
      }
      return true;
    }
    return m.branchId === activeBranchId;
  });

  // Filter by status & search
  const filteredMembers = branchScopedMembers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.biometricId && m.biometricId.toLowerCase().includes(search.toLowerCase()));

    const daysLeft = getDaysRemaining(m.planEndDate);

    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = m.status === 'active';
    else if (statusFilter === 'expired') matchesStatus = m.status === 'expired';
    else if (statusFilter === 'frozen') matchesStatus = m.status === 'frozen';
    else if (statusFilter === 'expiring') matchesStatus = daysLeft >= 0 && daysLeft <= 7;

    return matchesSearch && matchesStatus;
  });

  const getBranchName = (bId: string) =>
    branches.find((b) => b.id === bId)?.name || 'Unknown Branch';

  const handleOpenEdit = (m: Member) => {
    setSelectedMember(null);
    setMemberToEdit(m);
    setIsFormOpen(true);
  };

  const handleOpenAdd = () => {
    setMemberToEdit(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Members Directory
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {filteredMembers.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Client registrations with live webcam capture, biometric IDs & membership tracking
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition active:scale-95"
        >
          <Camera className="w-4 h-4" />
          <span>Register Member (Webcam)</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, phone, email, or Biometric ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Branch filter (if all branches active) */}
          {activeBranchId === 'all' && (
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">🏢 All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-end md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'table'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800/60">
          {[
            { id: 'all', label: 'All Members' },
            { id: 'active', label: 'Active' },
            { id: 'expiring', label: 'Expiring Soon (7d)' },
            { id: 'expired', label: 'Expired' },
            { id: 'frozen', label: 'Frozen' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === tab.id
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Members Results */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
          <h4 className="text-base font-bold text-white mb-1">No Members Found</h4>
          <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
            Try adjusting your search query or filter settings, or register a new member with the webcam.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
          >
            Register Member Now
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const daysLeft = getDaysRemaining(member.planEndDate);
            return (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition hover:shadow-xl group space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-800 group-hover:ring-amber-500/50 transition shadow-md"
                    />
                    {member.biometricId && (
                      <span className="absolute -bottom-2 -right-1 bg-slate-950 border border-slate-800 text-amber-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                        {member.biometricId}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="font-bold text-sm text-white truncate group-hover:text-amber-400 transition">
                        {member.name}
                      </h4>
                      <Badge status={member.status} />
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                      <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{getBranchName(member.branchId)}</span>
                    </p>

                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-1 truncate">
                      <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{member.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">
                      Plan
                    </span>
                    <span className="font-semibold text-slate-200">
                      {member.planName || 'Standard'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">
                      Validity
                    </span>
                    <span
                      className={`font-semibold ${
                        daysLeft > 7
                          ? 'text-emerald-400'
                          : daysLeft > 0
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Member</th>
                  <th className="py-3.5 px-4">Phone / Email</th>
                  <th className="py-3.5 px-4">Branch</th>
                  <th className="py-3.5 px-4">Active Plan</th>
                  <th className="py-3.5 px-4">Biometric ID</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className="hover:bg-slate-800/50 cursor-pointer transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <div className="font-bold text-white">{member.name}</div>
                          <div className="text-[10px] text-slate-500">
                            Joined {formatDate(member.joinDate)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div>{member.phone}</div>
                      <div className="text-[10px] text-slate-500">{member.email}</div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-300">
                      {getBranchName(member.branchId)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">
                        {member.planName || 'Standard'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Exp: {formatDate(member.planEndDate)}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-xs bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-amber-400">
                        {member.biometricId || '-'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <Badge status={member.status} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMember(member);
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Member Form Modal */}
      <MemberFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        memberToEdit={memberToEdit}
      />

      {/* Member Detail Drawer/Modal */}
      <MemberDetailModal
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        onEdit={handleOpenEdit}
        onRecordPayment={(m) => {
          setPaymentMember(m);
        }}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={!!paymentMember}
        onClose={() => setPaymentMember(null)}
        preSelectedMember={paymentMember}
      />
    </div>
  );
};
