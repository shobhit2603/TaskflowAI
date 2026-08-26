# ⚡ TaskflowAI — Smart Task & Reminder App

An AI-powered task management application with natural language task creation, smart categorization, and intelligent reminders. Built with a clean layered architecture: **one API, two clients** (Next.js web + React Native mobile).

---

## 🎯 What Makes This "Smart"

The "Smart" in Smart Task & Reminder App isn't a marketing label — it's a genuine AI integration:

- **Natural Language Task Creation** — Type `"Call vendor about invoice #223 next Friday afternoon, urgent"` → AI extracts `{title, dueDate, priority, category}` → pre-fills the form for human confirmation. AI proposes, user confirms.
- **Smart Category & Priority Suggestions** — As you type a task title, AI suggests the best category and priority with reasoning. Shown as a soft suggestion chip you can accept or ignore.
- **Powered by Mistral AI** via LangChain's structured output — guaranteed JSON schema compliance, no regex parsing.

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐
│  Next.js (Web)   │     │ React Native      │
│  Vercel / Docker │     │ (Expo) → APK      │
└────────┬─────────┘     └─────────┬─────────┘
         │                          │
         └──────────┬───────────────┘
                     │  REST API (JSON, JWT Bearer)
             ┌───────▼────────┐
             │ Node + Express  │
             │ Render / Docker │
             └───────┬─────────┘
                     │
        ┌────────────┼────────────┐
        │                          │
┌───────▼────────┐      ┌─────────▼─────────┐
│ MongoDB Atlas   │      │ Mistral AI (via    │
│                 │      │ LangChain)         │
└─────────────────┘      └────────────────────┘
```

**Key architectural decision:** Business logic lives once, in the API. Both clients are thin consumers — validation, ownership checks, and AI calls all happen server-side.

### Server Architecture (Layered)

```
Routes → Controllers → Services → Repositories → Models
  │          │             │            │            │
  │       HTTP only    Business     Data access   Mongoose
  │      (req/res)      logic       (MongoDB)     schemas
  │                  (auth, AI,
  │                  ownership)
```

Each layer has a single responsibility and only calls the layer below it.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Backend** | Node.js + Express 5 | Latest stable, native async error handling |
| **Database** | MongoDB + Mongoose | Flexible schema for task metadata |
| **Auth** | JWT (HS256, 7-day expiry) | Stateless auth, works across both clients |
| **Validation** | Zod v4 | Type-safe schemas, reusable across layers |
| **AI** | Mistral AI + LangChain | Structured output via tool-calling, reliable JSON |
| **Web Frontend** | Next.js 16 + Tailwind v4 | Server-side rendering, responsive design |
| **State (Web)** | Zustand + React Query | Minimal boilerplate, optimistic updates |
| **Mobile** | React Native (Expo 52) | Cross-platform, shared API contracts |
| **State (Mobile)** | Zustand + React Query | Same patterns as web for consistency |
| **Auth Storage** | SecureStore (mobile), localStorage (web) | Platform-appropriate secure storage |
| **Containerization** | Docker + Docker Compose | One-command full-stack deployment |

---

## ✨ Features

### Core Task Management
- ✅ Full CRUD (Create, Read, Update, Delete)
- ✅ Toggle task completion with optimistic UI updates
- ✅ Priority levels (Low / Medium / High) with color-coded indicators
- ✅ Categories (custom text: work, personal, health, etc.)
- ✅ Due dates with relative date display
- ✅ Search across title and description
- ✅ Filter by priority, category, and completion status
- ✅ Sort by date, priority, or creation time
- ✅ Pagination (server-side, 20 per page)

### AI Features
- ✅ **Natural Language Task Parsing** — flagship AI feature
- ✅ **Smart Category/Priority Suggestions** — debounced, non-intrusive
- ✅ Graceful degradation — AI failures never crash the user's flow

### Authentication
- ✅ JWT-based auth with bcrypt password hashing (work factor 12)
- ✅ User enumeration protection (same error for invalid email/password)
- ✅ Token auto-injection via Axios interceptors
- ✅ Auto-logout on 401 responses
- ✅ Hydration-aware auth guard (no flash to login on reload)

### Reminders
- ✅ Per-task reminders with configurable remind-at time
- ✅ Reminder sub-document design (no separate collection needed)
- ✅ Cron-ready architecture for email notifications

### Mobile App (React Native / Expo)
- ✅ Expo Router file-based navigation
- ✅ SecureStore for token storage (encrypted keychain)
- ✅ Pull-to-refresh
- ✅ AI Quick Add component
- ✅ Task form with AI category suggestions
- ✅ Profile screen with logout
- ✅ Dark theme matching web design language

---

## 📁 Project Structure

```
TaskflowAI/
├── server/                      # Express API
│   ├── server.js                # Entry point
│   ├── dockerfile               # Production Docker image
│   ├── .env.example             # Environment variables template
│   └── src/
│       ├── app.js               # Express app setup (CORS, middleware, error handler)
│       ├── config/              # DB, env, AI configuration
│       ├── controllers/         # HTTP handlers (req → res, no business logic)
│       ├── services/            # Business logic (auth, tasks, AI)
│       ├── repositories/        # Data access layer (MongoDB queries)
│       ├── models/              # Mongoose schemas (User, Task)
│       ├── middlewares/         # JWT auth guard
│       ├── validators/          # Zod schemas (auth, task, AI)
│       ├── routes/              # Express router definitions
│       └── utils/               # JWT, error classes, async handler
│
├── apps/
│   ├── web/                     # Next.js frontend
│   │   ├── dockerfile           # Production Docker image
│   │   └── src/
│   │       ├── app/             # Next.js App Router pages
│   │       ├── components/      # UI components (tasks, auth, AI, layout)
│   │       ├── hooks/           # React Query hooks (useTasks, useAuth, useAI)
│   │       ├── store/           # Zustand stores (auth, task)
│   │       └── lib/             # API client, utilities
│   │
│   └── mobile/                  # React Native (Expo) app
│       ├── app/                 # Expo Router screens
│       │   ├── (auth)/          # Login, Signup screens
│       │   └── (tabs)/          # Dashboard, Profile tabs
│       ├── components/          # TaskFormSheet, AIQuickAdd
│       ├── hooks/               # React Query hooks (mirrors web)
│       ├── store/               # Zustand stores (mirrors web)
│       └── lib/                 # API client, query config
│
├── docker-compose.yml           # Full-stack orchestration
├── AI_USAGE.md                  # How AI tools were used (required by assignment)
└── README.md                    # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **MongoDB** (local or MongoDB Atlas)
- **Mistral AI API Key** — [Get free key](https://console.mistral.ai)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/TaskflowAI.git
cd TaskflowAI

# Server
cd server && npm install

# Web app
cd ../apps/web && npm install

# Mobile app (optional)
cd ../mobile && npm install
```

### 2. Configure Environment

```bash
# Server — copy and fill in your values
cp server/.env.example server/.env
```

Required environment variables:

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Random 32+ char secret (`node -e "require('crypto').randomBytes(32).toString('hex')"`) |
| `MISTRAL_API_KEY` | Mistral AI API key |

### 3. Run Development Servers

```bash
# Terminal 1 — API server (port 5000)
cd server && npm run dev

# Terminal 2 — Web app (port 3000)
cd apps/web && npm run dev

# Terminal 3 — Mobile app (optional)
cd apps/mobile && npx expo start
```

Open **http://localhost:3000** → Sign up → Start creating tasks!

---

## 🐳 Docker Deployment

### One-command full stack:

```bash
# Set your secrets
export JWT_SECRET="your-super-secret-jwt-key-here"
export MISTRAL_API_KEY="your-mistral-api-key"

# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f
```

This starts:
- **MongoDB** on port 27017 (with persistent volume)
- **API Server** on port 5000 (with health checks)
- **Web App** on port 3000 (with API proxy)

### Individual services:

```bash
# Build server only
docker build -t taskflow-server ./server

# Build web only
docker build -t taskflow-web ./apps/web \
  --build-arg BACKEND_URL=https://your-api.render.com
```

---

## 📡 API Reference

Base URL: `http://localhost:5000/api/v1`

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/signup` | Public | Create account → returns `{user, token}` |
| `POST` | `/auth/login` | Public | Authenticate → returns `{user, token}` |
| `GET` | `/auth/me` | 🔒 JWT | Get current user profile |

### Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/tasks` | 🔒 JWT | List tasks (with filters, search, sort, pagination) |
| `POST` | `/tasks` | 🔒 JWT | Create a task |
| `GET` | `/tasks/:id` | 🔒 JWT | Get single task |
| `PUT` | `/tasks/:id` | 🔒 JWT | Update task (partial) |
| `DELETE` | `/tasks/:id` | 🔒 JWT | Delete task |
| `PATCH` | `/tasks/:id/toggle` | 🔒 JWT | Toggle completion status |

**Query parameters for `GET /tasks`:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Full-text search in title/description |
| `priority` | `low\|medium\|high` | — | Filter by priority |
| `category` | string | — | Filter by category (case-insensitive) |
| `completed` | `true\|false` | — | Filter by completion status |
| `sortBy` | `dueDate\|priority\|createdAt\|title` | `createdAt` | Sort field |
| `order` | `asc\|desc` | `desc` | Sort direction |
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Items per page (max 100) |

### AI Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/ai/parse-task` | 🔒 JWT | Parse natural language → structured task |
| `POST` | `/ai/suggest-category` | 🔒 JWT | Suggest category + priority for a task |

---

## 🔒 Security Decisions

- **bcrypt** with work factor 12 for password hashing
- **JWT HS256** with configurable expiry (7 days default)
- `passwordHash` excluded from queries via `select: false`
- `toJSON` transform strips sensitive fields as defense-in-depth
- User enumeration protection in login (same error for both invalid email and wrong password)
- Re-fetch user from DB in JWT middleware (catches deleted accounts)
- Body size limit (`10kb`) to prevent payload abuse
- CORS restricted to allowed origins
- Ownership check on every task operation (enforced in service layer)
- `SecureStore` on mobile (encrypted keychain, not AsyncStorage)

---

## 📊 Database Design

```js
// User
{
  name: String,             // 2–50 chars
  email: String,            // unique, lowercase, indexed
  passwordHash: String,     // bcrypt, select: false
  createdAt, updatedAt      // auto (timestamps: true)
}

// Task
{
  user: ObjectId → User,    // indexed, required
  title: String,            // required, max 200
  description: String,      // max 2000, default ''
  dueDate: Date,            // nullable
  priority: enum,           // low | medium | high
  category: String,         // default 'general'
  completed: Boolean,       // default false
  reminder: {
    enabled: Boolean,
    remindAt: Date,
    sent: Boolean           // cron job flips after sending
  },
  aiGenerated: Boolean,     // tracks AI provenance
  createdAt, updatedAt
}
```

**Indexes:** `{user, dueDate}`, `{user, completed}`, `{user, createdAt}` — covers the 3 most common query patterns.

---

## 🤖 AI Integration Details

See [AI_USAGE.md](./AI_USAGE.md) for a detailed breakdown of how AI tools were used during development.

### Natural Language Parsing (Flagship Feature)

**Prompt engineering approach:**
- System prompt provides current UTC time for relative date resolution
- Low temperature (0.1) for deterministic extraction
- LangChain `withStructuredOutput()` for guaranteed JSON schema compliance
- Graceful fallback: on any error, raw text becomes the title with safe defaults
- UX principle: AI proposes, user always confirms before saving

### Category Suggestion (Secondary Feature)

- Debounced (900ms) to avoid excessive API calls during typing
- Higher temperature (0.3) for slightly creative suggestions
- Returns `reasoning` string for transparent AI decision-making
- Null reasoning = no suggestion chip shown (silent failure)

---

## 🧪 End-to-End Test Checklist

```
✅ Signup → Login → Dashboard loads
✅ AI Quick Add → parses text → pre-fills form → user confirms → task created
✅ Manual task creation → title, description, priority, category, due date
✅ Edit task → form pre-fills → save changes
✅ Toggle task completion (optimistic update)
✅ Delete task (confirm dialog → removed)
✅ Filter by priority, search by text
✅ Switch tabs: Pending ↔ Completed
✅ Responsive: mobile, tablet, desktop
✅ Logout → redirect to login
✅ Mobile: same flow on React Native
```

---

## 📝 Known Limitations & Next Steps

Deliberately scoped out to ship a working 70% well rather than a broken 100%:

- **Push Notifications** — would require FCM setup; using in-app reminders instead
- **Forgot Password** — spec marks it optional; noted as a gap
- **Offline Sync** — mobile doesn't queue operations when offline
- **Email Reminders** — cron architecture is in place but email service (Resend/nodemailer) is not wired
- **Unit Tests** — architecture supports testing (each layer is independently testable), but test suite was deprioritized for feature completeness within the deadline
- **Animations Polish** — mobile app has functional UI but minimal animations

---

## 📄 License

This project was built as part of a technical assignment. All code is original work, AI-assisted where noted in [AI_USAGE.md](./AI_USAGE.md).
