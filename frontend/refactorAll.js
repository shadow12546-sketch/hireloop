const fs = require('fs');
const path = require('path');

function replaceServices(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Remove old imports
  content = content.replace(/import\s+\{\s*\w+Service\s*\}\s+from\s+"@\/services\/mock\w+Service"\r?\n?/g, '');
  
  // Mappings
  content = content.replace(/mockRecruiterDashboard/g, 'analyticsService.getAnalytics'); // manual fix needed
  content = content.replace(/\w+Service\.getDashboard/g, 'analyticsService.getKpis'); // manual fix needed

  content = content.replace(/\w+Service\.getJobs/g, 'jobService.getJobs');
  content = content.replace(/\w+Service\.getJobById/g, 'jobService.getJobById');
  content = content.replace(/\w+Service\.createJob/g, 'jobService.createJob');

  content = content.replace(/\w+Service\.getCandidates/g, 'candidateService.getAllCandidates');
  content = content.replace(/\w+Service\.getCandidateById/g, 'candidateService.getCandidateById');
  content = content.replace(/\w+Service\.updateCandidateStatus/g, 'applicationService.updateApplicationStatus');

  content = content.replace(/\w+Service\.getApplications/g, 'applicationService.getApplications');
  content = content.replace(/\w+Service\.getApplicationById/g, 'applicationService.getApplicationById');

  content = content.replace(/\w+Service\.getInterviews/g, 'interviewService.getInterviews');
  content = content.replace(/\w+Service\.getInterviewById/g, 'interviewService.getInterviewById');
  content = content.replace(/\w+Service\.submitFeedback/g, 'interviewService.submitFeedback');

  content = content.replace(/\w+Service\.getAssessments/g, 'assessmentService.getAssessments');
  
  content = content.replace(/\w+Service\.getOffers/g, 'offerService.getOffers');
  content = content.replace(/\w+Service\.createOffer/g, 'offerService.createOffer');
  
  content = content.replace(/\w+Service\.getUsers/g, 'authService.getUsers');
  content = content.replace(/\w+Service\.getRoles/g, 'authService.getRoles');
  content = content.replace(/\w+Service\.getCompanies/g, 'authService.getCompanies');
  content = content.replace(/\w+Service\.getAuditLogs/g, 'authService.getAuditLogs');

  // Find needed services
  const needed = new Set();
  const services = ['auth', 'job', 'candidate', 'application', 'interview', 'assessment', 'offer', 'notification', 'ai', 'analytics'];
  
  services.forEach(s => {
    if (content.includes(`${s}Service.`)) {
      needed.add(s);
    }
  });

  if (needed.size > 0) {
    let imports = '';
    needed.forEach(s => {
      imports += `import { ${s}Service } from "@/services/${s}Service"\n`;
    });
    
    if (content.includes('"use client"')) {
      content = content.replace(/"use client"\r?\n?/, '"use client"\n' + imports);
    } else {
      content = imports + content;
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      replaceServices(fullPath);
    }
  }
}

walk('src/app/(app)');
walk('src/components');
