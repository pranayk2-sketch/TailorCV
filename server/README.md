# TailorCV API Server

Descriptions + Variants backend. Runs separately from the Vite dev server and parse server.

## Setup

### Environment

Add to `.env`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
API_PORT=3002
CORS_ORIGIN=http://localhost:5173
```

- `SUPABASE_URL` — same as VITE_SUPABASE_URL
- `SUPABASE_SERVICE_ROLE_KEY` — server-side only, never expose to frontend
- `API_PORT` — default 3002 (parse-server uses 3001)
- `CORS_ORIGIN` — default localhost:5173 for Vite dev

### Run

```bash
npm run api
```

Server starts at `http://localhost:3002`.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/description/fetch | No | Fetch and cache description for one internship |
| POST | /api/description/fetch-bulk | No | Fetch descriptions for up to 20 internships |
| GET | /api/description/:internshipId | No | Get cached description |
| POST | /api/variant/map | Bearer JWT | Map internship to resume variant (creates variant if needed) |
| GET | /api/variant/:id | Bearer JWT | Get variant + linked internships |
| GET | /api/internship/:id/variant | Bearer JWT | Get variant mapped to internship (if any) |

## Safeguards

- Rate limit: 30 req/min per IP
- Fetch timeout: 10s per URL
- Bulk fetch: max 20 IDs, concurrency 2
