# Smart Task & Reminder App — 48-Hour Execution Plan

## 0. The real constraint you're solving for

Read the brief again: *"Mandatory: Use any AI coding LLM, interview will be on the basis of approach used to write down the code and basics of the application."*

That sentence is the whole assignment. They are not grading "did you build a task app with React Native + web + AI in 48 hours" as a feature checklist — nobody genuinely production-grade does that solo in 2 days. They're grading:

1. **Judgment** — did you scope sensibly under a hard deadline, or did you panic-build everything shallowly?
2. **Engineering hygiene** — clean commits, sane architecture, real auth, no copy-pasted AI slop with unused imports and inconsistent patterns.
3. **How you used AI** — did you understand and shape what the LLM gave you, or blindly paste?
4. **Product sense** — does the "smart" in "Smart Task & Reminder App" mean anything, or is it just CRUD with a chatbot bolted on?

So the strategy is: **build a smaller surface area extremely well, and be ready to explain every decision in the interview.** A judge will forgive a missing "forgot password" flow. They won't forgive a broken JWT refresh, an AI feature that's just a wrapped prompt with no real UX, or a repo with one giant "final commit."

---

## 1. Scope: what's core vs. what's cut

Full parity across Next.js web + React Native mobile + Node/Express + MongoDB + JWT + AI + 2 deployments + an APK, in 48 hours, alone — is not realistic to do *well*. Cutting scope deliberately, and being able to say why, is itself the signal they're testing for.

**Build fully (this is what gets judged closely):**
- Node.js + Express + MongoDB backend, JWT auth, full task CRUD, search/filter/sort — production-shaped code (validation, error handling, proper status codes).
- Next.js web app — full functionality, responsive (mobile/tablet/desktop), polished UI.
- One well-executed AI feature, not three shallow ones (see §3).
- Deployed and reachable: Vercel (web) + Render/Railway (API) + MongoDB Atlas.
- Clean GitHub repo: proper README, env example, commit history that tells a story.

**Build minimally, on purpose (React Native/Expo):**
- Don't try to rebuild every screen 1:1. Build: Login/Signup → Dashboard (pending/completed/upcoming) → Task list → Task detail/create/edit → Search/filter.
- Reuse the same backend and API contracts — that's the point of the architecture, and it's a good thing to say out loud in the interview: "one API, two clients."
- Skip: push notifications infra (use in-app/email reminders instead — the spec explicitly allows this), offline sync, animations polish. Note these as "next steps" in your README rather than silently omitting them.
- Ship it as an Expo build (`eas build` or `expo export` + APK via EAS) — doesn't need app-store polish, needs to install and run.

**Explicitly optional, skip unless time remains:**
- Forgot Password (spec marks it optional — skip it, mention it in README as a known gap).
- Push notifications (real ones require FCM setup, a rabbit hole not worth 3 hours of your 48).

This is the single most important paragraph in this doc: **a working, well-architected 70% beats a broken, sloppy 100%.** Interviewers can tell the difference in 5 minutes.

---

## 2. "How many AI features" — pick one flagship, add one small one

Don't scatter "AI" across five buttons. Depth over breadth, same logic as above.

**Flagship AI feature (the one you can talk about for 10 minutes in the interview):**
**Natural-language task creation.** User types "remind me to call the vendor about invoice #223 next Friday afternoon, high priority" into a single input → LLM extracts `{title, description, dueDate, priority, category}` → pre-fills the task form for confirmation (never auto-saves without a human glance — that's a UX decision worth stating explicitly in the interview: AI proposes, user confirms).

Why this one, not a chatbot: it's genuinely useful, it's demoable in 10 seconds, it forces you to do real prompt engineering (structured JSON output, date parsing, fallback when the model returns garbage), and it directly justifies "Smart" in the product name.

**Small secondary AI feature (nice-to-have, cheap to build):**
**Smart categorization / priority suggestion.** When a user types a task title+description without picking a category or priority, an async call suggests one, shown as a soft suggestion chip they can accept or override. Reuses the same LLM call infrastructure as the flagship feature — cheap to add once the first one exists.

Skip: AI chat assistants, AI "insights dashboards," AI daily-summary emails — all interesting in theory but will eat time you don't have and read as feature-padding rather than product thinking.

**Implementation note:** Use whichever provider you're fastest with — since you already work with LangChain/RAG patterns, structured output via function-calling/JSON mode (Claude's tool use or OpenAI's function calling) will be faster and more reliable here than a raw-text prompt you regex-parse.

---

## 3. Architecture

```
┌─────────────────┐     ┌──────────────────┐
│  Next.js (Web)   │     │ React Native      │
│  Vercel          │     │ (Expo) → APK      │
└────────┬─────────┘     └─────────┬─────────┘
         │                          │
         └──────────┬───────────────┘
                     │  REST API (JSON, JWT bearer)
             ┌───────▼────────┐
             │ Node + Express  │
             │ Render/Railway  │
             └───────┬─────────┘
                     │
        ┌────────────┼────────────┐
        │                          │
┌───────▼────────┐      ┌─────────▼─────────┐
│ MongoDB Atlas   │      │ AI API (Claude/    │
│                 │      │ OpenAI/Gemini)     │
└─────────────────┘      └────────────────────┘
```

One Express API, consumed by both clients. Don't duplicate business logic — enforce it server-side (validation, ownership checks) so both frontends stay thin. This is a good architectural talking point: "logic lives once, in the API."

---

## 4. Database schema (MongoDB / Mongoose)

```js
// User
{
  name: String,
  email: { type: String, unique: true, required: true, lowercase: true },
  passwordHash: String,          // bcrypt, never store plaintext
  createdAt: Date,
}

// Task
{
  user: { type: ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: String,
  dueDate: Date,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  category: { type: String, default: 'general' },
  completed: { type: Boolean, default: false },
  reminder: {
    enabled: { type: Boolean, default: false },
    remindAt: Date,
    sent: { type: Boolean, default: false },   // for the scheduled job to check
  },
  aiGenerated: { type: Boolean, default: false }, // nice detail: shows you tracked provenance
  createdAt: Date,
  updatedAt: Date,
}
```

Index on `{ user: 1, dueDate: 1 }` and `{ user: 1, completed: 1 }` — small detail, real signal that you thought about query patterns, not just CRUD.

---

## 5. API surface (Express)

```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me                  (JWT protected)

GET    /api/tasks                    ?search=&priority=&category=&completed=&sortBy=&order=
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id

POST   /api/ai/parse-task            { text } → { title, description, dueDate, priority, category }
POST   /api/ai/suggest-category      { title, description } → { category, priority }

GET    /api/reminders/due            (internal, used by scheduled job)
```

JWT via `Authorization: Bearer <token>` header, short-lived access token (~15min) is nice-to-have but a single reasonably-expiring token (e.g. 7 days) is fine for a 48-hour assignment — don't over-engineer refresh-token rotation here, it's not what's being tested and it'll eat hours.

For reminders: a `node-cron` job every few minutes checking `reminder.remindAt <= now && !reminder.sent`, sending via a transactional email service (Resend, or nodemailer + Gmail app password for speed) satisfies the spec's "email reminder" fallback without needing push infra.

---

## 6. User flow

```
Landing/Login → Signup (if new) → Dashboard
                                     │
        ┌────────────────────────────┼─────────────────────────┐
        │                            │                          │
   Pending Tasks               Completed Tasks           Upcoming Reminders
        │
        ├─ Quick-add bar (natural language, AI-parsed) ── confirm ── saved
        ├─ "+ New Task" (manual form: title, desc, due date, priority, category, reminder)
        ├─ Search bar + Filter (priority/category/status) + Sort (due date/priority/created)
        └─ Task card → click → Task detail/edit → mark complete / delete
```

Dashboard should visually separate the three states (pending / completed / upcoming reminders) at a glance — a simple 3-column or tabbed layout beats a single long list. This is where your "UI/UX instincts" line on your resume gets tested; make the AI quick-add bar visually prominent (it's your differentiator), not a buried settings toggle.

---

## 7. UI/UX principles for this build

- **One primary action per screen.** Dashboard's hero action is the natural-language quick-add — put it above the fold, not in a modal three clicks deep.
- **Priority and category as color + label, not color alone** (accessibility, and it reads better in a screen recording for the interview).
- **Empty states matter** — "No tasks yet — try typing 'remind me to...' above" teaches the AI feature for free.
- **Mobile-first Tailwind breakpoints** on the Next.js side; test at 375px, 768px, 1280px before you call it responsive.
- Keep the RN app visually consistent with the web app (same color tokens, same task card shape) — reinforces "one product, two surfaces" rather than two disconnected builds.

---

## 8. "Vibe coding" with production practices — how to actually use the AI tool here

Since they're grading *approach*, make it visible in the repo itself:

- **Commit in logical chunks**, not one mega-commit: `feat: auth + JWT middleware`, `feat: task CRUD API`, `feat: AI natural-language task parsing`, `feat: dashboard UI`, `feat: RN core screens`, `chore: deploy config`. This alone visibly demonstrates real engineering process versus a single AI-generated dump.
- **Review every AI-generated diff before accepting it** — rename generic variables, remove unused imports, make error handling consistent across routes (one error-response shape, not five different ones from five different prompts).
- **Write a short `AI_USAGE.md` or README section**: which tool you used, for what (scaffolding boilerplate vs. business logic vs. the AI-parsing prompt itself), and what you changed by hand. This directly answers their stated evaluation criterion instead of leaving them to guess.
- **Don't let the AI choose your architecture silently** — decide the schema and API shape yourself (or review closely if AI drafts it), then have it generate route handlers against your contract. Interviewers can tell architecture-first work from vibes-first work.
- **Add a couple of real tests** (even 5–6 with Jest/Supertest on the API — auth, task creation, task ownership check) — small effort, disproportionate signal of production habits.

---

## 9. 48-hour timeline (starting now, deadline Wed 3PM IST)

**Hours 0–6 — Foundation**
Repo init, Express skeleton, Mongoose models, JWT auth (signup/login/me), deploy skeleton to Render early (deploy early and often, don't leave it for hour 40).

**Hours 6–14 — Core API**
Task CRUD, search/filter/sort query logic, validation (Zod/Joi), error middleware. Write the 5–6 tests here while the logic is fresh.

**Hours 14–24 — Web app**
Next.js scaffold, auth pages, dashboard layout, task list/create/edit, search/filter UI, responsive pass. Deploy to Vercel, point at the live Render API.

**Hours 24–30 — AI features**
Natural-language parse endpoint + quick-add UI, category/priority suggestion. This is dense but scoped — you already have the API and UI shell to hang it on.

**Hours 30–36 — Reminders**
Cron job + email sending, reminder field wiring in the create/edit form, "Upcoming Reminders" dashboard section.

**Hours 36–44 — React Native**
Expo app: auth, dashboard, task list/detail/create/edit, search/filter, hitting the same live API. Build the APK via `eas build -p android --profile preview` (or local build) — start this build process early since builds can queue/take time; don't start it at hour 47.

**Hours 44–47 — Polish + submission prep**
Bug pass, responsive check, README (setup instructions, architecture diagram, AI_USAGE section, known gaps/next-steps), final deploy check on both URLs, confirm APK installs on a real or emulated device.

**Hour 47–48 — Buffer**
Something will break during deploy or the APK build. This hour exists for that. Don't schedule real work into it.

---

## 10. Submission checklist

- [ ] Live web URL (Vercel) — loads, login/signup works against the live API
- [ ] Live API (Render/Railway) — healthy, MongoDB Atlas connected, env vars set (not committed)
- [ ] APK installs and runs against the live API (not localhost)
- [ ] GitHub repo: clean commit history, README with setup + architecture + AI_USAGE + known limitations
- [ ] `.env.example` present, no secrets committed
- [ ] Quick end-to-end pass: signup → login → AI quick-add → edit → filter/search → complete → delete, on both web and mobile

---

If it'd help, I can generate the actual Express boilerplate (models, JWT middleware, task routes) or the AI-parsing prompt/endpoint next — that's the highest-leverage place to start given the timeline.