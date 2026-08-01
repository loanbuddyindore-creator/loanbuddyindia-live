/* ==========================================================================
   LOAN BUDDY INDIA — MAIN SCRIPT
   All form submissions POST as FormData (no-cors) to the Google Apps Script
   Web App URL below. Every existing feature (EMI Calculator, Eligibility
   Calculator, Loan Comparison, FAQ, Legal Modal, Mobile Navigation,
   Stats/Hero sliders) is preserved.
   ========================================================================== */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyk6bcave1L4cXK5YqFDuBoc8btWKpayK3RuB-BJuMzY1I9_FBTHJ41WJ5KFiBI03Vx/exec";

/* ==========================================================================
   1. GENERIC LEAD SUBMISSION HELPER
   ========================================================================== */

async function submitLead(formData) {
    try {
        await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            body: formData
        });
        return true;
    } catch (err) {
        console.error("Lead submission error:", err);
        return false;
    }
}

/* ==========================================================================
   1b. DOUBLE-SUBMIT PREVENTION
   Disables the submit button and shows a loading state while a form is
   being submitted, then restores it once the request completes.
   ========================================================================== */

function setFormLoading(form, isLoading, loadingText) {
    if (!form) return;
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;

    if (isLoading) {
        if (btn.disabled) return false; // already submitting — block duplicate
        btn.dataset.originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.classList.add("btn-loading");
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ' + (loadingText || "Submitting...");
        return true;
    }

    btn.disabled = false;
    btn.classList.remove("btn-loading");
    if (btn.dataset.originalHtml) btn.innerHTML = btn.dataset.originalHtml;
    return true;
}

/* ==========================================================================
   1c. LEAD SOURCE TRACKING
   Captures attribution + device/session context and appends it to every
   lead FormData. First-touch UTM values and the true landing page are
   captured once per browser session (sessionStorage) so multi-page
   navigation on the site doesn't overwrite the original marketing source.
   ========================================================================== */

function generateLeadId() {
    return "LBI-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(100 + Math.random() * 900);
}

function getUTMParams() {
    try {
        const stored = sessionStorage.getItem("lbi_utm");
        if (stored) return JSON.parse(stored);
    } catch (err) { /* sessionStorage unavailable — fall through */ }

    const params = new URLSearchParams(window.location.search);
    const utm = {
        utmSource: params.get("utm_source") || "Direct",
        utmMedium: params.get("utm_medium") || "None",
        utmCampaign: params.get("utm_campaign") || "None",
        utmTerm: params.get("utm_term") || "None",
        utmContent: params.get("utm_content") || "None"
    };

    try { sessionStorage.setItem("lbi_utm", JSON.stringify(utm)); } catch (err) { /* ignore */ }
    return utm;
}

function getLandingPageURL() {
    try {
        const stored = sessionStorage.getItem("lbi_landing_page");
        if (stored) return stored;
        sessionStorage.setItem("lbi_landing_page", window.location.href);
    } catch (err) { /* ignore */ }
    return window.location.href;
}

function detectDeviceType() {
    const w = window.innerWidth;
    if (w <= 767) return "Mobile";
    if (w <= 1024) return "Tablet";
    return "Desktop";
}

function detectBrowser() {
    const ua = navigator.userAgent || "";
    if (ua.includes("Edg/")) return "Edge";
    if (ua.includes("OPR/") || ua.includes("Opera")) return "Opera";
    if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "Chrome";
    if (ua.includes("Firefox/")) return "Firefox";
    if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
    return "Unknown";
}

function detectOS() {
    const ua = navigator.userAgent || "";
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iPhone") || ua.includes("iPad") || ua.includes("iOS")) return "iOS";
    if (ua.includes("Mac OS")) return "macOS";
    if (ua.includes("Linux")) return "Linux";
    return "Unknown";
}

function getTrackingMetadata(formName) {
    const utm = getUTMParams();
    const now = new Date();

    let timezone = "Unknown";
    try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown"; } catch (err) { /* ignore */ }

    return {
        leadId: generateLeadId(),
        leadSource: utm.utmSource !== "Direct" ? "Campaign" : (document.referrer ? "Referral" : "Direct"),
        pageName: document.title || "Loan Buddy India",
        formName: formName,
        submissionDate: now.toLocaleDateString("en-IN"),
        submissionTime: now.toLocaleTimeString("en-IN"),
        utmSource: utm.utmSource,
        utmMedium: utm.utmMedium,
        utmCampaign: utm.utmCampaign,
        utmTerm: utm.utmTerm,
        utmContent: utm.utmContent,
        referrerURL: document.referrer || "Direct",
        landingPageURL: getLandingPageURL(),
        deviceType: detectDeviceType(),
        browser: detectBrowser(),
        screenResolution: window.screen.width + "x" + window.screen.height,
        operatingSystem: detectOS(),
        language: navigator.language || "Unknown",
        timezone: timezone
    };
}

function appendTrackingToFormData(formData, formName) {
    const meta = getTrackingMetadata(formName);
    Object.keys(meta).forEach((key) => formData.append(key, meta[key]));
}

/* ==========================================================================
   1d. INPUT SANITIZATION
   ========================================================================== */

function sanitizeText(value) {
    return (value || "").toString().trim().replace(/[<>]/g, "");
}

function val(id) {
    const el = document.getElementById(id);
    return el ? sanitizeText(el.value) : "";
}

/* ==========================================================================
   1e. FIELD VALIDATION (phone / email / required) + AUTO-FOCUS FIRST ERROR
   ========================================================================== */

function isValidIndianPhone(phone) {
    return /^[6-9]\d{9}$/.test((phone || "").toString().trim());
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").toString().trim());
}

function markFieldInvalid(input, message) {
    if (!input) return;
    input.classList.add("field-invalid");
    input.setAttribute("aria-invalid", "true");

    let msgEl = input.parentElement ? input.parentElement.querySelector(".field-error-text") : null;
    if (!msgEl) {
        msgEl = document.createElement("span");
        msgEl.className = "field-error-text";
        msgEl.setAttribute("role", "alert");
        input.insertAdjacentElement("afterend", msgEl);
    }
    msgEl.textContent = message;
}

function clearFieldInvalid(input) {
    if (!input) return;
    input.classList.remove("field-invalid");
    input.removeAttribute("aria-invalid");
    const msgEl = input.parentElement ? input.parentElement.querySelector(".field-error-text") : null;
    if (msgEl) msgEl.remove();
}

function clearFormErrors(form) {
    if (!form) return;
    form.querySelectorAll(".field-invalid").forEach((el) => clearFieldInvalid(el));
}

/**
 * Validates a lead form's required / phone / email fields, marks invalid
 * fields with an inline message, and auto-focuses the first invalid field.
 * Returns true if the form is valid, false otherwise.
 */
function validateLeadForm(form, config) {
    if (!form) return true;
    clearFormErrors(form);

    const requiredIds = (config && config.requiredIds) || [];
    const phoneIds = (config && config.phoneIds) || [];
    const emailIds = (config && config.emailIds) || [];
    let firstInvalid = null;

    requiredIds.forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;
        if (!input.value || !input.value.toString().trim()) {
            markFieldInvalid(input, "This field is required.");
            if (!firstInvalid) firstInvalid = input;
        }
    });

    phoneIds.forEach((id) => {
        const input = document.getElementById(id);
        if (!input || !input.value.trim()) return;
        if (!isValidIndianPhone(input.value)) {
            markFieldInvalid(input, "Enter a valid 10-digit mobile number.");
            if (!firstInvalid) firstInvalid = input;
        }
    });

    emailIds.forEach((id) => {
        const input = document.getElementById(id);
        if (!input || !input.value.trim()) return;
        if (!isValidEmail(input.value)) {
            markFieldInvalid(input, "Enter a valid email address (e.g. name@example.com).");
            if (!firstInvalid) firstInvalid = input;
        }
    });

    if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
    }
    return true;
}

/* ==========================================================================
   1f. ANTI-SPAM: HONEYPOT + SUBMISSION COOLDOWN
   ========================================================================== */

function isHoneypotFilled(honeypotId) {
    const hp = document.getElementById(honeypotId);
    return !!(hp && hp.value && hp.value.trim() !== "");
}

function canSubmitForm(formKey, cooldownMs) {
    const key = "lbi_last_submit_" + formKey;
    try {
        const last = sessionStorage.getItem(key);
        const now = Date.now();
        if (last && now - parseInt(last, 10) < (cooldownMs || 4000)) {
            return false;
        }
        sessionStorage.setItem(key, now.toString());
    } catch (err) { /* sessionStorage unavailable — allow submission */ }
    return true;
}

/* Clears a field's invalid state as soon as the user starts correcting it */
function initInlineErrorClearing() {
    document.addEventListener("input", (e) => {
        if (e.target && e.target.classList && e.target.classList.contains("field-invalid")) {
            clearFieldInvalid(e.target);
        }
    });
    document.addEventListener("change", (e) => {
        if (e.target && e.target.classList && e.target.classList.contains("field-invalid")) {
            clearFieldInvalid(e.target);
        }
    });
}

/* ==========================================================================
   2. FORM HANDLERS
   ========================================================================== */

/* ---- Hero Quick Quote Form ---- */
async function handleHeroSubmit(e) {
    e.preventDefault();

    if (isHoneypotFilled("heroHP")) return; // silently drop spam
    if (!validateLeadForm(e.target, { requiredIds: ["heroLoanType", "heroPhone"], phoneIds: ["heroPhone"] })) return;
    if (!canSubmitForm("hero")) { alert("You already submitted this form. Please wait a few seconds and try again."); return; }
    if (setFormLoading(e.target, true) === false) return;

    const formData = new FormData();
    formData.append("fullName", "Website Lead");
    formData.append("mobile", val("heroPhone"));
    formData.append("email", "");
    formData.append("loanType", val("heroLoanType"));
    formData.append("amount", document.getElementById("heroAmountRange").value);
    formData.append("message", "Hero Form");
    appendTrackingToFormData(formData, "Hero Quick Quote");

    const success = await submitLead(formData);
    setFormLoading(e.target, false);

    if (success) {
        alert("Thank you! Your details have been submitted. Our loan advisor will call you shortly.");
        e.target.reset();
        clearFormErrors(e.target);
        updateHeroSlider(document.getElementById("heroAmountRange").value);
    } else {
        alert("We couldn't submit your request due to a network issue. Please check your connection and try again.");
    }
}

/* ---- Apply Now Modal Form ---- */
async function handleModalSubmit(e) {
    e.preventDefault();

    if (isHoneypotFilled("modalHP")) return; // silently drop spam
    if (!validateLeadForm(e.target, { requiredIds: ["modalName", "modalPhone", "modalCity"], phoneIds: ["modalPhone"] })) return;
    if (!canSubmitForm("modal")) { alert("You already submitted this form. Please wait a few seconds and try again."); return; }
    if (setFormLoading(e.target, true) === false) return;

    const formData = new FormData();
    formData.append("fullName", val("modalName"));
    formData.append("mobile", val("modalPhone"));
    formData.append("email", "");
    formData.append("loanType", document.getElementById("modalTitle").textContent || "Quick Loan");
    formData.append("amount", "");
    formData.append("message", "City: " + val("modalCity"));
    appendTrackingToFormData(formData, "Apply Now Modal");

    const success = await submitLead(formData);
    setFormLoading(e.target, false);

    if (success) {
        alert("Application submitted successfully! Our team will get back to you with pre-approved offers shortly.");
        e.target.reset();
        clearFormErrors(e.target);
        closeModal();
    } else {
        alert("We couldn't submit your application due to a network issue. Please check your connection and try again.");
    }
}

/* ---- Instant Loan Enquiry Form ---- */
async function handleEnquirySubmit(e) {
    e.preventDefault();

    if (isHoneypotFilled("enquiryHP")) return; // silently drop spam
    if (!validateLeadForm(e.target, {
        requiredIds: ["enquiryName", "enquiryMobile", "enquiryType", "enquiryAmount", "enquiryIncome", "enquiryCity"],
        phoneIds: ["enquiryMobile"]
    })) return;
    if (!canSubmitForm("enquiry")) { alert("You already submitted this form. Please wait a few seconds and try again."); return; }
    if (setFormLoading(e.target, true) === false) return;

    const formData = new FormData();
    formData.append("fullName", val("enquiryName"));
    formData.append("mobile", val("enquiryMobile"));
    formData.append("email", "");
    formData.append("loanType", val("enquiryType"));
    formData.append("amount", document.getElementById("enquiryAmount").value);
    formData.append(
        "message",
        "Instant Loan Enquiry | Monthly Income: " + val("enquiryIncome") +
        " | City: " + val("enquiryCity")
    );
    appendTrackingToFormData(formData, "Instant Loan Enquiry");

    const success = await submitLead(formData);
    setFormLoading(e.target, false);

    if (success) {
        alert("Enquiry submitted successfully! We'll match you with the best rate within 24 hours.");
        e.target.reset();
        clearFormErrors(e.target);
    } else {
        alert("We couldn't submit your enquiry due to a network issue. Please check your connection and try again.");
    }
}

/* ---- Partner Registration Form ---- */
async function handlePartnerSubmit(e) {
    e.preventDefault();

    if (isHoneypotFilled("partnerHP")) return; // silently drop spam
    if (!validateLeadForm(e.target, {
        requiredIds: ["partnerName", "partnerMobile", "partnerEmail", "partnerProfession", "partnerExperience", "partnerCity"],
        phoneIds: ["partnerMobile"],
        emailIds: ["partnerEmail"]
    })) return;
    if (!canSubmitForm("partner")) { alert("You already submitted this form. Please wait a few seconds and try again."); return; }
    if (setFormLoading(e.target, true) === false) return;

    const formData = new FormData();
    formData.append("fullName", val("partnerName"));
    formData.append("mobile", val("partnerMobile"));
    formData.append("email", val("partnerEmail"));
    formData.append("loanType", "Partner Registration");
    formData.append("amount", "");
    formData.append(
        "message",
        "Profession: " + val("partnerProfession") +
        " | Experience: " + val("partnerExperience") +
        " | City: " + val("partnerCity") +
        " | Notes: " + val("partnerMessage")
    );
    appendTrackingToFormData(formData, "Become a Partner");

    const success = await submitLead(formData);
    setFormLoading(e.target, false);

    if (success) {
        alert("Registration successful! Our partner onboarding manager will contact you shortly.");
        e.target.reset();
        clearFormErrors(e.target);
    } else {
        alert("We couldn't submit your registration due to a network issue. Please check your connection and try again.");
    }
}

/* ---- Career Application Form ---- */
async function handleCareerSubmit(e) {
    e.preventDefault();

    if (isHoneypotFilled("careerHP")) return; // silently drop spam
    if (!validateLeadForm(e.target, {
        requiredIds: ["careerName", "careerMobile", "careerEmail", "careerPosition", "careerExperience", "careerCity"],
        phoneIds: ["careerMobile"],
        emailIds: ["careerEmail"]
    })) return;
    if (!canSubmitForm("career")) { alert("You already submitted this form. Please wait a few seconds and try again."); return; }
    if (setFormLoading(e.target, true) === false) return;

    const formData = new FormData();
    formData.append("fullName", val("careerName"));
    formData.append("mobile", val("careerMobile"));
    formData.append("email", val("careerEmail"));
    formData.append("loanType", "Career Application");
    formData.append("amount", "");

    const resumeInput = document.getElementById("careerResume");
    const resumeName = resumeInput && resumeInput.files.length ? resumeInput.files[0].name : "No file";

    formData.append(
        "message",
        "Position: " + val("careerPosition") +
        " | Experience: " + val("careerExperience") +
        " | City: " + val("careerCity") +
        " | Resume: " + resumeName
    );
    appendTrackingToFormData(formData, "Career Application");

    const success = await submitLead(formData);
    setFormLoading(e.target, false);

    if (success) {
        alert("Application submitted successfully! Our HR team will review your profile and reach out.");
        e.target.reset();
        clearFormErrors(e.target);
    } else {
        alert("We couldn't submit your application due to a network issue. Please check your connection and try again.");
    }
}

/* ---- Contact Form ---- */
async function handleContactSubmit(e) {
    e.preventDefault();

    if (isHoneypotFilled("contactHP")) return; // silently drop spam
    if (!validateLeadForm(e.target, {
        requiredIds: ["contactName", "contactMobile", "contactEmail", "contactCategory", "contactMessage"],
        phoneIds: ["contactMobile"],
        emailIds: ["contactEmail"]
    })) return;
    if (!canSubmitForm("contact")) { alert("You already submitted this form. Please wait a few seconds and try again."); return; }
    if (setFormLoading(e.target, true) === false) return;

    const formData = new FormData();
    formData.append("fullName", val("contactName"));
    formData.append("mobile", val("contactMobile"));
    formData.append("email", val("contactEmail"));
    formData.append("loanType", val("contactCategory"));
    formData.append("amount", "");
    formData.append("message", val("contactMessage"));
    appendTrackingToFormData(formData, "Contact Us");

    const success = await submitLead(formData);
    setFormLoading(e.target, false);

    if (success) {
        alert("Message sent successfully! Our team will respond to you shortly.");
        e.target.reset();
        clearFormErrors(e.target);
    } else {
        alert("We couldn't send your message due to a network issue. Please check your connection and try again.");
    }
}

/* ---- Refer & Earn Form ---- */
function generateReferralCode() {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return "LBI-" + randomDigits;
}

async function handleReferSubmit(e) {
    e.preventDefault();

    if (isHoneypotFilled("referHP")) return; // silently drop spam
    if (!validateLeadForm(e.target, {
        requiredIds: ["referCustomerName", "referCustomerMobile", "referLoanCategory", "referLoanAmount", "referCity", "referrerName", "referrerMobile"],
        phoneIds: ["referCustomerMobile", "referrerMobile"]
    })) return;
    if (!canSubmitForm("refer")) { alert("You already submitted this form. Please wait a few seconds and try again."); return; }
    if (setFormLoading(e.target, true, "Generating...") === false) return;

    const referralCode = generateReferralCode();

    const formData = new FormData();
    formData.append("fullName", val("referCustomerName"));
    formData.append("mobile", val("referCustomerMobile"));
    formData.append("email", "");
    formData.append("loanType", val("referLoanCategory"));
    formData.append("amount", document.getElementById("referLoanAmount").value);
    formData.append(
        "message",
        "Refer & Earn | Referral ID: " + referralCode +
        " | City: " + val("referCity") +
        " | Referrer: " + val("referrerName") +
        " | Referrer Mobile: " + val("referrerMobile") +
        " | Relationship: " + val("referrerRelation") +
        " | Remarks: " + val("referRemarks")
    );
    appendTrackingToFormData(formData, "Refer & Earn");

    const success = await submitLead(formData);
    setFormLoading(e.target, false);

    if (success) {
        const codeBox = document.getElementById("referCodeBox");
        const codeValue = document.getElementById("referCodeValue");
        if (codeValue) codeValue.textContent = referralCode;
        if (codeBox) codeBox.style.display = "block";
        alert("Referral submitted successfully! Your Reference ID is " + referralCode);
        e.target.reset();
        clearFormErrors(e.target);
    } else {
        alert("We couldn't submit your referral due to a network issue. Please check your connection and try again.");
    }
}

/* ---- Callback Request Form ---- */
async function handleCallbackSubmit(e) {
    e.preventDefault();

    if (isHoneypotFilled("callbackHP")) return; // silently drop spam
    if (!validateLeadForm(e.target, { requiredIds: ["callbackName", "callbackPhone"], phoneIds: ["callbackPhone"] })) return;
    if (!canSubmitForm("callback")) { alert("You already requested a callback. Please wait a few seconds and try again."); return; }
    if (setFormLoading(e.target, true) === false) return;

    const formData = new FormData();
    formData.append("fullName", val("callbackName"));
    formData.append("mobile", val("callbackPhone"));
    formData.append("email", "");
    formData.append("loanType", "Callback Request");
    formData.append("amount", "");
    formData.append("message", "Preferred Time: " + val("callbackTime"));
    appendTrackingToFormData(formData, "Callback Request");

    const success = await submitLead(formData);
    setFormLoading(e.target, false);

    if (success) {
        alert("Callback requested! Our advisor will call you within 15 minutes during business hours.");
        e.target.reset();
        clearFormErrors(e.target);
        closeCallbackModal();
    } else {
        alert("We couldn't submit your request due to a network issue. Please check your connection and try again.");
    }
}

/* ==========================================================================
   3. APPLY MODAL
   ========================================================================== */

function openModal(title) {
    const modal = document.getElementById("applyModal");
    const modalTitle = document.getElementById("modalTitle");
    if (modalTitle) modalTitle.textContent = "Apply For " + title;
    if (modal) modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    const modal = document.getElementById("applyModal");
    if (modal) modal.classList.remove("active");
    document.body.style.overflow = "";
}

/* ---- Callback Request Modal ---- */
function openCallbackModal() {
    const modal = document.getElementById("callbackModal");
    if (modal) modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeCallbackModal() {
    const modal = document.getElementById("callbackModal");
    if (modal) modal.classList.remove("active");
    document.body.style.overflow = "";
}

/* ==========================================================================
   4. CAREER SHORTCUT
   Scrolls to the careers section and pre-selects the chosen position.
   ========================================================================== */

function openCareerModal(positionTitle) {
    const careerSection = document.getElementById("careers");
    const positionSelect = document.getElementById("careerPosition");

    if (positionSelect) {
        const optionExists = Array.from(positionSelect.options).some(
            (opt) => opt.value === positionTitle
        );
        if (optionExists) positionSelect.value = positionTitle;
    }

    if (careerSection) {
        careerSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

/* ==========================================================================
   5. LEGAL POLICIES MODAL
   ========================================================================== */

const legalContent = {
    privacy: {
        title: "Privacy Policy",
        body: `
            <p>Loan Buddy India ("we", "us") respects your privacy. Any personal information such as name, mobile number, email, and financial details submitted through our forms is collected solely to process your loan enquiry, eligibility check, partner registration, or career application.</p>
            <p>We do not sell your personal data to third parties. Information may be shared with partner Banks & NBFCs strictly for the purpose of loan processing and sanction.</p>
            <p>By using this website and submitting any form, you consent to being contacted via call, SMS, WhatsApp, or email regarding your enquiry.</p>
        `
    },
    terms: {
        title: "Terms & Conditions",
        body: `
            <p>Loan Buddy India acts as a loan facilitation and financial advisory service, connecting borrowers with partner Banks and NBFCs. We do not guarantee loan approval, as final sanction is at the sole discretion of the lending institution.</p>
            <p>All EMI, eligibility, and comparison figures shown on this website are indicative estimates only and may vary based on the lender's actual terms, applicant profile, and credit assessment.</p>
            <p>Our advisory service to borrowers is offered free of any upfront consultation fee. Any processing fees are charged directly by the respective bank/NBFC as per their policy.</p>
        `
    },
    disclaimer: {
        title: "Disclaimer",
        body: `
            <p>The content on this website, including interest rates, EMI calculations, and eligibility estimates, is for general informational purposes only and does not constitute financial advice.</p>
            <p>Loan Buddy India is not a bank or NBFC and does not directly disburse loans. All loan approvals, disbursals, and final terms are subject to the respective partner Bank/NBFC's policies and credit evaluation.</p>
            <p>We strive to keep information accurate and up to date, but make no warranties about the completeness or accuracy of the content on this site.</p>
        `
    }
};

function openLegalModal(type) {
    const modal = document.getElementById("legalModal");
    const titleEl = document.getElementById("legalModalTitle");
    const contentEl = document.getElementById("legalModalContent");

    const data = legalContent[type];
    if (!data || !modal) return;

    titleEl.textContent = data.title;
    contentEl.innerHTML = data.body;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeLegalModal() {
    const modal = document.getElementById("legalModal");
    if (modal) modal.classList.remove("active");
    document.body.style.overflow = "";
}

/* ==========================================================================
   6. FAQ ACCORDION
   ========================================================================== */

function toggleFaq(headerEl) {
    const item = headerEl.parentElement;
    const wasActive = item.classList.contains("active");

    document.querySelectorAll(".accordion-item").forEach((el) => {
        el.classList.remove("active");
    });

    if (!wasActive) {
        item.classList.add("active");
    }
}

/* ==========================================================================
   6b. DOCUMENT CHECKLIST TABS
   ========================================================================== */

function switchDocumentTab(type, btnEl) {
    document.querySelectorAll(".doc-tab").forEach((tab) => tab.classList.remove("active"));
    document.querySelectorAll(".document-panel").forEach((panel) => panel.classList.remove("active"));

    if (btnEl) btnEl.classList.add("active");

    const panel = document.getElementById("doc-" + type);
    if (panel) panel.classList.add("active");
}

/* ==========================================================================
   7. MOBILE NAVIGATION
   ========================================================================== */

function initMobileNav() {
    const toggleBtn = document.getElementById("mobileToggle");
    const navLinks = document.getElementById("navLinks");

    if (!toggleBtn || !navLinks) return;

    toggleBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        const icon = toggleBtn.querySelector("i");
        if (icon) {
            icon.classList.toggle("fa-bars");
            icon.classList.toggle("fa-xmark");
        }
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            const icon = toggleBtn.querySelector("i");
            if (icon) {
                icon.classList.add("fa-bars");
                icon.classList.remove("fa-xmark");
            }
        });
    });
}

/* ==========================================================================
   8. HERO / STATS COUNTER ANIMATION
   ========================================================================== */

function animateCounters() {
    const counters = document.querySelectorAll(".counter");
    if (!counters.length) return;

    const animate = (el) => {
        const target = parseFloat(el.getAttribute("data-target")) || 0;
        const duration = 1500;
        const startTime = performance.now();
        const suffix = el.textContent.replace(/[0-9.,]/g, "").trim();

        function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const value = Math.floor(progress * target);
            el.textContent = value.toLocaleString("en-IN") + (progress < 1 ? "" : (suffix ? " " + suffix : ""));
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target.toLocaleString("en-IN") + (suffix ? " " + suffix : "");
            }
        }
        requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animate(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
}

/* ==========================================================================
   9. HERO AMOUNT SLIDER
   ========================================================================== */

function formatIndianCurrency(value) {
    const num = Number(value) || 0;
    return "₹" + num.toLocaleString("en-IN");
}

function updateHeroSlider(value) {
    const display = document.getElementById("heroAmountValue");
    if (display) display.textContent = formatIndianCurrency(value);
}

/* ==========================================================================
   10. EMI CALCULATOR
   ========================================================================== */

function calculateEMI() {
    const amount = parseFloat(document.getElementById("calcAmountInput").value) || 0;
    const rate = parseFloat(document.getElementById("calcRateInput").value) || 0;
    const years = parseFloat(document.getElementById("calcTenureInput").value) || 0;

    const monthlyRate = rate / 12 / 100;
    const months = years * 12;

    let emi = 0;
    if (monthlyRate > 0 && months > 0) {
        emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
              (Math.pow(1 + monthlyRate, months) - 1);
    } else if (months > 0) {
        emi = amount / months;
    }

    const totalPayment = emi * months;
    const totalInterest = totalPayment - amount;

    const principalPct = totalPayment > 0 ? Math.round((amount / totalPayment) * 100) : 0;
    const interestPct = 100 - principalPct;

    const emiDisplay = document.getElementById("emiDisplay");
    const principalDisplay = document.getElementById("principalDisplay");
    const interestDisplay = document.getElementById("interestDisplay");
    const totalPayableDisplay = document.getElementById("totalPayableDisplay");
    const principalRatioLabel = document.getElementById("principalRatioLabel");
    const interestRatioLabel = document.getElementById("interestRatioLabel");
    const progressPrincipalBar = document.getElementById("progressPrincipalBar");
    const progressInterestBar = document.getElementById("progressInterestBar");

    if (emiDisplay) emiDisplay.textContent = "₹" + Math.round(emi).toLocaleString("en-IN");
    if (principalDisplay) principalDisplay.textContent = "₹" + Math.round(amount).toLocaleString("en-IN");
    if (interestDisplay) interestDisplay.textContent = "₹" + Math.round(totalInterest).toLocaleString("en-IN");
    if (totalPayableDisplay) totalPayableDisplay.textContent = "₹" + Math.round(totalPayment).toLocaleString("en-IN");
    if (principalRatioLabel) principalRatioLabel.textContent = "Principal: " + principalPct + "%";
    if (interestRatioLabel) interestRatioLabel.textContent = "Interest: " + interestPct + "%";
    if (progressPrincipalBar) progressPrincipalBar.style.width = principalPct + "%";
    if (progressInterestBar) progressInterestBar.style.width = interestPct + "%";
}

function syncAmountInput(value) {
    document.getElementById("calcAmountSlider").value = value;
    calculateEMI();
}

function syncAmountSlider(value) {
    document.getElementById("calcAmountInput").value = value;
    calculateEMI();
}

function syncRateInput(value) {
    document.getElementById("calcRateSlider").value = value;
    calculateEMI();
}

function syncRateSlider(value) {
    document.getElementById("calcRateInput").value = value;
    calculateEMI();
}

function syncTenureInput(value) {
    document.getElementById("calcTenureSlider").value = value;
    calculateEMI();
}

function syncTenureSlider(value) {
    document.getElementById("calcTenureInput").value = value;
    calculateEMI();
}

/* ==========================================================================
   11. LOAN ELIGIBILITY CALCULATOR
   ========================================================================== */

function calculateEligibility(e) {
    if (e && e.preventDefault) e.preventDefault();

    const age = parseFloat(document.getElementById("elAge").value) || 0;
    const empType = document.getElementById("elEmpType").value;
    const income = parseFloat(document.getElementById("elIncome").value) || 0;
    const existingEmi = parseFloat(document.getElementById("elExistingEmi").value) || 0;
    const rate = parseFloat(document.getElementById("elRate").value) || 0;
    const tenureYears = parseFloat(document.getElementById("elTenure").value) || 0;

    // FOIR (Fixed Obligation to Income Ratio) cap by employment type
    let foirCap = 0.55;
    if (empType === "self-employed") foirCap = 0.50;
    if (empType === "professional") foirCap = 0.60;

    const maxEmiCapacity = Math.max((income * foirCap) - existingEmi, 0);

    const monthlyRate = rate / 12 / 100;
    const months = tenureYears * 12;

    let maxLoanAmount = 0;
    if (monthlyRate > 0 && months > 0 && maxEmiCapacity > 0) {
        maxLoanAmount = (maxEmiCapacity * (Math.pow(1 + monthlyRate, months) - 1)) /
                        (monthlyRate * Math.pow(1 + monthlyRate, months));
    } else if (months > 0) {
        maxLoanAmount = maxEmiCapacity * months;
    }

    // Simple approval probability score
    let score = 70;
    if (income >= 50000) score += 10;
    if (income >= 100000) score += 5;
    if (age >= 25 && age <= 50) score += 5;
    if (existingEmi / (income || 1) < 0.3) score += 5;
    if (empType === "salaried") score += 5;
    score = Math.min(score, 98);

    let scoreLabel = "Moderate";
    if (score >= 90) scoreLabel = "High";
    else if (score < 75) scoreLabel = "Fair";

    const maxLoanDisplay = document.getElementById("elMaxLoanDisplay");
    const maxEmiDisplay = document.getElementById("elMaxEmiDisplay");
    const scoreDisplay = document.getElementById("elScoreDisplay");

    if (maxLoanDisplay) maxLoanDisplay.textContent = "₹" + Math.round(maxLoanAmount).toLocaleString("en-IN");
    if (maxEmiDisplay) maxEmiDisplay.textContent = "₹" + Math.round(maxEmiCapacity).toLocaleString("en-IN") + " / mo";
    if (scoreDisplay) {
        scoreDisplay.innerHTML = '<i class="fa-solid fa-star"></i> ' + scoreLabel + " (" + score + "%)";
    }
}

/* ==========================================================================
   12. LOAN COMPARISON TOOL
   ========================================================================== */

const loanProductData = {
    personal: {
        name: "Personal Loan",
        rate: "9.99% p.a. onwards",
        maxAmount: "Up to ₹50 Lakhs",
        tenure: "1 - 8 Years",
        collateral: "Not Required",
        processingFee: "0.10% - 3.00%",
        disbursal: "12 - 48 Hours",
        idealFor: "Weddings, Travel, Medical, Debt Consolidation"
    },
    business: {
        name: "Business Loan",
        rate: "9.99% p.a. onwards",
        maxAmount: "Up to ₹1 Crore",
        tenure: "1 - 5 Years",
        collateral: "Not Required (Unsecured)",
        processingFee: "0.10% - 3.00%",
        disbursal: "48 - 72 Hours",
        idealFor: "MSMEs, Retailers, Traders, Manufacturers"
    },
    home: {
        name: "Home Loan",
        rate: "Starting from 7.10% p.a.",
        maxAmount: "Up to ₹5 Crores",
        tenure: "5 - 30 Years",
        collateral: "Property Mortgage",
        processingFee: "0.10% - 1.00%",
        disbursal: "5 - 7 Working Days",
        idealFor: "Home Purchase, Construction, Renovation"
    },
    lap: {
        name: "Loan Against Property",
        rate: "Starting from 8.00% p.a.",
        maxAmount: "Up to ₹10 Crores",
        tenure: "5 - 20 Years",
        collateral: "Residential / Commercial Property",
        processingFee: "0.10% - 1.50%",
        disbursal: "5 - 7 Working Days",
        idealFor: "Business Expansion, Higher Education, Large Expenses"
    },
    balance_transfer: {
        name: "Balance Transfer / Top-Up",
        rate: "Save up to 2.5% on current rate",
        maxAmount: "Existing Outstanding + Top-Up",
        tenure: "Remaining / Extended Tenure",
        collateral: "Same as Original Loan",
        processingFee: "0.10% - 1.50%",
        disbursal: "3 - 7 Working Days",
        idealFor: "Reducing EMI, Cash Top-Up on Existing Loans"
    },
    working_capital: {
        name: "Working Capital & CC/OD",
        rate: "Starting from 8.00% p.a.",
        maxAmount: "Up to ₹25 Crores",
        tenure: "Annual Renewal",
        collateral: "May Vary (Secured / Unsecured)",
        processingFee: "0.10% - 1.50%",
        disbursal: "5 - 10 Working Days",
        idealFor: "Business Cash Flow, Inventory, Operations"
    },
       used_car: {
        name: "Used Car Loan",
        rate: "Starting from 9.99% p.a.",
        maxAmount: "Up to ₹25 Lakhs",
        tenure: "1 - 5 Years",
        collateral: "Vehicle Hypothecation",
        processingFee: "Upto 1.00%",
        disbursal: "24 - 48 Hours",
        idealFor: "Pre-Owned / Used Vehicle Purchase"
    }
};

function updateLoanComparison() {
    const key1 = document.getElementById("compareSelect1").value;
    const key2 = document.getElementById("compareSelect2").value;

    const product1 = loanProductData[key1];
    const product2 = loanProductData[key2];

    const header1 = document.getElementById("compHeader1");
    const header2 = document.getElementById("compHeader2");
    const tableBody = document.getElementById("compareTableBody");

    if (!product1 || !product2 || !header1 || !header2 || !tableBody) return;

    header1.textContent = product1.name;
    header2.textContent = product2.name;

    const rows = [
        { label: "Interest Rate", key: "rate" },
        { label: "Maximum Loan Amount", key: "maxAmount" },
        { label: "Tenure", key: "tenure" },
        { label: "Collateral Requirement", key: "collateral" },
        { label: "Processing Fee", key: "processingFee" },
        { label: "Disbursal Time", key: "disbursal" },
        { label: "Ideal For", key: "idealFor" }
    ];

    tableBody.innerHTML = rows
        .map(
            (row) => `
        <tr>
            <td class="feature-col">${row.label}</td>
            <td class="product-col">${product1[row.key]}</td>
            <td class="product-col">${product2[row.key]}</td>
        </tr>`
        )
        .join("");
}

function setComparePreset(key1, key2, evt) {
    const select1 = document.getElementById("compareSelect1");
    const select2 = document.getElementById("compareSelect2");

    if (select1) select1.value = key1;
    if (select2) select2.value = key2;

    document.querySelectorAll(".preset-btn").forEach((btn) => btn.classList.remove("active"));

    const triggerEvent = evt || window.event;
    if (triggerEvent && triggerEvent.target) {
        const btn = triggerEvent.target.closest(".preset-btn");
        if (btn) btn.classList.add("active");
    }

    updateLoanComparison();
}

function swapCompareProducts() {
    const select1 = document.getElementById("compareSelect1");
    const select2 = document.getElementById("compareSelect2");

    if (!select1 || !select2) return;

    const temp = select1.value;
    select1.value = select2.value;
    select2.value = temp;

    updateLoanComparison();
}

/* ==========================================================================
   13. NAVBAR SCROLL / ACTIVE LINK STATE
   ========================================================================== */

function initNavbarScroll() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 40) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
}

function initActiveNavLink() {
    const sections = document.querySelectorAll("section[id]");
    const navAnchors = document.querySelectorAll(".nav-links a");

    if (!sections.length || !navAnchors.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute("id");
                    navAnchors.forEach((a) => {
                        a.classList.toggle("active", a.getAttribute("href") === "#" + id);
                    });
                }
            });
        },
        { rootMargin: "-40% 0px -55% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
}

/* ==========================================================================
   14. INITIALIZATION
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initMobileNav();
    initNavbarScroll();
    initActiveNavLink();
    animateCounters();
    initInlineErrorClearing();

    // Set initial hero slider value display
    const heroAmountRange = document.getElementById("heroAmountRange");
    if (heroAmountRange) updateHeroSlider(heroAmountRange.value);

    // Initial EMI calculation on load
    calculateEMI();

    // Initial eligibility calculation on load
    calculateEligibility();

    // Initial loan comparison table render
    updateLoanComparison();
});

// Close modals when clicking outside the modal box
window.addEventListener("click", (e) => {
    const applyModal = document.getElementById("applyModal");
    const legalModal = document.getElementById("legalModal");
    const callbackModal = document.getElementById("callbackModal");

    if (e.target === applyModal) closeModal();
    if (e.target === legalModal) closeLegalModal();
    if (e.target === callbackModal) closeCallbackModal();
});

// Close modals with Escape key
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeModal();
        closeLegalModal();
        closeCallbackModal();
    }
});
