import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MessageLog } from '../../types';
import { initialMessages } from '../../utils/mockData';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

interface MessageState {
  logs: MessageLog[];
  isLoading: boolean;
}

const savedLogs = loadFromStorage<MessageLog[]>('messages', initialMessages);

const initialState: MessageState = {
  logs: savedLogs,
  isLoading: false,
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    sendMessage: (state, action: PayloadAction<Omit<MessageLog, 'id' | 'sentAt' | 'status'>>) => {
      const newLog: MessageLog = {
        ...action.payload,
        id: `msg-${Date.now()}`,
        sentAt: new Date().toISOString(),
        status: 'delivered',
      };
      state.logs.unshift(newLog);
      saveToStorage('messages', state.logs);
    },
    setMessages: (state, action: PayloadAction<MessageLog[]>) => {
      state.logs = action.payload;
      saveToStorage('messages', state.logs);
    },
  },
});

export const { sendMessage, setMessages } = messageSlice.actions;
export default messageSlice.reducer;
