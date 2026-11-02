import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Plan } from '../../types';
import { initialPlans } from '../../utils/mockData';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

interface PlanState {
  plans: Plan[];
  isLoading: boolean;
}

const savedPlans = loadFromStorage<Plan[]>('plans', initialPlans);

const initialState: PlanState = {
  plans: savedPlans,
  isLoading: false,
};

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    addPlan: (state, action: PayloadAction<Omit<Plan, 'id'>>) => {
      const newPlan: Plan = {
        ...action.payload,
        id: `plan-${Date.now()}`,
      };
      state.plans.push(newPlan);
      saveToStorage('plans', state.plans);
    },
    updatePlan: (state, action: PayloadAction<Plan>) => {
      const index = state.plans.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.plans[index] = action.payload;
        saveToStorage('plans', state.plans);
      }
    },
    togglePlanStatus: (state, action: PayloadAction<string>) => {
      const plan = state.plans.find((p) => p.id === action.payload);
      if (plan) {
        plan.isActive = !plan.isActive;
        saveToStorage('plans', state.plans);
      }
    },
    deletePlan: (state, action: PayloadAction<string>) => {
      state.plans = state.plans.filter((p) => p.id !== action.payload);
      saveToStorage('plans', state.plans);
    },
    setPlans: (state, action: PayloadAction<Plan[]>) => {
      state.plans = action.payload;
      saveToStorage('plans', state.plans);
    },
  },
});

export const { addPlan, updatePlan, togglePlanStatus, deletePlan, setPlans } = planSlice.actions;
export default planSlice.reducer;
