/* 
   Loan Buddy India - Vanilla JavaScript Engine
   Handles EMI Calculator, Eligibility Checker, Career Application, Partner Registration, Modals & Forms
*/
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyk6bcave1L4cXK5YqFDuBoc8btWKpayK3RuB-BJuMzY1I9_FBTHJ41WJ5KFiBI03Vx/exec";
document.addEventListener('DOMContentLoaded', function () {
    // Initial Calculations
    calculateEmi();
    calculateEligibility();
    updateLoanComparison();

    // Mobile Navigation Toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function () {
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.backgroundColor = '#0f2b5b';
                navLinks.style.padding = '20px';
                navLinks.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
            }
        });

        // Close mobile nav when link clicked
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 992) {
                    navLinks.style.display = 'none';
                }
            });
        });
    }
});

// Helper Function: Format Currency in INR (₹)
function formatINR(val) {
    if (isNaN(val) || !isFinite(val) || val <= 0) return '₹0';
    return '₹' + Math.round(val).toLocaleString('en-IN');
}

// Hero Slider Sync
function updateHeroSlider(val) {
    const display = document.getElementById('heroAmountValue');
    if (display) {
        if (val >= 10000000) {
            display.innerText = '₹' + (val / 10000000).toFixed(2) + ' Cr';
        } else if (val >= 100000) {
            display.innerText = '₹' + (val / 100000).toFixed(2) + ' Lakhs';
        } else {
            display.innerText = '₹' + Number(val).toLocaleString('en-IN');
        }
    }
}

// EMI Calculator Core Logic
function calculateEmi() {
    const amountSlider = document.getElementById('calcAmountSlider');
    const rateSlider = document.getElementById('calcRateSlider');
    const tenureSlider = document.getElementById('calcTenureSlider');

    if (!amountSlider || !rateSlider || !tenureSlider) return;

    const P = parseFloat(amountSlider.value) || 0;
    const annualRate = parseFloat(rateSlider.value) || 0;
    const years = parseFloat(tenureSlider.value) || 0;

    const r = annualRate / 12 / 100;
    const n = years * 12;

    if (P > 0 && r > 0 && n > 0) {
        const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalPayment = emi * n;
        const totalInterest = totalPayment - P;

        // Update DOM Displays
        const emiDisplay = document.getElementById('emiDisplay');
        const principalDisplay = document.getElementById('principalDisplay');
        const interestDisplay = document.getElementById('interestDisplay');
        const totalPayableDisplay = document.getElementById('totalPayableDisplay');

        if (emiDisplay) emiDisplay.innerText = formatINR(emi);
        if (principalDisplay) principalDisplay.innerText = formatINR(P);
        if (interestDisplay) interestDisplay.innerText = formatINR(totalInterest);
        if (totalPayableDisplay) totalPayableDisplay.innerText = formatINR(totalPayment);

        // Update Visual Progress Bar Ratios
        const principalPct = Math.round((P / totalPayment) * 100);
        const interestPct = 100 - principalPct;

        const pBar = document.getElementById('progressPrincipalBar');
        const iBar = document.getElementById('progressInterestBar');
        const pLabel = document.getElementById('principalRatioLabel');
        const iLabel = document.getElementById('interestRatioLabel');

        if (pBar) pBar.style.width = principalPct + '%';
        if (iBar) iBar.style.width = interestPct + '%';
        if (pLabel) pLabel.innerText = 'Principal: ' + principalPct + '%';
        if (iLabel) iLabel.innerText = 'Interest: ' + interestPct + '%';
    }
}

// Synchronizers for Text Input -> Slider & Slider -> Text Input
function syncAmountInput(val) {
    const slider = document.getElementById('calcAmountSlider');
    if (slider) {
        slider.value = val;
        calculateEmi();
    }
}

function syncAmountSlider(val) {
    const input = document.getElementById('calcAmountInput');
    if (input) {
        input.value = val;
        calculateEmi();
    }
}

function syncRateInput(val) {
    const slider = document.getElementById('calcRateSlider');
    if (slider) {
        slider.value = val;
        calculateEmi();
    }
}

function syncRateSlider(val) {
    const input = document.getElementById('calcRateInput');
    if (input) {
        input.value = val;
        calculateEmi();
    }
}

function syncTenureInput(val) {
    const slider = document.getElementById('calcTenureSlider');
    if (slider) {
        slider.value = val;
        calculateEmi();
    }
}

function syncTenureSlider(val) {
    const input = document.getElementById('calcTenureInput');
    if (input) {
        input.value = val;
        calculateEmi();
    }
}

// Loan Eligibility Calculator Core
function calculateEligibility(e) {
    if (e) e.preventDefault();

    const incomeEl = document.getElementById('elIncome');
    const existingEmiEl = document.getElementById('elExistingEmi');
    const rateEl = document.getElementById('elRate');
    const tenureEl = document.getElementById('elTenure');
    const empTypeEl = document.getElementById('elEmpType');

    if (!incomeEl || !rateEl || !tenureEl) return;

    const income = parseFloat(incomeEl.value) || 0;
    const existingEmi = parseFloat(existingEmiEl.value) || 0;
    const annualRate = parseFloat(rateEl.value) || 8.5;
    const years = parseFloat(tenureEl.value) || 20;
    const empType = empTypeEl ? empTypeEl.value : 'salaried';

    // FOIR (Fixed Obligation to Income Ratio) calculation factor
    let foirFactor = 0.50; // default 50%
    if (income >= 100000) foirFactor = 0.65;
    else if (income >= 50000) foirFactor = 0.55;

    if (empType === 'professional') foirFactor += 0.05;

    const maxEmiCapacity = Math.max(0, (income * foirFactor) - existingEmi);
    const r = annualRate / 12 / 100;
    const n = years * 12;

    let maxLoanAmount = 0;
    if (maxEmiCapacity > 0 && r > 0 && n > 0) {
        maxLoanAmount = (maxEmiCapacity * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
    }

    // Update Displays
    const maxLoanDisplay = document.getElementById('elMaxLoanDisplay');
    const maxEmiDisplay = document.getElementById('elMaxEmiDisplay');
    const scoreDisplay = document.getElementById('elScoreDisplay');

    if (maxLoanDisplay) maxLoanDisplay.innerText = formatINR(maxLoanAmount);
    if (maxEmiDisplay) maxEmiDisplay.innerText = formatINR(maxEmiCapacity) + ' / mo';

    if (scoreDisplay) {
        if (maxEmiCapacity > 15000) {
            scoreDisplay.innerHTML = '<i class="fa-solid fa-star text-gold"></i> High Approval (95%)';
        } else if (maxEmiCapacity > 5000) {
            scoreDisplay.innerHTML = '<i class="fa-solid fa-circle-check"></i> Medium Approval (82%)';
        } else {
            scoreDisplay.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Co-Applicant Recommended';
        }
    }
}

// FAQ Accordion Toggle
function toggleFaq(element) {
    const item = element.parentElement;
    const isAlreadyActive = item.classList.contains('active');

    // Close all FAQs
    document.querySelectorAll('.accordion-item').forEach(el => el.classList.remove('active'));

    // Toggle clicked FAQ
    if (!isAlreadyActive) {
        item.classList.add('active');
    }
}

// Apply Modal Handlers
function openModal(loanType) {
    const modal = document.getElementById('applyModal');
    const modalTitle = document.getElementById('modalTitle');

    if (modal) {
        modal.style.display = 'flex';
        if (modalTitle) {
            modalTitle.innerText = loanType ? 'Apply for ' + loanType : 'Apply For Quick Loan';
        }
    }
}

function closeModal() {
    const modal = document.getElementById('applyModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Career Modal Preset Handler
function openCareerModal(jobTitle) {
    const posSelect = document.getElementById('careerPosition');
    if (posSelect) {
        posSelect.value = jobTitle;
    }
    const section = document.getElementById('careers');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Legal Policies Modal Handler
function openLegalModal(type) {
    const modal = document.getElementById('legalModal');
    const titleEl = document.getElementById('legalModalTitle');
    const contentEl = document.getElementById('legalModalContent');

    if (!modal || !titleEl || !contentEl) return;

    if (type === 'privacy') {
        titleEl.innerText = 'Privacy Policy';
        contentEl.innerHTML = `
            <p><strong>Effective Date: 2026</strong></p>
            <p>At Loan Buddy India (Palasia, Indore), accessible from loanbuddyindia.com, your privacy is our utmost priority.</p>
            <h4>1. Information We Collect</h4>
            <p>We collect essential personal information (Name, Phone Number, Email, Net Income, City, Loan Requirements, Resume files) voluntarily submitted through our forms.</p>
            <h4>2. How We Use Your Data</h4>
            <p>Your details are strictly used to assess loan eligibility, negotiate interest rates with our 35+ partner banks/NBFCs, contact you regarding loan sanctions, or process job and partner registrations.</p>
            <h4>3. Data Security & Confidentiality</h4>
            <p>We do not sell, rent, or trade your personal information to third-party marketing companies. All client information is encrypted and handled with strict financial confidentiality.</p>
            <h4>4. Official Contact</h4>
            <p>For privacy queries, email us at <a href="mailto:sachchidanand.dwivedi@loanbuddyindia.com">sachchidanand.dwivedi@loanbuddyindia.com</a> or <a href="mailto:pankaj.jain@loanbuddyindia.com">pankaj.jain@loanbuddyindia.com</a>.</p>
        `;
    } else if (type === 'terms') {
        titleEl.innerText = 'Terms & Conditions';
        contentEl.innerHTML = `
            <p><strong>Effective Date: 2026</strong></p>
            <p>Welcome to Loan Buddy India. By using our advisory website and submitting loan enquiries, you agree to these terms:</p>
            <h4>1. Advisory & Referral Role</h4>
            <p>Loan Buddy India operates as an authorized Direct Selling Agent (DSA) and loan consultancy matching borrowers with licensed banks and NBFCs. Final loan sanctioning and interest rates remain at the sole discretion of the respective lending institution.</p>
            <h4>2. 100% Free Borrower Service</h4>
            <p>We do not charge any upfront application fees or hidden service charges from loan applicants.</p>
            <h4>3. Accuracy of Information</h4>
            <p>Users must submit accurate financial and identity details to prevent loan rejection or verification delays.</p>
            <h4>4. Contact Support</h4>
            <p>Direct inquiries to <a href="mailto:pankaj.jain@loanbuddyindia.com">pankaj.jain@loanbuddyindia.com</a> or call +91 9907704049.</p>
        `;
    } else if (type === 'disclaimer') {
        titleEl.innerText = 'Disclaimer';
        contentEl.innerHTML = `
            <p><strong>General Financial Disclaimer</strong></p>
            <p>The interest rates, EMI figures, and loan eligibility estimates displayed on Loan Buddy India are for illustrative and informational purposes calculated via mathematical financial models. Actual interest rates, loan amounts, and processing fees are determined by partner Banks & NBFCs upon credit review, CIBIL verification, and property valuation.</p>
            <p>Loan Buddy India is not a bank or non-banking financial company itself, but an authorized financial channel advisory facilitating loans in Indore and pan-India.</p>
        `;
    }

    modal.style.display = 'flex';
}

function closeLegalModal() {
    const modal = document.getElementById('legalModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Form Handlers
async function handleHeroSubmit(e) {
    e.preventDefault();

    const data = {
        fullName: "Website Lead",
        mobile: document.getElementById("heroPhone").value,
        city: "Indore",
        loanType: document.getElementById("heroLoanType").value,
        amount: document.getElementById("heroAmountRange").value
    };

    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log(result);

        alert("Lead Submitted Successfully!");
        e.target.reset();

    } catch (error) {
        console.error(error);
        alert("Submission Failed!");
    }
}
function handleEnquirySubmit(e) {
    e.preventDefault();
    const name = document.getElementById('enquiryName').value;
    const phone = document.getElementById('enquiryMobile').value;
    const loanType = document.getElementById('enquiryType').value;
    const amount = document.getElementById('enquiryAmount').value;

    alert('Instant Loan Enquiry Received!\n\nThank you ' + name + '! We have received your ' + loanType + ' request for ₹' + Number(amount).toLocaleString('en-IN') + '.\n\nOur Palasia, Indore advisor will call you on +91 ' + phone + ' within 15 minutes.');
    e.target.reset();
}

function handlePartnerSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('partnerName').value;
    const phone = document.getElementById('partnerMobile').value;
    const profession = document.getElementById('partnerProfession').value;

    alert('Partner Registration Received!\n\nWelcome ' + name + ' (' + profession + ')!\nOur Partner Desk Manager will contact you on +91 ' + phone + ' to explain commission payouts and complete your onboarding.');
    e.target.reset();
}

function handleCareerSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('careerName').value;
    const position = document.getElementById('careerPosition').value;
    const phone = document.getElementById('careerMobile').value;
    const resumeInput = document.getElementById('careerResume');

    const fileName = resumeInput && resumeInput.files[0] ? resumeInput.files[0].name : 'resume document';

    alert('Job Application Submitted Successfully!\n\nThank you ' + name + ' for applying for the ' + position + ' role.\nResume attached: ' + fileName + '\n\nOur HR team will contact you at +91 ' + phone + ' for interview scheduling.');
    e.target.reset();
}

function handleContactSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('contactName') ? document.getElementById('contactName').value : 'Valued Customer';
    alert('Thank you ' + name + '! Your message has been received. Our loan team will reach out to you within 15 minutes.');
    e.target.reset();
}

function handleModalSubmit(e) {
    e.preventDefault();
    alert('Application Submitted Successfully! Our Palasia, Indore loan officer will reach out to you shortly.');
    closeModal();
}

/* ==================== LOAN COMPARISON MATRIX DATA & LOGIC ==================== */
const LOAN_PRODUCTS_DATA = {
    personal: {
        id: 'personal',
        title: 'Personal Loan',
        icon: 'fa-user-check',
        rate: 'Starting @ 10.25% p.a.',
        maxAmount: 'Up to ₹50 Lakhs',
        maxTenure: '1 to 5 Years',
        processingFee: '1.0% to 2.0% + GST',
        collateral: 'Zero Collateral Required (100% Unsecured)',
        features: [
            '100% Collateral-Free Instant Cash Loan',
            'Flexible usage for medical, wedding, or travel',
            'Minimal documentation & fast 24h disbursal',
            'Prepayment & foreclosure options available'
        ],
        eligibility: [
            'Salaried / Self-Employed Individuals',
            'Minimum Net Monthly Salary: ₹25,000',
            'Age: 21 to 60 Years',
            'Credit Score: CIBIL 700 or higher'
        ]
    },
    business: {
        id: 'business',
        title: 'Business Loan',
        icon: 'fa-briefcase',
        rate: 'Starting @ 12.50% p.a.',
        maxAmount: 'Up to ₹1 Crore',
        maxTenure: '1 to 5 Years',
        processingFee: '1.5% to 2.5% + GST',
        collateral: 'Zero Collateral (Unsecured MSME Funding)',
        features: [
            'Unsecured Business & MSME Growth Capital',
            'Term Loan & Overdraft facilities',
            'Special interest discount on GST/ITR filings',
            'Ideal for traders, retailers, doctors & CAs'
        ],
        eligibility: [
            'Proprietorship, Partnership, Pvt Ltd, LLPs',
            'Business Vintage: Minimum 2 Years',
            'Minimum Annual Turnover: ₹20 Lakhs',
            'Active GST Registration & Bank Statement'
        ]
    },
    home: {
        id: 'home',
        title: 'Home Loan',
        icon: 'fa-house',
        rate: 'Starting @ 8.35% p.a.',
        maxAmount: 'Up to ₹10 Crores',
        maxTenure: 'Up to 30 Years',
        processingFee: '0.25% to 0.50% + GST',
        collateral: 'Residential Property Mortgage Required',
        features: [
            'Up to 90% property cost financing',
            'Longest repayment tenure up to 30 years',
            'PMAY Govt Interest Subsidy benefits',
            'Balance Transfer with extra Top-Up available'
        ],
        eligibility: [
            'Salaried employees & Self-Employed Professionals',
            'Property with clear legal & technical title',
            'Age: 21 to 65 Years at loan maturity',
            'Stable employment / business track record'
        ]
    },
    lap: {
        id: 'lap',
        title: 'Loan Against Property (LAP)',
        icon: 'fa-building-columns',
        rate: 'Starting @ 9.15% p.a.',
        maxAmount: 'Up to ₹15 Crores',
        maxTenure: 'Up to 15 Years',
        processingFee: '0.50% to 1.0% + GST',
        collateral: 'Residential, Commercial, or Industrial Property',
        features: [
            'Unlock high cash limits up to 75% LTV ratio',
            'Significantly lower interest rate than personal loan',
            'Retain complete property ownership & usage',
            'Multi-purpose funding for business or personal needs'
        ],
        eligibility: [
            'Individual or Joint Property Owners',
            'Fully constructed residential/commercial property',
            'Verifiable regular income source',
            'Clean CIBIL repayment history'
        ]
    },
    balance_transfer: {
        id: 'balance_transfer',
        title: 'Loan Balance Transfer',
        icon: 'fa-rotate',
        rate: 'Save up to 2.5% p.a.',
        maxAmount: 'Existing Loan Sanction + Top-Up',
        maxTenure: 'Up to 30 Years (Home) / 5 Years (Personal)',
        processingFee: 'Nominal / Waived under special schemes',
        collateral: 'Transfer existing mortgaged property or unsecured',
        features: [
            'Slash existing high monthly EMI dramatically',
            'Instant high-value Top-Up loan disbursal',
            'Zero prepayment penalties on floating rate loans',
            'Single-window hassle-free bank switching'
        ],
        eligibility: [
            'Existing active Home, LAP or Personal Loan',
            'Minimum 12 monthly EMIs paid without delay',
            'Satisfactory property valuation & CIBIL score'
        ]
    },
    working_capital: {
        id: 'working_capital',
        title: 'Working Capital & CC/OD',
        icon: 'fa-chart-line',
        rate: 'Starting @ 9.50% p.a.',
        maxAmount: 'Up to ₹25 Crores',
        maxTenure: '1 Year (Renewable annually)',
        processingFee: '0.50% to 1.0% + GST',
        collateral: 'Stock, Receivables or Property Collateral',
        features: [
            'Pay interest strictly on utilized limit only',
            'Cash Credit (CC) & Overdraft (OD) limits',
            'Bank Guarantees (BG) & Letter of Credit (LC)',
            'Smooth seasonal cash flow management for industries'
        ],
        eligibility: [
            'Manufacturing, Trading & Services Businesses',
            'Audited Financial Statements for last 2-3 years',
            'Active Current Bank Account with healthy turnover'
        ]
    },
    used_car: {
        id: 'used_car',
        title: 'Used Car Loan',
        icon: 'fa-car',
        rate: 'Starting @ 11.00% p.a.',
        maxAmount: 'Up to 85% Vehicle Value',
        maxTenure: 'Up to 7 Years',
        processingFee: '1.0% to 1.5% + GST',
        collateral: 'Vehicle Hypothecation (Secured)',
        features: [
            'Quick vehicle valuation & instant approval',
            'Up to 85% financing of car valuation',
            'Hassle-free RTO transfer assistance',
            'Easy monthly installments with flexible tenure'
        ],
        eligibility: [
            'Salaried / Business Owners / Professionals',
            'Minimum monthly net income ₹20,000',
            'Vehicle age under 8-10 years'
        ]
    }
};

function updateLoanComparison() {
    const sel1 = document.getElementById('compareSelect1');
    const sel2 = document.getElementById('compareSelect2');

    if (!sel1 || !sel2) return;

    const key1 = sel1.value;
    const key2 = sel2.value;

    const prod1 = LOAN_PRODUCTS_DATA[key1] || LOAN_PRODUCTS_DATA.personal;
    const prod2 = LOAN_PRODUCTS_DATA[key2] || LOAN_PRODUCTS_DATA.home;

    // Update Header 1
    const h1 = document.getElementById('compHeader1');
    if (h1) {
        h1.innerHTML = `
            <div class="comp-card-head prod-a">
                <div class="comp-icon"><i class="fa-solid ${prod1.icon}"></i></div>
                <h3>${prod1.title}</h3>
                <span class="comp-rate text-gold">${prod1.rate}</span>
                <button type="button" class="btn btn-gold btn-sm" onclick="openModal('${prod1.title}')">
                    Apply ${prod1.title.split(' ')[0]} <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;
    }

    // Update Header 2
    const h2 = document.getElementById('compHeader2');
    if (h2) {
        h2.innerHTML = `
            <div class="comp-card-head prod-b">
                <div class="comp-icon"><i class="fa-solid ${prod2.icon}"></i></div>
                <h3>${prod2.title}</h3>
                <span class="comp-rate text-royal">${prod2.rate}</span>
                <button type="button" class="btn btn-primary btn-sm" onclick="openModal('${prod2.title}')">
                    Apply ${prod2.title.split(' ')[0]} <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;
    }

    // Update Table Body
    const tbody = document.getElementById('compareTableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td class="feature-label"><i class="fa-solid fa-percent text-gold"></i> Starting Interest Rate</td>
                <td class="prod-val highlight-a">${prod1.rate}</td>
                <td class="prod-val highlight-b">${prod2.rate}</td>
            </tr>
            <tr>
                <td class="feature-label"><i class="fa-solid fa-indian-rupee-sign text-gold"></i> Maximum Loan Limit</td>
                <td class="prod-val">${prod1.maxAmount}</td>
                <td class="prod-val">${prod2.maxAmount}</td>
            </tr>
            <tr>
                <td class="feature-label"><i class="fa-solid fa-clock text-gold"></i> Maximum Repayment Tenure</td>
                <td class="prod-val">${prod1.maxTenure}</td>
                <td class="prod-val">${prod2.maxTenure}</td>
            </tr>
            <tr>
                <td class="feature-label"><i class="fa-solid fa-file-invoice text-gold"></i> Processing Fee Range</td>
                <td class="prod-val">${prod1.processingFee}</td>
                <td class="prod-val">${prod2.processingFee}</td>
            </tr>
            <tr>
                <td class="feature-label"><i class="fa-solid fa-shield-halved text-gold"></i> Collateral / Security</td>
                <td class="prod-val font-semibold">${prod1.collateral}</td>
                <td class="prod-val font-semibold">${prod2.collateral}</td>
            </tr>
            <tr>
                <td class="feature-label"><i class="fa-solid fa-list-check text-gold"></i> Key Highlights & Features</td>
                <td class="prod-val">
                    <ul class="comp-feature-list">
                        ${prod1.features.map(f => `<li><i class="fa-solid fa-check text-green"></i> ${f}</li>`).join('')}
                    </ul>
                </td>
                <td class="prod-val">
                    <ul class="comp-feature-list">
                        ${prod2.features.map(f => `<li><i class="fa-solid fa-check text-green"></i> ${f}</li>`).join('')}
                    </ul>
                </td>
            </tr>
            <tr>
                <td class="feature-label"><i class="fa-solid fa-user-gear text-gold"></i> Key Eligibility Criteria</td>
                <td class="prod-val">
                    <ul class="comp-feature-list">
                        ${prod1.eligibility.map(e => `<li><i class="fa-solid fa-circle-dot text-gold"></i> ${e}</li>`).join('')}
                    </ul>
                </td>
                <td class="prod-val">
                    <ul class="comp-feature-list">
                        ${prod2.eligibility.map(e => `<li><i class="fa-solid fa-circle-dot text-navy"></i> ${e}</li>`).join('')}
                    </ul>
                </td>
            </tr>
            <tr class="comp-cta-row">
                <td class="feature-label">Take Action</td>
                <td class="prod-val">
                    <button type="button" class="btn btn-gold btn-block" onclick="openModal('${prod1.title}')">
                        Apply For ${prod1.title}
                    </button>
                </td>
                <td class="prod-val">
                    <button type="button" class="btn btn-primary btn-block" onclick="openModal('${prod2.title}')">
                        Apply For ${prod2.title}
                    </button>
                </td>
            </tr>
        `;
    }
}

function swapCompareProducts() {
    const sel1 = document.getElementById('compareSelect1');
    const sel2 = document.getElementById('compareSelect2');
    if (sel1 && sel2) {
        const temp = sel1.value;
        sel1.value = sel2.value;
        sel2.value = temp;
        updateLoanComparison();
    }
}

function setComparePreset(p1, p2) {
    const sel1 = document.getElementById('compareSelect1');
    const sel2 = document.getElementById('compareSelect2');

    if (sel1 && sel2) {
        sel1.value = p1;
        sel2.value = p2;
        updateLoanComparison();
    }

    // Update active state on preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
    if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }
}
