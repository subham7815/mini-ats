# TalentFlow - Mini Applicant Tracking System (ATS)

A modern, full-stack Applicant Tracking System designed for HR and talent acquisition teams to manage job openings, candidate pipelines, recruitment stages, and hiring analytics from a centralized dashboard.

![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Express%20%7C%20MongoDB%20%7C%20TailwindCSS-blue)
![Deployment](https://img.shields.io/badge/Deploy-Vercel%20Ready-black?logo=vercel)
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
  - **Automatic In-Memory MongoDB Fallback**: In local development without MongoDB installed, the system boots an embedded in-memory MongoDB engine (`mongodb-memory-server`) and auto-seeds demo data.
  - **Serverless Production Caching**: On Vercel, connections are cached across lambda invocations (`global.mongoose`) to avoid cold-start connection limits.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18 (Vite)
  - Tailwind CSS
  - React Router v6 (SPA routing with Vercel rewrites)
  - Lucide React (Icons)
  - Recharts (Data Visualizations)
  - Vitest + React Testing Library

- **Backend**:
  - Node.js & Express
  - Mongoose 7 with serverless connection pooling
  - Vercel Serverless Function entry point (`server/api/index.js`)
  - Supertest & Vitest (Automated API tests)
  - Helmet & CORS security middleware

---

## 🌐 Vercel Deployment Instructions

The application is deployed on Vercel as two decoupled projects: **Backend (Serverless API)** and **Frontend (SPA Client)**.

### 1. Backend Deployment (`ats-backend`)

1. In the Vercel dashboard, import the repository `https://github.com/subham7815/mini-ats`.
2. Configure project settings:
   - **Project Name**: `mini-ats-backend` (or your preferred name)
   - **Framework Preset**: `Other`
   - **Root Directory**: `server`
   - **Build Command**: Leave default (or empty)
   - **Output Directory**: Leave default (or empty)
3. Set the **Environment Variables** in Vercel:
   | Variable | Description | Example Value |
   |---|---|---|
   | `MONGODB_URI` | **Required** MongoDB Atlas connection string | `mongodb+srv://<user>:<pwd>@cluster0.abcde.mongodb.net/ats-app?retryWrites=true&w=majority` |
   | `CLIENT_URL` | URL of the deployed frontend | `https://mini-ats-one.vercel.app` |
   | `NODE_ENV` | Environment mode | `production` |
4. Deploy the project.
5. Verify the backend deployment:
   - Root endpoint: `https://<backend-url>.vercel.app/` should return:
     ```json
     {
       "message": "Mini ATS API is running",
       "status": "OK",
       "version": "1.0.0"
     }
     ```
   - Health endpoint: `https://<backend-url>.vercel.app/api/health` should return:
     ```json
     {
       "success": true,
       "status": "OK",
       "message": "ATS API Server is running",
       "database": {
         "status": "connected",
         "connected": true
       }
     }
     ```

### 2. Frontend Deployment (`ats-frontend`)

1. In the Vercel dashboard, create a second project from the same repository.
2. Configure project settings:
   - **Project Name**: `mini-ats-frontend`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
3. Set the **Environment Variables** in Vercel:
   | Variable | Description | Example Value |
   |---|---|---|
   | `VITE_API_BASE_URL` | **Required** Backend API base URL | `https://mini-ats-tfil.vercel.app/api` |
4. Deploy the project.
5. The frontend will now communicate directly with the live backend at `mini-ats-tfil.vercel.app`.

---

## 🗄️ Database Setup (MongoDB Atlas)

For production deployment on Vercel:

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Security > Database Access**, create a user with read/write permissions.
3. Under **Security > Network Access**, add IP `0.0.0.0/0` (allow access from anywhere, required for dynamic serverless IPs).
4. Click **Connect > Drivers > Node.js** to copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/ats-app?retryWrites=true&w=majority
   ```
5. Add this string as `MONGODB_URI` in your Vercel Backend project settings.
6. Upon the first request, the database will automatically initialize and auto-seed initial demo candidates and jobs if the collections are empty.

---

## 🚀 Local Development Guide

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 2. Installation
Install all dependencies across root, backend, and frontend:
```bash
npm run install:all
```

### 3. Running Locally
Start both backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API Root**: [http://localhost:5000/](http://localhost:5000/)
- **Backend Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Testing

Run the automated test suites:

```bash
# Run backend API integration tests
npm test

# Run frontend component unit tests
npm run test:client
```

---

## 📡 API Reference

### Root & Health
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Root API status and documentation endpoints |
| `GET` | `/api` | API status confirmation |
| `GET` | `/api/health` | Service and MongoDB connection health check |

### Jobs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/jobs` | Get all jobs (filters: status, department, search) |
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
├── .env.example               # Template environment configuration
├── README.md                  # Project documentation
├── server/                    # Express Backend
│   ├── vercel.json            # Vercel serverless rewrite rules
│   ├── api/
│   │   └── index.js           # Vercel serverless entry point
│   ├── src/
│   │   ├── config/            # Serverless cached DB connection
│   │   ├── controllers/       # Business logic for jobs, candidates, dashboard
│   │   ├── models/            # Mongoose schemas (Job, Candidate, Activity)
│   │   ├── routes/            # Express route definitions
│   │   ├── scripts/           # Database seed script & test verifiers
│   │   ├── __tests__/         # API integration test suite
│   │   ├── app.js             # Express app, CORS, routes & health endpoints
│   │   └── server.js          # Standalone server entry point
│   └── package.json
└── client/                    # Vite + React Frontend
    ├── vercel.json            # Vercel SPA routing rewrites
    ├── .env.example           # Template frontend environment configuration
    ├── src/
    │   ├── components/        # UI (Sidebar, Badges, Modals, Search, Dropdowns)
    │   ├── layouts/           # AppLayout with responsive sidebar & top header
    │   ├── pages/
    │   │   ├── Dashboard/     # Metrics, Charts, Activity feed
    │   │   ├── Candidates/    # Candidates list, Detail view, Add/Edit form
    │   │   ├── Jobs/          # Job postings, Detail view, Create/Edit form
    │   │   ├── Pipeline/      # Interactive Kanban stage board
    │   │   ├── Settings/      # System settings and configuration
    │   │   └── NotFound.jsx   # 404 handler
    │   ├── services/          # Centralized API fetch client with VITE_API_BASE_URL
    │   ├── App.jsx            # React Router setup
    │   ├── main.jsx           # React DOM root
    │   └── index.css          # Tailwind CSS styling & animations
    └── package.json
```
