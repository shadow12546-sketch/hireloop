# Assessment UI Specifications

The Assessment UI provides coding challenge layouts for Candidates and assessment management dashboards for Recruiters.

## 1. Candidate Assessment Layout (The Sandbox)
* **Header:** Title, timer count-down widget, "Submit Test" button.
* **Layout:** Dual-pane split:
  * **Left Pane:** Problem statement formatting, instructions, constraints, example input/output blocks.
  * **Right Pane:** Editor panel (Monaco Editor or CodeMirror), dropdown language selector, "Run Code" button (outputs console console outputs/results), and "Submit Code".
* **Alert System:** Warning message popup triggers if user clicks off or leaves the viewport (basic tab-switching detection helper).

## 2. Recruiter Panel (Test Creation & Assignment)
* **Layout:** Grid of pre-built code questions or "Create Custom Question" form.
* **Fields:** Title, difficulty level (Easy/Medium/Hard), description (Markdown), starter template, validation test cases (Input & expected output).
* **Candidate Tracker:** Table listing test statuses: Pending, Started, Completed, Evaluated, Scores, and detailed submission logs.
