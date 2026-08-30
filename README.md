# BuildAI Command

Public WebMCP demo for the [BuildAI](https://github.com/amakora/buildai-backend) agent platform. A one-page dashboard that talks to the hosted BuildAI API and exposes the same actions as **WebMCP tools** for ChatGPT in the browser.

Built for the [WebMCP Challenge](https://webmcp.devpost.com/) (submission deadline: September 3, 2026).

## What we're building

**BuildAI Command** is a live operations dashboard for workspace agents:

| Panel | Purpose |
| ----- | ------- |
| **Agents** | List workspace agents, start runs |
| **Activity** | Recent runs, status, output |
| **Approvals** | Pending actions — approve or reject |
| **Memory** *(optional)* | Search workspace memory |

The UI and WebMCP tools share one API client. When ChatGPT calls a tool, the dashboard updates to match.

### Demo script

> Run the Support Agent with: *"Summarize open tickets and send email to the client."* → approval appears → approve → run completes.

This is the scripted flow for judges, video, and hackathon testing.

## Architecture

```text
Browser (this app)
  ├── React UI ──────────────┐
  └── WebMCP tools ──────────┼──► BuildAI API (Azure, private)
                             │         └── agent runtime + worker
  Supabase Auth ─────────────┘
```

- **Frontend** (this repo): Vite + React + TypeScript + Tailwind
- **WebMCP**: `@mcp-b/global`, `@mcp-b/react-webmcp`
- **Auth**: Supabase session → Bearer token on API requests
- **Backend**: Existing BuildAI API — not open-sourced; stays in the private `buildai-backend` repo

## Local setup

```bash
cd webmcp-demo
npm install
cp .env.example .env.local
# Edit .env.local with your values, then:
npm run dev
```

Open `http://localhost:5173` and sign in with a BuildAI Supabase account.

### Environment variables

| Variable | Description |
| -------- | ----------- |
| `VITE_API_BASE_URL` | BuildAI API base URL |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/publishable key |
| `VITE_WORKSPACE_LABEL` | *(optional)* Label in the connection bar |

Env files must live in `webmcp-demo/`. Vite does not read `.env` from the parent repo. Restart the dev server after changing env vars.

### API headers

All authenticated requests send:

```text
Authorization: Bearer <supabase-access-token>
x-workspace-id: <workspace-id from /api/account/me>
```

Approve/reject requires **ADMIN** or **OWNER** on the workspace.

## WebMCP tools (planned)

| Tool | Purpose |
| ---- | ------- |
| `list_agents` | List workspace agents |
| `run_agent` | Start an agent run |
| `get_run_status` | Run status and output |
| `list_pending_approvals` | Pending approval items |
| `approve_action` | Approve by ID |
| `reject_action` | Reject by ID |
| `search_memory` | Search memory hub |
| `get_workspace_summary` | Workspace counts *(optional)* |

Test in the ChatGPT desktop in-app browser or Chrome 149+ with WebMCP enabled.

## Current status

**Done (Phase 0)**

- Vite + React + TypeScript + Tailwind scaffold
- Supabase sign-in and session bootstrap
- API client with health check and agents list
- Connection bar and agents panel (dark layout)

**Next (Phase 1)**

- Run agent modal with demo prompt
- Activity panel with run polling
- Approvals panel with approve/reject

**Later**

- WebMCP tool registration
- Deploy to Vercel/Netlify
- Judge quick-start section and demo video

## Scripts

```bash
npm run dev      # local dev server
npm run build    # production build
npm run preview  # preview production build
```

## License

MIT
