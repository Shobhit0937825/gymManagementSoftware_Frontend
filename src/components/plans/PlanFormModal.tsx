import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Plan } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { addPlan, updatePlan } from '../../store/slices/planSlice';
import api from '../../services/api';
import { Plus, X } from 'lucide-react';

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: Plan | null;
}

export const PlanFormModal: React.FC<PlanFormModalProps> = ({
  isOpen,
  onClose,
  planToEdit,
}) => {
  const dispatch = useAppDispatch();
  const { branches } = useAppSelector((state) => state.branch);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [price, setPrice] = useState(2499);
  const [branchId, setBranchId] = useState<string>('org_wide');
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([
    'Gym Floor Access',
    'Locker Room Access',
  ]);

  useEffect(() => {
    if (planToEdit) {
      setName(planToEdit.name);
      setDescription(planToEdit.description);
      setDurationDays(planToEdit.durationDays);
      setPrice(planToEdit.price);
      setBranchId(planToEdit.branchId || 'org_wide');
      setFeatures(planToEdit.features || []);
    } else {
      setName('');
      setDescription('');
      setDurationDays(30);
      setPrice(2499);
      setBranchId('org_wide');
      setFeatures(['Gym Floor Access', 'Locker Room Access']);
    }
  }, [planToEdit, isOpen]);

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const planPayload = {
      name,
      description,
      durationDays: Number(durationDays),
      price: Number(price),
      branchId: branchId === 'org_wide' ? null : branchId,
      features,
      isActive: true,
    };

    if (planToEdit) {
      dispatch(updatePlan({ ...planPayload, id: planToEdit.id }));
      api
        .put(`/plans/${planToEdit.id}`, planPayload)
        .catch((err) => console.warn('Backend update plan note:', err.message));
    } else {
      dispatch(addPlan(planPayload));
      api
        .post('/plans', planPayload)
        .catch((err) => console.warn('Backend add plan note:', err.message));
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={planToEdit ? 'Edit Membership Plan' : 'Create New Gym Plan'}
      subtitle="Define pricing, duration, and branch availability"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Plan Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Quarterly Pro Athlete"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Brief overview of who this plan is best suited for..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Duration (Days) *
            </label>
            <input
              type="number"
              required
              min="1"
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Price (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Branch Availability
          </label>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="org_wide">🌐 Organization-Wide (All Branches)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                📍 Specific: {b.name} ({b.city})
              </option>
            ))}
          </select>
        </div>

        {/* Plan Features */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Included Features
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add feature (e.g. Free Sauna, 2 PT sessions)"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {features.map((f, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px]"
              >
                {f}
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="hover:text-rose-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
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
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition active:scale-95"
          >
            {planToEdit ? 'Save Plan' : 'Create Plan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
