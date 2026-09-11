# Portfolio Site — Structure Overview

For the full step-by-step deployment guide in Arabic, see **دليل-النشر.md**.

## Files

```
index.html            Public portfolio site (English)
admin.html             Admin dashboard (login required)
style.css               Public site styles
admin.css                Admin dashboard styles
script.js                 Public site logic (reads content from Supabase)
admin.js                   Admin dashboard logic (auth, editing, uploads)
content.js                  Shared data-access layer (Supabase queries)
supabase-config.js            ⚠️ Add your Supabase project URL + anon key here
supabase-schema.sql             Run this once in Supabase SQL Editor to set up tables
netlify.toml                     Netlify deployment config
robots.txt                        Keeps /admin.html out of search engines
assets/                            Optional local starter images (site works fully from Supabase Storage once configured)
```

## How content flows

1. **Supabase** stores all text content (`site_content` table) and all projects (`projects` table), plus uploaded images/PDFs (Storage bucket `portfolio-assets`).
2. **index.html** (public site) fetches this data on load — no login needed, read-only.
3. **admin.html** (dashboard) requires signing in with a Supabase account, then reads/writes the same data live.
4. **Netlify** just serves the static files (HTML/CSS/JS) — it has no idea about your content; all content lives in Supabase.

This means: editing content in the dashboard never requires a new deploy. Only changing the actual code (design, layout) requires a GitHub push, which Netlify then deploys automatically.
