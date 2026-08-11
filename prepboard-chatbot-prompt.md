# Task: Add a natural-language chatbot to PrepBoard

## Context
PrepBoard is a React + Node/Express + MongoDB app that tracks job/internship applications (fields: `company`, `role`, `status`, `appliedOn`). I want to add a chatbot panel that lets me manage entries by typing natural language instead of using the form, e.g.:
- "I applied to Goldman Sachs for Summer Analyst" → adds a new entry
- "Move JP Morgan to interview" → updates status
- "Remove Goldman Sachs" → deletes an entry

## Architecture to follow
Chat input (React) → `POST /api/chatbot` (Express) → Claude API with tool use to parse intent → Express executes the matching MongoDB operation → JSON reply sent back to the chat UI → applications table refreshes.

## Backend requirements

1. **New route**: `POST /api/chatbot`, accepts `{ message: string }`.
2. **Call the Anthropic API** (model `claude-sonnet-4-6`) with three tools defined via `input_schema`:
   - `add_application(company, role?, status, appliedOn?)` — `status` enum: `Applied`, `Hackathon`, `Interview`, `Offer`, `Rejected`. Default `appliedOn` to today if not mentioned.
   - `update_status(company, newStatus)`
   - `remove_application(company)`
3. **Execute the tool call** against the existing `Application` Mongoose model:
   - `add_application` → `Application.create(...)`
   - `update_status` / `remove_application` → match `company` case-insensitively (`new RegExp(company, "i")`)
4. **Ambiguous or missing matches**: if a company match returns more than one document, or zero documents, do NOT guess — return a reply asking the user to clarify (e.g. "I found 2 entries for 'Goldman' — which role: Summer Analyst or SDE Intern?"), and don't mutate the database.
5. **Deletion confirmation**: `remove_application` should not delete immediately. Instead, return a reply asking for confirmation (e.g. "Remove Goldman Sachs — Summer Analyst? (yes/no)") and only execute the delete on an explicit follow-up confirmation message. Keep this state minimal — a pending-action flag returned to the frontend and echoed back on the next request is fine.
6. **No tool call returned**: if Claude responds with plain text (didn't recognize an actionable command), just return that text as the reply — don't error.
7. **Security**: the Anthropic API key must only ever be read from a server-side environment variable, never sent to or used from the React frontend.

## Frontend requirements

1. A simple chat panel (message list + text input + send button) added to the existing Application Tracker page — doesn't need to be a separate route.
2. On send: POST the message to `/api/chatbot`, append both the user's message and the bot's reply to the message list.
3. On a successful add/update/delete, re-fetch (or optimistically update) the applications list so the existing table and the Overview donut chart update without a page reload.
4. Handle the pending-confirmation flow from the backend: if the bot's reply is a delete confirmation prompt, show it like a normal message and let the next user message ("yes"/"no") resolve it.
5. Loading state while waiting on the API call, and a basic error state if the request fails.

## Out of scope for this pass
- Multi-turn context beyond the single pending-delete-confirmation case
- Editing fields other than status (e.g. renaming a role) via chat
- Any auth/permissions changes

## Deliverables
- New Express route + tool-calling logic
- New React chat component wired into the existing dashboard
- Brief note in the PR/commit description on how to set the `ANTHROPIC_API_KEY` env var
