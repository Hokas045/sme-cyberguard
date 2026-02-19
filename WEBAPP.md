# SME CyberGuard - Web Dashboard Specification

**Tech Stack**: Vite + React + TypeScript + Tailwind CSS + Turso SDK

---

## 🎯 **Overview**

Multi-tenant SaaS dashboard for SME business owners to monitor security across all their devices in real-time.

**Core Principle**: Direct Turso connection (no backend API) - same as agent architecture.

---

## 📊 **Dashboard Structure**

### **1. Authentication & Onboarding**

#### **Login Page** (`/login`)
```tsx
// Features:
- Email + Password login
- "Forgot Password" link
- "Sign Up" button
- Clean, professional design
- SME CyberGuard branding

// Database Query:
SELECT id, business_id, email, role 
FROM users 
WHERE email = ? AND password_hash = ?
```

#### **Signup Page** (`/signup`)
```tsx
// Features:
- Business name
- Owner name
- Email
- Password
- Industry dropdown
- Phone number
- Accept terms checkbox

// Database Insert:
1. INSERT INTO businesses (id, name, industry, status)
2. INSERT INTO users (id, business_id, email, role)
3. Generate first activation token
```

#### **Onboarding Flow** (`/onboarding`)
```tsx
// Steps:
1. Welcome screen
2. Download agent (Windows/Linux)
3. Generate activation code
4. Wait for first device to connect
5. Dashboard tour

// Show activation code prominently:
"Your Activation Code: CG-SALON-XYZ123"
```

---

### **2. Main Dashboard** (`/dashboard`)

#### **Top Navigation Bar**
```tsx
// Left Side:
- SME CyberGuard logo
- Business name

// Right Side:
- Notifications bell (red dot if threats)
- User avatar dropdown
  - Profile
  - Settings
  - Logout
```

#### **Sidebar Navigation**
```tsx
// Menu Items:
📊 Overview (default)
🖥️ Devices
🚨 Threats
🔒 Quarantine
🌐 Web Activity
💾 USB Activity
🔄 Updates & Patches
👥 Users
⚙️ Settings
```

---

### **3. Overview Page** (`/dashboard/overview`)

#### **Key Metrics Cards** (Top Row)
```tsx
// Card 1: Total Devices
{
  title: "Active Devices",
  value: 8,
  change: "+2 this week",
  icon: "💻",
  color: "blue"
}

// Card 2: Threats Blocked
{
  title: "Threats Blocked",
  value: 23,
  change: "+5 today",
  icon: "🛡️",
  color: "green"
}

// Card 3: Risk Score
{
  title: "Risk Score",
  value: "65/100",
  status: "Medium",
  icon: "⚠️",
  color: "yellow"
}

// Card 4: Pending Updates
{
  title: "Pending Updates",
  value: 12,
  change: "3 critical",
  icon: "🔄",
  color: "red"
}

// Database Query:
SELECT 
  COUNT(DISTINCT device_id) as active_devices,
  COUNT(CASE WHEN detected_at > datetime('now', '-24 hours') THEN 1 END) as threats_today
FROM threat_alerts
WHERE business_id = ?
```

#### **Risk Score Trend Chart**
```tsx
// Line chart showing risk score over last 30 days
// Database Query:
SELECT score, recorded_at 
FROM risk_score_history 
WHERE business_id = ? 
ORDER BY recorded_at DESC 
LIMIT 30
```

#### **Recent Threats Table**
```tsx
// Columns: Device, Threat Type, Severity, Status, Time, Actions
// Show last 10 threats
// Database Query:
SELECT 
  d.hostname,
  t.title,
  t.severity,
  t.status,
  t.detected_at
FROM threat_alerts t
JOIN devices d ON t.device_id = d.id
WHERE t.business_id = ?
ORDER BY t.detected_at DESC
LIMIT 10
```

#### **Device Status Grid**
```tsx
// Visual grid of all devices with status indicators
// Green = Healthy, Yellow = Warnings, Red = Critical
// Click device to see details

// Database Query:
SELECT 
  d.id,
  d.hostname,
  d.last_seen,
  COUNT(t.id) as threat_count
FROM devices d
LEFT JOIN threat_alerts t ON d.id = t.device_id AND t.status = 'open'
WHERE d.business_id = ?
GROUP BY d.id
```

---

### **4. Devices Page** (`/dashboard/devices`)

#### **Device List Table**
```tsx
// Columns:
- Hostname
- OS Version
- Agent Version
- Last Seen
- Status (Online/Offline)
- Threats (count)
- Actions (View Details, Remote Commands)

// Database Query:
SELECT 
  d.*,
  COUNT(t.id) as open_threats,
  p.pending_updates
FROM devices d
LEFT JOIN threat_alerts t ON d.id = t.device_id AND t.status = 'open'
LEFT JOIN patch_status p ON d.id = p.device_id
WHERE d.business_id = ?
GROUP BY d.id
```

#### **Device Details Modal**
```tsx
// When clicking a device, show modal with:
- Device info (hostname, OS, IP, last seen)
- Active threats
- Software inventory
- Patch status
- Recent activity timeline
- Remote actions:
  - Send command
  - View logs
  - Restart agent
```

---

### **5. Threats Page** (`/dashboard/threats`)

#### **Threat Filters** (Top Bar)
```tsx
// Filters:
- Severity: All, Critical, High, Medium, Low
- Status: All, Open, Resolved
- Type: All, Malware, Phishing, Ransomware, USB, Web
- Date Range: Today, Week, Month, Custom
- Device: All devices dropdown
```

#### **Threats Table**
```tsx
// Columns:
- Time
- Device
- Threat Type
- Title
- Severity (colored badge)
- Status (Open/Resolved)
- Actions (View, Resolve, Ignore)

// Database Query:
SELECT 
  t.*,
  d.hostname
FROM threat_alerts t
JOIN devices d ON t.device_id = d.id
WHERE t.business_id = ?
  AND t.severity IN (?)
  AND t.status IN (?)
  AND t.detected_at BETWEEN ? AND ?
ORDER BY t.detected_at DESC
```

#### **Threat Details Modal**
```tsx
// Show full threat information:
- Title & Description
- Severity & Status
- Device & User
- Detection time
- Actions taken (if any)
- Related events
- Action buttons:
  - Mark as Resolved
  - Mark as False Positive
  - View Device
  - Export Report
```

---

### **6. Quarantine Page** (`/dashboard/quarantine`)

#### **Quarantined Files Table**
```tsx
// Columns:
- File Name
- File Path
- Hash (SHA256)
- Device
- Quarantined At
- Status
- Actions (Delete, Restore, Download)

// Database Query:
SELECT 
  q.*,
  d.hostname
FROM quarantined_threats q
JOIN devices d ON q.device_id = d.id
WHERE q.business_id = ?
  AND q.status = 'quarantined'
ORDER BY q.quarantined_at DESC
```

#### **Quarantine Actions**
```tsx
// Delete Permanently:
1. Update quarantined_threats SET status = 'deleted'
2. INSERT INTO remote_commands (command = 'delete_file', target = quarantine_path)

// Restore File:
1. Update quarantined_threats SET status = 'restored'
2. INSERT INTO remote_commands (command = 'restore_file', target = 'quarantine_path|original_path')

// Download for Analysis:
- Show warning: "This file is malicious. Only download if you know what you're doing."
- Generate download link (if implemented)
```

---

### **7. Web Activity Page** (`/dashboard/web-activity`)

#### **Web Threats Summary**
```tsx
// Top Cards:
- Total Blocked Sites
- Phishing Attempts
- Piracy Sites Accessed
- Custom Blocked Sites

// Database Query:
SELECT 
  threat_type,
  COUNT(*) as count
FROM web_threats
WHERE business_id = ?
  AND detected_at > datetime('now', '-30 days')
GROUP BY threat_type
```

#### **Top Blocked Domains Chart**
```tsx
// Bar chart showing most accessed blocked domains
// Database Query:
SELECT 
  domain,
  COUNT(*) as attempts
FROM web_threats
WHERE business_id = ?
GROUP BY domain
ORDER BY attempts DESC
LIMIT 10
```

#### **Web Activity Table**
```tsx
// Columns:
- Time
- Device
- Domain
- Threat Type
- User Warned
- Actions

// Database Query:
SELECT 
  w.*,
  d.hostname
FROM web_threats w
JOIN devices d ON w.device_id = d.id
WHERE w.business_id = ?
ORDER BY w.detected_at DESC
```

#### **Custom Blocked Domains Section**
```tsx
// Features:
- Add new blocked domain (input + button)
- List of custom blocked domains
- Remove domain button
- Reason field (optional)

// Add Domain:
INSERT INTO business_blocked_domains 
(id, business_id, domain, reason, added_by)
VALUES (?, ?, ?, ?, ?)

// Remove Domain:
DELETE FROM business_blocked_domains
WHERE business_id = ? AND domain = ?

// List Domains:
SELECT domain, reason, added_at, added_by
FROM business_blocked_domains
WHERE business_id = ?
ORDER BY added_at DESC
```

---

### **8. USB Activity Page** (`/dashboard/usb-activity`)

#### **USB Activity Table**
```tsx
// Columns:
- Time
- Device
- Action (Inserted/Removed)
- Drive Letter
- Threats Found
- Threats Quarantined
- Status

// Database Query:
SELECT 
  u.*,
  d.hostname
FROM usb_activity u
JOIN devices d ON u.device_id = d.id
WHERE u.business_id = ?
ORDER BY u.detected_at DESC
```

#### **USB Threat Statistics**
```tsx
// Cards:
- Total USB Insertions
- Infected USB Drives
- Threats Quarantined
- Clean USB Drives

// Chart: USB activity over time
```

---

### **9. Updates & Patches Page** (`/dashboard/patches`)

#### **Patch Status Overview**
```tsx
// Cards:
- Devices Up to Date
- Pending Windows Updates
- Outdated Software
- Critical Patches

// Database Query:
SELECT 
  d.hostname,
  p.pending_updates,
  p.status,
  p.last_checked
FROM patch_status p
JOIN devices d ON p.device_id = d.id
WHERE p.business_id = ?
```

#### **Devices Needing Updates Table**
```tsx
// Columns:
- Device
- Pending Updates
- Critical Count
- Last Checked
- Status
- Actions (View Details)

// Show devices with pending_updates > 0
```

#### **Outdated Software Table**
```tsx
// Columns:
- Device
- Software Name
- Current Version
- Latest Version
- Risk Level
- Actions

// Database Query:
SELECT 
  d.hostname,
  s.name,
  s.version,
  s.is_outdated
FROM software_inventory s
JOIN devices d ON s.device_id = d.id
WHERE s.business_id = ?
  AND s.is_outdated = 1
```

---

### **10. Users Page** (`/dashboard/users`)

#### **Users Table**
```tsx
// Columns:
- Name
- Email
- Role (Owner, Admin, User)
- Last Login
- Status (Active/Inactive)
- Actions (Edit, Deactivate)

// Database Query:
SELECT * FROM users
WHERE business_id = ?
ORDER BY created_at DESC
```

#### **Add User Modal**
```tsx
// Fields:
- Email
- Role (dropdown)
- Send invitation email checkbox

// Insert:
INSERT INTO users (id, business_id, email, role)
VALUES (?, ?, ?, ?)
```

---

### **11. Settings Page** (`/dashboard/settings`)

#### **Tabs:**

##### **Business Profile**
```tsx
// Fields:
- Business Name
- Industry
- Phone
- Address
- Logo upload

// Update:
UPDATE businesses
SET name = ?, industry = ?, phone = ?
WHERE id = ?
```

##### **Activation Tokens**
```tsx
// Features:
- Generate new activation token button
- List of tokens (active/used/expired)
- Copy token button
- Revoke token button

// Generate Token:
INSERT INTO agent_activation_tokens
(token, business_id, expires_at)
VALUES (?, ?, datetime('now', '+30 days'))

// List Tokens:
SELECT token, expires_at, used_at, used_by_device
FROM agent_activation_tokens
WHERE business_id = ?
ORDER BY created_at DESC
```

##### **Blocked Domains**
```tsx
// Same as Web Activity custom blocked domains section
```

##### **Notifications**
```tsx
// Settings:
- Email notifications (on/off)
- Threat severity threshold (Critical only, High+, All)
- Daily summary email
- Weekly report email

// Store in users table or separate notifications_settings table
```

##### **Billing** (Future)
```tsx
// Show:
- Current plan
- Devices count
- Monthly cost
- Payment method
- Billing history
```

---

## 🔐 **Authentication & Security**

### **Session Management**
```tsx
// On login:
1. Verify credentials against users table
2. Generate JWT token (or use Turso auth)
3. Store business_id and user_id in session
4. All queries filtered by business_id

// Middleware:
- Check authentication on every route
- Verify business_id matches session
- Row-level security enforced
```

### **Role-Based Access**
```tsx
// Roles:
- Owner: Full access
- Admin: All except billing/users
- User: Read-only

// Implement in React:
const { role } = useAuth();
{role === 'owner' && <DeleteButton />}
```

---

## 📡 **Real-Time Updates**

### **Polling Strategy**
```tsx
// Use React Query with polling:
const { data } = useQuery({
  queryKey: ['threats', businessId],
  queryFn: fetchThreats,
  refetchInterval: 30000 // 30 seconds
});

// Poll for:
- New threats (30s)
- Device status (60s)
- Quarantine updates (60s)
```

### **Notification System**
```tsx
// Check for new threats:
SELECT COUNT(*) 
FROM threat_alerts
WHERE business_id = ?
  AND detected_at > ?
  AND status = 'open'

// Show toast notification if count > 0
```

---

## 🎨 **UI/UX Guidelines**

### **Color Scheme**
```css
/* Primary Colors */
--primary: #0066CC (Brand Blue)
--secondary: #00A86B (Green)

/* Status Colors */
--success: #10B981
--warning: #F59E0B
--danger: #EF4444
--info: #3B82F6

/* Severity Colors */
--critical: #DC2626
--high: #F97316
--medium: #FBBF24
--low: #94A3B8

/* Neutrals */
--gray-50: #F9FAFB
--gray-900: #111827
```

### **Typography**
```css
/* Fonts */
font-family: 'Inter', sans-serif;

/* Sizes */
--text-xs: 0.75rem
--text-sm: 0.875rem
--text-base: 1rem
--text-lg: 1.125rem
--text-xl: 1.25rem
--text-2xl: 1.5rem
```

### **Components to Build**
```tsx
// Reusable Components:
- <Card /> - Dashboard cards
- <Table /> - Data tables with sorting/filtering
- <Badge /> - Status/severity badges
- <Button /> - Primary, secondary, danger variants
- <Modal /> - Dialogs and details
- <Chart /> - Line, bar, pie charts (use recharts)
- <Stat /> - Metric cards
- <Alert /> - Notifications
- <Dropdown /> - Menus
- <Tabs /> - Settings tabs
```

---

## 📊 **Charts & Visualizations**

### **Libraries to Use**
```bash
npm install recharts
```

### **Chart Types Needed**

#### **Risk Score Trend** (Line Chart)
```tsx
<LineChart data={riskScoreHistory}>
  <XAxis dataKey="date" />
  <YAxis domain={[0, 100]} />
  <Line type="monotone" dataKey="score" stroke="#0066CC" />
</LineChart>
```

#### **Threats by Type** (Pie Chart)
```tsx
<PieChart>
  <Pie data={threatsByType} dataKey="count" nameKey="type" />
</PieChart>
```

#### **Device Status** (Bar Chart)
```tsx
<BarChart data={deviceStatus}>
  <XAxis dataKey="hostname" />
  <YAxis />
  <Bar dataKey="threats" fill="#EF4444" />
</BarChart>
```

---

## 🔌 **Turso Integration**

### **Setup**
```bash
npm install @libsql/client
```

### **Client Configuration**
```tsx
// lib/turso.ts
import { createClient } from '@libsql/client';

export const turso = createClient({
  url: 'https://agents-ogega.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...'
});

// Helper function
export async function query(sql: string, params: any[] = []) {
  const result = await turso.execute({
    sql,
    args: params
  });
  return result.rows;
}
```

### **Example Queries**
```tsx
// Fetch threats
const threats = await query(
  'SELECT * FROM threat_alerts WHERE business_id = ? ORDER BY detected_at DESC',
  [businessId]
);

// Update threat status
await query(
  'UPDATE threat_alerts SET status = ? WHERE id = ?',
  ['resolved', threatId]
);

// Insert blocked domain
await query(
  'INSERT INTO business_blocked_domains (id, business_id, domain, reason) VALUES (?, ?, ?, ?)',
  [uuid(), businessId, domain, reason]
);
```

---

## 🚀 **Project Structure**

```
sme-cyberguard-dashboard/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Chart.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Layout.tsx
│   │   └── features/
│   │       ├── ThreatTable.tsx
│   │       ├── DeviceGrid.tsx
│   │       ├── QuarantineManager.tsx
│   │       └── BlockedDomains.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Devices.tsx
│   │   ├── Threats.tsx
│   │   ├── Quarantine.tsx
│   │   ├── WebActivity.tsx
│   │   ├── USBActivity.tsx
│   │   ├── Patches.tsx
│   │   ├── Users.tsx
│   │   └── Settings.tsx
│   ├── lib/
│   │   ├── turso.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useThreats.ts
│   │   ├── useDevices.ts
│   │   └── useQuery.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 📦 **Dependencies**

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@libsql/client": "^0.4.0",
    "@tanstack/react-query": "^5.0.0",
    "recharts": "^2.10.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.300.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 🎯 **Key Features Summary**

### **Must Have (MVP)**
✅ Authentication (login/signup)
✅ Overview dashboard with metrics
✅ Device list and details
✅ Threat alerts table
✅ Quarantine management (delete/restore)
✅ Custom blocked domains
✅ Activation token generation
✅ Real-time polling

### **Should Have (Phase 2)**
- User management
- Advanced filtering
- Export reports (PDF/CSV)
- Email notifications
- Patch management view
- USB activity tracking

### **Nice to Have (Phase 3)**
- Billing integration
- Mobile app
- Webhooks
- API for integrations
- Advanced analytics
- Threat intelligence feed management

---

## 🔥 **Quick Start Commands**

```bash
# Create project
npm create vite@latest sme-cyberguard-dashboard -- --template react-ts

# Install dependencies
cd sme-cyberguard-dashboard
npm install

# Install additional packages
npm install @libsql/client @tanstack/react-query recharts date-fns lucide-react clsx tailwind-merge react-router-dom

# Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Run dev server
npm run dev
```

---

## 📝 **Sample API Calls**

### **Fetch Dashboard Metrics**
```tsx
const metrics = await query(`
  SELECT 
    (SELECT COUNT(*) FROM devices WHERE business_id = ?) as total_devices,
    (SELECT COUNT(*) FROM threat_alerts WHERE business_id = ? AND status = 'open') as open_threats,
    (SELECT SUM(pending_updates) FROM patch_status WHERE business_id = ?) as pending_updates
`, [businessId, businessId, businessId]);
```

### **Fetch Recent Threats**
```tsx
const threats = await query(`
  SELECT 
    t.id,
    t.title,
    t.severity,
    t.status,
    t.detected_at,
    d.hostname
  FROM threat_alerts t
  JOIN devices d ON t.device_id = d.id
  WHERE t.business_id = ?
  ORDER BY t.detected_at DESC
  LIMIT 10
`, [businessId]);
```

### **Add Blocked Domain**
```tsx
await query(`
  INSERT INTO business_blocked_domains 
  (id, business_id, domain, reason, added_by)
  VALUES (?, ?, ?, ?, ?)
`, [crypto.randomUUID(), businessId, domain, reason, userEmail]);
```

### **Send Remote Command**
```tsx
await query(`
  INSERT INTO remote_commands
  (id, business_id, device_id, command, target, status)
  VALUES (?, ?, ?, ?, ?, 'pending')
`, [crypto.randomUUID(), businessId, deviceId, 'delete_file', filePath]);
```

---

## 🎨 **Design Inspiration**

- **Vercel Dashboard** - Clean, modern, fast
- **Stripe Dashboard** - Data-heavy, professional
- **Cloudflare Dashboard** - Security-focused
- **Linear** - Beautiful UI, smooth interactions

---

**Build a dashboard that SME owners will love to use every day!** 🚀
