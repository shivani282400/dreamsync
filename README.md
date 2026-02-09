# DreamSync

DreamSync is a personal dream intelligence system designed for private reflection and long-term emotional insight. It helps users capture dreams, reflect with calm AI assistance, and build a meaningful memory of themes, emotions, and symbols over time.

DreamSync is intentionally not a social network, productivity tool, or diagnostic system.

## Why DreamSync Is Not a CRUD App
DreamSync is built around lived experience, not records.
Dreams are stored immediately and interpreted asynchronously
Reflections are written by the user, not generated content
Insights are delivered as calm narrative letters, not dashboards
The system remains usable and meaningful even when AI is unavailable
This architecture prioritizes continuity, safety, and trust over automation.

## Core Vision
- Private dream journaling, always available
- Reflective interpretation with non‑diagnostic language
- Long‑term semantic memory and trend detection
- Calm, psychology‑aware UX
- AI as augmentation, not dependency

## Architecture (High Level)
- **Frontend**: Vite + React + TypeScript + Tailwind + React Router + Zustand
- **Backend**: Fastify + Prisma + Neon PostgreSQL
- **AI**: Google Gemini (interpretation + embeddings), Pinecone (vector memory)

```mermaid
flowchart TB
  UI["React + Vite UI"] --> API["Fastify API"]
  API --> DB["Neon Postgres (Prisma)"]
  API --> AI["Gemini LLM + Embeddings"]
  API --> VDB["Pinecone Vector DB"]
  DB --> Insights["Weekly / Monthly / Yearly Insights"]
  UI --> Insights


## Key Flows
Dream Save
Dreams are persisted to PostgreSQL immediately to ensure data safety.

Interpretation
AI interpretations are generated asynchronously with safety validation and graceful fallbacks.

Reflections
User-written reflections are treated as first-class data, not metadata.

Insights
Weekly and monthly reflections are delivered as calm narrative letters, while yearly arcs are generated deterministically from accumulated data

## Privacy & Anonymity
Dreams are private by default
Community sharing is fully optional and anonymous
No likes, comments, or engagement mechanics
No diagnosis, predictions, or authoritative claims
DreamSync is designed to support self-understanding, not performance or validation.

## Deployment

DreamSync is fully deployed as a production-grade system.

Frontend

Platform: Vercel

Build: Vite production build

Environment: Configured API base URL for Railway backend

Features:

Client-side routing

Secure auth token handling

Defensive rendering for partial data

Backend

Platform: Railway

Runtime: Node.js + Fastify

Database: Neon PostgreSQL (via Prisma)

Health Check: /health

Production Concerns Handled

Cross-origin (CORS) configuration

Environment variable resolution (build-time vs runtime)

API base URL mismatches

DNS and malformed URL debugging

Preflight (OPTIONS) request handling

Graceful crashes and restart behavior

This deployment reflects real-world debugging and operational ownership, not a demo setup.

## Screenshots
- `docs/screenshots/login.png`
- `docs/screenshots/journal.png`
- `docs/screenshots/insights.png`

## Local Development
Frontend:
```bash
cd dreamsync-frontend
npm install
npm run dev
```

Backend:
```bash
cd dreamsync-backend
npm install
npm run dev
```

Ensure `.env` is configured for:
- `JWT_SECRET`
- `DATABASE_URL`
- `GEMINI_API_KEY`
- `PINECONE_API_KEY`

## Status
Post-MVP polishing in progress:

Community UX refinement

Full-screen insight reading experience

Yearly emotional arc finalization

Documentation and deployment hardening
