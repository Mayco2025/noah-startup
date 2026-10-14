/* =============================================================
   CAREERS — Ethiopia Team Member recruitment page logic
   EN/AM language toggle · open/close gating (Africa/Addis_Ababa)
   · 7-step wizard · local draft save · Netlify Forms submit
   ============================================================= */
(function () {
  'use strict';

  var CFG = window.EM_CAREERS || {};
  var DRAFT_KEY = 'em-app-draft-etm';
  var SUBMITTED_KEY = 'em-app-submitted-etm';
  var LANG_KEY = 'em-careers-lang';

  /* ── Language: EN / AM (page-local, overrides site EN/JA) ── */
  function currentLang() {
    try { return localStorage.getItem(LANG_KEY) === 'am' ? 'am' : 'en'; } catch (e) { return 'en'; }
  }
  function applyCareersLang(lang) {
    var d = document.documentElement;
    d.classList.remove('lang-ja', 'lang-en', 'lang-am');
    d.classList.add(lang === 'am' ? 'lang-am' : 'lang-en');
    d.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    document.querySelectorAll('[data-careers-lang]').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.careersLang === lang);
    });
    // <option> labels: submitted value stays English
    document.querySelectorAll('option[data-en]').forEach(function (opt) {
      opt.textContent = (lang === 'am' && opt.dataset.am) ? opt.dataset.am : opt.dataset.en;
    });
    var langField = document.getElementById('f-lang');
    if (langField) langField.value = lang;
    updateProgressTitle();
    updateWordCounts();
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-careers-lang]');
    if (btn) applyCareersLang(btn.dataset.careersLang);
  });
  // main.js may have re-applied the site-wide EN/JA class — correct it now.
  applyCareersLang(currentLang());

  /* ── Campaign state from config ────────────────────────────── */
  function parseWhen(iso) {
    if (!iso) return null;
    var t = Date.parse(iso);
    return isNaN(t) ? null : t;
  }
  var openAt = parseWhen(CFG.openAt);
  var closeAt = parseWhen(CFG.closeAt);
  var now = Date.now();
  var state = 'open';
  if (openAt && now < openAt) state = 'upcoming';
  else if (closeAt && now > closeAt) state = 'closed';

  function fmtAddis(ts, lang) {
    try {
      return new Intl.DateTimeFormat(lang === 'am' ? 'am-ET' : 'en-GB', {
        dateStyle: 'long', timeStyle: 'short', timeZone: 'Africa/Addis_Ababa'
      }).format(ts);
    } catch (e) {
      return new Date(ts).toUTCString();
    }
  }

  // Badge
  var badge = document.getElementById('status-badge');
  if (badge) {
    badge.querySelectorAll('[data-state]').forEach(function (el) {
      el.hidden = el.dataset.state !== state;
    });
    badge.classList.toggle('is-closed', state === 'closed');
    badge.classList.toggle('is-upcoming', state === 'upcoming');
  }

  // Employment detail fields ({en, am} from config, else keep "To be confirmed")
  var details = CFG.details || {};
  document.querySelectorAll('[data-detail]').forEach(function (dd) {
    var key = dd.dataset.detail;
    if (key === 'deadline') {
      if (closeAt) {
        dd.innerHTML = '';
        dd.appendChild(bilingualSpan(fmtAddis(closeAt, 'en') + ' (EAT)', fmtAddis(closeAt, 'am') + ' (EAT)'));
      }
      return;
    }
    var val = details[key];
    if (val && (val.en || val.am)) {
      dd.innerHTML = '';
      dd.appendChild(bilingualSpan(val.en || val.am, val.am || val.en));
    }
  });
  function bilingualSpan(en, am) {
    var frag = document.createDocumentFragment();
    var e = document.createElement('span'); e.className = 'i-en'; e.textContent = en;
    var a = document.createElement('span'); a.className = 'i-am'; a.setAttribute('lang', 'am'); a.textContent = am;
    frag.appendChild(e); frag.appendChild(a);
    return frag;
  }

  // Salary note
  if (CFG.salaryConfirmed) {
    var note = document.querySelector('[data-salary-note]');
    if (note) note.hidden = true;
  }
  if (CFG.baseSalaryETB) {
    var sal = document.querySelector('[data-salary]');
    if (sal) sal.textContent = Number(CFG.baseSalaryETB).toLocaleString('en-US');
  }

  // Admin publication checklist (console only — never shown to applicants)
  (function checklist() {
    var missing = [];
    if (!CFG.openAt) missing.push('openAt');
    if (!CFG.closeAt) missing.push('closeAt (deadline)');
    ['hours', 'arrangement', 'contractType', 'probation', 'location', 'startDate'].forEach(function (k) {
      if (!details[k]) missing.push('details.' + k);
    });
    if (!CFG.salaryConfirmed) missing.push('salaryConfirmed');
    if (missing.length) {
      console.warn('[EthioMirai careers] PUBLICATION CHECKLIST — still to confirm in js/careers-config.js:\n  - ' + missing.join('\n  - '));
    }
  })();

  /* ── Gate the form by campaign state ───────────────────────── */
  var formWrap = document.getElementById('form-wrap');
  var closedBox = document.getElementById('form-closed');
  var upcomingBox = document.getElementById('form-upcoming');
  var successBox = document.getElementById('form-success');

  var alreadyRef = null;
  try { alreadyRef = localStorage.getItem(SUBMITTED_KEY); } catch (e) {}

  if (state === 'closed') {
    formWrap.hidden = true;
    closedBox.hidden = false;
    document.querySelectorAll('[data-applybtn]').forEach(function (b) { b.style.display = 'none'; });
  } else if (state === 'upcoming') {
    formWrap.hidden = true;
    upcomingBox.hidden = false;
  } else if (alreadyRef) {
    // Duplicate-submission guard: this device already applied.
    showSuccess(alreadyRef);
  }

  /* ── Wizard ────────────────────────────────────────────────── */
  var form = document.getElementById('application-form');
  if (!form) return;
  var steps = Array.prototype.slice.call(form.querySelectorAll('.careers-step'));
  var TOTAL = steps.length;
  var current = 1;
  var btnBack = document.getElementById('btn-back');
  var btnNext = document.getElementById('btn-next');
  var btnSubmit = document.getElementById('btn-submit');

  function stepEl(n) { return steps[n - 1]; }

  function showStep(n) {
    current = n;
    steps.forEach(function (s, i) { s.hidden = (i + 1) !== n; });
    btnBack.hidden = n === 1;
    btnNext.hidden = n === TOTAL;
    btnSubmit.hidden = n !== TOTAL;
    var fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = (n / TOTAL * 100) + '%';
    var nowEl = document.getElementById('progress-now');
    if (nowEl) nowEl.textContent = n;
    document.querySelectorAll('.progress-now-am').forEach(function (el) { el.textContent = n; });
    updateProgressTitle();
    if (n === TOTAL) buildReview();
    var wrap = document.getElementById('form-wrap');
    if (wrap && wrap.getBoundingClientRect().top < 0) wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function updateProgressTitle() {
    // Called from applyCareersLang(), which also runs before the wizard
    // variables below are initialized — bail out until they exist.
    if (!steps || !steps.length || !current) return;
    var el = document.getElementById('progress-title');
    var s = stepEl(current);
    if (el && s) el.textContent = currentLang() === 'am' ? (s.dataset.titleAm || '') : (s.dataset.titleEn || '');
  }

  function clearInvalid(field) {
    field.classList.remove('is-invalid');
    var err = field.parentElement.querySelector('.careers-field-error');
    if (err) err.remove();
  }
  function markInvalid(field) {
    field.classList.add('is-invalid');
    if (!field.parentElement.querySelector('.careers-field-error')) {
      var p = document.createElement('p');
      p.className = 'careers-field-error';
      var msgs = {
        valueMissing: { en: 'This field is required.', am: 'ይህ መስክ አስፈላጊ ነው።' },
        tooShort: { en: 'Please write a little more detail.', am: 'እባክዎ ትንሽ ተጨማሪ ዝርዝር ይጻፉ።' },
        typeMismatch: { en: 'Please check the format of this field.', am: 'እባክዎ የዚህን መስክ አጻጻፍ ያረጋግጡ።' }
      };
      var kind = field.validity.valueMissing ? 'valueMissing' : field.validity.tooShort ? 'tooShort' : 'typeMismatch';
      var lang = currentLang();
      p.textContent = msgs[kind][lang];
      field.parentElement.appendChild(p);
    }
  }

  function validateStep(n) {
    var ok = true, first = null;
    var fields = stepEl(n).querySelectorAll('input, select, textarea');
    fields.forEach(function (f) {
      clearInvalid(f);
      if (!f.willValidate || f.type === 'file') return;
      if (!f.checkValidity()) {
        ok = false;
        markInvalid(f);
        if (!first) first = f;
      }
    });
    // CV size check (max 5 MB)
    var cv = stepEl(n).querySelector('input[type="file"]');
    if (cv && cv.files && cv.files[0] && cv.files[0].size > 5 * 1024 * 1024) {
      ok = false;
      markInvalid(cv);
      var err = cv.parentElement.querySelector('.careers-field-error');
      if (err) err.textContent = currentLang() === 'am' ? 'ፋይሉ ከ5 ሜባ መብለጥ የለበትም።' : 'File must be 5 MB or smaller.';
      if (!first) first = cv;
    }
    if (first) first.focus({ preventScroll: false });
    return ok;
  }

  btnNext.addEventListener('click', function () {
    if (validateStep(current)) showStep(current + 1);
  });
  btnBack.addEventListener('click', function () { showStep(current - 1); });

  // "Apply Now" → jump to form start
  document.querySelectorAll('[data-applybtn]').forEach(function (b) {
    b.addEventListener('click', function () { if (formWrap.hidden === false) showStep(current); });
  });

  /* ── Word counter (strongest skills, recommended ≥ 50 words) ─ */
  function countWords(s) { return (s.trim().match(/\S+/g) || []).length; }
  function updateWordCounts() {
    document.querySelectorAll('.careers-wordcount').forEach(function (el) {
      var field = document.getElementById(el.dataset.countFor);
      if (!field) return;
      var n = countWords(field.value);
      el.textContent = currentLang() === 'am' ? (n + ' ቃላት') : (n + ' words');
      el.classList.toggle('is-ok', n >= 50);
    });
  }
  form.addEventListener('input', function (e) {
    if (e.target.id && document.querySelector('[data-count-for="' + e.target.id + '"]')) updateWordCounts();
  });

  /* ── Draft save (local, excludes files) ────────────────────── */
  function saveDraft() {
    try {
      var data = {};
      new FormData(form).forEach(function (v, k) {
        if (v instanceof File) return;
        if (data[k] !== undefined) { data[k] = [].concat(data[k], v); } else { data[k] = v; }
      });
      delete data['bot-field'];
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step: current, data: data }));
    } catch (e) {}
  }
  var draftTimer = null;
  form.addEventListener('input', function () {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(saveDraft, 400);
  });

  (function restoreDraft() {
    var raw = null;
    try { raw = localStorage.getItem(DRAFT_KEY); } catch (e) {}
    if (!raw) return;
    try {
      var saved = JSON.parse(raw);
      var data = saved.data || {};
      Object.keys(data).forEach(function (k) {
        var vals = [].concat(data[k]);
        var fields = form.querySelectorAll('[name="' + k + '"]');
        fields.forEach(function (f) {
          if (f.type === 'checkbox' || f.type === 'radio') {
            f.checked = vals.indexOf(f.value) !== -1;
          } else if (f.type !== 'file' && f.type !== 'hidden') {
            f.value = vals[0];
          }
        });
      });
      updateWordCounts();
    } catch (e) {}
  })();

  /* ── Review summary ────────────────────────────────────────── */
  function fieldLabel(f) {
    var group = f.closest('.form-group') || f.closest('fieldset');
    if (!group) return f.name;
    var label = group.querySelector('label[for="' + f.id + '"]') || group.querySelector('.careers-group-label') || group.querySelector('label');
    if (!label) return f.name;
    var lang = currentLang();
    var span = label.querySelector(lang === 'am' ? '.i-am' : '.i-en');
    var txt = (span ? span.textContent : label.textContent) || '';
    return txt.replace(/\s*\*\s*$/, '').replace(/\(.*?\)/g, '').trim();
  }
  function buildReview() {
    var box = document.getElementById('review-summary');
    if (!box) return;
    box.innerHTML = '';
    var lang = currentLang();
    steps.slice(0, TOTAL - 1).forEach(function (s) {
      var h = document.createElement('h4');
      h.textContent = lang === 'am' ? (s.dataset.titleAm || '') : (s.dataset.titleEn || '');
      box.appendChild(h);
      var dl = document.createElement('dl');
      var seen = {};
      s.querySelectorAll('input, select, textarea').forEach(function (f) {
        if (!f.name || f.name === 'bot-field' || seen[f.name]) return;
        var value = '';
        if (f.type === 'checkbox') {
          seen[f.name] = true;
          var checked = s.querySelectorAll('[name="' + f.name + '"]:checked');
          value = Array.prototype.map.call(checked, function (c) { return c.value; }).join(', ');
        } else if (f.type === 'file') {
          value = f.files && f.files[0] ? f.files[0].name : '';
        } else if (f.tagName === 'SELECT') {
          value = f.selectedIndex > 0 ? f.options[f.selectedIndex].textContent : '';
        } else {
          value = f.value;
        }
        if (!value) return;
        var row = document.createElement('div'); row.className = 'rv-row';
        var dt = document.createElement('dt'); dt.textContent = fieldLabel(f);
        var dd = document.createElement('dd'); dd.textContent = value;
        row.appendChild(dt); row.appendChild(dd);
        dl.appendChild(row);
      });
      box.appendChild(dl);
    });
  }

  /* ── Submit (Netlify Forms, multipart for CV upload) ───────── */
  function makeRef() {
    var t = Date.now().toString(36).toUpperCase();
    var r = Math.random().toString(36).slice(2, 6).toUpperCase();
    return 'EM-ETM-' + t + '-' + r;
  }

  function showSuccess(ref) {
    if (formWrap) formWrap.hidden = true;
    if (successBox) {
      successBox.hidden = false;
      var refEl = document.getElementById('success-ref');
      if (refEl) refEl.textContent = ref;
    }
  }

  var submitting = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (submitting) return;
    if (!validateStep(TOTAL)) return;

    // Deadline re-check at the moment of submission
    if (closeAt && Date.now() > closeAt) {
      formWrap.hidden = true;
      closedBox.hidden = false;
      return;
    }

    var ref = makeRef();
    document.getElementById('f-ref').value = ref;
    document.getElementById('f-lang').value = currentLang();

    submitting = true;
    btnSubmit.disabled = true;
    btnSubmit.style.opacity = '0.6';
    var errBox = document.getElementById('submit-error');
    errBox.hidden = true;

    // Netlify silently drops multipart submissions that carry an EMPTY file
    // part — strip fileless uploads and fall back to urlencoded when no
    // real file is attached.
    var fd = new FormData(form);
    var hasFile = false;
    var emptyKeys = [];
    fd.forEach(function (v, k) {
      if (v instanceof File) {
        if (v.size > 0 && v.name) hasFile = true;
        else emptyKeys.push(k);
      }
    });
    emptyKeys.forEach(function (k) { fd.delete(k); });
    var fetchOpts;
    if (hasFile) {
      fetchOpts = { method: 'POST', body: fd };
    } else {
      var params = new URLSearchParams();
      fd.forEach(function (v, k) { if (!(v instanceof File)) params.append(k, v); });
      fetchOpts = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      };
    }

    fetch(form.getAttribute('action') || '/', fetchOpts).then(function (res) {
      if (!res.ok) throw new Error('Submit failed: ' + res.status);
      try {
        localStorage.setItem(SUBMITTED_KEY, ref);
        localStorage.removeItem(DRAFT_KEY);
      } catch (e2) {}
      showSuccess(ref);
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }).catch(function () {
      errBox.hidden = false;
    }).finally(function () {
      submitting = false;
      btnSubmit.disabled = false;
      btnSubmit.style.opacity = '';
    });
  });

  showStep(1);
})();
