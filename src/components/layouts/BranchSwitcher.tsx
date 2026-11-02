import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { setActiveBranch } from '../../store/slices/branchSlice';
import { Building2, ChevronDown, Check, Globe } from 'lucide-react';

export const BranchSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const { branches, activeBranchId, organization } = useAppSelector((state) => state.branch);
  const { user } = useAppSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeBranch = branches.find((b) => b.id === activeBranchId);
  const isOwner = user.role === 'owner';

  // Allowed branches for this user
  const accessibleBranches = isOwner
    ? branches
    : branches.filter((b) => user.assignedBranches.includes(b.id) || user.assignedBranches.includes('*'));

  const handleSelect = (branchId: string) => {
    dispatch(setActiveBranch(branchId));
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition text-left group"
      >
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-105 transition">
          {activeBranchId === 'all' ? (
            <Globe className="w-4 h-4 text-emerald-400" />
          ) : (
            <Building2 className="w-4 h-4" />
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Current Branch
          </span>
          <span className="text-xs font-semibold text-slate-100 max-w-[140px] truncate">
            {activeBranchId === 'all' ? 'All Branches (Owner)' : activeBranch?.name || 'Select Branch'}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 ml-1 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3 border-b border-slate-800/80 bg-slate-950/50">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {organization.name}
            </p>
            <p className="text-xs text-slate-500">Switch workspace location</p>
          </div>

          <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
            {isOwner && (
              <button
                onClick={() => handleSelect('all')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition ${
                  activeBranchId === 'all'
                    ? 'bg-amber-500/15 text-amber-400 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-medium">All Branches Overview</div>
                    <div className="text-[10px] text-slate-500">Combined chain statistics</div>
                  </div>
                </div>
                {activeBranchId === 'all' && <Check className="w-4 h-4 text-amber-400" />}
              </button>
            )}

            {accessibleBranches.map((branch) => {
              const isSelected = activeBranchId === branch.id;
              return (
                <button
                  key={branch.id}
                  onClick={() => handleSelect(branch.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-400 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-200">{branch.name}</div>
                      <div className="text-[10px] text-slate-500">{branch.city}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
