# Loan Buddy India — Production Upgrade Change Log

## Scope
Incremental upgrade on top of the previously-fixed baseline. No section was removed, no existing ID/class/event-listener was changed, and no working logic (EMI Calculator, Eligibility Checker, Loan Comparison, Google Apps Script lead submission) was altered — only extended.

---

## 1. Updated Loan Pricing (applied consistently everywhere)

| Loan Type | New Rate | Processing Fee |
|---|---|---|
| Personal Loan | 9.99% p.a. onwards | 0.10% – 3.00% |
| Business Loan | 9.99% p.a. onwards | 0.10% – 3.00% |
| Home Loan | Starting from 7.10% p.a. | 0.10% – 3.00% |
| Used Car / Vehicle Loan | Starting from 7.15% p.a. | 0.10% – 3.00% |
| Loan Against Property | Starting from 9.00% p.a. | 0.10% – 3.00% |
| Working Capital & CC/OD | Starting from 10.50% p.a. | 0.10% – 3.00% |
| Balance Transfer | Save up to 2.5% (unchanged) | 0.10% – 3.00% |

Updated in **3 places** so nothing is out of sync:
- Service card rate-tags (`#services`)
- Loan Comparison tool dropdowns and `loanProductData` object (`script.js`)
- (Previously-blank rate tags for Personal, Business, Home, LAP, Working Capital were filled in — this was a pre-existing display bug, now fixed.)

---

## 2. New Sections Added

1. **Trust Badges Strip** — slim bar under the hero stats (RBI compliant, bank-grade security, ISO data practices, confidential process, verified borrower count).
2. **Loan Process Timeline** — 4-step "How It Works" visual (Enquiry → Rate Match → Doorstep Docs → Disbursal), placed between Services and Compare.
3. **Document Checklist** — tabbed section (Salaried / Self-Employed / Business Owner) with the exact document list required for each employment type, placed between Eligibility and Partner.
4. **Refer & Earn** — premium glassmorphism section with the exact fields requested (Customer Name, Customer Mobile, Loan Category, Loan Amount, City, Referrer Name, Referrer Mobile, Relationship, Remarks), a "Generate Referral" submit button that also generates a client-side reference ID (`LBI-XXXXXX`) shown to the user after submission. Placed between Partner and Careers, and linked in the main nav + footer.
5. **Callback Request** — new floating action button (alongside Call/WhatsApp) opens a lightweight modal (Name, Mobile, Preferred Time) that submits as a lead.
6. **Data Security / Privacy Promise** — trust section near the footer (Bank-Grade Encryption, Confidential Handling, No Spam, RBI Guideline Aligned).

All new sections reuse the site's existing design tokens (`--navy-dark`, `--gold-primary`, `--royal-blue`, existing `.btn`, `.form-control`, `.section-title` classes) — no new color palette or typography was introduced.

---

## 3. Conversion / Trust / Security Improvements

- **Duplicate-submission prevention**: every form's submit button now disables itself and shows a spinner + "Submitting…" state while the request is in flight, across all 8 lead forms (Hero, Apply Modal, Contact, Partner, Career, Enquiry, Refer & Earn, Callback). Prevents double leads in your Google Sheet from double-clicks or slow connections.
- Referral submissions get a visible, shareable reference ID for the referrer.

---

## 4. SEO

- `FinancialService` **Organization schema** (JSON-LD) with address, phone, email.
- `FAQPage` **schema** (JSON-LD) mirrored from the existing FAQ accordion content.
- **Open Graph** tags (title, description, type, url, locale) and **Twitter Card** tags.
- **Canonical URL** tag (placeholder domain — update to your live domain before deploying).
- `meta robots` tag added.
- Meta description/keywords updated to reflect new rates and Refer & Earn.

> ⚠️ Action needed: replace `https://www.loanbuddyindia.com/` in the `<link rel="canonical">` and OG/Twitter `url` tags with your actual live domain before pushing to production.

---

## 5. Performance

- `<script src="script.js" defer>` — script no longer blocks HTML parsing.
- Google Maps iframe already had `loading="lazy"` — confirmed and left as-is.
- No new images were introduced (site uses icon fonts only), so no image optimization was needed.
- CSS/JS were **not minified** in this deliverable — recommend running your existing build/minify step (or a simple CSS/JS minifier) before final production deploy, since minifying is a build-time concern that shouldn't be done by hand-editing readable source.

---

## 6. Head Office

No change needed — the site already displayed a single "Corporate Office Address" (Indore) with no other branches listed.

---

## 7. What Was Deliberately NOT Changed

- No existing HTML `id` was renamed.
- No existing CSS class or design token was renamed or removed.
- No existing JavaScript function signature was changed.
- No existing form field was removed or reordered.
- The Google Apps Script Web App URL and the `FormData` + `no-cors` submission pattern are untouched.

---

## 8. Testing Notes / QA Performed

- ✅ Every `onclick` / `onchange` / `oninput` / `onsubmit` attribute in `index.html` resolves to a defined function in `script.js` (automated cross-check, zero mismatches).
- ✅ Every `document.getElementById(...)` call in `script.js` matches a real `id` in `index.html` (automated cross-check, zero mismatches).
- ✅ No duplicate function definitions in `script.js`.
- ✅ `node --check script.js` — syntax valid.
- ✅ CSS brace count balanced (330 open / 330 close).
- ✅ HTML `<section>`, `<div>`, `<form>` open/close tag counts balanced.
- ✅ Both JSON-LD schema blocks validated as parseable JSON.
- ✅ Responsive breakpoints (992px, 600px) updated to include all new grid sections (Timeline, Document Checklist, Refer & Earn, Security).

### Manual QA still recommended before go-live
- Submit each of the 8 forms against your live Apps Script URL and confirm rows land correctly in Google Sheets (the Refer & Earn and Callback forms are new payload shapes your Apps Script `doPost` will accept fine since it only reads `e.parameter` — no script-side changes required).
- Visually check the Refer & Earn glass card and Trust Badges strip on an actual mobile device (320–414px) for text wrapping.
- Confirm the new "Refer & Earn" nav link scroll position looks good given your sticky header height.
- Update the canonical/OG domain placeholder before deploying.

---

## 9. Google Apps Script — No Changes Required

The Refer & Earn and Callback Request forms reuse the **same field names** (`fullName`, `mobile`, `email`, `loanType`, `amount`, `message`) as your existing forms, so your current `doPost(e)` function will log them into the same sheet columns without any modification. The referral ID and referrer details are packed into the `message` field for readability in the sheet.

If you'd like referrals to go into a **separate sheet/tab** instead of mixed in with regular leads, that would require a small `doPost` update (routing based on `loanType === "..."` or a new hidden field) — let me know if you want that and I'll provide the exact Apps Script snippet.
