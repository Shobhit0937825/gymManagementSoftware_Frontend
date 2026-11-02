import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './useAppStore';
import api from '../services/api';
import { setBranches, updateOrganization } from '../store/slices/branchSlice';
import { setMembers } from '../store/slices/memberSlice';
import { setPlans } from '../store/slices/planSlice';
import { setPayments } from '../store/slices/paymentSlice';
import { setAttendance, setDevices } from '../store/slices/attendanceSlice';
import { setMessages } from '../store/slices/messageSlice';

export function useBackendSync() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const { activeBranchId } = useAppSelector((state) => state.branch);

  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    async function syncData() {
      try {
        // 1. Organization & Branches
        const [orgRes, branchRes] = await Promise.allSettled([
          api.get('/organization'),
          api.get('/branches'),
        ]);

        if (isMounted) {
          if (orgRes.status === 'fulfilled' && orgRes.value.data?.data) {
            dispatch(updateOrganization(orgRes.value.data.data));
          }
          if (branchRes.status === 'fulfilled' && branchRes.value.data?.data) {
            dispatch(setBranches(branchRes.value.data.data));
          }
        }

        // 2. Members, Plans, Payments, Attendance, Messages, Devices
        const [membersRes, plansRes, paymentsRes, attendanceRes, messagesRes, devicesRes] =
          await Promise.allSettled([
            api.get('/members'),
            api.get('/plans'),
            api.get('/payments'),
            api.get('/attendance'),
            api.get('/messages'),
            api.get('/devices'),
          ]);

        if (isMounted) {
          if (membersRes.status === 'fulfilled' && membersRes.value.data?.data) {
            dispatch(setMembers(membersRes.value.data.data));
          }
          if (plansRes.status === 'fulfilled' && plansRes.value.data?.data) {
            dispatch(setPlans(plansRes.value.data.data));
          }
          if (paymentsRes.status === 'fulfilled' && paymentsRes.value.data?.data) {
            dispatch(setPayments(paymentsRes.value.data.data));
          }
          if (attendanceRes.status === 'fulfilled' && attendanceRes.value.data?.data) {
            dispatch(setAttendance(attendanceRes.value.data.data));
          }
          if (messagesRes.status === 'fulfilled' && messagesRes.value.data?.data) {
            dispatch(setMessages(messagesRes.value.data.data));
          }
          if (devicesRes.status === 'fulfilled' && devicesRes.value.data?.data) {
            dispatch(setDevices(devicesRes.value.data.data));
          }
        }
      } catch (err) {
        console.warn('Backend sync note: operating in offline-first mode', err);
      }
    }

    syncData();

    return () => {
      isMounted = false;
    };
  }, [dispatch, isAuthenticated, token, activeBranchId]);
}
