# 🏋️ IronPulse — Multi-Branch Gym Management System (Frontend)

Built based on the [ROADMAP.md](file:///Users/shobhit/Developers/gymManagementSystem_frontend/ROADMAP.md) specification using **React 18+**, **Vite**, **TypeScript**, **Redux Toolkit**, and **Tailwind CSS**.

---

## 🚀 Key Features Implemented

### 1. 🏢 Multi-Branch Architecture (From Day 1)
- **Top-Level Organization**: Organization branding, currency, and global configuration.
- **Branch Switcher Dropdown**: Toggle between active branches or switch to **"All Branches (Owner Overview)"**.
- **Branch-Scoped Data**: Members, plans, transactions, and check-in logs are automatically scoped to the active branch.
- **Cross-Branch Transfers**: One-click member transfer between branches.
- **API Interceptor Scoping**: Axios automatically injects `x-branch-id` on every outgoing request.

### 2. 👤 Membership Management
- Member registration with full personal, emergency, and membership details.
- Status management (`active`, `expired`, `frozen`, `cancelled`).
- Expiry tracking with countdowns and 7-day expiration alert flags.
- Instant renewal flows and membership plan upgrades.

### 3. 📸 Client Entry with Live Webcam Photo Capture
- **Live HTML5 Camera**: Uses `navigator.mediaDevices.getUserMedia` for instant snapshot during registration.
- **File Upload Fallback**: Upload photos directly from storage.
- **Photo Verification**: Displayed prominently during entry check-ins and member profile reviews.

### 4. 🔐 Biometric Attendance & Check-In Kiosk
- **Instant Kiosk Modal**: Quick search by member name, phone number, or Biometric ID (`BIO-xxx`).
- **Punch Sources**: Support for Biometric hardware, QR code pass, or manual front desk check-in.
- **Live Attendance Feed**: Real-time workout stream, tracking who is currently on the gym floor and completed check-outs.
- **Hardware Integrations UI**: Configured for ZKTeco, eSSL, and Mantra devices.

### 5. 💳 Payments & Receipts
- Record membership fees via **UPI/QR**, **Cash**, **Card swipe**, or **Bank transfer**.
- Printable official tax invoice receipt with organization branding, branch address, and transaction receipt number.

### 6. 💬 WhatsApp & Email Automation Hub
- Pre-built templates for:
  - 🎉 Welcome Message on registration
  - 💳 Payment Due / Overdue Reminders
  - ⚠️ 7-day & 1-day Plan Expiration Warnings
  - 🎂 Birthday Greetings
  - 📢 Custom Bulk Announcements
- Interactive smartphone preview simulator and live dispatch logs.

### 7. 🛡️ Role-Based Access Testing
- Switch between **Owner**, **Manager**, **Front Desk**, and **Trainer** roles dynamically from the top navigation bar.

---

## 🛠️ Project Structure

```
src/
├── components/
│   ├── common/           # Reusable UI (CameraCapture, Modal, StatCard, Badge)
│   ├── layouts/          # MainLayout, Navbar, Sidebar, BranchSwitcher
│   ├── members/          # MemberFormModal (Webcam), MemberDetailModal
│   ├── payments/         # PaymentModal, ReceiptModal
│   ├── plans/            # PlanFormModal
│   ├── branches/         # BranchFormModal
│   └── attendance/       # CheckInModal
├── hooks/
│   └── useAppStore.ts    # Typed Redux hooks
├── pages/
│   ├── DashboardPage.tsx # KPI analytics, real-time stream, expiring soon
│   ├── MembersPage.tsx   # Directory with search, filters & grid/table toggle
│   ├── PlansPage.tsx     # Tiered pricing & plan CRUD
│   ├── PaymentsPage.tsx  # Revenue metrics & billing ledger
│   ├── AttendancePage.tsx# Check-in stream & hardware device status
│   ├── BranchesPage.tsx  # Multi-branch management
│   ├── MessagesPage.tsx  # WhatsApp & Email broadcast center
│   ├── SettingsPage.tsx  # Org settings & biometric device setup
│   └── NotFoundPage.tsx
├── services/
│   └── api.ts            # Axios instance with auth & branchId headers
├── store/
│   ├── slices/           # RTK slices (auth, branch, member, plan, payment, attendance, message)
│   └── store.ts
├── types/
│   └── index.ts          # Unified TypeScript interfaces
└── utils/
    ├── formatters.ts     # Currency, date, and status formatters
    ├── mockData.ts       # Realistic multi-branch seed dataset
    └── storage.ts        # LocalStorage persistence layer
```

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```
