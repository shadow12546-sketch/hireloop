const fs = require('fs');

function f(file, search, replace) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.split(search).join(replace);
  fs.writeFileSync(file, c);
}

f('src/app/(app)/admin/audit/page.tsx', 'const logs = await authService.getAuditLogs()', 'const logs = await authService.getAuditLogs() as any[]');
f('src/app/(app)/admin/companies/page.tsx', 'setCompanies(comps)', 'setCompanies(comps as any[])');
f('src/app/(app)/admin/page.tsx', 'auditLogs.map', '(auditLogs as any[]).map');
f('src/app/(app)/admin/roles/page.tsx', 'setRoles(rolesData)', 'setRoles(rolesData as any[])');
f('src/app/(app)/admin/users/page.tsx', 'setUsers(usersData)', 'setUsers(usersData as any[])');

f('src/app/(app)/interviewer/page.tsx', 'interviewerService.getDashboard()', 'interviewService.getInterviews()');
f('src/app/(app)/manager/candidates/[id]/page.tsx', 'managerService.getCandidateReview', 'candidateService.getCandidateById');
f('src/app/(app)/manager/page.tsx', 'managerService.getDashboard()', 'candidateService.getAllCandidates()');

let anaPath = 'src/app/(app)/recruiter/analytics/page.tsx';
let ana = fs.readFileSync(anaPath, 'utf8');
let lines = ana.split('\n');
let newLines = [];
let seenAna = false;
for(let line of lines) {
  if (line.includes('import { analyticsService, type AnalyticsData, type DateRange } from "@/services/analyticsService"')) {
    if (!seenAna) {
      newLines.push(line);
      seenAna = true;
    }
  } else if (line.includes('import { analyticsService } from "@/services/analyticsService"')) {
    // skip
  } else {
    newLines.push(line);
  }
}
fs.writeFileSync(anaPath, newLines.join('\n'));
