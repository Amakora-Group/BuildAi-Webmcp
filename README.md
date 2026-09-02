# BuildAI Command

Public WebMCP demo for the [BuildAI](https://github.com/Amakora-Group/buildai-backend) agent platform. A one-page dashboard that talks to the hosted BuildAI API and exposes the same actions as **WebMCP tools** for ChatGPT in the browser.

Built for the [WebMCP Challenge](https://webmcp.devpost.com/) (submission deadline: September 3, 2026).

**Repo:** [github.com/Amakora-Group/BuildAi-Webmcp](https://github.com/Amakora-Group/BuildAi-Webmcp)

## What this is

**BuildAI Command** is a live operations dashboard for workspace agents:

| Panel        | Purpose                             |
| ------------ | ----------------------------------- |
| **Agents**   | List workspace agents, start runs   |
| **Activity** | Recent runs, status, output         |
| **Approvals**| Pending actions — approve or reject |

The UI and WebMCP tools share one API client. When ChatGPT calls a tool, the dashboard updates to match.

### Demo script

> Run the Support Agent with: _"Summarize open tickets and send email to the client."_ → approval appears → approve → run completes.

This is the scripted flow for judges, video, and hackathon testing.

## Architecture

```text
Browser (this app)
  ├── React UI ──────────────┐
  └── WebMCP tools ──────────┼──► BuildAI API (Azure, private)
                             │         └── agent runtime + worker
  Supabase Auth ─────────────┘
```

- **Frontend** (this repo): Vite + React + TypeScript + Tailwind + React Query
- **WebMCP**: `@mcp-b/global`, `@mcp-b/react-webmcp` (8 tools registered)
- **Auth**: Supabase session → Bearer token on API requests
- **Backend**: Existing BuildAI API — private `buildai-backend` repo

## Local setup

```bash
git clone git@github.com-amakora:Amakora-Group/BuildAi-Webmcp.git
cd BuildAi-Webmcp
npm install
cp .env.example .env.local
# Edit .env.local with your values, then:
npm run dev
```

Open `http://localhost:5173` and sign in with a BuildAI Supabase account.

### Environment variables

| Variable                 | Description                              |
| ------------------------ | ---------------------------------------- |
| `VITE_API_BASE_URL`      | BuildAI API base URL                     |
| `VITE_SUPABASE_URL`      | Supabase project URL                     |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/publishable key            |
| `VITE_WORKSPACE_LABEL`   | _(optional)_ Label in the connection bar |

`.env.local` must live in the project root. Restart the dev server after changing env vars.

### API headers

All authenticated requests send:

```text
Authorization: Bearer <supabase-access-token>
x-workspace-id: <workspace-id from /api/account/me>
```

Approve/reject requires **ADMIN** or **OWNER** on the workspace.

## WebMCP tools

Eight tools are registered in `src/webmcp/WebMCPTools.tsx`:

| Tool                     | Purpose                              |
| ------------------------ | ------------------------------------ |
| `list_agents`            | List workspace agents                |
| `run_agent`              | Start an agent run                   |
| `get_run_status`         | Run status, logs, and output         |
| `list_pending_approvals` | Pending approval items               |
| `approve_action`         | Approve by ID (admin/owner)          |
| `reject_action`          | Reject by ID (admin/owner)           |
| `search_memory`          | Search workspace memory hub          |
| `get_workspace_summary`  | Agent, run, approval, and memory counts |

The connection bar shows WebMCP status and tool count when `document.modelContext` is available.

Test in the ChatGPT desktop in-app browser or Chrome 149+ with WebMCP enabled.

## Current status

**Done**

- Vite + React + TypeScript + Tailwind scaffold
- Supabase sign-in and session bootstrap
- Three-column dashboard (agents, activity, approvals) with mobile nav
- Run agent modal with demo prompt
- React Query data layer with live run polling
- Approve/reject flow for pending actions
- Light/dark theme toggle
- WebMCP tool registration (8 tools)

**Next**

- Deploy to Vercel/Netlify
- Judge quick-start section and demo video
- End-to-end WebMCP testing in ChatGPT browser

## Scripts

```bash
npm run dev      # local dev server
npm run build    # production build
npm run preview  # preview production build
npm run lint     # ESLint
```

## License

MIT
