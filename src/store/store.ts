import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import branchReducer from './slices/branchSlice';
import memberReducer from './slices/memberSlice';
import planReducer from './slices/planSlice';
import paymentReducer from './slices/paymentSlice';
import attendanceReducer from './slices/attendanceSlice';
import messageReducer from './slices/messageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    branch: branchReducer,
    member: memberReducer,
    plan: planReducer,
    payment: paymentReducer,
    attendance: attendanceReducer,
    message: messageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
