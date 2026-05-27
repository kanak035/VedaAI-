# VedaAI – AI Assessment Creator

An AI-powered full-stack application that lets teachers create structured question papers in seconds. Built with Next.js, Node.js/Express, MongoDB, Redis, BullMQ, and WebSockets.

---

## Live Demo

> Deploy instructions below. Once deployed, add your links here.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Create  │  │  Assignments │  │  Result / Paper View   │ │
│  │   Form   │  │     List     │  │  + PDF Export          │ │
│  └────┬─────┘  └──────────────┘  └────────────────────────┘ │
│       │  Zustand Store + WebSocket Hook                      │
└───────┼─────────────────────────────────────────────────────┘
        │ HTTP POST /api/assignments
        ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Express + TS)                   │
│                                                             │
│  Route → Controller → MongoDB (save) → BullMQ Queue        │
│                                    ↓                        │
│                              Worker picks job               │
│                                    ↓                        │
│                         OpenAI GPT-4o-mini                  │
│                                    ↓                        │
│                    Parse + Validate structured JSON          │
│                                    ↓                        │
│                    MongoDB (store result) + Redis (cache)   │
│                                    ↓                        │
│                         WebSocket broadcast                 │
└─────────────────────────────────────────────────────────────┘
        │ ws://  real-time progress events
        ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend receives job_completed event           │
│              → Redirects to /result/[jobId]                 │
│              → Renders structured question paper            │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | Next.js 16, TypeScript, Tailwind CSS v4, Zustand |
| Forms      | React Hook Form + Zod validation                |
| Realtime   | WebSocket (ws library, custom hook)             |
| Backend    | Node.js, Express, TypeScript                    |
| Database   | MongoDB + Mongoose                              |
| Cache      | Redis (ioredis)                                 |
| Queue      | BullMQ (background job processing)              |
| AI         | OpenAI GPT-4o-mini (structured JSON output)     |
| PDF Export | jsPDF + html2canvas                             |

---

## Features

- **Assignment Creation Form** — title, subject, grade, due date, question types, marks, difficulty, file upload, instructions
- **AI Question Generation** — structured prompt → GPT-4o-mini → parsed JSON → Section A/B/C with difficulty tags
- **Real-time Progress** — WebSocket events show live generation progress (0→100%)
- **Background Jobs** — BullMQ queue with Redis; falls back to direct processing if Redis unavailable
- **Structured Output** — sections, questions, difficulty badges (Easy/Moderate/Hard), marks per question
- **Student Info Panel** — name, roll number, section fields on the output page
- **PDF Export** — clean A4 formatted download via jsPDF + html2canvas
- **Regenerate** — one-click regeneration creates a new job from the same inputs
- **Assignments List** — paginated history of all created assessments
- **Mock Fallback** — works without an OpenAI key using a structured mock generator

---

## Project Structure

```
VedaAI/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Redis, WebSocket setup
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routes
│   │   ├── services/        # AI service, queue service
│   │   ├── types/           # Shared TypeScript types
│   │   └── index.ts         # Entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Landing page
│   │   ├── create/           # Assignment creation
│   │   ├── assignments/      # History list
│   │   └── result/[jobId]/   # Output page
│   ├── components/
│   │   ├── forms/            # AssignmentForm
│   │   ├── paper/            # QuestionPaper renderer
│   │   └── ui/               # Navbar, ProgressBar, DifficultyBadge
│   ├── hooks/                # useWebSocket
│   ├── lib/                  # API client, WebSocket client
│   ├── store/                # Zustand store
│   └── types/                # Shared types
│
├── docker-compose.yml
└── README.md
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Redis (optional — app works without it, queue falls back to direct processing)
- OpenAI API key (optional — mock generator used if not provided)

---

### Option 1: Local Development (Recommended)

#### 1. Clone & install

```bash
git clone <your-repo-url>
cd VedaAI

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

#### 2. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-...          # Your OpenAI key (or leave as-is for mock mode)
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

#### 3. Start MongoDB

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or with Docker
docker run -d -p 27017:27017 --name mongo mongo:7
```

#### 4. Start Redis (optional)

```bash
# macOS with Homebrew
brew services start redis

# Or with Docker
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

#### 5. Run the backend

```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
# WebSocket at ws://localhost:5000/ws
```

#### 6. Run the frontend

```bash
cd frontend
npm run dev
# App starts at http://localhost:3000
```

---

### Option 2: Docker Compose (Full Stack)

```bash
# Set your OpenAI key
export OPENAI_API_KEY=sk-...

# Start everything
docker-compose up --build

# App: http://localhost:3000
# API: http://localhost:5000
```

---

### Option 3: Without OpenAI Key (Mock Mode)

The app works fully without an OpenAI API key. When no valid key is detected, it uses a structured mock generator that produces realistic question papers with proper sections, difficulty levels, and marks distribution. Just leave `OPENAI_API_KEY=your_openai_api_key_here` in `.env`.

---

## API Reference

| Method | Endpoint                          | Description                    |
|--------|-----------------------------------|--------------------------------|
| POST   | `/api/assignments`                | Create assignment + start job  |
| GET    | `/api/assignments`                | List all assignments (paginated)|
| GET    | `/api/assignments/:jobId/status`  | Get job status + result        |
| POST   | `/api/assignments/:jobId/regenerate` | Regenerate from same inputs |
| GET    | `/health`                         | Health check                   |

### WebSocket Events

Connect: `ws://localhost:5000/ws?clientId=<your-client-id>`

| Event           | Direction      | Payload                                      |
|-----------------|----------------|----------------------------------------------|
| `connected`     | Server → Client | `{ type, clientId }`                        |
| `job_status`    | Server → Client | `{ type, jobId, status, progress, message }` |
| `job_progress`  | Server → Client | `{ type, jobId, progress, message }`         |
| `job_completed` | Server → Client | `{ type, jobId, status, data: GeneratedPaper }` |
| `job_failed`    | Server → Client | `{ type, jobId, error }`                    |
| `ping`          | Client → Server | `{ type: 'ping' }`                          |

---

## Approach

### AI Prompt Design

Rather than asking the LLM for free-form text, the prompt enforces a strict JSON schema:
- Sections (A, B, C) with titles and instructions
- Each question has `text`, `difficulty`, `marks`, `type`, and optional `options`
- GPT-4o-mini is called with `response_format: { type: 'json_object' }` to guarantee parseable output
- The response is validated and normalized before storage — raw LLM output is never rendered directly

### Queue Architecture

```
HTTP Request → MongoDB save → BullMQ.add(job) → HTTP 201 response
                                    ↓
                              Worker.process()
                                    ↓
                           OpenAI API call
                                    ↓
                         MongoDB update (result)
                                    ↓
                        WebSocket broadcast → Frontend
```

If Redis is unavailable, the queue falls back to `setTimeout`-based direct processing so the app remains functional in minimal environments.

### State Management

Zustand store persists `currentJobId`, `jobStatus`, and `generatedPaper` to localStorage. This means if you refresh the page mid-generation, the WebSocket reconnects and continues receiving updates for the same job.

---

## Bonus Features Implemented

- ✅ PDF export (jsPDF + html2canvas, properly formatted A4)
- ✅ Regenerate action (creates new job from same inputs)
- ✅ Difficulty badges (Easy/Moderate/Hard with color coding)
- ✅ Redis caching for completed results (1 hour TTL)
- ✅ Mock generator (works without OpenAI key)
- ✅ File upload support (PDF/TXT/DOC reference material)
- ✅ Mobile responsive design
- ✅ WebSocket reconnection with exponential backoff
- ✅ Zustand state persistence across page refreshes
