import React from 'react';
import { Modal } from '../common/Modal';
import { Payment } from '../../types';
import { useAppSelector } from '../../hooks/useAppStore';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Printer, CheckCircle, Flame } from 'lucide-react';

interface ReceiptModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  isOpen,
  onClose,
}) => {
  const { branches, organization } = useAppSelector((state) => state.branch);

  if (!payment) return null;

  const branch = branches.find((b) => b.id === payment.branchId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Payment Receipt"
      subtitle="Tax Invoice & Membership Payment Acknowledgment"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Printable Receipt Card */}
        <div
          id="printable-receipt"
          className="bg-white text-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <Flame className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-tight text-slate-900">
                  {organization.name}
                </h4>
                <p className="text-[10px] text-slate-500">{branch?.name || 'Main Branch'}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Receipt No
              </span>
              <span className="font-mono text-xs font-bold text-slate-900">
                {payment.receiptNumber}
              </span>
            </div>
          </div>

          {/* Branch & Date Info */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pb-4 border-b border-slate-200">
            <div>
              <span className="font-semibold text-slate-900 block">Branch Location:</span>
              <p>{branch?.address || 'Gym location'}</p>
              <p>Ph: {branch?.phone || 'N/A'}</p>
            </div>
            <div className="text-right">
              <span className="font-semibold text-slate-900 block">Date & Time:</span>
              <p>{formatDateTime(payment.paymentDate)}</p>
              <p className="font-semibold text-emerald-600 capitalize">
                Paid via {payment.paymentMode.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>

          {/* Member Details */}
          <div className="py-4 border-b border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Billed To
            </span>
            <h5 className="font-bold text-slate-900 text-sm">{payment.memberName}</h5>
            <p className="text-xs text-slate-600">Mobile: {payment.memberPhone}</p>
          </div>

          {/* Invoice Table */}
          <div className="py-4 border-b border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="text-left pb-2 font-semibold">Description</th>
                  <th className="text-right pb-2 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2.5 text-slate-800">
                    <div>Gym Membership Subscription</div>
                    <div className="text-[10px] text-slate-400">{payment.notes || 'Full gym access'}</div>
                  </td>
                  <td className="py-2.5 text-right font-bold text-slate-900">
                    {formatCurrency(payment.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>PAYMENT RECEIVED</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                Total Paid
              </span>
              <span className="text-lg font-black text-slate-900">
                {formatCurrency(payment.amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
        </div>
      </div>
    </Modal>
  );
};
