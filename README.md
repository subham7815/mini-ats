# TalentFlow - Mini Applicant Tracking System (ATS)

A modern, full-stack Applicant Tracking System designed for HR and talent acquisition teams to manage job openings, candidate pipelines, recruitment stages, and hiring analytics from a centralized dashboard.

![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Express%20%7C%20MongoDB%20%7C%20TailwindCSS-blue)
![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen)

---

## 🌟 Key Features

- **📊 Comprehensive Analytics Dashboard**
  - Recruitment KPI metrics: Total Candidates, Active Openings, In-Interview, Offers Extended, Hired.
  - Interactive Pipeline Funnel visualization.
  - Applications Trend chart over the last 30 days (Recharts Area chart).
  - Candidate Source Distribution chart (LinkedIn, Referrals, Job Boards, etc.).
  - Real-time Recent Activity feed tracking hiring actions and status changes.

- **👥 Candidate Management**
  - Search candidates by name or email with live debounced search.
  - Filter candidates by Recruitment Stage, Job Opening, and Candidate Source.
  - Candidate profile detail view with resume link, contact details, tags, and notes.
  - Complete candidate Stage Progression History with timestamps and actor tracking.
  - Quick Stage advancement directly from candidate list or profile view.
  - Add / Edit Candidate modal with input validation.

- **💼 Job Openings Management**
  - Create and edit job postings with departments, required skills, employment types, and opening counts.
  - Toggle Job status between Open and Closed with immediate status updates.
  - View applicant count and candidate roster per job posting.

- **🗂️ Interactive Kanban Pipeline**
  - 6 recruitment stages: **Applied**, **Screening**, **Interview**, **Offer**, **Hired**, **Rejected**.
  - Drag-and-drop cards between columns to change candidate stages dynamically.
  - Action menu for quick stage movement and profile preview.

- **🔍 Global Instant Search**
  - Global search bar with shortcut (`Ctrl+K` / `Cmd+K`) to instantly find candidates and jobs across the platform.

- **🔔 Interactive Notifications System**
  - Notification bell with unread counter badge.
  - Dropdown panel showing real-time hiring updates and audit log events.
  - Read/unread state tracking with local persistence, mark-all-as-read, and quick direct navigation.

- **⚡ Zero-Config Database Architecture**
  - Seamlessly connects to local/cloud MongoDB if available (`MONGODB_URI`).
  - **Automatic In-Memory MongoDB Fallback**: If no MongoDB server is running on the machine, the system automatically boots an in-memory MongoDB engine (`mongodb-memory-server`) and auto-seeds initial demo data. No database installation or Docker required to run out of the box!

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18 (Vite)
  - Tailwind CSS
  - React Router v6
  - Lucide React (Icons)
  - Recharts (Data Visualizations)
  - Vitest + React Testing Library

- **Backend**:
  - Node.js & Express
  - Mongoose 7
  - `mongodb-memory-server` (Zero-config in-memory engine fallback)
  - Supertest & Vitest (Automated API tests)
  - Helmet & CORS security middleware

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 2. Installation
Install all dependencies (root, backend, and frontend) with a single command:
```bash
npm run install:all
```
*(Or run `npm install` in the root, `/server`, and `/client` directories individually).*

### 3. Environment Configuration
The root `.env` file is pre-configured with default development settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ats-app
JWT_SECRET=ats-jwt-secret-development-key-2026
CLIENT_URL=http://localhost:5173
```
*Note: If no local MongoDB is detected, the server automatically starts an in-memory instance.*

### 4. Running the Application
Start both the backend server and frontend client concurrently:
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Testing

Run automated tests for both server and client:

```bash
# Run backend API integration tests
npm test

# Run frontend component tests
npm run test:client
```

---

## 📡 API Endpoints

### Jobs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/jobs` | Get all jobs (optional filters: status, department, search) |
| `POST` | `/api/jobs` | Create a new job opening |
| `GET` | `/api/jobs/:id` | Get job details and associated candidates |
| `PUT` | `/api/jobs/:id` | Update job opening |
| `PATCH` | `/api/jobs/:id/status` | Toggle status (`Open` / `Closed`) |
| `DELETE` | `/api/jobs/:id` | Delete job opening |

### Candidates
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/candidates` | Get paginated candidate list with search & filters |
| `POST` | `/api/candidates` | Create a new candidate |
| `GET` | `/api/candidates/:id` | Get candidate detail with stage history |
| `PUT` | `/api/candidates/:id` | Update candidate details |
| `PATCH` | `/api/candidates/:id/stage` | Update candidate recruitment stage |
| `DELETE` | `/api/candidates/:id` | Delete candidate |

### Dashboard & Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/metrics` | Aggregate KPI counts |
| `GET` | `/api/dashboard/pipeline` | Candidate counts grouped by stage |
| `GET` | `/api/dashboard/applications-over-time` | Applications grouped by date |
| `GET` | `/api/dashboard/sources` | Breakdown of candidate sources |
| `GET` | `/api/dashboard/activity` | Recent activity audit logs |

### Search
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/search?q={query}` | Global search across candidates and jobs |

---

## 📁 Project Structure

```
ats-app/
├── package.json               # Root scripts (dev, test, install:all)
├── .env                       # Environment configuration
├── README.md                  # Project documentation
├── server/                    # Express Backend
│   ├── src/
│   │   ├── config/            # DB connection & in-memory fallback
│   │   ├── controllers/       # Business logic for jobs, candidates, dashboard
│   │   ├── models/            # Mongoose schemas (Job, Candidate, Activity)
│   │   ├── routes/            # Express route definitions
│   │   ├── scripts/           # Database seed script
│   │   ├── __tests__/         # API integration test suite
│   │   ├── app.js             # Express app setup & middleware
│   │   └── server.js          # Server entry point
│   └── package.json
└── client/                    # Vite + React Frontend
    ├── src/
    │   ├── components/        # Reusable UI (Sidebar, Badges, Modals, Search, Toasts)
    │   ├── layouts/           # AppLayout with responsive sidebar & top header
    │   ├── pages/
    │   │   ├── Dashboard/     # Metrics, Charts, Activity feed
    │   │   ├── Candidates/    # Candidates list, Detail view, Add/Edit form
    │   │   ├── Jobs/          # Job postings, Detail view, Create/Edit form
    │   │   ├── Pipeline/      # Interactive Kanban stage board
    │   │   ├── Settings/      # System settings and configuration
    │   │   └── NotFound.jsx   # 404 handler
    │   ├── services/          # Centralized API fetch client
    │   ├── App.jsx            # React Router setup
    │   ├── main.jsx           # React DOM root
    │   └── index.css          # Tailwind CSS styling & animations
    └── package.json
```
