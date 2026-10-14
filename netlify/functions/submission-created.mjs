/*
 * Netlify event function: runs automatically on every Netlify Forms
 * submission ("submission-created" is a reserved function name).
 *
 * Sends the applicant a confirmation email for the Ethiopia Team Member
 * application via Resend (https://resend.com — free tier is enough for
 * a 7-day campaign).
 *
 * Setup (optional — the site works without it, applicants still see the
 * on-screen confirmation + reference number):
 *   1. Create a Resend account, verify the ethiomirai.com domain.
 *   2. In Netlify: Site settings → Environment variables, add:
 *        RESEND_API_KEY   = re_xxxxxxxx
 *        CAREERS_FROM     = EthioMirai Recruitment <recruitment@ethiomirai.com>
 * If RESEND_API_KEY is not set, this function does nothing.
 *
 * Team notifications: configure separately in the Netlify UI under
 * Forms → Form notifications (no code needed).
 */
export default async (req) => {
  const { payload } = await req.json();
  if (!payload || payload.form_name !== 'ethiopia-team-application') {
    return new Response('ignored', { status: 200 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('RESEND_API_KEY not set — skipping applicant confirmation email.');
    return new Response('skipped', { status: 200 });
  }

  const d = payload.data || {};
  const to = d.email;
  if (!to) return new Response('no email', { status: 200 });

  const name = d.fullName || 'Applicant';
  const ref = d.applicationRef || '—';
  const amharic = d.formLanguage === 'am';

  const subject = amharic
    ? `ማመልከቻዎ ደርሶናል — EthioMirai (${ref})`
    : `We received your application — EthioMirai (${ref})`;

  const bodyEn = `Dear ${name},

Thank you for your interest in joining EthioMirai.

Your application for the Ethiopia Team Member — Coordination & Operations position has been received.

Application reference: ${ref}

Our team will review your information carefully. Please note that only shortlisted candidates may be contacted regarding the next steps. We appreciate your patience.

Warm regards,
EthioMirai Recruitment Team
https://ethiomirai.com`;

  const bodyAm = `ውድ ${name}፣

ኢትዮሚራይን ለመቀላቀል ላሳዩት ፍላጎት እናመሰግናለን።

«የኢትዮጵያ ቡድን አባል — ማስተባበርና ኦፕሬሽን» ለሚለው የሥራ መደብ ያስገቡት ማመልከቻ ደርሶናል።

የማመልከቻ መለያ ቁጥር፦ ${ref}

ቡድናችን መረጃዎን በጥንቃቄ ይገመግማል። ለቀጣይ ደረጃዎች የሚገናኙት ወደ አጭር ዝርዝር የገቡ እጩዎች ብቻ መሆናቸውን እናሳውቃለን። ለትዕግስትዎ እናመሰግናለን።

ከሰላምታ ጋር፣
የኢትዮሚራይ ምልመላ ቡድን
https://ethiomirai.com`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.CAREERS_FROM || 'EthioMirai Recruitment <onboarding@resend.dev>',
      to: [to],
      subject,
      text: amharic ? `${bodyAm}\n\n----------------\n\n${bodyEn}` : bodyEn
    })
  });

  if (!res.ok) {
    console.error('Resend error:', res.status, await res.text());
  }
  return new Response('ok', { status: 200 });
};
