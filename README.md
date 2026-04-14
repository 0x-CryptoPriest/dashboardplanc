# dashboardplanc Frontend

Trading dashboard frontend for PlanC backend.

## Requirements

- Node.js `18+` (recommended `20+`)
- npm `9+`

## Setup

```bash
cd /Users/luoxiaohei/github_projects/dashboardplanc
npm install
cp .env.example .env
```

## Environment Variables

- `VITE_API_BASE_URL`: backend base URL (default `http://127.0.0.1:8000`)
- `VITE_WS_URL`: backend websocket URL (default `ws://127.0.0.1:8000/v1/ws`)
- `VITE_DASHBOARD_SESSION_ID`: session id used for dashboard bootstrap

Never commit `.env` or real exchange credentials.

## Run

```bash
cd /Users/luoxiaohei/github_projects/dashboardplanc
npm run dev
```

App URL: `http://127.0.0.1:5173`

## Login

When backend auth is enabled, sign in via `/login`:
- Default username: `admin`
- Default password: `admin123`

These values come from backend env:
- `PLANC_AUTH_ADMIN_USERNAME`
- `PLANC_AUTH_ADMIN_PASSWORD`

## Docker

Frontend can be started via Dockerfile, or through backend compose:

```bash
cd /Users/luoxiaohei/github_projects/dashboardplanc
docker build -t dashboardplanc:dev .
docker run --rm -p 3000:3000 dashboardplanc:dev
```

## Quality Checks

```bash
cd /Users/luoxiaohei/github_projects/dashboardplanc
npm run lint
npm run test
npm run build
```
