'use strict';
const rateInput = document.getElementById('annual-rate');
function calculateDoubling(rate) {
  if (!Number.isFinite(rate) || rate < 1 || rate > 30) throw new RangeError('Use a rate between 1% and 30%.');
  return { rate, approximateYears: 72 / rate, exactYears: Math.log(2) / Math.log1p(rate / 100) };
}
function updateDoubling() {
  const result = calculateDoubling(Number(rateInput.value));
  const displayRate = Number.isInteger(result.rate) ? String(result.rate) : result.rate.toFixed(1);
  document.getElementById('rate-display').textContent = displayRate + '%';
  document.getElementById('formula-rate').textContent = displayRate;
  document.getElementById('doubling-years').textContent = result.approximateYears.toFixed(1);
  document.getElementById('exact-years').textContent = result.exactYears.toFixed(2);
  rateInput.setAttribute('aria-valuetext', displayRate + ' percent annual return');
  return result;
}
rateInput.addEventListener('input', updateDoubling);
updateDoubling();
const chapterLinks = Array.from(document.querySelectorAll('.chapter-nav a'));
const chapters = Array.from(document.querySelectorAll('main > section'));
const chapterNav = document.querySelector('.chapter-nav');
let scrollFrame = 0;
function updateCurrentChapter() {
  const offset = chapterNav.getBoundingClientRect().height + 55;
  let current = chapters[0];
  for (const chapter of chapters) if (chapter.getBoundingClientRect().top <= offset) current = chapter;
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5) current = chapters[chapters.length - 1];
  for (const link of chapterLinks) {
    if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  scrollFrame = 0;
}
window.addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateCurrentChapter); }, { passive: true });
window.addEventListener('resize', updateCurrentChapter);
updateCurrentChapter();
const manager = window.MANAGER_CONTENT || {};
const cleanText = value => typeof value === 'string' ? value.trim() : '';
const name = cleanText(manager.name);
if (name) document.querySelectorAll('[data-manager-name]').forEach(el => { el.textContent = name; });
if (cleanText(manager.roleAndFund)) document.getElementById('manager-role').textContent = manager.roleAndFund;
if (cleanText(manager.inspiration)) document.querySelector('[data-inspiration-note]').textContent = manager.inspiration;
function safeHttps(value) { try { const url = new URL(cleanText(value)); return url.protocol === 'https:' ? url.href : null; } catch { return null; } }
const email = cleanText(manager.email);
const phone = cleanText(manager.phone);
const linkedIn = safeHttps(manager.linkedin);
const contactData = [
  { label: 'Email', text: email, href: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'mailto:' + encodeURIComponent(email) : null },
  { label: 'Phone', text: phone, href: /^\+?[\d\s().-]{6,}$/.test(phone) ? 'tel:' + phone.replace(/[^+\d]/g, '') : null },
  { label: 'LinkedIn', text: linkedIn ? 'View profile ↗' : '', href: linkedIn }
];
const contactRows = document.querySelectorAll('#contact-details > div');
let activeContacts = 0;
contactData.forEach((item, index) => {
  if (!item.href) return;
  const anchor = document.createElement('a'); anchor.textContent = item.text; anchor.href = item.href;
  if (item.label === 'LinkedIn') { anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; }
  contactRows[index].querySelector('dd').replaceChildren(anchor); activeContacts++;
});
if (activeContacts) document.getElementById('contact-status').textContent = 'Get in touch to arrange an introductory conversation.';
if (Array.isArray(manager.investmentCases) && manager.investmentCases.some(item => cleanText(item?.title))) {
  const cases = document.getElementById('investment-cases'); cases.replaceChildren();
  manager.investmentCases.filter(item => cleanText(item?.title)).forEach((item, index) => {
    const article = document.createElement('details'); article.className = 'case-detail';
    const summary = document.createElement('summary'); summary.textContent = String(index + 1).padStart(2, '0') + ' — ' + item.title; article.append(summary);
    if (cleanText(item.description)) { const p = document.createElement('p'); p.className = 'case-description'; p.textContent = item.description; article.append(p); }
    const dl = document.createElement('dl');
    for (const [key, label] of [['date', 'Date'], ['thesis', 'Thesis'], ['valuation', 'Valuation'], ['risks', 'Risks'], ['outcome', 'Outcome'], ['lesson', 'Lesson']]) {
      const row = document.createElement('div'); const dt = document.createElement('dt'); dt.textContent = label;
      const dd = document.createElement('dd'); dd.textContent = cleanText(item[key]) || 'To be supplied'; row.append(dt, dd); dl.append(row);
    }
    article.append(dl);
    const evidenceUrl = safeHttps(item.evidenceUrl);
    if (evidenceUrl) { const a = document.createElement('a'); a.href = evidenceUrl; a.textContent = 'View supporting record ↗'; a.className = 'source-link'; a.target = '_blank'; a.rel = 'noopener noreferrer'; article.append(a); }
    cases.append(article);
  });
  document.querySelector('#past-ideas .section-note').textContent = 'Selected manager-provided cases. Individual examples are not a complete track record or an indication of future performance.';
}
