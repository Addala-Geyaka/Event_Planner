# CelebratAI Event Planner

CelebratAI helps people plan weddings, birthdays, anniversaries, community events, and other celebrations. It uses Gemini to generate a tailored event plan, then lets signed-in users save plans, track checklist progress, edit budgets, and return to earlier events.

## What it includes

- Account registration and sign-in with per-user event history.
- AI-generated budget allocations, preparation timeline, vendor checklist, themes, activities, and practical tips.
- Editable plans with progress saved to the user's account.
- PostgreSQL persistence in deployment and SQLite for local development.
- React, TypeScript, and Vite frontend; FastAPI backend.

## Run locally

1. Install Python dependencies from `event-planner-backend/requirements.txt`.
2. Install frontend dependencies in `event-planner-frontend/` with `npm install`.
3. Create `event-planner-backend/.env` with `GEMINI_API_KEY=your_key`. `DATABASE_URL` is optional locally; without it, SQLite is used.
4. Start the backend with `python -m uvicorn main:app --reload --port 8000` from `event-planner-backend/`.
5. Start the frontend with `npm run dev` from `event-planner-frontend/`.

## Deployment configuration

The root `vercel.json` deploys the frontend and FastAPI backend as Vercel Services under one project. `/api/*` routes to FastAPI and other paths route to the Vite frontend. Configure `GEMINI_API_KEY` as a Production secret and connect a PostgreSQL integration that sets `DATABASE_URL`.

## Quality checks

- Frontend lint: run `npm run lint` from `event-planner-frontend/`.
- Frontend production build: run `npm run build` from `event-planner-frontend/`.
- Backend tests: install `event-planner-backend/requirements-dev.txt`, then run `python -m unittest discover -s tests` from `event-planner-backend/`.
