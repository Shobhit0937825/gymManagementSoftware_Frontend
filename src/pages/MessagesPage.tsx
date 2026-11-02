import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { sendMessage, setMessages } from '../store/slices/messageSlice';
import api from '../services/api';
import { TemplateType, MessageChannel } from '../types';
import { formatDateTime } from '../utils/formatters';
import {
  MessageSquare,
  Send,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Building2,
  AlertCircle,
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { logs } = useAppSelector((state) => state.message);
  const { members } = useAppSelector((state) => state.member);
  const { branches, activeBranchId } = useAppSelector((state) => state.branch);

  const [channel, setChannel] = useState<MessageChannel>('whatsapp');
  const [templateType, setTemplateType] = useState<TemplateType>('welcome');
  const [targetAudience, setTargetAudience] = useState<'all' | 'expiring' | 'active'>('active');
  const [customText, setCustomText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const branchParam = activeBranchId === 'all' ? '' : `?branchId=${activeBranchId}`;
    api
      .get(`/messages${branchParam}`)
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          dispatch(setMessages(res.data.data));
        }
      })
      .catch((e) => console.warn('Messages fetch note:', e));
  }, [activeBranchId, dispatch]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const templates: Record<TemplateType, { name: string; content: string }> = {
    welcome: {
      name: '🎉 Welcome Message',
      content:
        'Welcome to IronPulse Fitness! 🏋️‍♂️ Your membership is now active. You can punch in using your registered biometric ID at the entrance turnstiles. Let\'s crush those goals!',
    },
    reminder_due: {
      name: '💳 Payment Reminder',
      content:
        'Hi {name}, this is a gentle reminder from IronPulse that your membership renewal fee is due. Pay online or visit the front desk to continue training without interruption.',
    },
    expiry_7d: {
      name: '⚠️ Plan Expiry (7 Days Alert)',
      content:
        'Hey {name}, your gym plan expires in 7 days! Renew this week to receive a complimentary body composition analysis.',
    },
    expiry_1d: {
      name: '🚨 Last Day Expiry Alert',
      content:
        'Hi {name}, today is the last day of your membership! Renew today at the desk to maintain uninterrupted access.',
    },
    birthday: {
      name: '🎂 Birthday Wishes',
      content:
        'Happy Birthday from the entire team at IronPulse! 🎂 Enjoy a complimentary energy smoothie on your next workout visit today!',
    },
    announcement: {
      name: '📢 Custom Announcement',
      content: 'Important update: New Olympic lifting barbells and sauna slots have been added!',
    },
  };

  const activeContent = customText || templates[templateType].content;

  const handleSendBroadcast = () => {
    // Filter recipients based on active branch
    const scoped = members.filter((m) =>
      activeBranchId === 'all' ? true : m.branchId === activeBranchId
    );

    const recipients = scoped.slice(0, 3); // Broadcast sample
    if (recipients.length === 0) {
      showToast('No eligible members in current branch scope.');
      return;
    }

    recipients.forEach((m) => {
      const personalized = activeContent.replace('{name}', m.name);
      const msgPayload = {
        memberId: m.id,
        memberName: m.name,
        memberPhone: m.phone,
        branchId: m.branchId,
        channel: channel,
        templateType: templateType,
        content: personalized,
      };

      dispatch(
        sendMessage({
          ...msgPayload,
          triggeredBy: 'manual',
        })
      );

      api.post('/messages/send', msgPayload).catch((err) =>
        console.warn('Backend send message note:', err.message)
      );
    });

    showToast(`Dispatched ${channel.toUpperCase()} messages to ${recipients.length} members!`);
    setCustomText('');
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl animate-in slide-in-from-top-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            WhatsApp & Email Automation Hub
          </h2>
          <p className="text-xs text-slate-400">
            Automated reminders, welcome sequences, birthday greetings & instant bulk announcements
          </p>
        </div>

        {/* Channel Status */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Meta WhatsApp API: Live</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Message Composer */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-500" />
            Compose & Trigger Campaign
          </h3>

          {/* Delivery Channel selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setChannel('whatsapp')}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition ${
                channel === 'whatsapp'
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Business API</span>
            </button>

            <button
              type="button"
              onClick={() => setChannel('email')}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition ${
                channel === 'email'
                  ? 'bg-blue-500/15 border-blue-500/50 text-blue-300 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4 text-blue-400" />
              <span>Transactional Email</span>
            </button>
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Message Template
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {(Object.keys(templates) as TemplateType[]).map((key) => {
                const isSelected = templateType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setTemplateType(key);
                      setCustomText('');
                    }}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {templates[key].name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Content Preview & Customizer */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Message Body (Variables: <code className="text-amber-400 font-mono">{"{name}"}</code>)
              </label>
              <span className="text-[10px] text-slate-500">Edit below to customize</span>
            </div>
            <textarea
              rows={4}
              value={customText || templates[templateType].content}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Target Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Audience Filter
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="active">All Active Members</option>
                <option value="expiring">Expiring within 7 Days</option>
                <option value="all">Entire Member Base</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Branch Scope
              </label>
              <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {activeBranchId === 'all'
                    ? 'All Branches (Chain Broadcast)'
                    : branches.find((b) => b.id === activeBranchId)?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Send Action */}
          <div className="pt-2 flex items-center justify-end">
            <button
              onClick={handleSendBroadcast}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 transition active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Send Campaign Now</span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: Live WhatsApp Phone Simulator Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Live Phone Preview
            </h3>

            {/* Smartphone simulator */}
            <div className="bg-slate-950 border-4 border-slate-800 rounded-[2.5rem] p-4 shadow-2xl relative max-w-xs mx-auto">
              {/* Phone top notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-4" />

              {/* WhatsApp chat header */}
              <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-800/40 flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  IP
                </div>
                <div>
                  <div className="text-xs font-bold text-white">IronPulse Fitness</div>
                  <div className="text-[9px] text-emerald-400 font-medium">Official Business Account</div>
                </div>
              </div>

              {/* WhatsApp Chat Bubble */}
              <div className="bg-emerald-950/80 border border-emerald-800/60 p-3 rounded-2xl rounded-tl-none text-[11px] text-slate-200 shadow-sm leading-relaxed mb-3">
                <p className="whitespace-pre-wrap">
                  {activeContent.replace('{name}', 'David')}
                </p>
                <div className="text-[9px] text-emerald-500 text-right mt-1.5 flex items-center justify-end gap-1 font-mono">
                  <span>10:30 AM</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 text-center">
            <span className="text-[11px] text-slate-500">
              Messages will be branded with your gym logo and send receipt confirmations.
            </span>
          </div>
        </div>
      </div>

      {/* Message Delivery Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          Recent Message Dispatch Logs
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Template</th>
                <th className="py-3 px-4">Content Snippet</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{log.memberName || 'Broadcast'}</div>
                    <div className="text-[10px] text-slate-500">{log.memberPhone}</div>
                  </td>
                  <td className="py-3 px-4 uppercase font-bold text-emerald-400">
                    {log.channel}
                  </td>
                  <td className="py-3 px-4 capitalize text-slate-300">
                    {log.templateType.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                    {log.content}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {formatDateTime(log.sentAt)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
