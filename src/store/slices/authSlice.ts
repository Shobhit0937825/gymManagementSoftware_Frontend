import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserRole } from '../../types';
import { initialCurrentUser } from '../../utils/mockData';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

interface AuthState {
  user: User;
  token: string | null;
  isAuthenticated: boolean;
}

const savedUser = loadFromStorage<User>('auth_user', initialCurrentUser);
const savedToken = loadFromStorage<string | null>('auth_token', 'mock-jwt-token-ironpulse-2026');
const savedIsAuthenticated = loadFromStorage<boolean>('auth_authenticated', true);

const initialState: AuthState = {
  user: savedUser,
  token: savedIsAuthenticated ? savedToken : null,
  isAuthenticated: savedIsAuthenticated,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User; token?: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token || `mock-jwt-token-${Date.now()}`;
      state.isAuthenticated = true;
      saveToStorage('auth_user', state.user);
      saveToStorage('auth_token', state.token);
      saveToStorage('auth_authenticated', true);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      saveToStorage('auth_authenticated', false);
      saveToStorage('auth_token', null);
    },
    setUserRole: (state, action: PayloadAction<UserRole>) => {
      state.user.role = action.payload;
      if (action.payload === 'owner') {
        state.user.assignedBranches = ['*'];
      } else {
        state.user.assignedBranches = ['branch-1'];
      }
      saveToStorage('auth_user', state.user);
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      state.user = { ...state.user, ...action.payload };
      saveToStorage('auth_user', state.user);
    },
  },
});

export const { login, logout, setUserRole, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
