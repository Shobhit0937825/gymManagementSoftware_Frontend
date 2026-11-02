import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Attendance, DeviceSetting } from '../../types';
import { initialAttendance, initialDevices } from '../../utils/mockData';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

interface AttendanceState {
  records: Attendance[];
  devices: DeviceSetting[];
  isLoading: boolean;
}

const savedAttendance = loadFromStorage<Attendance[]>('attendance', initialAttendance);
const savedDevices = loadFromStorage<DeviceSetting[]>('devices', initialDevices);

const initialState: AttendanceState = {
  records: savedAttendance,
  devices: savedDevices,
  isLoading: false,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    checkInMember: (
      state,
      action: PayloadAction<{
        memberId: string;
        memberName: string;
        memberPhoto?: string;
        memberPhone: string;
        branchId: string;
        source: 'biometric' | 'manual' | 'qr';
      }>
    ) => {
      const newAttendance: Attendance = {
        id: `att-${Date.now()}`,
        memberId: action.payload.memberId,
        memberName: action.payload.memberName,
        memberPhoto: action.payload.memberPhoto,
        memberPhone: action.payload.memberPhone,
        branchId: action.payload.branchId,
        checkIn: new Date().toISOString(),
        source: action.payload.source,
        status: 'checked_in',
      };
      state.records.unshift(newAttendance);
      saveToStorage('attendance', state.records);
    },
    checkOutMember: (state, action: PayloadAction<string>) => {
      const record = state.records.find((r) => r.id === action.payload);
      if (record) {
        record.checkOut = new Date().toISOString();
        record.status = 'completed';
        saveToStorage('attendance', state.records);
      }
    },
    updateDeviceStatus: (
      state,
      action: PayloadAction<{ deviceId: string; status: 'connected' | 'offline' | 'syncing' }>
    ) => {
      const dev = state.devices.find((d) => d.id === action.payload.deviceId);
      if (dev) {
        dev.status = action.payload.status;
        dev.lastSyncAt = 'Just now';
        saveToStorage('devices', state.devices);
      }
    },
    addDevice: (state, action: PayloadAction<Omit<DeviceSetting, 'id' | 'lastSyncAt'>>) => {
      const newDevice: DeviceSetting = {
        ...action.payload,
        id: `dev-${Date.now()}`,
        lastSyncAt: 'Never synced',
      };
      state.devices.push(newDevice);
      saveToStorage('devices', state.devices);
    },
    setAttendance: (state, action: PayloadAction<Attendance[]>) => {
      state.records = action.payload;
      saveToStorage('attendance', state.records);
    },
    setDevices: (state, action: PayloadAction<DeviceSetting[]>) => {
      state.devices = action.payload;
      saveToStorage('devices', state.devices);
    },
  },
});

export const { checkInMember, checkOutMember, updateDeviceStatus, addDevice, setAttendance, setDevices } = attendanceSlice.actions;
export default attendanceSlice.reducer;
