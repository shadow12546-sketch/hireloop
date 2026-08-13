const fs = require('fs');
const path = require('path');

const files = [
  'src/app/(app)/candidate/page.tsx',
  'src/app/(app)/candidate/applications/page.tsx',
  'src/app/(app)/candidate/applications/[id]/page.tsx',
  'src/app/(app)/candidate/assessments/page.tsx',
  'src/app/(app)/candidate/interviews/page.tsx',
  'src/app/(app)/candidate/jobs/page.tsx',
  'src/app/(app)/candidate/jobs/[id]/page.tsx',
  'src/app/(app)/candidate/notifications/page.tsx',
  'src/app/(app)/candidate/offers/page.tsx',
  'src/app/(app)/candidate/profile/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove old import
  content = content.replace(/import\s+\{\s*candidateService\s*\}\s+from\s+"@\/services\/mockCandidateService"\r?\n?/g, '');
  
  // Find which services are needed
  const needed = new Set();
  if (content.includes('candidateService.getProfile') || content.includes('candidateService.updateProfile')) needed.add('candidateService');
  if (content.includes('candidateService.getJobs') || content.includes('candidateService.getJobById')) needed.add('jobService');
  if (content.includes('candidateService.getApplications') || content.includes('candidateService.getApplicationById')) needed.add('applicationService');
  if (content.includes('candidateService.getInterviews')) needed.add('interviewService');
  if (content.includes('candidateService.getAssessments')) needed.add('assessmentService');
  if (content.includes('candidateService.getOffers')) needed.add('offerService');
  if (content.includes('candidateService.getNotifications')) needed.add('notificationService');
  
  // Add new imports
  let imports = '';
  needed.forEach(service => {
    imports += `import { ${service} } from "@/services/${service}"\n`;
  });
  
  if (imports) {
    if (content.includes('"use client"')) {
      content = content.replace(/"use client"\r?\n?/, '"use client"\n' + imports);
    } else {
      content = imports + content;
    }
  }
  
  // Replace usages
  content = content.replace(/candidateService\.getJobs/g, 'jobService.getJobs');
  content = content.replace(/candidateService\.getJobById/g, 'jobService.getJobById');
  content = content.replace(/candidateService\.getApplications/g, 'applicationService.getApplications');
  content = content.replace(/candidateService\.getApplicationById/g, 'applicationService.getApplicationById');
  content = content.replace(/candidateService\.getInterviews/g, 'interviewService.getInterviews');
  content = content.replace(/candidateService\.getAssessments/g, 'assessmentService.getAssessments');
  content = content.replace(/candidateService\.getOffers/g, 'offerService.getOffers');
  content = content.replace(/candidateService\.getNotifications/g, 'notificationService.getNotifications');
  
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});
