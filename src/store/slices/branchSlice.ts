import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Branch, Organization } from '../../types';
import { initialBranches, initialOrganization } from '../../utils/mockData';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

interface BranchState {
  organization: Organization;
  branches: Branch[];
  activeBranchId: string; // 'all' or branch id
  isLoading: boolean;
}

const savedBranches = loadFromStorage<Branch[]>('branches', initialBranches);
const savedOrg = loadFromStorage<Organization>('organization', initialOrganization);
const savedActiveBranchId = loadFromStorage<string>('active_branch_id', 'branch-1');

const initialState: BranchState = {
  organization: savedOrg,
  branches: savedBranches,
  activeBranchId: savedActiveBranchId,
  isLoading: false,
};

const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    setActiveBranch: (state, action: PayloadAction<string>) => {
      state.activeBranchId = action.payload;
      saveToStorage('active_branch_id', action.payload);
      localStorage.setItem('gym_active_branch_id', action.payload);
    },
    addBranch: (state, action: PayloadAction<Omit<Branch, 'id' | 'organizationId' | 'createdAt'>>) => {
      const newBranch: Branch = {
        ...action.payload,
        id: `branch-${Date.now()}`,
        organizationId: state.organization.id,
        createdAt: new Date().toISOString(),
      };
      state.branches.push(newBranch);
      saveToStorage('branches', state.branches);
    },
    updateBranch: (state, action: PayloadAction<Branch>) => {
      const index = state.branches.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.branches[index] = action.payload;
        saveToStorage('branches', state.branches);
      }
    },
    toggleBranchStatus: (state, action: PayloadAction<string>) => {
      const branch = state.branches.find((b) => b.id === action.payload);
      if (branch) {
        branch.isActive = !branch.isActive;
        saveToStorage('branches', state.branches);
      }
    },
    updateOrganization: (state, action: PayloadAction<Partial<Organization>>) => {
      state.organization = { ...state.organization, ...action.payload };
      saveToStorage('organization', state.organization);
    },
    setBranches: (state, action: PayloadAction<Branch[]>) => {
      state.branches = action.payload;
      saveToStorage('branches', state.branches);
    },
  },
});

export const {
  setActiveBranch,
  addBranch,
  updateBranch,
  toggleBranchStatus,
  updateOrganization,
  setBranches,
} = branchSlice.actions;

export default branchSlice.reducer;
