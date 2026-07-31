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
   2. FORM HANDLERS
   ========================================================================== */

/* ---- Hero Quick Quote Form ---- */
async function handleHeroSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullName", "Website Lead");
    formData.append("mobile", document.getElementById("heroPhone").value);
    formData.append("email", "");
    formData.append("loanType", document.getElementById("heroLoanType").value);
    formData.append("amount", document.getElementById("heroAmountRange").value);
    formData.append("message", "Hero Form");

    const success = await submitLead(formData);

    if (success) {
        alert("Lead Submitted Successfully!");
        e.target.reset();
        updateHeroSlider(document.getElementById("heroAmountRange").value);
    } else {
        alert("Submission Failed. Please try again.");
    }
}

/* ---- Apply Now Modal Form ---- */
async function handleModalSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullName", document.getElementById("modalName").value);
    formData.append("mobile", document.getElementById("modalPhone").value);
    formData.append("email", "");
    formData.append("loanType", document.getElementById("modalTitle").textContent || "Quick Loan");
    formData.append("amount", "");
    formData.append("message", "City: " + document.getElementById("modalCity").value);

    const success = await submitLead(formData);

    if (success) {
        alert("Application Submitted Successfully!");
        e.target.reset();
        closeModal();
    } else {
        alert("Submission Failed. Please try again.");
    }
}

/* ---- Instant Loan Enquiry Form ---- */
async function handleEnquirySubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullName", document.getElementById("enquiryName").value);
    formData.append("mobile", document.getElementById("enquiryMobile").value);
    formData.append("email", "");
    formData.append("loanType", document.getElementById("enquiryType").value);
    formData.append("amount", document.getElementById("enquiryAmount").value);
    formData.append(
        "message",
        "Instant Loan Enquiry | Monthly Income: " + document.getElementById("enquiryIncome").value +
        " | City: " + document.getElementById("enquiryCity").value
    );

    const success = await submitLead(formData);

    if (success) {
        alert("Enquiry Submitted Successfully!");
        e.target.reset();
    } else {
        alert("Submission Failed. Please try again.");
    }
}

/* ---- Partner Registration Form ---- */
async function handlePartnerSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullName", document.getElementById("partnerName").value);
    formData.append("mobile", document.getElementById("partnerMobile").value);
    formData.append("email", document.getElementById("partnerEmail").value);
    formData.append("loanType", "Partner Registration");
    formData.append("amount", "");
    formData.append(
        "message",
        "Profession: " + document.getElementById("partnerProfession").value +
        " | Experience: " + document.getElementById("partnerExperience").value +
        " | City: " + document.getElementById("partnerCity").value +
        " | Notes: " + document.getElementById("partnerMessage").value
    );

    const success = await submitLead(formData);

    if (success) {
        alert("Partner Registration Successful!");
        e.target.reset();
    } else {
        alert("Submission Failed. Please try again.");
    }
}

/* ---- Career Application Form ---- */
async function handleCareerSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullName", document.getElementById("careerName").value);
    formData.append("mobile", document.getElementById("careerMobile").value);
    formData.append("email", document.getElementById("careerEmail").value);
    formData.append("loanType", "Career Application");
    formData.append("amount", "");

    const resumeInput = document.getElementById("careerResume");
    const resumeName = resumeInput && resumeInput.files.length ? resumeInput.files[0].name : "No file";

    formData.append(
        "message",
        "Position: " + document.getElementById("careerPosition").value +
        " | Experience: " + document.getElementById("careerExperience").value +
        " | City: " + document.getElementById("careerCity").value +
        " | Resume: " + resumeName
    );

    const success = await submitLead(formData);

    if (success) {
        alert("Application Submitted Successfully!");
        e.target.reset();
    } else {
        alert("Submission Failed. Please try again.");
    }
}

/* ---- Contact Form ---- */
async function handleContactSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullName", document.getElementById("contactName").value);
    formData.append("mobile", document.getElementById("contactMobile").value);
    formData.append("email", document.getElementById("contactEmail").value);
    formData.append("loanType", document.getElementById("contactCategory").value);
    formData.append("amount", "");
    formData.append("message", document.getElementById("contactMessage").value);

    const success = await submitLead(formData);

    if (success) {
        alert("Message Sent Successfully!");
        e.target.reset();
    } else {
        alert("Submission Failed. Please try again.");
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
        rate: "10.5% - 18% p.a.",
        maxAmount: "Up to ₹50 Lakhs",
        tenure: "1 - 5 Years",
        collateral: "Not Required",
        processingFee: "1% - 2.5%",
        disbursal: "24 - 48 Hours",
        idealFor: "Weddings, Travel, Medical, Debt Consolidation"
    },
    business: {
        name: "Business Loan",
        rate: "12% - 20% p.a.",
        maxAmount: "Up to ₹1 Crore",
        tenure: "1 - 5 Years",
        collateral: "Not Required (Unsecured)",
        processingFee: "1% - 3%",
        disbursal: "48 - 72 Hours",
        idealFor: "MSMEs, Retailers, Traders, Manufacturers"
    },
    home: {
        name: "Home Loan",
        rate: "8.0% - 10.5% p.a.",
        maxAmount: "Up to ₹5 Crores",
        tenure: "5 - 30 Years",
        collateral: "Property Mortgage",
        processingFee: "0.5% - 1%",
        disbursal: "5 - 10 Working Days",
        idealFor: "Home Purchase, Construction, Renovation"
    },
    lap: {
        name: "Loan Against Property",
        rate: "9% - 13% p.a.",
        maxAmount: "Up to ₹10 Crores",
        tenure: "5 - 20 Years",
        collateral: "Residential / Commercial Property",
        processingFee: "0.5% - 1.5%",
        disbursal: "5 - 7 Working Days",
        idealFor: "Business Expansion, Higher Education, Large Expenses"
    },
    balance_transfer: {
        name: "Balance Transfer / Top-Up",
        rate: "Save up to 2.5% on current rate",
        maxAmount: "Existing Outstanding + Top-Up",
        tenure: "Remaining / Extended Tenure",
        collateral: "Same as Original Loan",
        processingFee: "0.5% - 1%",
        disbursal: "3 - 7 Working Days",
        idealFor: "Reducing EMI, Cash Top-Up on Existing Loans"
    },
    working_capital: {
        name: "Working Capital & CC/OD",
        rate: "11% - 16% p.a.",
        maxAmount: "Up to ₹25 Crores",
        tenure: "Annual Renewal",
        collateral: "May Vary (Secured / Unsecured)",
        processingFee: "1% - 2%",
        disbursal: "5 - 10 Working Days",
        idealFor: "Business Cash Flow, Inventory, Operations"
    },
    used_car: {
        name: "Used Car Loan",
        rate: "11% - 16% p.a.",
        maxAmount: "Up to ₹25 Lakhs",
        tenure: "1 - 5 Years",
        collateral: "Vehicle Hypothecation",
        processingFee: "1% - 2%",
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

    if (e.target === applyModal) closeModal();
    if (e.target === legalModal) closeLegalModal();
});

// Close modals with Escape key
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeModal();
        closeLegalModal();
    }
});
