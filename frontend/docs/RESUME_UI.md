# Resume UI Specification

Handles candidate resume uploads, parse progress, file validation, and metadata representations.

## 1. Resume Upload Flow

```
User selects file / Drags to Area 
  -> Client validation (file type/size) 
  -> Show progress bar 
  -> Trigger API Upload 
  -> Processing State (AI Parsing Spinner) 
  -> Show parsed results & match score
```

## 2. Technical Validation
* **Supported Formats:** PDF, DOCX, DOC.
* **Maximum File Size:** 5MB.
* **Validation Error Feedback:** Toast warning on size limit exceed or invalid file format.

## 3. UI States

### A. Idle State
* Drag-and-drop icon, upload text instructions, and file selection button.

### B. Uploading / Parsing State
* Progress bar showing upload percentage.
* A detailed progress indicator during the AI parsing stage: "AI is extraction skills & job suitability...".

### C. Completed State
* File info card (file name, size, type).
* Quick actions: "Preview CV", "Upload Different File".
