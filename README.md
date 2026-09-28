# FixMyCampus 🏛️

> **Production-Ready Campus Maintenance & Facility Ticketing Web Application for College Campuses**

Built with **Next.js (App Router)**, **React**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **SQLite**, and **Lucide Icons**.

---

## 🌟 Key Features

### 1. Student / Campus Member Experience
- **Public Issue Feed**: Real-time listing of campus facility defects with filtering by **Category**, **Campus Block**, **Status**, and sorting by **Most Upvoted**, **Newest**, or **Oldest**.
- **Instant Optimistic Upvoting**: Upvote issues to escalate facility urgency. Upvotes update immediately in the UI and are persisted in `localStorage` + database to prevent duplicates.
- **Location Breadcrumbs**: Clear navigation hierarchy `[Block] > [Floor] > [Room]` with room tags (e.g. `Computer Lab 304`, `Washroom 2B`).
- **Interactive Progress Tracker**: 5-step visual pipeline on each ticket:
  1. `Reported` ➔ 2. `In Review` ➔ 3. `Assigned to Staff` ➔ 4. `Work in Progress` ➔ 5. `Resolved`.
- **Photo Evidence & Lightbox**: Drag-and-drop file upload with instant preview and high-resolution lightbox view.
- **Quick Demo Presets**: 1-click preset buttons to test reporting real campus issues in seconds.

### 2. Maintenance Staff & Admin Dispatch Console
- **Instant Role Switcher**: Quick toggle between **Student View** and **Staff Mode** in the navbar.
- **Dedicated Staff Console (`/admin`)**:
  - Live facility health KPI cards: **Pending Triage**, **Active Repairs**, **Resolved**, and **Total Tickets**.
  - Tabbed workflow filtering: `Needs Triage` ➔ `Active Repairs` ➔ `Resolved`.
  - Inline status changer dropdown: Move issues across all 5 workflow states in real time.
  - Technician remark & resolution note editor with instant save.
  - Ticket deletion & management.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with **SQLite** (configured for easy swap to PostgreSQL / Supabase)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with shadcn/ui-inspired aesthetic
- **Icons**: [Lucide React](https://lucide.dev/)
- **Media**: Local multipart upload handler (`/api/upload`) + mock photo library

---

## 🗄️ Database Schema

### `Issue`
| Field | Type | Description |
|---|---|---|
| `id` | String (CUID) | Primary key |
| `title` | String | Issue headline |
| `description` | String | Detailed symptom / hazard description |
| `category` | String | `ELECTRICAL`, `PLUMBING`, `FURNITURE`, `LAB_EQUIPMENT`, `SANITATION`, `OTHER` |
| `block` | String | Campus building/block (e.g., `Academic Block A`) |
| `floor` | String | Floor level (e.g., `3rd Floor`) |
| `room` | String | Specific room / lab (e.g., `Lab 304`) |
| `imageUrl` | String? | Evidence photo URL |
| `status` | String | `REPORTED`, `IN_REVIEW`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED` |
| `upvotesCount` | Int | Total priority upvotes |
| `adminNote` | String? | Technician dispatch remark or resolution summary |
| `createdAt` | DateTime | Timestamp of report |
| `updatedAt` | DateTime | Timestamp of last status change |

### `Upvote`
| Field | Type | Description |
|---|---|---|
| `id` | String (CUID) | Primary key |
| `issueId` | String | Foreign key to `Issue` |
| `userIdentifier` | String | Pseudonymous client identifier (stored in localStorage) |
| `createdAt` | DateTime | Timestamp of upvote |

*A composite unique index `@@unique([issueId, userIdentifier])` prevents duplicate upvotes.*

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database & Seed Data
```bash
npx prisma db push
node prisma/seed.mjs
```

### 3. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Endpoints

- `GET /api/issues`: List filtered and sorted issues
- `POST /api/issues`: Create a new issue ticket
- `PATCH /api/issues/[id]`: Update issue status and technician note
- `DELETE /api/issues/[id]`: Delete an issue ticket
- `POST /api/issues/[id]/upvote`: Toggle upvote with atomicity
- `POST /api/upload`: Multipart image upload endpoint
# fix-my-campus
