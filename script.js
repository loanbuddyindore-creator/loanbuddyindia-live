async function handleHeroSubmit(e) {
    e.preventDefault();

    const formData = new FormData();

    formData.append("fullName", "Website Lead");
    formData.append("mobile", document.getElementById("heroPhone").value);
    formData.append("email", "");
    formData.append("loanType", document.getElementById("heroLoanType").value);
    formData.append("amount", document.getElementById("heroAmountRange").value);
    formData.append("message", "Hero Form");

    try {

        await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            body: formData
        });

        alert("Lead Submitted Successfully!");

        e.target.reset();

    } catch (error) {

        console.error(error);

        alert("Submission Failed");
async function handleModalSubmit(e) {

    e.preventDefault();

    const formData = new FormData();

    formData.append("fullName", document.getElementById("modalName").value);
    formData.append("mobile", document.getElementById("modalPhone").value);
    formData.append("email", "");
    formData.append("loanType", "Quick Loan");
    formData.append("amount", "");
    formData.append("message", "Apply Now Popup");

    try {

        await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            body: formData
        });

        alert("Application Submitted Successfully!");

        e.target.reset();

        closeModal();

    } catch (error) {

        console.error(error);

        alert("Submission Failed");

    }
}async function handleEnquirySubmit(e) {

    e.preventDefault();

    const formData = new FormData();

    formData.append("fullName", document.getElementById("enquiryName").value);
    formData.append("mobile", document.getElementById("enquiryMobile").value);
    formData.append("email", "");
    formData.append("loanType", document.getElementById("enquiryType").value);
    formData.append("amount", document.getElementById("enquiryAmount").value);
    formData.append("message", "Instant Loan Enquiry");

    try {

        await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            body: formData
        });

        alert("Enquiry Submitted Successfully!");

        e.target.reset();

    } catch (error) {

        console.error(error);

        alert("Submission Failed");

    }
}async function handlePartnerSubmit(e) {

    e.preventDefault();

    const formData = new FormData();

    formData.append("fullName", document.getElementById("partnerName").value);
    formData.append("mobile", document.getElementById("partnerMobile").value);
    formData.append("email", "");
    formData.append("loanType", "Partner Registration");
    formData.append("amount", "");
    formData.append("message", document.getElementById("partnerProfession").value);

    try {

        await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            body: formData
        });

        alert("Partner Registration Successful!");

        e.target.reset();

    } catch (error) {

        console.error(error);

        alert("Submission Failed");

    }
}async function handleCareerSubmit(e) {

    e.preventDefault();

    const formData = new FormData();

    formData.append("fullName", document.getElementById("careerName").value);
    formData.append("mobile", document.getElementById("careerMobile").value);
    formData.append("email", "");
    formData.append("loanType", "Career Application");
    formData.append("amount", "");
    formData.append("message", document.getElementById("careerPosition").value);

    try {

        await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            body: formData
        });

        alert("Application Submitted Successfully!");

        e.target.reset();

    } catch (error) {

        console.error(error);

        alert("Submission Failed");

    }
}async function handleContactSubmit(e) {

    e.preventDefault();

    const formData = new FormData();

    formData.append("fullName", document.getElementById("contactName").value);
    formData.append("mobile", document.getElementById("contactPhone").value);
    formData.append("email", document.getElementById("contactEmail").value);
    formData.append("loanType", "Contact Form");
    formData.append("amount", "");
    formData.append("message", document.getElementById("contactMessage").value);

    try {

        await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            body: formData
        });

        alert("Message Sent Successfully!");

        e.target.reset();

    } catch (error) {

        console.error(error);

        alert("Submission Failed");

    }
}async function submitLead(formData) {

    try {

        await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            body: formData
        });

        return true;

    } catch (err) {

        console.error(err);

        return false;

    }

}const success = await submitLead(formData);

if(success){

    alert("Lead Submitted Successfully!");

    e.target.reset();

}else{

    alert("Submission Failed");

}const success = await submitLead(formData);

if(success){
   ...
}else{
   ...
}const SHEET_ID = "1VNjO0qFjqqYSzutdnofpH-s84y-x8m_R2D-77EaJmjM";

function doPost(e) {

  try {

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];

    const data = e.parameter;

    sheet.appendRow([
      new Date(),
      data.fullName || "",
      data.mobile || "",
      data.email || "",
      data.loanType || "",
      data.amount || "",
      data.message || ""
    ]);

    return ContentService
      .createTextOutput(
        JSON.stringify({
          success: true
        })
      )
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {

    return ContentService
      .createTextOutput(
        JSON.stringify({
          success: false,
          error: err.toString()
        })
      )
      .setMimeType(ContentService.MimeType.JSON);

  }

}

function doGet() {

  return ContentService
    .createTextOutput("Loan Buddy API Running");

}

function doOptions() {

  return ContentService
    .createTextOutput("");

}
    }
}
