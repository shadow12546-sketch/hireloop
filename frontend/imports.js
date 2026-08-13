const fs = require('fs');

function addImport(file, name) {
  let c = fs.readFileSync(file, 'utf8');
  if (!c.includes(name)) {
    c = c.replace('"use client"', '"use client"\nimport { ' + name + ' } from "@/services/' + name + '"');
    fs.writeFileSync(file, c);
  }
}

addImport('src/app/(app)/interviewer/page.tsx', 'interviewService');
addImport('src/app/(app)/manager/candidates/[id]/page.tsx', 'candidateService');
addImport('src/app/(app)/manager/page.tsx', 'candidateService');

// Also fix managerService.getCandidateReview which was not fixed
let mc = fs.readFileSync('src/app/(app)/manager/candidates/[id]/page.tsx', 'utf8');
mc = mc.replace(/managerService\.getCandidateReview/g, 'candidateService.getCandidateById');
fs.writeFileSync('src/app/(app)/manager/candidates/[id]/page.tsx', mc);
