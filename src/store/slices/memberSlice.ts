import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Member } from '../../types';
import { initialMembers } from '../../utils/mockData';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

interface MemberState {
  members: Member[];
  searchQuery: string;
  statusFilter: string;
  selectedMember: Member | null;
  isLoading: boolean;
}

const savedMembers = loadFromStorage<Member[]>('members', initialMembers);

const initialState: MemberState = {
  members: savedMembers,
  searchQuery: '',
  statusFilter: 'all',
  selectedMember: null,
  isLoading: false,
};

const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    addMember: (state, action: PayloadAction<Omit<Member, 'id'>>) => {
      const newMember: Member = {
        ...action.payload,
        id: `mem-${Date.now()}`,
      };
      state.members.unshift(newMember);
      saveToStorage('members', state.members);
    },
    updateMember: (state, action: PayloadAction<Member>) => {
      const index = state.members.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.members[index] = action.payload;
        if (state.selectedMember?.id === action.payload.id) {
          state.selectedMember = action.payload;
        }
        saveToStorage('members', state.members);
      }
    },
    deleteMember: (state, action: PayloadAction<string>) => {
      state.members = state.members.filter((m) => m.id !== action.payload);
      if (state.selectedMember?.id === action.payload) {
        state.selectedMember = null;
      }
      saveToStorage('members', state.members);
    },
    transferMemberBranch: (
      state,
      action: PayloadAction<{ memberId: string; targetBranchId: string }>
    ) => {
      const member = state.members.find((m) => m.id === action.payload.memberId);
      if (member) {
        member.branchId = action.payload.targetBranchId;
        saveToStorage('members', state.members);
      }
    },
    renewMembership: (
      state,
      action: PayloadAction<{
        memberId: string;
        planId: string;
        planName: string;
        startDate: string;
        endDate: string;
      }>
    ) => {
      const member = state.members.find((m) => m.id === action.payload.memberId);
      if (member) {
        member.currentPlanId = action.payload.planId;
        member.planName = action.payload.planName;
        member.planStartDate = action.payload.startDate;
        member.planEndDate = action.payload.endDate;
        member.status = 'active';
        saveToStorage('members', state.members);
      }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    setSelectedMember: (state, action: PayloadAction<Member | null>) => {
      state.selectedMember = action.payload;
    },
    setMembers: (state, action: PayloadAction<Member[]>) => {
      state.members = action.payload;
      saveToStorage('members', state.members);
    },
  },
});

export const {
  addMember,
  updateMember,
  deleteMember,
  transferMemberBranch,
  renewMembership,
  setSearchQuery,
  setStatusFilter,
  setSelectedMember,
  setMembers,
} = memberSlice.actions;

export default memberSlice.reducer;
