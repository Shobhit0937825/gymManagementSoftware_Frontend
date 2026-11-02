import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { BranchFormModal } from '../components/branches/BranchFormModal';
import { setActiveBranch, toggleBranchStatus, setBranches } from '../store/slices/branchSlice';
import api from '../services/api';
import { Branch } from '../types';
import {
  Building2,
  Plus,
  MapPin,
  Phone,
  Mail,
  Clock,
  User,
  Check,
  Edit2,
  Users,
  CreditCard,
  Flame,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const BranchesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { branches, activeBranchId, organization } = useAppSelector((state) => state.branch);
  const { members } = useAppSelector((state) => state.member);
  const { payments } = useAppSelector((state) => state.payment);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState<Branch | null>(null);

  useEffect(() => {
    api
      .get('/branches')
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          dispatch(setBranches(res.data.data));
        }
      })
      .catch((e) => console.warn('Branches fetch note:', e));
  }, [dispatch]);

  const handleEdit = (branch: Branch) => {
    setBranchToEdit(branch);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setBranchToEdit(null);
    setIsFormOpen(true);
  };

  const handleSwitchBranch = (branchId: string) => {
    dispatch(setActiveBranch(branchId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Branch Network
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {branches.length} locations
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Multi-location gym administration, branch scoping & hardware assignments
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Branch</span>
        </button>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => {
          const isSelected = activeBranchId === branch.id;
          const branchMembers = members.filter((m) => m.branchId === branch.id);
          const branchRevenue = payments
            .filter((p) => p.branchId === branch.id)
            .reduce((sum, p) => sum + p.amount, 0);

          return (
            <div
              key={branch.id}
              className={`bg-slate-900 border rounded-3xl p-6 flex flex-col justify-between transition relative shadow-lg ${
                isSelected
                  ? 'border-amber-500 ring-2 ring-amber-500/20 bg-slate-900/90'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-4">
                {/* Branch Top Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">{branch.name}</h3>
                      <p className="text-xs text-slate-400">{branch.city}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      branch.isActive
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {branch.isActive ? 'Active' : 'Closed'}
                  </span>
                </div>

                {/* Metrics Mini-strip */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">
                      Registered
                    </span>
                    <span className="text-sm font-bold text-white flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {branchMembers.length} Members
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">
                      Revenue
                    </span>
                    <span className="text-sm font-bold text-amber-400 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                      {formatCurrency(branchRevenue, organization.currency)}
                    </span>
                  </div>
                </div>

                {/* Branch Info List */}
                <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                    <span className="text-slate-300">{branch.address}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-slate-300">{branch.phone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-slate-300">{branch.timings}</span>
                  </div>

                  {branch.managerName && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-slate-400">
                        Manager: <strong className="text-slate-200">{branch.managerName}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleSwitchBranch(branch.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Active Workspace
                    </>
                  ) : (
                    'Switch to this branch'
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleEdit(branch)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    title="Edit Branch"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Branch Form Modal */}
      <BranchFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        branchToEdit={branchToEdit}
      />
    </div>
  );
};
