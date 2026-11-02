import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, AlertTriangle, Shield } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { logout } from '../../store/slices/authSlice';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleConfirmLogout = () => {
    onClose();
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Sign Out"
      subtitle="Terminal session termination"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Warning Card */}
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-300">
              Are you sure you want to log out?
            </h4>
            <p className="text-xs text-rose-400/80 mt-1 leading-relaxed">
              You will be signed out from this workstation terminal. Any unsaved member registration
              or fee drafts will need to be re-entered.
            </p>
          </div>
        </div>

        {/* Current Active Account Box */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/40"
            />
            <div>
              <p className="text-xs font-bold text-white">{user.name}</p>
              <p className="text-[11px] text-slate-400">{user.email}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 capitalize">
            {user.role}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Stay Signed In
          </button>

          <button
            type="button"
            onClick={handleConfirmLogout}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-500/20 flex items-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Yes, Log Out</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LogoutConfirmModal;

