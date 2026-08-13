# Offer Letter UI

Handles drafting, reviewing, sending, accepting, or rejecting formal job offers.

## 1. Recruiter Offer Generation Form
* **Form Inputs:**
  * Candidate Selection (AutoComplete dropdown).
  * Role / Job Title (Select).
  * Annual CTC / Salary (Numerical input).
  * Expected Start Date (Calendar picker).
  * Signee / Representative (Text input).
  * Upload custom PDF template or fill text template (Rich Text Editor).
* **Actions:** "Generate PDF Preview", "Send Offer Letter".

## 2. Candidate Offer Review Screen
* **Components:** PDF Viewer showing terms, summary card, digital signature verification checkbox.
* **Actions:**
  * "Accept Offer" button (Triggers signature confirmation dialog and acceptance flow).
  * "Decline Offer" button (Triggers feedback dialog text area: "Reason for declining").
* **States:** Offer status indicator badges (Draft, Sent, Accepted, Declined, Expired).
