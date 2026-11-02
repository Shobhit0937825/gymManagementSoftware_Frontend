import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Payment } from '../../types';
import { initialPayments } from '../../utils/mockData';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

interface PaymentState {
  payments: Payment[];
  selectedReceipt: Payment | null;
  isLoading: boolean;
}

const savedPayments = loadFromStorage<Payment[]>('payments', initialPayments);

const initialState: PaymentState = {
  payments: savedPayments,
  selectedReceipt: null,
  isLoading: false,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    recordPayment: (state, action: PayloadAction<Omit<Payment, 'id' | 'receiptNumber' | 'paymentDate'>>) => {
      const year = new Date().getFullYear();
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const newPayment: Payment = {
        ...action.payload,
        id: `pay-${Date.now()}`,
        receiptNumber: `REC-${year}-${randomSeq}`,
        paymentDate: new Date().toISOString(),
      };
      state.payments.unshift(newPayment);
      saveToStorage('payments', state.payments);
    },
    setSelectedReceipt: (state, action: PayloadAction<Payment | null>) => {
      state.selectedReceipt = action.payload;
    },
    setPayments: (state, action: PayloadAction<Payment[]>) => {
      state.payments = action.payload;
      saveToStorage('payments', state.payments);
    },
  },
});

export const { recordPayment, setSelectedReceipt, setPayments } = paymentSlice.actions;
export default paymentSlice.reducer;
