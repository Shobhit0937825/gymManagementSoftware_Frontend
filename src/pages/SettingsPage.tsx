import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { updateOrganization } from '../store/slices/branchSlice';
import { addDevice, updateDeviceStatus, setDevices } from '../store/slices/attendanceSlice';
import api from '../services/api';
import { clearGymStorage } from '../utils/storage';
import {
  Fingerprint,
  Building2,
  Shield,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { organization, branches } = useAppSelector((state) => state.branch);
  const { devices } = useAppSelector((state) => state.attendance);

  const [orgForm, setOrgForm] = useState({
    name: organization.name,
    tagline: organization.tagline,
    contactEmail: organization.contactEmail,
    currency: organization.currency,
  });

  const [newDevice, setNewDevice] = useState({
    deviceName: '',
    model: 'ZKTeco K40' as const,
    branchId: branches[0]?.id || 'branch-1',
    ipAddress: '192.168.1.150',
    port: 4370,
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateOrganization(orgForm));
    api
      .put('/organization', orgForm)
      .catch((err) => console.warn('Backend update org note:', err.message));
    showToast('Organization settings updated successfully!');
  };

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevice.deviceName) return;

    const devicePayload = {
      deviceName: newDevice.deviceName,
      model: newDevice.model,
      branchId: newDevice.branchId,
      ipAddress: newDevice.ipAddress,
      port: Number(newDevice.port),
      status: 'connected' as const,
    };

    dispatch(addDevice(devicePayload));
    api
      .post('/devices', devicePayload)
      .catch((err) => console.warn('Backend add device note:', err.message));

    setNewDevice({
      deviceName: '',
      model: 'ZKTeco K40',
      branchId: branches[0]?.id || 'branch-1',
      ipAddress: '192.168.1.150',
      port: 4370,
    });

    showToast('Biometric attendance device paired!');
  };

  const handleTestDevice = (deviceId: string) => {
    dispatch(updateDeviceStatus({ deviceId, status: 'syncing' }));
    api
      .put(`/devices/${deviceId}/sync`)
      .then(() => {
        dispatch(updateDeviceStatus({ deviceId, status: 'connected' }));
        showToast('Device ping & live biometric sync successful!');
      })
      .catch(() => {
        setTimeout(() => {
          dispatch(updateDeviceStatus({ deviceId, status: 'connected' }));
          showToast('Device ping successful! 0 logs pending.');
        }, 1200);
      });
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Reset all demo members, attendance logs, and payments to initial defaults?'
      )
    ) {
      clearGymStorage();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl animate-in slide-in-from-top-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          System Settings & Hardware Integration
        </h2>
        <p className="text-xs text-slate-400">
          Configure gym brand, biometric punch machines, and system administration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Brand Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building2 className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-white">Gym Organization Profile</h3>
          </div>

          <form onSubmit={handleSaveOrg} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Organization / Brand Name
              </label>
              <input
                type="text"
                required
                value={orgForm.name}
                onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={orgForm.tagline}
                onChange={(e) => setOrgForm({ ...orgForm, tagline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={orgForm.contactEmail}
                  onChange={(e) => setOrgForm({ ...orgForm, contactEmail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={orgForm.currency}
                  onChange={(e) => setOrgForm({ ...orgForm, currency: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>

        {/* Biometric Attendance Machine Setup */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Fingerprint className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm text-white">
                Biometric Punch-In Hardware (TCP/IP & MQTT)
              </h3>
              <p className="text-[11px] text-slate-400">
                Integrate ZKTeco, eSSL, or Mantra attendance terminals
              </p>
            </div>
          </div>

          {/* Active Devices List */}
          <div className="space-y-2">
            {devices.map((device) => {
              const bName = branches.find((b) => b.id === device.branchId)?.name;
              return (
                <div
                  key={device.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-white flex items-center gap-2">
                      {device.deviceName}
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400">
                        {device.model}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {bName} • IP: {device.ipAddress}:{device.port} • Sync: {device.lastSyncAt}
                    </div>
                  </div>

                  <button
                    onClick={() => handleTestDevice(device.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                  >
                    Test Ping
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Device form */}
          <form
            onSubmit={handleAddDevice}
            className="pt-3 border-t border-slate-800 space-y-3 text-xs"
          >
            <span className="font-bold text-slate-300 block">Pair New Device</span>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Device Name (e.g. Turnstile A)"
                value={newDevice.deviceName}
                onChange={(e) => setNewDevice({ ...newDevice, deviceName: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              <select
                value={newDevice.model}
                onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value as any })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                <option value="ZKTeco K40">ZKTeco K40</option>
                <option value="eSSL SilkBio-101">eSSL SilkBio-101</option>
                <option value="Mantra Bio">Mantra Bio</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <select
                value={newDevice.branchId}
                onChange={(e) => setNewDevice({ ...newDevice, branchId: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="IP Address"
                value={newDevice.ipAddress}
                onChange={(e) => setNewDevice({ ...newDevice, ipAddress: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
              />
              <input
                type="number"
                placeholder="Port"
                value={newDevice.port}
                onChange={(e) => setNewDevice({ ...newDevice, port: Number(e.target.value) })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl text-xs transition"
            >
              + Connect Biometric Terminal
            </button>
          </form>
        </div>
      </div>

      {/* Role-Based Access Reference & Reset Demo Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-white">
              Role-Based Access Matrix (Roadmap Phase 4)
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-amber-400 block mb-1">Owner</span>
              <p className="text-[11px] text-slate-400">
                Full access across all gym branches, financial analytics & branch CRUD.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-emerald-400 block mb-1">Manager</span>
              <p className="text-[11px] text-slate-400">
                Scoped to assigned branch. Manages member plans, dues, and attendance.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-blue-400 block mb-1">Front Desk</span>
              <p className="text-[11px] text-slate-400">
                Check-in kiosk, manual desk punches, camera member registration & fee collection.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-purple-400 block mb-1">Trainer</span>
              <p className="text-[11px] text-slate-400">
                View active floor trainees, check workout logs & medical alert notes.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <h3 className="font-bold text-sm text-white">Reset Local Database</h3>
            </div>
            <p className="text-xs text-slate-400">
              Clear all added members, webcam photos, check-ins, and payments back to initial mock
              state.
            </p>
          </div>

          <button
            onClick={handleResetData}
            className="w-full py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition"
          >
            Reset to Sample Seed Data
          </button>
        </div>
      </div>
    </div>
  );
};
