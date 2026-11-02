import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CameraCapture } from '../common/CameraCapture';
import { Member, Gender, MembershipStatus } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { addMember, updateMember } from '../../store/slices/memberSlice';
import api from '../../services/api';
import { User, Phone, Mail, MapPin, Shield, Calendar, HeartPulse } from 'lucide-react';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
}) => {
  const dispatch = useAppDispatch();
  const { branches, activeBranchId } = useAppSelector((state) => state.branch);
  const { plans } = useAppSelector((state) => state.plan);

  const initialBranch =
    activeBranchId === 'all'
      ? branches[0]?.id || 'branch-1'
      : activeBranchId;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    photoUrl: '',
    dateOfBirth: '1995-01-01',
    gender: 'male' as Gender,
    branchId: initialBranch,
    biometricId: '',
    currentPlanId: plans[0]?.id || '',
    bloodGroup: 'O+',
    status: 'active' as MembershipStatus,
    emergencyName: '',
    emergencyRelationship: 'Parent',
    emergencyPhone: '',
    notes: '',
  });

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        name: memberToEdit.name,
        phone: memberToEdit.phone,
        email: memberToEdit.email,
        address: memberToEdit.address,
        photoUrl: memberToEdit.photoUrl,
        dateOfBirth: memberToEdit.dateOfBirth,
        gender: memberToEdit.gender,
        branchId: memberToEdit.branchId,
        biometricId: memberToEdit.biometricId || '',
        currentPlanId: memberToEdit.currentPlanId || (plans[0]?.id || ''),
        bloodGroup: memberToEdit.bloodGroup || 'O+',
        status: memberToEdit.status,
        emergencyName: memberToEdit.emergencyContact.name,
        emergencyRelationship: memberToEdit.emergencyContact.relationship,
        emergencyPhone: memberToEdit.emergencyContact.phone,
        notes: memberToEdit.notes || '',
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        photoUrl: '',
        dateOfBirth: '1995-01-01',
        gender: 'male',
        branchId: initialBranch,
        biometricId: `BIO-${Math.floor(100 + Math.random() * 900)}`,
        currentPlanId: plans[0]?.id || '',
        bloodGroup: 'O+',
        status: 'active',
        emergencyName: '',
        emergencyRelationship: 'Family',
        emergencyPhone: '',
        notes: '',
      });
    }
  }, [memberToEdit, isOpen, initialBranch, plans]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPlan = plans.find((p) => p.id === formData.currentPlanId);
    const startDate = new Date().toISOString();
    const endDate = new Date(
      Date.now() + (selectedPlan?.durationDays || 30) * 24 * 60 * 60 * 1000
    ).toISOString();

    if (memberToEdit) {
      const updatedMemberPayload = {
        ...memberToEdit,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        photoUrl: formData.photoUrl || memberToEdit.photoUrl,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        branchId: formData.branchId,
        biometricId: formData.biometricId,
        currentPlanId: formData.currentPlanId,
        planName: selectedPlan?.name || memberToEdit.planName,
        bloodGroup: formData.bloodGroup,
        status: formData.status,
        emergencyContact: {
          name: formData.emergencyName,
          relationship: formData.emergencyRelationship,
          phone: formData.emergencyPhone,
        },
        notes: formData.notes,
      };

      dispatch(updateMember(updatedMemberPayload));
      api.put(`/members/${memberToEdit.id}`, updatedMemberPayload).catch((err) =>
        console.warn('Backend update sync note:', err.message)
      );
    } else {
      const newMemberPayload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        photoUrl:
          formData.photoUrl ||
          `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80`,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        branchId: formData.branchId,
        biometricId: formData.biometricId,
        currentPlanId: formData.currentPlanId,
        planName: selectedPlan?.name || 'Standard Plan',
        planStartDate: startDate,
        planEndDate: endDate,
        joinDate: new Date().toISOString().split('T')[0],
        bloodGroup: formData.bloodGroup,
        status: formData.status,
        emergencyContact: {
          name: formData.emergencyName || 'Emergency Contact',
          relationship: formData.emergencyRelationship,
          phone: formData.emergencyPhone || formData.phone,
        },
        notes: formData.notes,
      };

      dispatch(addMember(newMemberPayload));
      api.post('/members', newMemberPayload).catch((err) =>
        console.warn('Backend create member sync note:', err.message)
      );
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={memberToEdit ? 'Edit Member Profile' : 'Register New Member'}
      subtitle="Complete profile details, take photo & assign membership"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo capture & Basic Info row */}
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start border-b border-slate-800 pb-6">
          <CameraCapture
            photoUrl={formData.photoUrl}
            onChange={(url) => setFormData({ ...formData, photoUrl: url })}
          />

          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. David Reynolds"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  placeholder="david@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Biometric Punch ID
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="BIO-101"
                  value={formData.biometricId}
                  onChange={(e) => setFormData({ ...formData, biometricId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Branch & Membership Plan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-800 pb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Assigned Branch *
            </label>
            <select
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Membership Plan *
            </label>
            <select
              value={formData.currentPlanId}
              onChange={(e) => setFormData({ ...formData, currentPlanId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ₹{p.price} ({p.durationDays}d)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Membership Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as MembershipStatus })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="frozen">Frozen</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Demographics & Health */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-800 pb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Blood Group
            </label>
            <div className="relative">
              <HeartPulse className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="O+, A+, B+"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Emergency Contact Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah Reynolds"
              value={formData.emergencyName}
              onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Relationship
            </label>
            <input
              type="text"
              placeholder="Spouse / Parent"
              value={formData.emergencyRelationship}
              onChange={(e) =>
                setFormData({ ...formData, emergencyRelationship: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Emergency Phone
            </label>
            <input
              type="tel"
              placeholder="+91 98765 00000"
              value={formData.emergencyPhone}
              onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Residential Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Apartment, Street address, City"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Form Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition active:scale-95"
          >
            {memberToEdit ? 'Save Changes' : 'Register Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
