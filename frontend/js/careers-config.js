/* =============================================================
   EthioMirai — Recruitment campaign settings (ADMIN-EDITABLE)
   -------------------------------------------------------------
   Edit this file to control the Ethiopia Team Member campaign.
   All date-times are Africa/Addis_Ababa (UTC+03:00, no DST) —
   keep the "+03:00" suffix so every device computes it the same.

   PUBLICATION CHECKLIST — set every `null` below before launch:
     1. openAt            — when applications open
     2. closeAt           — deadline (form auto-closes after this)
     3. details.hours     — working hours & weekly schedule
     4. details.arrangement — full-time / part-time
     5. details.contractType — employment or contract type
     6. details.probation — trial/probation arrangement (or "None")
     7. details.location  — work location & travel expectations
     8. details.startDate — expected start date
     9. salaryConfirmed   — set true once ETB figure is final
   While any of these is null the page shows "To be confirmed"
   and logs a checklist warning in the browser console.
   ============================================================= */
window.EM_CAREERS = {
  timezone: 'Africa/Addis_Ababa',

  // ISO strings with explicit +03:00 offset, e.g. '2026-10-20T09:00:00+03:00'
  openAt:  null,                       // null = open immediately
  closeAt: '2026-10-25T23:59:59+03:00', // deadline: Oct 25, 2026, end of day (Addis Ababa time)

  // Compensation
  baseSalaryETB: 10000,                // starting base salary, ETB / month
  salaryConfirmed: true,               // false = shown as "under final review"

  // Employment terms — strings shown on the page, or null = "To be confirmed".
  // Each entry: { en: '...', am: '...' }
  details: {
    hours:        { en: 'Flexible — based on assigned work', am: 'ተለዋዋጭ — በሚሰጠው ሥራ መሠረት' },
    arrangement:  { en: 'Part-time', am: 'ትርፍ ሰዓት' },
    contractType: { en: 'Contract-based', am: 'በውል ላይ የተመሠረተ' },
    probation:    { en: 'Mandatory trial period — details agreed before signing', am: 'የግዴታ የሙከራ ጊዜ — ዝርዝሩ ከውል በፊት ይወሰናል' },
    location:     { en: 'Mostly remote; on-site depending on the project', am: 'በአብዛኛው በርቀት፤ እንደ ፕሮጀክቱ ሁኔታ በቦታው' },
    startDate:    { en: 'As soon as possible', am: 'በተቻለ ፍጥነት' }
  }
};
