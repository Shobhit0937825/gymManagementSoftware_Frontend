import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Branch } from '../../types';
import { useAppDispatch } from '../../hooks/useAppStore';
import { addBranch, updateBranch } from '../../store/slices/branchSlice';
import api from '../../services/api';
import { Building2, MapPin, Phone, Mail, Clock, User } from 'lucide-react';

interface BranchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchToEdit?: Branch | null;
}

export const BranchFormModal: React.FC<BranchFormModalProps> = ({
  isOpen,
  onClose,
  branchToEdit,
}) => {
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    timings: '06:00 AM - 10:30 PM (Daily)',
    managerName: '',
    totalCapacity: 300,
    isActive: true,
  });

  useEffect(() => {
    if (branchToEdit) {
      setFormData({
        name: branchToEdit.name,
        city: branchToEdit.city,
        address: branchToEdit.address,
        phone: branchToEdit.phone,
        email: branchToEdit.email,
        timings: branchToEdit.timings,
        managerName: branchToEdit.managerName || '',
        totalCapacity: branchToEdit.totalCapacity || 300,
        isActive: branchToEdit.isActive,
      });
    } else {
      setFormData({
        name: '',
        city: '',
        address: '',
        phone: '',
        email: '',
        timings: '06:00 AM - 10:30 PM (Daily)',
        managerName: '',
        totalCapacity: 300,
        isActive: true,
      });
    }
  }, [branchToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (branchToEdit) {
      dispatch(updateBranch({ ...branchToEdit, ...formData }));
      api
        .put(`/branches/${branchToEdit.id}`, formData)
        .catch((err) => console.warn('Backend update branch note:', err.message));
    } else {
      dispatch(addBranch(formData));
      api
        .post('/branches', formData)
        .catch((err) => console.warn('Backend add branch note:', err.message));
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={branchToEdit ? 'Edit Gym Branch' : 'Add New Gym Branch'}
      subtitle="Expand your gym network with a new branch location"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Branch Name *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="e.g. Uptown Powerhouse"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              City / Territory *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Austin (Downtown)"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Physical Address *
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              required
              placeholder="Full street address and zip code"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Branch Phone *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                required
                placeholder="+1 (555) 019-2834"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Contact Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                placeholder="branch@ironpulsefitness.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Operating Hours
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="05:30 AM - 11:00 PM"
                value={formData.timings}
                onChange={(e) => setFormData({ ...formData, timings: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Branch Manager Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. Jason Myers"
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

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
            {branchToEdit ? 'Save Changes' : 'Create Branch'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
