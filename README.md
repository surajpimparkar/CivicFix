# CivicFix — Complete v2

A hackathon-ready PS-18 prototype for **Intelligent Citizen Grievance Triage, Deduplication and Accountability**.

## What is included

- Citizen landing page
- Email/password login + signup UI
- Demo mode that works immediately with browser localStorage
- Optional real Supabase Auth + Postgres integration
- Complaint form with photo preview
- Leaflet + OpenStreetMap map
- Browser geolocation and draggable complaint marker
- AI triage preview with explainable priority factors
- Duplicate signal / community-report concept
- Citizen complaint timeline
- Resolution confirmation / reopen flow
- Admin command center
- Status workflow: New → Verified → Assigned → In Progress → Resolved / Reopened
- Admin priority queue + hotspot map
- Supabase SQL schema + RLS starter policies
- Supabase Edge Function for Gemini structured-output triage
- Image upload path for Supabase Storage

## Important

This folder is **complete as a project scaffold**, but it cannot contain your private Supabase or Gemini credentials. The default files therefore run in Demo Mode. To make it a real multi-user website, connect Supabase using the steps below.

## 1. Test immediately

Open `index.html` in VS Code with Live Server or Open with Integrated Browser.

Create a demo account. For admin demo use:

- Email: `admin@civicfix.local`
- Password: any 6+ character password

Then test:

Home → Report Issue → choose location → Analyze → Submit → My Complaints → Admin.

## 2. Turn on real accounts + database

1. Create a Supabase project.
2. Open SQL Editor and run `supabase-schema.sql`.
3. In Authentication, enable Email/Password.
4. Create an admin user through Supabase Auth.
5. In `profiles`, change that user's `role` to `admin`.
6. Create a Storage bucket named `complaint-images` and add appropriate Storage RLS policies.
7. Copy `supabase-config.example.js` to `supabase-config.js` and fill in your project URL and publishable/anon key.
8. Refresh the site. The badge should change from `Demo mode` to `Live backend`.

Never place a Supabase secret/service-role key in `supabase-config.js`.

## 3. Turn on real AI

The Edge Function is in `edge-functions/ai-triage/index.ts`.

Install/login to the Supabase CLI, then from this project:

`supabase functions deploy ai-triage`

Set your secret:

`supabase secrets set GEMINI_API_KEY=YOUR_KEY`

The browser calls the Edge Function. The Gemini key stays server-side.

## 4. Map notes

The prototype uses Leaflet with OpenStreetMap tiles and visible attribution. Public OSM tile infrastructure is not an unlimited production API. Follow the OpenStreetMap tile usage policy or use an appropriate commercial/hosted tile provider if traffic grows.

## 5. Deploy

Because the frontend is static, it can be deployed on GitHub Pages. Supabase/Auth/Storage/Edge Functions remain separate backend services.

## 6. Hackathon demo story

Use this exact flow:

1. Citizen signs up.
2. Citizen reports “Large pothole near GHRCE gate; dangerous for students and vehicles.”
3. Pins the location and adds a photo.
4. AI returns Pothole + High priority with reasons.
5. A second citizen report becomes a duplicate/supporting signal rather than another isolated work item.
6. Admin sees the issue at the top of the queue.
7. Admin verifies it and moves it through Assigned → In Progress → Resolved.
8. Citizen confirms the repair or reopens it.

## Why this is stronger for PS-18

The differentiators are not just “AI chatbot” features. The project demonstrates:

- Duplicate clustering / community support
- Explainable priority scoring
- Human verification instead of AI declaring truth
- SLA/accountability workflow
- Evidence + exact map location
- Citizen feedback and reopen loop
- Admin priority queue and hotspot view

For the final hackathon, prefer a small number of real end-to-end features over many simulated features.
