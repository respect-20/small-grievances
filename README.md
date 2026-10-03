# The Department of Small Grievances

A mock bureaucratic tribunal for petty everyday disputes. File a grievance about
your roommate, your coworker, or anyone else who has wronged you in a small but
undeniable way. An AI Commissioner reviews the case and issues a binding ruling,
backed by structured content in Sanity and moved through a Workflow.

Built for the DEV.to [Sanity Challenge](https://dev.to/challenges/sanity-2026-09-16),
Path Two: Vibe-Code Something Strange.

## Stack

- Next.js (App Router) + Tailwind for the frontend
- Sanity for structured content: `grievance`, `ruling`, `commissioner`, `appeal`
- `sanity-plugin-workflow` to move grievances through Filed -> Under Review ->
  Ruling Issued -> Appealed -> Closed
- Gemini (Google AI Studio, free tier) as the AI Commissioner that reads a
  grievance and writes a `ruling` document back into Sanity

## Setup (things only you can do)

1. **Create a Sanity project.** From this folder, run:
   ```bash
   npx sanity init
   ```
   This creates a project and dataset (call the dataset `production`) and prints
   your project ID.

2. **Copy the env file and fill it in:**
   ```bash
   cp .env.local.example .env.local
   ```
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET`: from step 1.
   - `SANITY_API_WRITE_TOKEN`: sanity.io/manage -> your project -> API -> Tokens ->
     Add API token, give it Editor permissions.
   - `GEMINI_API_KEY`: a free key from aistudio.google.com/apikey.

3. **Create a Commissioner.** Run the app (`npm run dev`), open `/studio`, and add
   one `Commissioner` document (name, honorific, personality). Mark it `active`.
   Without one, the Department has no one to issue rulings.

4. **Deploy.** Push to GitHub and deploy on Vercel (or similar), adding the same
   environment variables there.

## Run locally

```bash
npm install
npm run dev
```

- `/` — file a grievance, browse the docket, submit a case for judgment
- `/studio` — the embedded Sanity Studio, including the Workflow board
- `/docket/[caseNumber]` — a permalink for a single case and its ruling

## How the Workflow works

Every grievance starts in `filed`. Clicking "Submit for Judgment" calls
`/api/rule`, which:

1. Moves the grievance to `under-review` (visible on the Workflow board in the
   Studio as the agent picking up the case).
2. Sends the case details to Gemini, in character as the active Commissioner.
3. Writes the result back as a `ruling` document and links it to the grievance.
4. Moves the grievance to `ruling-issued`.

A human reviewer can still drag a case backward, forward, into `appealed`, or
into `closed` from the Workflow board in the Studio — the agent moves drafts
forward, a person approves through the same transitions.
