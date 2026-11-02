import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { setPayments } from '../store/slices/paymentSlice';
import api from '../services/api';
import { PaymentModal } from '../components/payments/PaymentModal';
import { ReceiptModal } from '../components/payments/ReceiptModal';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { Payment, PaymentMode } from '../types';
import {
  formatCurrency,
  formatDateTime,
} from '../utils/formatters';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Printer,
  QrCode,
  Banknote,
  Building,
  ArrowUpRight,
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { payments } = useAppSelector((state) => state.payment);
  const { branches, activeBranchId, organization } = useAppSelector((state) => state.branch);

  const [search, setSearch] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);

  useEffect(() => {
    const branchParam = activeBranchId === 'all' ? '' : `?branchId=${activeBranchId}`;
    api
      .get(`/payments${branchParam}`)
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          dispatch(setPayments(res.data.data));
        }
      })
      .catch((e) => console.warn('Payments fetch note:', e));
  }, [activeBranchId, dispatch]);

  // Scoped to active branch
  const scopedPayments = payments.filter((p) => {
    if (activeBranchId === 'all') return true;
    return p.branchId === activeBranchId;
  });

  const filteredPayments = scopedPayments.filter((p) => {
    const matchesSearch =
      p.memberName.toLowerCase().includes(search.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.memberPhone.includes(search);

    const matchesMode = selectedMode === 'all' || p.paymentMode === selectedMode;

    return matchesSearch && matchesMode;
  });

  // Analytics
  const totalRevenue = scopedPayments.reduce((acc, p) => acc + p.amount, 0);
  const upiRevenue = scopedPayments
    .filter((p) => p.paymentMode === 'upi')
    .reduce((acc, p) => acc + p.amount, 0);
  const cashRevenue = scopedPayments
    .filter((p) => p.paymentMode === 'cash')
    .reduce((acc, p) => acc + p.amount, 0);

  const getBranchName = (bId: string) =>
    branches.find((b) => b.id === bId)?.name || 'Branch';

  const getModeIcon = (mode: PaymentMode) => {
    switch (mode) {
      case 'upi':
        return <QrCode className="w-3.5 h-3.5 text-emerald-400" />;
      case 'cash':
        return <Banknote className="w-3.5 h-3.5 text-amber-400" />;
      case 'card':
        return <CreditCard className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Building className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Payments & Billing
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {filteredPayments.length} records
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Track subscription revenue, dues, and generate official payment receipts
          </p>
        </div>

        <button
          onClick={() => setIsRecordOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Collected"
          value={formatCurrency(totalRevenue, organization.currency)}
          subtitle="All transactions in selected view"
          icon={CreditCard}
          color="emerald"
        />
        <StatCard
          title="UPI & Digital Modes"
          value={formatCurrency(upiRevenue, organization.currency)}
          subtitle="GPay, PhonePe, Paytm, QR"
          icon={QrCode}
          color="amber"
        />
        <StatCard
          title="Cash Collections"
          value={formatCurrency(cashRevenue, organization.currency)}
          subtitle="Front desk cash register"
          icon={Banknote}
          color="blue"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by member name, phone, or receipt number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Payment Modes</option>
            <option value="upi">UPI / QR Code</option>
            <option value="cash">Cash</option>
            <option value="card">Card Swipe</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Payment Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Receipt #</th>
                <th className="py-3.5 px-4">Member Name</th>
                <th className="py-3.5 px-4">Branch</th>
                <th className="py-3.5 px-4">Mode</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No payment records match your filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {p.receiptNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{p.memberName}</div>
                      <div className="text-[10px] text-slate-500">{p.memberPhone}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {getBranchName(p.branchId)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-medium capitalize text-slate-200">
                        {getModeIcon(p.paymentMode)}
                        {p.paymentMode.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {formatDateTime(p.paymentDate)}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={p.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-sm text-white">
                      {formatCurrency(p.amount, organization.currency)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setReceiptPayment(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <PaymentModal
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
      />

      {/* View/Print Receipt Modal */}
      <ReceiptModal
        payment={receiptPayment}
        isOpen={!!receiptPayment}
        onClose={() => setReceiptPayment(null)}
      />
    </div>
  );
};
