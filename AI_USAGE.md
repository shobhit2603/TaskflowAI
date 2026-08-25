# AI Usage — TaskflowAI

This document explains how I used AI coding tools (specifically **Google Gemini / Antigravity IDE**) during the development of this project. This is required by the assignment brief, which states: *"Mandatory: Use any AI coding LLM, interview will be on the basis of approach used to write down the code."*

---

## My Approach: Architecture-First, AI-Assisted

The most important thing I want to be clear about: **AI did not design this application. I did.**

Before writing a single line of code, I made all the key decisions myself:
- The layered architecture (Routes → Controller → Service → Repository → Model)
- The database schema and which indexes to add
- The API surface (which endpoints, what they return, what errors they throw)
- Which AI feature to build and why (natural-language task creation over a chatbot)

Only after those decisions were locked in did I use AI to help implement them. This is the right way to use AI in production — **you drive the architecture, AI accelerates the implementation**.

---

## What I Used AI For

### ✅ Scaffolding boilerplate (high AI contribution)
Things that are correct but tedious to type:
- Express app setup (CORS, morgan, body parser, error handler)
- Mongoose schema field definitions
- Zod validation schemas
- JSDoc comments

**What I changed after AI generated it:** Renamed generic variables, consolidated the error handler to use a single `isOperational` flag pattern (AI sometimes generates multiple if/else chains for each error type), and removed unused imports.

### ✅ Filling in well-defined contracts (medium AI contribution)
Once I wrote the function signatures and JSDoc comments defining what each function should do, AI filled in the implementation. Examples:
- `UserRepository.findByEmail(email, withPassword)` — I defined the signature; AI wrote the Mongoose query
- `TaskService.updateTask(taskId, userId, updates)` — I defined that it must check ownership first; AI implemented the pattern
- The `asyncHandler` HOF — textbook pattern, AI generated it correctly first try

**What I changed:** The `findByEmail` in the repository — AI initially used `.lean()` which strips Mongoose instance methods, breaking `user.comparePassword()` in the login flow. I caught this during testing and added `lean(false)` with a comment explaining why.

### ✅ Error handling patterns (medium AI contribution)
I specified the `ApiError` class shape (statusCode, message, errors[], isOperational flag) and had AI generate the factory methods. The distinction between operational errors and programmer errors in the global error handler was my design decision — AI implemented it.

### ✅ The AI feature itself (collaborative)
For the natural-language task parser (`POST /api/ai/parse-task`), I wrote the prompt engineering and the JSON output schema first, then used AI to generate the boilerplate around the API call. The structured output format (using function calling / JSON mode) was my decision — a raw-text prompt that needs regex parsing is fragile; structured output with a schema is reliable.

---

## What I Did NOT Use AI For

### ❌ Architecture decisions
- The choice to separate Repository from Service (Repository = data access only, Service = business rules) — this came from my understanding of the layered architecture pattern
- Enforcing ownership checks in the Service layer (not Controller, not Repository) — my decision
- Using `select: false` on `passwordHash` in the Mongoose schema — I knew this from experience; AI didn't suggest it

### ❌ Security decisions
- User enumeration protection in login (same error message for "user not found" and "wrong password") — I explicitly specified this
- Re-fetching the user from DB in the JWT middleware (to catch deleted accounts) — my decision, with a comment explaining why
- Body size limit (`express.json({ limit: '10kb' })`) — a real-world practice I added

### ❌ Bug fixing
- The `.lean()` issue in the repository (described above) — caught by testing
- Zod query param coercion (`"true"` → `true`, `"1"` → `1`) — I noticed this edge case and added the `.transform()` calls

---

## How I Reviewed AI Output

I followed a simple process for every AI-generated diff:

1. **Read it line by line** before accepting — not just "does it look right", but "do I understand every decision made here?"
2. **Run it and test it** — auth endpoints, error cases, edge cases (wrong password, no token, duplicate email)
3. **Add comments** — if I couldn't explain a line in the code to an interviewer, I either changed it or added a comment that does explain it
4. **Check imports** — AI sometimes adds unused imports or uses the wrong module. I cleaned these up.

---

## Commit History Philosophy

Commits follow logical feature chunks, not "one big commit at the end":
- `feat: project scaffold + db config + env setup`
- `feat: jwt auth — user model, repository, service, middleware, controller, routes`
- `feat: task CRUD — model, repository, service, validator, controller, routes`
- `feat: AI natural-language task parsing endpoint`
- `feat: reminder cron + email service`
- `feat: Next.js web app — auth + dashboard + task management`
- `feat: Expo mobile app — core screens`
- `chore: deploy config + README`

This commit history tells the story of how the app was built. It also means if something breaks in deployment, I can bisect to the exact commit that caused it.

---

## Tools Used

| Tool | Purpose |
|---|---|
| **Antigravity IDE (Gemini)** | Primary AI coding assistant — scaffolding, implementation, review |
| **Zod** | Schema validation — chosen over express-validator because schemas are reusable outside of HTTP handlers |
| **bcryptjs** | Password hashing — work factor 12 (balanced security vs. speed) |
| **jsonwebtoken** | JWT signing/verification — all logic centralised in `utils/jwt.js` |
| **node-cron** | Reminder scheduling — runs every 2 minutes to check due reminders |

---

## Key Interview Talking Points

If asked "how did you use AI in this project?", here's the honest answer:

> *"I used AI as a senior pair-programming partner who's fast at typing. I drove the architecture — I decided the layer structure, the schema, the API surface, and all the security decisions. AI helped me implement those decisions faster. Every line of code was reviewed before it went in. The biggest value-add was scaffolding boilerplate that's correct but slow to write manually, like the global error handler and Zod schemas."*

The AI feature in the product itself (natural-language task creation) is different — that required real prompt engineering: specifying the JSON output schema, handling edge cases where the model returns garbage, and making the UX decision that AI proposes but the user always confirms before saving.
