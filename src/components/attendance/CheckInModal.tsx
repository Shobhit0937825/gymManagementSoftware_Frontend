import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { checkInMember } from '../../store/slices/attendanceSlice';
import api from '../../services/api';
import { Search, CheckCircle2, UserCheck, ShieldAlert, Fingerprint, QrCode } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { members } = useAppSelector((state) => state.member);
  const { activeBranchId, branches } = useAppSelector((state) => state.branch);
  const [search, setSearch] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [punchSuccess, setPunchSuccess] = useState(false);
  const [source, setSource] = useState<'biometric' | 'manual' | 'qr'>('manual');

  // Filter members available for check-in
  const branchMembers = members.filter((m) =>
    activeBranchId === 'all' ? true : m.branchId === activeBranchId
  );

  const filteredMembers = branchMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      (m.biometricId && m.biometricId.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const handleCheckIn = () => {
    if (!selectedMember) return;

    const targetBranch =
      activeBranchId === 'all' ? selectedMember.branchId : activeBranchId;

    const checkInPayload = {
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      memberPhoto: selectedMember.photoUrl,
      memberPhone: selectedMember.phone,
      branchId: targetBranch,
      source: source,
    };

    dispatch(checkInMember(checkInPayload));
    api.post('/attendance/check-in', checkInPayload).catch((err) =>
      console.warn('Backend attendance check-in sync note:', err.message)
    );

    setPunchSuccess(true);
    setTimeout(() => {
      setPunchSuccess(false);
      setSelectedMemberId(null);
      setSearch('');
      onClose();
    }, 1500);
  };

  const getBranchName = (bId: string) =>
    branches.find((b) => b.id === bId)?.name || 'Unknown Branch';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Member Check-In & Entry Verification"
      subtitle="Verify member profile photo & punch attendance"
      maxWidth="lg"
    >
      {punchSuccess ? (
        <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-xl font-bold text-white mb-1">Check-In Successful!</h4>
          <p className="text-sm text-slate-400">
            {selectedMember?.name} checked in at {new Date().toLocaleTimeString()}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Punch Source Selector */}
          <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSource('manual')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                source === 'manual'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Manual Desk
            </button>
            <button
              type="button"
              onClick={() => setSource('biometric')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                source === 'biometric'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" /> Biometric
            </button>
            <button
              type="button"
              onClick={() => setSource('qr')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                source === 'qr'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" /> QR Pass
            </button>
          </div>

          {/* Member Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search member by name, phone, or Biometric ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Member Search List */}
          <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
            {filteredMembers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No matching members found.</p>
            ) : (
              filteredMembers.map((member) => {
                const isSelected = selectedMemberId === member.id;
                const isExpired = member.status === 'expired';

                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={member.photoUrl || 'https://via.placeholder.com/80'}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="font-semibold text-xs text-white flex items-center gap-2">
                          {member.name}
                          {member.biometricId && (
                            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-mono">
                              {member.biometricId}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {member.phone} • {getBranchName(member.branchId)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          member.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {member.status}
                      </span>
                      {member.planEndDate && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Exp: {formatDate(member.planEndDate)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Member verification preview card */}
          {selectedMember && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-4">
                <img
                  src={selectedMember.photoUrl}
                  alt={selectedMember.name}
                  className="w-16 h-16 rounded-xl object-cover ring-2 ring-amber-500"
                />
                <div className="flex-1">
                  <h5 className="font-bold text-white text-sm">{selectedMember.name}</h5>
                  <p className="text-xs text-slate-400">Plan: {selectedMember.planName || 'Standard'}</p>
                  <p className="text-xs text-slate-400">
                    Emergency: {selectedMember.emergencyContact.phone} ({selectedMember.emergencyContact.relationship})
                  </p>
                </div>
              </div>

              {selectedMember.status === 'expired' && (
                <div className="flex items-center gap-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Warning: This membership is expired! Please renew before workout.</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleCheckIn}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Punch In ({selectedMember.name})
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
