const fs = require('fs');
const path = require('path');

function cleanup(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix duplicate imports
  const lines = content.split('\n');
  const uniqueImports = new Set();
  const newLines = [];
  
  lines.forEach(line => {
    if (line.startsWith('import { ') && line.includes(' } from "@/services/')) {
      if (uniqueImports.has(line.trim())) {
        return; // skip duplicate
      }
      uniqueImports.add(line.trim());
    }
    newLines.push(line);
  });
  
  content = newLines.join('\n');
  
  // Fix missed usages
  content = content.replace(/interviewerService\.getDashboard/g, 'interviewService.getInterviews');
  content = content.replace(/managerService\.getDashboard/g, 'applicationService.getApplications');
  content = content.replace(/managerService\.getCandidateReview/g, 'candidateService.getCandidateById');

  // Fix specific compiler errors (type 'unknown' must have iterator)
  if (filePath.includes('admin/audit/page.tsx')) {
    content = content.replace(/const logs = await authService.getAuditLogs\(\)/g, 'const logs = await authService.getAuditLogs() as any[]');
  }
  if (filePath.includes('admin/companies/page.tsx')) {
    content = content.replace(/setCompanies\(comps\)/g, 'setCompanies(comps as any[])');
  }
  if (filePath.includes('admin/page.tsx')) {
    content = content.replace(/auditLogs\.map/g, '(auditLogs as any[]).map');
  }
  if (filePath.includes('admin/roles/page.tsx')) {
    content = content.replace(/setRoles\(rolesData\)/g, 'setRoles(rolesData as any[])');
  }
  if (filePath.includes('admin/users/page.tsx')) {
    content = content.replace(/setUsers\(usersData\)/g, 'setUsers(usersData as any[])');
  }
  
  fs.writeFileSync(filePath, content);
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      cleanup(fullPath);
    }
  }
}

walk('src/app/(app)');
walk('src/components');
