export type UserRole = 'owner' | 'manager' | 'trainer' | 'frontdesk';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  assignedBranches: string[]; // Branch IDs or ['*'] for all
}

export interface Organization {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  contactEmail: string;
  currency: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  timings: string;
  isActive: boolean;
  managerName?: string;
  totalCapacity?: number;
  createdAt: string;
}

export type MembershipStatus = 'active' | 'expired' | 'frozen' | 'cancelled';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface Member {
  id: string;
  branchId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  photoUrl: string;
  dateOfBirth: string;
  gender: Gender;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  joinDate: string;
  status: MembershipStatus;
  biometricId?: string;
  currentPlanId?: string;
  planName?: string;
  planStartDate?: string;
  planEndDate?: string;
  bloodGroup?: string;
  notes?: string;
}

export interface Plan {
  id: string;
  branchId: string | null; // null = Org-wide
  name: string;
  description: string;
  durationDays: number;
  price: number;
  features: string[];
  isActive: boolean;
  popular?: boolean;
}

export interface MemberPlan {
  id: string;
  memberId: string;
  planId: string;
  branchId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'renewed';
  pricePaid: number;
}

export type PaymentMode = 'cash' | 'upi' | 'card' | 'bank_transfer';
export type PaymentStatus = 'paid' | 'partial' | 'pending';

export interface Payment {
  id: string;
  receiptNumber: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  memberPlanId?: string;
  branchId: string;
  amount: number;
  totalDue?: number;
  paymentDate: string;
  paymentMode: PaymentMode;
  status: PaymentStatus;
  notes?: string;
}

export type AttendanceSource = 'biometric' | 'manual' | 'qr';

export interface Attendance {
  id: string;
  memberId: string;
  memberName: string;
  memberPhoto?: string;
  memberPhone: string;
  branchId: string;
  checkIn: string; // ISO string
  checkOut?: string; // ISO string
  source: AttendanceSource;
  status?: 'checked_in' | 'completed';
}

export type MessageChannel = 'whatsapp' | 'email';
export type MessageStatus = 'sent' | 'delivered' | 'failed' | 'scheduled';
export type TemplateType = 'welcome' | 'reminder_due' | 'expiry_7d' | 'expiry_1d' | 'birthday' | 'announcement';

export interface MessageLog {
  id: string;
  memberId?: string;
  memberName?: string;
  memberPhone?: string;
  branchId: string;
  channel: MessageChannel;
  templateType: TemplateType;
  content: string;
  sentAt: string;
  status: MessageStatus;
  triggeredBy: 'auto' | 'manual';
}

export interface DeviceSetting {
  id: string;
  branchId: string;
  deviceName: string;
  model: 'ZKTeco K40' | 'eSSL SilkBio-101' | 'Mantra Bio' | 'Generic MQTT';
  ipAddress: string;
  port: number;
  status: 'connected' | 'offline' | 'syncing';
  lastSyncAt: string;
}
