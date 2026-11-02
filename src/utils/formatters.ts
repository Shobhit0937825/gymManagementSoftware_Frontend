export const formatCurrency = (amount: number, currency: string = '₹'): string => {
  return `${currency}${amount.toLocaleString('en-IN')}`;
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

export const formatTimeOnly = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

export const getDaysRemaining = (endDateString?: string): number => {
  if (!endDateString) return 0;
  const end = new Date(endDateString);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getStatusBadgeClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'paid':
    case 'connected':
    case 'delivered':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'expiring_soon':
    case 'partial':
    case 'syncing':
    case 'scheduled':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'expired':
    case 'pending':
    case 'overdue':
    case 'failed':
    case 'offline':
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    case 'frozen':
      return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
    case 'cancelled':
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-700';
  }
};
