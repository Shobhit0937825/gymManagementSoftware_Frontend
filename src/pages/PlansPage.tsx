import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { PlanFormModal } from '../components/plans/PlanFormModal';
import { togglePlanStatus, deletePlan, setPlans } from '../store/slices/planSlice';
import api from '../services/api';
import { Plan } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  Dumbbell,
  Plus,
  Check,
  Building2,
  Globe,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const PlansPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { plans } = useAppSelector((state) => state.plan);
  const { branches, organization } = useAppSelector((state) => state.branch);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<Plan | null>(null);
  const [filterScope, setFilterScope] = useState<'all' | 'org' | 'branch'>('all');

  useEffect(() => {
    api
      .get('/plans')
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          dispatch(setPlans(res.data.data));
        }
      })
      .catch((e) => console.warn('Plans fetch note:', e));
  }, [dispatch]);

  const filteredPlans = plans.filter((p) => {
    if (filterScope === 'org') return p.branchId === null;
    if (filterScope === 'branch') return p.branchId !== null;
    return true;
  });

  const getBranchName = (bId: string | null) => {
    if (!bId) return 'All Branches (Org-wide)';
    return branches.find((b) => b.id === bId)?.name || 'Specific Branch';
  };

  const handleEdit = (plan: Plan) => {
    setPlanToEdit(plan);
    setIsFormOpen(true);
  };

  const handleTogglePlan = (plan: Plan) => {
    dispatch(togglePlanStatus(plan.id));
    api
      .put(`/plans/${plan.id}`, { isActive: !plan.isActive })
      .catch((err) => console.warn('Backend toggle plan note:', err.message));
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the "${name}" plan?`)) {
      dispatch(deletePlan(id));
      api
        .delete(`/plans/${id}`)
        .catch((err) => console.warn('Backend delete plan note:', err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Membership Plans & Pricing
          </h2>
          <p className="text-xs text-slate-400">
            Define gym subscription packages, org-wide or branch-specific tariffs
          </p>
        </div>

        <button
          onClick={() => {
            setPlanToEdit(null);
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Scope Filter Tabs */}
      <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setFilterScope('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            filterScope === 'all'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Plans ({plans.length})
        </button>
        <button
          onClick={() => setFilterScope('org')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            filterScope === 'org'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" /> Org-Wide Only
        </button>
        <button
          onClick={() => setFilterScope('branch')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            filterScope === 'branch'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> Branch Specific
        </button>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => {
          const isOrgWide = plan.branchId === null;

          return (
            <div
              key={plan.id}
              className={`bg-slate-900 border rounded-3xl p-6 flex flex-col justify-between transition hover:shadow-2xl relative ${
                plan.popular
                  ? 'border-amber-500/50 shadow-amber-500/5'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-6 bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Most Popular
                </span>
              )}

              <div className="space-y-4">
                {/* Plan Scope Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      isOrgWide
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {isOrgWide ? <Globe className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                    {getBranchName(plan.branchId)}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      plan.isActive
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {plan.isActive ? 'Active' : 'Archived'}
                  </span>
                </div>

                {/* Plan Name & Price */}
                <div>
                  <h3 className="text-xl font-black text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {plan.description || 'Gym fitness and workout membership plan.'}
                  </p>
                </div>

                <div className="pt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-white">
                    {formatCurrency(plan.price, organization.currency)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    / {plan.durationDays} days
                  </span>
                </div>

                {/* Features */}
                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Plan Inclusions:
                  </span>
                  <ul className="space-y-2">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5 shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleTogglePlan(plan)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  {plan.isActive ? 'Deactivate' : 'Activate'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleEdit(plan)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    title="Edit Plan"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(plan.id, plan.name)}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <PlanFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        planToEdit={planToEdit}
      />
    </div>
  );
};
