# EthioMirai — Project Context

## What this is
EthioMirai (エチオ未来, "Mirai" = Future) is a Japan–Ethiopia **bridge organization**. Mission: **"Connecting Japan and Ethiopia through Education, Cultural Exchange, and Business Partnerships."** Slogan: "Bridging Nations. Creating Futures."

**Core identity rule:** EthioMirai is a bridge organization FIRST — not a travel agency, not a language school, not a consulting company alone. Everything sits under three pillars.

## Core Pillars (exactly 3)
1. **Education & Opportunity** — student support, study-in-Japan guidance, language support, educational partnerships, career guidance. Includes Maya Nihongo.
2. **Cultural Exchange & Travel Support** — exchange programs, events/seminars, delegation visits, travel support, local guidance, media & storytelling. NEVER position as travel agency / tour operator / package tours.
3. **Business & Partnership Support** — business matching, partnership development, market research support, translation/interpretation, meeting coordination, delegation support, project facilitation.

## Maya Nihongo
Sub-brand name is **"Maya Nihongo"** (do NOT rename). Position as: "Maya Nihongo – EthioMirai's Japanese Language & Student Support Program" under the Education pillar. Page: `frontend/maya-nihongo.html` (old `ethiomirai-nihongo.html` is a redirect stub).

## Leadership (always show BOTH — never single-founder)
- **Noah Eskindir** — Founder & Japan Director. Ethiopian, based in Japan. JLPT N2; Waseda Bunri College grad (Embedded Software Engineering); Software Engineer at Castalia Co., Ltd.; project experience with JICA, AOTS, UNESCO/IICBA; founder of Maya Nihongo. Leads: Education & Opportunity, strategic partnerships, tech/ops, Japan side.
- **Tegegn Begashaw Abate** — Co-Founder & Ethiopia Relations Director. BA Tourism Management; tour planning, events, cross-cultural communication, business development. Leads: Cultural Exchange & Travel Support, Ethiopia-side partnerships, community relations, delegation/visitor support.

## Differentiators
Leadership on both sides; real experience living/working in both cultures; trilingual (Japanese, Amharic, English); personal networks in both countries.

## Content Rules
- Homepage must communicate "a Japan–Ethiopia bridge organization" + the 3 pillars within 10 seconds. Avoid clutter / long service lists on homepage.
- Do NOT mention YouTube or TikTok (for now). Socials: LinkedIn, Instagram only.
- Do NOT focus on coffee or machinery trade — `consulting.html` and `trade.html` are now redirect stubs to `services.html#business`; don't resurrect them.
- Tone: professional, trustworthy, modern, international, human-centered. Prefer real photos over generic icons/illustrations.

## Stack
Static site: plain HTML/CSS/JS in `frontend/` (no build step). Serve with `python3 -m http.server 8090` from `frontend/`. Brand palette in `css/style.css` (BRAND REFRESH block): green #1B7A3D, blue #1B3C8C, red #CE2B37, gold #F2A900.

## i18n (EN/JA) — REQUIRED on every page
Site is fully bilingual via sibling elements: `.i-en` (English) and `.i-ja` (Japanese, add `lang="ja"`). `<html>` carries `.lang-en`/`.lang-ja`; an inline `<head>` script reads localStorage `em-lang` (prevents FOUC); toggle pill (`.lang-switch`/`.lang-btn`) lives in desktop nav + mobile nav; logic in `js/main.js` (`applyLang`). Form placeholders use `data-ph-en`/`data-ph-ja`; `<option>` labels use `data-en`/`data-ja`; page `<title>` uses `data-title-en`/`data-title-ja` on `<body>`. CSS hides the inactive language (I18N block in style.css). Any new content MUST ship with both languages. Japanese fonts: Noto Sans JP / Noto Serif JP (in each page's Google Fonts link).

## Pages & assets
Pages: index, about, services (3 pillars), projects, maya-nihongo, news, events, media, contact. `news.html` holds dated announcements (bilingual cards, `.news-card`); homepage has a 3-card News section. Stock photos are hotlinked from images.unsplash.com inside `.photo-frame` (hover zoom, `onerror` hides broken imgs, "Photo: Unsplash" credit) — replace with real photos over time. Leadership headshots, Maya Nihongo gallery, and student stories intentionally remain placeholders (need real people/photos).

## Current Stage
Building — website content/design iteration. Site restructured to 3-pillar messaging (June 2026).

## Long-Term Goal
Become the leading Japan–Ethiopia bridge organization (5–10 year horizon: each pillar can grow into its own section/sub-site).
