import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Member } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import {
  deleteMember,
  transferMemberBranch,
  renewMembership,
} from '../../store/slices/memberSlice';
import { sendMessage } from '../../store/slices/messageSlice';
import api from '../../services/api';
import {
  formatDate,
  getDaysRemaining,
  formatCurrency,
} from '../../utils/formatters';
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  Send,
  ArrowRightLeft,
  RefreshCw,
  Trash2,
  CheckCircle,
} from 'lucide-react';

interface MemberDetailModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (member: Member) => void;
  onRecordPayment: (member: Member) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  isOpen,
  onClose,
  onEdit,
  onRecordPayment,
}) => {
  const dispatch = useAppDispatch();
  const { branches } = useAppSelector((state) => state.branch);
  const { plans } = useAppSelector((state) => state.plan);

  const [isTransferring, setIsTransferring] = useState(false);
  const [targetBranchId, setTargetBranchId] = useState('');
  const [isRenewing, setIsRenewing] = useState(false);
  const [renewPlanId, setRenewPlanId] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!member) return null;

  const currentBranch = branches.find((b) => b.id === member.branchId);
  const daysLeft = getDaysRemaining(member.planEndDate);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTransfer = () => {
    if (!targetBranchId || targetBranchId === member.branchId) return;
    dispatch(
      transferMemberBranch({
        memberId: member.id,
        targetBranchId: targetBranchId,
      })
    );
    api.put(`/members/${member.id}`, { branchId: targetBranchId }).catch((err) =>
      console.warn('Backend transfer member note:', err.message)
    );
    setIsTransferring(false);
    triggerToast('Member transferred successfully!');
  };

  const handleRenew = () => {
    const selectedPlan = plans.find((p) => p.id === renewPlanId);
    if (!selectedPlan) return;

    const startDate = new Date().toISOString();
    const endDate = new Date(
      Date.now() + selectedPlan.durationDays * 24 * 60 * 60 * 1000
    ).toISOString();

    dispatch(
      renewMembership({
        memberId: member.id,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        startDate,
        endDate,
      })
    );

    api.put(`/members/${member.id}`, {
      currentPlanId: selectedPlan.id,
      planName: selectedPlan.name,
      planStartDate: startDate,
      planEndDate: endDate,
      status: 'active',
    }).catch((err) => console.warn('Backend renew note:', err.message));

    setIsRenewing(false);
    triggerToast(`Renewed with ${selectedPlan.name}!`);
  };

  const handleSendWhatsApp = () => {
    const content = `Hi ${member.name}, reminder from ${currentBranch?.name || 'IronPulse'}: Your ${member.planName} membership has ${daysLeft} days remaining.`;
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
    }).catch((err) => console.warn('Backend message note:', err.message));

    triggerToast('WhatsApp reminder dispatched!');
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove ${member.name}?`)) {
      dispatch(deleteMember(member.id));
      api.delete(`/members/${member.id}`).catch((err) =>
        console.warn('Backend delete member note:', err.message)
      );
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Member Profile & Membership"
      subtitle={`Member ID: ${member.id}`}
      maxWidth="2xl"
    >
      {toastMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Header Profile card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <img
            src={member.photoUrl}
            alt={member.name}
            className="w-24 h-24 rounded-2xl object-cover ring-2 ring-amber-500 shadow-xl"
          />

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-lg font-bold text-white">{member.name}</h4>
              <Badge status={member.status} />
            </div>

            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {currentBranch?.name} ({currentBranch?.city})
              </span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                {member.phone}
              </span>
              {member.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {member.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Current Plan Card */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Membership Plan
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                daysLeft > 7
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : daysLeft > 0
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {daysLeft > 0 ? `${daysLeft} days remaining` : 'Expired'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h5 className="text-base font-bold text-white">
                {member.planName || 'Standard Plan'}
              </h5>
              <p className="text-xs text-slate-400">
                Period: {formatDate(member.planStartDate)} to {formatDate(member.planEndDate)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRenewing(!isRenewing)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Renew
              </button>

              <button
                type="button"
                onClick={() => onRecordPayment(member)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition"
              >
                + Payment
              </button>
            </div>
          </div>

          {/* Inline Renew plan selector */}
          {isRenewing && (
            <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/30 space-y-2 mt-2">
              <label className="block text-xs font-medium text-amber-400">
                Select Renewal Plan:
              </label>
              <div className="flex gap-2">
                <select
                  value={renewPlanId}
                  onChange={(e) => setRenewPlanId(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="">Select Plan...</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatCurrency(p.price)} ({p.durationDays}d)
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleRenew}
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-amber-400"
                >
                  Confirm Renewal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Member Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">
              Biometric ID
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {member.biometricId || 'Not assigned'}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">
              Blood Group
            </span>
            <span className="font-semibold text-white">{member.bloodGroup || 'N/A'}</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">
              Member Since
            </span>
            <span className="font-semibold text-white">{formatDate(member.joinDate)}</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 sm:col-span-3">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">
              Emergency Contact
            </span>
            <span className="font-medium text-slate-200">
              {member.emergencyContact.name} ({member.emergencyContact.relationship}) •{' '}
              <span className="text-amber-400">{member.emergencyContact.phone}</span>
            </span>
          </div>

          {member.address && (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 sm:col-span-3">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Address
              </span>
              <span className="font-medium text-slate-200">{member.address}</span>
            </div>
          )}
        </div>

        {/* Branch Transfer Box (Multi-branch feature) */}
        {isTransferring && (
          <div className="p-3 bg-slate-950 rounded-xl border border-blue-500/30 space-y-2">
            <label className="block text-xs font-semibold text-blue-400">
              Transfer Member to Another Branch:
            </label>
            <div className="flex gap-2">
              <select
                value={targetBranchId}
                onChange={(e) => setTargetBranchId(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                <option value="">Select Destination Branch...</option>
                {branches
                  .filter((b) => b.id !== member.branchId)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleTransfer}
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-xs font-bold"
              >
                Execute Transfer
              </button>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              WhatsApp Alert
            </button>

            <button
              type="button"
              onClick={() => setIsTransferring(!isTransferring)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Transfer Branch
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(member)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
            >
              Edit Info
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition"
              title="Delete member"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
