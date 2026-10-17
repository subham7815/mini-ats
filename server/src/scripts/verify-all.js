const http = require('http');

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const opt = {
      hostname: 'localhost',
      port: 5000,
      path: '/api' + path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };
    const req = http.request(opt, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

(async () => {
  console.log('=== STARTING END-TO-END ATS VERIFICATION ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log('  ✅ PASS:', message);
      passed++;
    } else {
      console.error('  ❌ FAIL:', message);
      failed++;
    }
  }

  // 1. Health check
  console.log('1. Health Check');
  const health = await request('/health');
  assert(health.status === 200 && health.body.success === true, 'Health check returns 200 OK');

  // 2. Dashboard metrics
  console.log('\n2. Dashboard Analytics');
  const metrics = await request('/dashboard/metrics');
  assert(metrics.status === 200 && metrics.body.data.totalCandidates > 0, 'Dashboard metrics return candidate count');
  const pipeline = await request('/dashboard/pipeline');
  assert(pipeline.status === 200 && Array.isArray(pipeline.body.data), 'Dashboard pipeline returns stage distribution array');
  const appsOverTime = await request('/dashboard/applications-over-time');
  assert(appsOverTime.status === 200 && Array.isArray(appsOverTime.body.data), 'Dashboard applications over time returns trend data');
  const sources = await request('/dashboard/sources');
  assert(sources.status === 200 && Array.isArray(sources.body.data), 'Dashboard sources returns candidate source breakdown');
  const activity = await request('/dashboard/activity');
  assert(activity.status === 200 && Array.isArray(activity.body.data), 'Dashboard activity returns recent event feed');

  // 3. Jobs CRUD Flow
  console.log('\n3. Jobs CRUD Flow');
  const listJobs = await request('/jobs');
  assert(listJobs.status === 200 && listJobs.body.data.length > 0, 'Jobs list returns seeded jobs');
  const testJobPayload = {
    title: 'Staff Security Engineer',
    department: 'Security',
    description: 'Lead application security and threat modeling.',
    requiredSkills: ['AppSec', 'OAuth', 'Threat Modeling'],
    location: 'Remote',
    employmentType: 'Full-time',
    openings: 1
  };
  const createJob = await request('/jobs', { method: 'POST', body: testJobPayload });
  assert(createJob.status === 201 && createJob.body.data._id, 'Job created successfully with status Open');
  const newJobId = createJob.body.data._id;

  const getJob = await request('/jobs/' + newJobId);
  assert(getJob.status === 200 && getJob.body.data.title === testJobPayload.title, 'Fetch single job by ID');

  const updateJob = await request('/jobs/' + newJobId, { method: 'PUT', body: { openings: 3 } });
  assert(updateJob.status === 200 && updateJob.body.data.openings === 3, 'Update job details');

  // 4. Candidates CRUD & Stage Progression
  console.log('\n4. Candidates CRUD & Stage Progression');
  const testCandidatePayload = {
    name: 'Ada Lovelace',
    email: 'ada.lovelace@pioneers.org',
    phone: '(555) 010-9999',
    jobId: newJobId,
    source: 'Referral',
    experience: 10,
    skills: ['Algorithms', 'Architecture', 'Security'],
    notes: 'Exceptional background in analytical foundations.',
    stage: 'Applied'
  };
  const createCand = await request('/candidates', { method: 'POST', body: testCandidatePayload });
  assert(createCand.status === 201 && createCand.body.data._id, 'Candidate created with initial Applied stage');
  const newCandId = createCand.body.data._id;

  const getCand = await request('/candidates/' + newCandId);
  assert(getCand.status === 200 && getCand.body.data.email === testCandidatePayload.email, 'Fetch single candidate by ID');
  assert(getCand.body.data.stageHistory && getCand.body.data.stageHistory.length >= 1, 'Initial stageHistory recorded');

  // Stage transition Applied -> Screening
  const stage1 = await request('/candidates/' + newCandId + '/stage', { method: 'PATCH', body: { stage: 'Screening' } });
  assert(stage1.status === 200 && stage1.body.data.stage === 'Screening', 'Stage updated to Screening');

  // Stage transition Screening -> Interview
  const stage2 = await request('/candidates/' + newCandId + '/stage', { method: 'PATCH', body: { stage: 'Interview' } });
  assert(stage2.status === 200 && stage2.body.data.stage === 'Interview', 'Stage updated to Interview');

  // Verify stage history has entries
  const verifyCand = await request('/candidates/' + newCandId);
  assert(verifyCand.body.data.stageHistory.length >= 3, 'Stage progression history tracks all 3 transitions');

  // 5. Business Logic: Cannot apply to Closed Job
  console.log('\n5. Business Rules Validation');
  const toggleClose = await request('/jobs/' + newJobId + '/status', { method: 'PATCH', body: { status: 'Closed' } });
  assert(toggleClose.status === 200 && toggleClose.body.data.status === 'Closed', 'Toggle job status to Closed');

  const rejectApplyClosed = await request('/candidates', {
    method: 'POST',
    body: {
      name: 'Charles Babbage',
      email: 'charles@diffengine.org',
      jobId: newJobId,
      source: 'LinkedIn'
    }
  });
  assert(rejectApplyClosed.status === 400 && rejectApplyClosed.body.message.includes('closed job'), 'Correctly rejects application to Closed job');

  // Reopen job
  const toggleOpen = await request('/jobs/' + newJobId + '/status', { method: 'PATCH', body: { status: 'Open' } });
  assert(toggleOpen.status === 200 && toggleOpen.body.data.status === 'Open', 'Toggle job status back to Open');

  // 6. Search & Filters
  console.log('\n6. Search & Filter Flow');
  const searchCand = await request('/candidates?search=Lovelace');
  assert(searchCand.status === 200 && searchCand.body.data.some(c => c.name.includes('Lovelace')), 'Search candidates by name');

  const filterStage = await request('/candidates?stage=Interview');
  assert(filterStage.status === 200 && filterStage.body.data.every(c => c.stage === 'Interview'), 'Filter candidates by stage');

  const globalSearch = await request('/search?q=Security');
  assert(globalSearch.status === 200 && (globalSearch.body.data.jobs.length > 0 || globalSearch.body.data.candidates.length > 0), 'Global instant search finds matching records');

  // 7. Cleanup created test records
  console.log('\n7. Cleanup Test Records');
  const delCand = await request('/candidates/' + newCandId, { method: 'DELETE' });
  assert(delCand.status === 200, 'Delete candidate successfully');

  const delJob = await request('/jobs/' + newJobId, { method: 'DELETE' });
  assert(delJob.status === 200, 'Delete job successfully');

  console.log('\n=== VERIFICATION SUMMARY ===');
  console.log('Passed:', passed, '| Failed:', failed);
  if (failed > 0) process.exit(1);
})().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
