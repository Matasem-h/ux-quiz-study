# UX Quiz study

This is a browser-based study comparing an **enhanced UI** against a **minimal UI** in an educational nature-and-animals quiz, built for a B.Sc. Software Development thesis at IU International University of Applied Sciences.

Participants are randomly assigned to one of two groups that see the **same content** but a different visual design, so any difference in usability, learning, or engagement can be attributed to the design rather than the material.

## How it works

The study runs as a single page with four phases:

  1. **Consent** — GDPR information and agreement.
  2. **Age screening** — only the 18–30 band proceeds (age is asked as a band, not an exact age).
  3. **Prior-knowledge screening** — all 30 questions shown; participants tick the ones they already know. Knowing 11+ excludes them (too little new material to learn). Eligible participants are then assigned a group and given 20 questions drawn from the ones they did *not* already know.
  4. **Learning phase** — a timed (3 minute) interactive review of those 20 questions (answer, check, see explanation).
  5. **Quiz phase** — the same 20 questions, one at a time, no feedback, with response time recorded per question.

**Group A (enhanced)** uses a polished modern UI (color, cards, images, animation).
**Group B (minimal)** is deliberately bare (plain text, default controls, no images).
Consent and screening look identical for both groups; only the learning and quiz phases differ.

## Project structure
  | File | Purpose |
  |---|---|
  | `index.html` | Entry point; loads everything in order. |
  | `config.js` | Supabase project URL and publishable key. |
  | `questions.js` | The 30-question bank (text, options, answer, explanation, image). |
  | `db.js` | Data layer — all Supabase reads/writes. |
  | `study.js` | Flow controller — renders each phase, handles logic and data. |
  | `style.css` | Three visual layers: neutral base, Group A skin, Group B skin. |
  | `images/` | Group-A-only images (see `IMAGE-SOURCES.md`). |
  | `IMAGE-SOURCES.md` | Source and licence record for every image. |

## Running locally
  Open `index.html` directly in a browser — no server needed (scripts use plain globals).
  A network connection is required for the Supabase client (loaded from a CDN) and for saving responses.

## Data & privacy
  Responses are **anonymous** — no name, email, or identifying information is collected, only an age band, answers, response times, and basic browser/device type.
  Data is stored in Supabase (Postgres) across two tables, `participants` and `answers`, protected by Row Level Security.
  The publishable key in `config.js` is safe to expose (it is a front-end anon key limited by RLS policies).

## Notes
  - Group assignment alternates strictly (A, B, A, B…) via a Supabase RPC, assigned only *after* a participant passes screening, so the groups stay balanced.
  - Drop-outs are recorded (each answer is written as it happens), because abandonment is itself part of the engagement measure.
  - Built as a Bachelor thesis project; not intended for reuse without permission.


