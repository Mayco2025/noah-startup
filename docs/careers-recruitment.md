# Ethiopia Team Member Recruitment — Admin Guide

Temporary 7-day campaign. Page: `https://ethiomirai.com/careers/ethiopia-team-member/`

## 1. Publication checklist (do BEFORE announcing)

Edit `frontend/js/careers-config.js` and set every `null`:

| Setting | What to enter | Status |
|---|---|---|
| `openAt` | Opening date-time, e.g. `'2026-10-20T09:00:00+03:00'` | ☐ |
| `closeAt` | Deadline (≈7 days later), e.g. `'2026-10-27T23:59:59+03:00'` | ☐ |
| `details.hours` | Working hours & weekly schedule (`{en:'…', am:'…'}`) | ☐ |
| `details.arrangement` | Full-time / part-time | ☐ |
| `details.contractType` | Employment or contract type | ☐ |
| `details.probation` | Trial/probation arrangement (or "None") | ☐ |
| `details.location` | Work location & travel expectations | ☐ |
| `details.startDate` | Expected start date | ☐ |
| `salaryConfirmed` | `true` once ETB 10,000 (or final figure) is confirmed | ☐ |

Until these are set, the page shows "To be confirmed" chips (honest, but finish them before the deadline). The browser console prints a checklist warning listing what is still missing.

Also confirm:

- ☐ Compensation & contract reviewed for Ethiopian employment-law compliance.
- ☐ `privacy.html` covers recruitment data processing (the form links to it).
- ☐ Netlify form notifications configured (below).
- ☐ Decide on applicant confirmation email (below) — optional; on-screen confirmation always works.

All times are **Africa/Addis_Ababa (UTC+03:00)** — keep the `+03:00` suffix.

## 2. Where applications are stored (the "backend")

Submissions go to **Netlify Forms** — the same system as the contact page. Nothing is public; access requires a Netlify team login.

- **View applications**: Netlify dashboard → site → **Forms → ethiopia-team-application**. Each submission shows all answers + a link to the uploaded CV.
- **Export CSV**: Forms page → **Export to CSV** button.
- **Email notifications to the team**: Forms → **Form notifications** → add the recruitment-team email(s). Only add authorized reviewers.
- **Spam — CHECK IT DAILY during the campaign**: Netlify runs Akismet automatically + the form has a honeypot field. Testing showed Akismet can flag legitimate-looking long applications as spam (our test entries landed there). Real applicants writing short or repetitive English may be false-flagged — open Forms → ethiopia-team-application → **Spam** tab every day and click "Mark as verified" on real applications.
- **Duplicates**: the page blocks accidental re-submission from the same device and issues one reference number (`EM-ETM-…`) per application; the reference is stored with each submission in the `applicationRef` field.
- **Limits**: the free Netlify Forms tier includes **100 submissions/month and 10 MB uploads**. If the campaign attracts more, upgrade Forms Level 1 in Netlify ($19/mo, 1,000 submissions) — decide when submissions approach ~80.

The first submission (including file-upload handling) should be **tested after deploy** — submit a test application yourself, confirm it appears in the dashboard, then delete it.

## 3. Applicant confirmation email (optional)

On-screen confirmation + reference number always shows. To ALSO email applicants automatically, see the setup comment in `netlify/functions/submission-created.mjs` (Resend free tier, `RESEND_API_KEY` env var). Without the key the function silently skips — no fake emails, no errors.

## 4. Evaluation rubric (score consistently, humans decide)

Score each reviewed application 1–5 per criterion; weighted total = screening score. Scores support consistency — they must never auto-reject anyone. Template: `docs/candidate-evaluation-template.csv` (import into Google Sheets, one row per candidate).

| Criterion | Weight | Where to look |
|---|---|---|
| Communication skills | 20% | English quality of long answers; clarity of Q1/Q3 |
| Responsibility & reliability | 20% | Q3 (responsibility story); consistency of answers |
| Problem-solving & critical thinking | 20% | Q4 (five students scenario); Q5 (visa guarantee — correct answer never guarantees, explains honestly, refers to official process) |
| Learning potential & initiative | 20% | Q2 (two-year goals); "strongest skills" answer |
| Relevant knowledge & digital skills | 10% | Tools used, computer/internet access, education |
| Relevant work experience | 10% | Experience fields — remember: entry-level welcome, this is only 10% |

Recruitment statuses to track in the sheet: **New → Under Review → Shortlisted → Interview → Finalist → Selected / Rejected**. Keep interview notes in the sheet, not in personal chats.

## 5. Closing the campaign

Automatic at `closeAt`: the form disables itself, the page shows the closed message, and the homepage banner disappears. Belt-and-braces (recommended on deadline day): Netlify dashboard → Forms → ethiopia-team-application → you may also mark the form inactive after exporting, which blocks any direct POSTs.

Applications remain visible to the team in Netlify after closing — nothing is deleted by closing.

## 6. Data retention & deletion

1. Within 1 week of selection: export the final CSV + CVs of the finalists only; store in the restricted recruitment folder (01_HR).
2. Notify-complete: once the selected candidate signs, stop processing other candidates' data.
3. Within 6 months of `closeAt`: delete all submissions in Netlify (Forms → select → delete), delete downloaded CVs of non-selected candidates, and empty the form's spam folder.
4. Keep only: the selected candidate's records (HR file) and anonymized stats (number of applicants, regions) if needed.
5. If an applicant requests deletion earlier (info@ethiomirai.com), delete their submission within 30 days and confirm to them.

## 7. Removing the page after the campaign

The build is isolated — safe to remove without touching the rest of the site:

- `frontend/careers/` (whole folder)
- `frontend/css/careers.css`, `frontend/js/careers.js`, `frontend/js/careers-config.js`
- Banner block + `careers.css` link + config script in `frontend/index.html`
- `netlify/functions/submission-created.mjs` + the `[functions]` block in `netlify.toml`
- Optionally add a redirect in `netlify.toml`: `/careers/ethiopia-team-member/* → /` (301) so shared links don't 404.
