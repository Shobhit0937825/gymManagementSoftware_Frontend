import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Member, PaymentMode } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { recordPayment, setSelectedReceipt } from '../../store/slices/paymentSlice';
import api from '../../services/api';
import { CreditCard, Banknote, QrCode, Building, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedMember?: Member | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  preSelectedMember,
}) => {
  const dispatch = useAppDispatch();
  const { members } = useAppSelector((state) => state.member);
  const { activeBranchId } = useAppSelector((state) => state.branch);

  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState<number>(2499);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (preSelectedMember) {
      setMemberId(preSelectedMember.id);
    } else if (members.length > 0 && !memberId) {
      setMemberId(members[0].id);
    }
  }, [preSelectedMember, members]);

  const selectedMember = members.find((m) => m.id === memberId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const branch = selectedMember.branchId || (activeBranchId === 'all' ? 'branch-1' : activeBranchId);

    const paymentPayload = {
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      memberPhone: selectedMember.phone,
      branchId: branch,
      amount: Number(amount),
      paymentMode: paymentMode,
      status: 'paid' as const,
      notes: notes || `Payment recorded via ${paymentMode.toUpperCase()}`,
    };

    dispatch(recordPayment(paymentPayload));
    api.post('/payments', paymentPayload).catch((err) =>
      console.warn('Backend payment sync note:', err.message)
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Member Payment"
      subtitle="Collect membership fee, record payment & issue receipt"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Member */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Select Member *
          </label>
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.phone}) — {m.planName || 'No active plan'}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Amount (₹) *
          </label>
          <input
            type="number"
            required
            min="1"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base font-bold text-amber-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Payment Mode Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Payment Method *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'upi', label: 'UPI / QR', icon: QrCode },
              { id: 'cash', label: 'Cash', icon: Banknote },
              { id: 'card', label: 'Card Swipe', icon: CreditCard },
              { id: 'bank_transfer', label: 'Bank Transfer', icon: Building },
            ].map((method) => {
              const isSelected = paymentMode === method.id;
              const Icon = method.icon;
              return (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => setPaymentMode(method.id as PaymentMode)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Transaction Notes / Ref ID
          </label>
          <input
            type="text"
            placeholder="e.g. UPI Ref: 489201948209"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Record & Generate Receipt
          </button>
        </div>
      </form>
    </Modal>
  );
};
