# 🏋️ Gym Management System — Roadmap & Tech Stack

## Tech Stack Recommendation

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | **React 18+ with Vite** | Blazing fast HMR, modern tooling, lightweight |
| **Styling** | **Vanilla CSS** (or Tailwind if you prefer) | Full control, no framework lock-in |
| **Routing** | **React Router v6** | Client-side routing, nested layouts |
| **State** | **Redux Toolkit** | Industry-standard state management, great devtools |
| **HTTP Client** | **Axios** | Clean API calls with interceptors for auth tokens |
| **Backend** | **Node.js + Express.js** | Simple, fast, massive ecosystem |
| **Database** | **PostgreSQL** | Relational data (members, plans, payments) — rock solid |
| **ORM** | **Prisma** | Type-safe queries, easy migrations, great DX |
| **Auth** | **JWT (jsonwebtoken + bcrypt)** | Stateless auth, easy to implement with Express |
| **File Storage** | **AWS S3 / Cloudflare R2** (or local `uploads/` to start) | Member photos, documents |
| **WhatsApp API** | **Twilio WhatsApp API** or **WhatsApp Business Cloud API (Meta)** | Official APIs, reliable delivery |
| **Email** | **Nodemailer + SMTP** (or Resend) | Transactional emails (receipts, reminders) |
| **Punch-in Machine** | **REST API / MQTT / TCP Socket** | Depends on your hardware (ZKTeco, eSSL, etc.) |
| **Deployment** | **Vercel/Netlify** (frontend) + **Railway/Render/VPS** (backend + DB) | Easy, scalable |
| **Language** | **TypeScript** | Type safety across the full stack, fewer runtime bugs |

---

## Project Structure (Separate Repos)

### 📁 Repo 1: `gym-client` — React + Vite Frontend

```
gym-client/
├── public/
├── src/
│   ├── assets/              # Images, icons
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page-level components
│   ├── layouts/             # Sidebar, Navbar layouts
│   ├── services/            # API call functions (axios)
│   ├── store/               # Redux Toolkit slices & store
│   ├── hooks/               # Custom hooks
│   ├── types/               # Shared TypeScript interfaces
│   ├── utils/               # Helpers, formatters
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tsconfig.json
├── .env                     # VITE_API_URL=http://localhost:5000
└── package.json
```

### 📁 Repo 2: `gym-server` — Node.js + Express Backend

```
gym-server/
├── prisma/
│   └── schema.prisma        # Database schema
├── src/
│   ├── controllers/         # Route handlers
│   ├── routes/              # Express route definitions
│   ├── middleware/           # Auth, error handling, upload
│   ├── services/            # Business logic (WhatsApp, email, etc.)
│   ├── types/               # TypeScript interfaces
│   ├── utils/               # Helpers, validators
│   ├── cron/                # Scheduled jobs (reminders, sync)
│   └── app.ts               # Express app setup
├── uploads/                 # Local file storage (dev)
├── tsconfig.json
├── .env                     # DATABASE_URL, JWT_SECRET, etc.
└── package.json
```

> **TIP:** Keep a shared `types/` convention in both repos for API request/response interfaces. You can later extract shared types into a private npm package if needed.

---

## Core Features Breakdown

### 1. 🏢 Multi-Branch Management (Built-in from Day 1)
- **Organization** — Top-level entity (your gym brand)
- **Branches** — Each city/location is a branch under the organization
- Branch CRUD — Add, edit, deactivate branches
- **Branch Switcher** in the UI — staff can switch between branches they have access to
- **Branch-scoped data** — Members, plans, payments, attendance are all tied to a branch
- **Owner Dashboard** — Cross-branch overview (total revenue, total members, per-branch comparison)
- Branch-specific settings (timings, contact info, address)

> **IMPORTANT:** Every API request will include a `branchId` (via middleware). All queries are automatically scoped to the active branch. This ensures data isolation between branches.

### 2. 👤 Membership Management
- Member registration (name, phone, email, address, emergency contact)
- **Member belongs to a branch** (can be transferred between branches)
- Plan management (monthly, quarterly, yearly, custom) — plans can be branch-specific or org-wide
- Plan assignment & renewal
- Payment tracking (paid, due, overdue)
- Membership status (active, expired, frozen, cancelled)
- Member search & filters (within branch or across all branches for owners)
- Dashboard with KPIs (active members, revenue, expiring soon) — **per branch & org-wide**

### 3. 📸 Client Entry with Photo
- Webcam capture during registration (via browser `getUserMedia` API)
- Photo upload option (file picker)
- Photo stored in S3/R2 with URL saved in DB
- Member profile card with photo
- Photo displayed on check-in for verification

### 4. 💬 WhatsApp Messages
- Welcome message on registration
- Payment reminders (due/overdue)
- Plan expiry reminders (7 days, 3 days, 1 day before)
- Birthday wishes
- Bulk promotional messages (per branch or org-wide)
- Message templates & scheduling
- Delivery status tracking

### 5. 📧 Email Notifications
- Registration confirmation
- Payment receipts
- Plan expiry reminders
- Custom announcements / offers
- Email templates (HTML) — branch-branded

### 6. 🔐 Punch-in Machine Sync
- Integration with biometric/RFID attendance devices (ZKTeco, eSSL, Mantra, etc.)
- **Each branch has its own punch-in device(s)**
- Pull attendance logs via device SDK/API
- Real-time or scheduled sync (every 5–15 mins)
- Check-in/check-out tracking
- Attendance history per member
- Alerts for irregular patterns

### 7. 🔔 In-App & Owner Notifications
- **Instant New Member Alert to Owner**: Whenever a front-desk staff or branch manager registers a new member, an instant notification is dispatched to the Gym Owner containing:
  - Member Name & Contact
  - Registered Branch
  - Assigned Plan & Amount Paid (₹)
  - Payment Mode (UPI, Cash, Card)
- **Payment Collection Alerts**: Real-time ping to owner upon dues clearance and fee renewals.
- **In-App Notification Bell**: Top navigation tray with unread badge counter, audio chime, and mark-as-read controls.
- **Biometric Device Offline Alerts**: Notifies branch manager and owner if a turnstile machine loses network connection.
- **Push & WhatsApp Mirroring**: Option for owner to receive WhatsApp or web-push copy of critical enrollment receipts.

---

## Phased Roadmap

### 🟢 Phase 1 — Foundation + Multi-Branch (Weeks 1–3)
> Get the core running — org, branches, members, plans, payments

- [ ] Project setup — **Vite + React** (client) and **Express + Prisma** (server)
- [ ] Database schema design (Organization, Branches, Members, Plans, Payments, Users)
- [ ] **Organization & Branch setup** — Create org, add branches
- [ ] **Branch-scoped middleware** — All API routes scoped to active branch
- [ ] Authentication — **JWT-based** login with branch & role info in token
- [ ] **Branch Switcher** UI component
- [ ] **Member CRUD** — Add, edit, view, delete members (branch-scoped)
- [ ] **Plan Management** — Create/manage gym plans (per branch or org-wide)
- [ ] **Payment Tracking** — Record payments, mark dues
- [ ] **Dashboard** — Active members, revenue summary, expiring memberships (per branch + org overview)
- [ ] Responsive UI with sidebar navigation

### 🟡 Phase 2 — Photo & Attendance (Weeks 4–5)
> Add identity verification and attendance

- [ ] **Webcam Photo Capture** on registration form
- [ ] Photo storage (S3/R2) integration
- [ ] Member profile card with photo
- [ ] **Punch-in Machine Integration** — research your hardware model
- [ ] Attendance sync service (cron job or webhook)
- [ ] Attendance log viewer (per member, per day)
- [ ] Check-in screen with photo verification

### 🟢 Phase 3 — Communication (Weeks 6–7)
> WhatsApp & Email automation

- [ ] WhatsApp Business API setup (Twilio or Meta Cloud API)
- [ ] **Message Templates** — welcome, reminder, receipt
- [ ] **Automated Triggers** — payment due, plan expiry, birthday
- [ ] Email service setup (Resend / Nodemailer)
- [ ] Email templates (HTML)
- [ ] Message logs (sent, delivered, failed)
- [ ] Manual bulk messaging UI

### 🟡 Phase 4 — Polish & Advanced (Weeks 8–10)
> Make it production-ready

- [ ] **Reports** — Revenue reports, attendance reports, member growth (**per branch & cross-branch**)
- [ ] **Bulk Import** — CSV upload for existing member data (per branch)
- [ ] **Role-based access** — Owner (all branches), Manager (assigned branches), Trainer, Front Desk
- [ ] **Member Transfer** — Move member from one branch to another
- [ ] **Audit log** — Track who changed what, at which branch
- [ ] Mobile-responsive optimization
- [ ] Dark mode
- [ ] Data backup strategy

### 🔵 Phase 5 — Future Enhancements
- Member self-service portal / mobile app
- Online payment integration (Razorpay / Stripe)
- Trainer & class scheduling
- Diet & workout plan assignment
- Inventory management (supplements, merchandise)
- QR code based check-in (alternative to biometric)

---

## Database Schema (Multi-Branch)

```
Organization (your gym brand)
├── id, name, logo, contactEmail
└── createdAt

Branches
├── id, organizationId (FK)
├── name, city, address, phone
├── timings, isActive
└── createdAt

Users (Staff)
├── id, organizationId (FK)
├── name, email, passwordHash
├── role (owner/manager/trainer/frontdesk)
└── assignedBranches[] (many-to-many — which branches they can access)

Members
├── id, branchId (FK)          ← scoped to a branch
├── name, phone, email, address
├── photoUrl, dateOfBirth, gender
├── emergencyContact
├── joinDate, status (active/expired/frozen)
└── biometricId (for punch-in machine mapping)

Plans
├── id, branchId (FK) or NULL  ← NULL = org-wide plan
├── name, durationDays, price
└── description, isActive

MemberPlans (assignment)
├── id, memberId, planId, branchId (FK)
├── startDate, endDate
└── status (active/expired/renewed)

Payments
├── id, memberId, memberPlanId, branchId (FK)
├── amount, paymentDate, paymentMode
└── receiptNumber, notes

Attendance
├── id, memberId, branchId (FK)
├── checkIn, checkOut
└── source (biometric/manual/qr)

Messages
├── id, memberId, branchId (FK)
├── channel (whatsapp/email)
├── templateType, content
├── sentAt, status (sent/delivered/failed)
└── triggeredBy (auto/manual)

Notifications
├── id, organizationId (FK), branchId (FK)
├── recipientUserId (FK)  ← Gym Owner / Manager
├── type (new_member_enrolled / payment_received / plan_expired / machine_offline)
├── title, message
├── metadata (JSON: memberId, memberName, amount, planName, branchName)
├── isRead (boolean), readAt
└── createdAt
```

> **NOTE:** **Data isolation strategy**: Every query goes through a `branchId` filter via middleware. The Owner role can query across branches for org-wide reports. This is simpler than multi-tenancy (separate DBs) and works perfectly for a gym chain.

---

## Key Decisions You Need to Make

| Question | Options |
|---|---|
| **Which punch-in machine do you have?** | ZKTeco, eSSL, Mantra, or other? This determines the integration approach. |
| **WhatsApp API choice?** | Twilio (easier, paid per msg) vs Meta Cloud API (free tier, more setup) |
| **Hosting preference?** | Vercel + managed DB (easy) vs self-hosted VPS (cheaper long-term) |
| **Existing member data?** | Do you need a CSV import tool for migration? |
| **How many branches initially?** | Helps configure the seed data and initial setup. |

---

> **TIP:** I recommend starting with **Phase 1** immediately. We can set up the project, design the DB schema, and build the member management module today itself. Want to start?
