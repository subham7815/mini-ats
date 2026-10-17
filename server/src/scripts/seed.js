const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const Activity = require('../models/Activity');

const jobs = [
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    description: 'We are looking for an experienced frontend engineer to lead UI development for our flagship product. You will work closely with design and product teams.',
    requiredSkills: ['React', 'TypeScript', 'CSS', 'REST APIs', 'Git'],
    location: 'San Francisco, CA',
    employmentType: 'Full-time',
    openings: 2,
    status: 'Open'
  },
  {
    title: 'Product Manager',
    department: 'Product',
    description: 'Drive product strategy and roadmap for our B2B platform. Collaborate with engineering, design, and stakeholders to deliver impactful features.',
    requiredSkills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research', 'Roadmapping'],
    location: 'New York, NY',
    employmentType: 'Full-time',
    openings: 1,
    status: 'Open'
  },
  {
    title: 'UX Designer',
    department: 'Design',
    description: 'Create intuitive and beautiful user experiences for our enterprise applications. Conduct user research and design prototypes.',
    requiredSkills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility'],
    location: 'Remote',
    employmentType: 'Full-time',
    openings: 1,
    status: 'Open'
  },
  {
    title: 'Backend Engineer',
    department: 'Engineering',
    description: 'Build scalable backend services and APIs. Work with microservices architecture and cloud infrastructure.',
    requiredSkills: ['Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker'],
    location: 'Austin, TX',
    employmentType: 'Full-time',
    openings: 3,
    status: 'Open'
  },
  {
    title: 'Marketing Intern',
    department: 'Marketing',
    description: 'Support the marketing team with content creation, social media management, and campaign analytics.',
    requiredSkills: ['Content Writing', 'Social Media', 'Analytics', 'Canva'],
    location: 'San Francisco, CA',
    employmentType: 'Internship',
    openings: 2,
    status: 'Open'
  },
  {
    title: 'Data Analyst',
    department: 'Analytics',
    description: 'Analyze business data to provide insights and drive decision-making. Build dashboards and reports.',
    requiredSkills: ['SQL', 'Python', 'Tableau', 'Excel', 'Statistics'],
    location: 'Chicago, IL',
    employmentType: 'Full-time',
    openings: 1,
    status: 'Closed'
  }
];

const candidateTemplates = [
  { name: 'Sarah Chen', email: 'sarah.chen@email.com', phone: '(415) 555-0101', source: 'LinkedIn', experience: 6, skills: ['React', 'TypeScript', 'Node.js', 'CSS'], stage: 'Interview', jobIndex: 0 },
  { name: 'Marcus Johnson', email: 'marcus.j@email.com', phone: '(212) 555-0102', source: 'Referral', experience: 8, skills: ['Product Strategy', 'Agile', 'SQL', 'Jira'], stage: 'Offer', jobIndex: 1 },
  { name: 'Emily Rodriguez', email: 'emily.r@email.com', phone: '(510) 555-0103', source: 'Job Board', experience: 4, skills: ['Figma', 'Sketch', 'User Research', 'Prototyping'], stage: 'Screening', jobIndex: 2 },
  { name: 'David Kim', email: 'david.kim@email.com', phone: '(737) 555-0104', source: 'Company Website', experience: 5, skills: ['Python', 'Node.js', 'PostgreSQL', 'Docker'], stage: 'Applied', jobIndex: 3 },
  { name: 'Jessica Wang', email: 'jessica.w@email.com', phone: '(415) 555-0105', source: 'LinkedIn', experience: 7, skills: ['React', 'Vue.js', 'GraphQL', 'Tailwind CSS'], stage: 'Hired', jobIndex: 0 },
  { name: 'Michael Brown', email: 'michael.b@email.com', phone: '(312) 555-0106', source: 'Indeed', experience: 3, skills: ['SQL', 'Python', 'Tableau', 'R'], stage: 'Interview', jobIndex: 5 },
  { name: 'Priya Patel', email: 'priya.p@email.com', phone: '(646) 555-0107', source: 'Referral', experience: 5, skills: ['Product Management', 'Data Analysis', 'A/B Testing'], stage: 'Screening', jobIndex: 1 },
  { name: 'James Wilson', email: 'james.w@email.com', phone: '(737) 555-0108', source: 'Glassdoor', experience: 2, skills: ['Node.js', 'Express', 'MongoDB', 'Redis'], stage: 'Applied', jobIndex: 3 },
  { name: 'Aisha Mohammed', email: 'aisha.m@email.com', phone: '(415) 555-0109', source: 'LinkedIn', experience: 4, skills: ['React', 'JavaScript', 'CSS', 'Testing'], stage: 'Rejected', jobIndex: 0 },
  { name: 'Carlos Gutierrez', email: 'carlos.g@email.com', phone: '(510) 555-0110', source: 'Job Board', experience: 1, skills: ['Content Writing', 'Social Media', 'Photoshop'], stage: 'Interview', jobIndex: 4 },
  { name: 'Rachel Green', email: 'rachel.g@email.com', phone: '(212) 555-0111', source: 'Company Website', experience: 3, skills: ['Figma', 'Adobe XD', 'CSS', 'Design Systems'], stage: 'Applied', jobIndex: 2 },
  { name: 'Kevin Zhang', email: 'kevin.z@email.com', phone: '(737) 555-0112', source: 'LinkedIn', experience: 9, skills: ['Python', 'AWS', 'Kubernetes', 'CI/CD'], stage: 'Offer', jobIndex: 3 },
  { name: 'Laura Martinez', email: 'laura.m@email.com', phone: '(312) 555-0113', source: 'Referral', experience: 6, skills: ['Data Science', 'Machine Learning', 'SQL', 'Python'], stage: 'Hired', jobIndex: 5 },
  { name: 'Alex Thompson', email: 'alex.t@email.com', phone: '(415) 555-0114', source: 'Indeed', experience: 2, skills: ['React', 'Next.js', 'Tailwind CSS'], stage: 'Screening', jobIndex: 0 },
  { name: 'Sophia Lee', email: 'sophia.l@email.com', phone: '(646) 555-0115', source: 'Job Board', experience: 0, skills: ['Marketing', 'Analytics', 'Google Ads'], stage: 'Applied', jobIndex: 4 },
  { name: 'Ryan O\'Connor', email: 'ryan.o@email.com', phone: '(510) 555-0116', source: 'Glassdoor', experience: 7, skills: ['Node.js', 'Go', 'gRPC', 'PostgreSQL'], stage: 'Interview', jobIndex: 3 },
  { name: 'Nina Petrova', email: 'nina.p@email.com', phone: '(737) 555-0117', source: 'LinkedIn', experience: 4, skills: ['Product Analytics', 'SQL', 'Amplitude', 'Mixpanel'], stage: 'Applied', jobIndex: 1 },
  { name: 'Tom Baker', email: 'tom.b@email.com', phone: '(312) 555-0118', source: 'Company Website', experience: 5, skills: ['React', 'Angular', 'Node.js', 'MongoDB'], stage: 'Rejected', jobIndex: 0 }
];

const seedData = async (exitOnComplete = false) => {
  try {
    if (mongoose.connection.readyState === 0) {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ats-app';
      await mongoose.connect(uri);
      console.log('✅ Connected to MongoDB');
    }

    // Clear existing data
    await Promise.all([
      Job.deleteMany({}),
      Candidate.deleteMany({}),
      Activity.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Insert jobs
    const createdJobs = await Job.insertMany(jobs);
    console.log(`📋 Created ${createdJobs.length} jobs`);

    // Create candidates with proper job references
    const candidates = [];
    const now = new Date();
    for (let i = 0; i < candidateTemplates.length; i++) {
      const t = candidateTemplates[i];
      const job = createdJobs[t.jobIndex];
      // Spread application dates over the last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const appDate = new Date(now);
      appDate.setDate(appDate.getDate() - daysAgo);

      const stageHistory = [
        { fromStage: null, toStage: 'Applied', changedAt: appDate, actor: 'System' }
      ];

      // Build stage history based on current stage
      const stageOrder = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];
      const currentIdx = stageOrder.indexOf(t.stage);
      if (t.stage === 'Rejected') {
        const rejectedFrom = stageOrder[Math.min(Math.floor(Math.random() * 3) + 1, 3)];
        const rejIdx = stageOrder.indexOf(rejectedFrom);
        for (let s = 1; s <= rejIdx; s++) {
          const d = new Date(appDate);
          d.setDate(d.getDate() + s);
          stageHistory.push({ fromStage: stageOrder[s - 1], toStage: stageOrder[s], changedAt: d, actor: 'HR Manager' });
        }
        const rd = new Date(appDate);
        rd.setDate(rd.getDate() + rejIdx + 1);
        stageHistory.push({ fromStage: stageOrder[rejIdx], toStage: 'Rejected', changedAt: rd, actor: 'HR Manager' });
      } else if (currentIdx > 0) {
        for (let s = 1; s <= currentIdx; s++) {
          const d = new Date(appDate);
          d.setDate(d.getDate() + s);
          stageHistory.push({ fromStage: stageOrder[s - 1], toStage: stageOrder[s], changedAt: d, actor: 'HR Manager' });
        }
      }

      candidates.push({
        name: t.name,
        email: t.email,
        phone: t.phone,
        jobId: job._id,
        source: t.source,
        experience: t.experience,
        skills: t.skills,
        notes: `Sample candidate for ${job.title}. This is demo data.`,
        stage: t.stage,
        applicationDate: appDate,
        stageHistory
      });
    }

    const createdCandidates = await Candidate.insertMany(candidates);
    console.log(`👤 Created ${createdCandidates.length} candidates`);

    // Create activity records
    const activities = [];
    for (const c of createdCandidates) {
      const job = createdJobs.find(j => j._id.toString() === c.jobId.toString());
      activities.push({
        actionType: 'candidate_added',
        candidateId: c._id,
        jobId: c.jobId,
        description: `${c.name} applied for ${job.title}`,
        createdAt: c.applicationDate
      });

      if (c.stage === 'Interview' || c.stage === 'Offer' || c.stage === 'Hired') {
        const d = new Date(c.applicationDate);
        d.setDate(d.getDate() + 2);
        activities.push({
          actionType: c.stage === 'Interview' ? 'interview_scheduled' :
            c.stage === 'Offer' ? 'offer_extended' : 'candidate_hired',
          candidateId: c._id,
          jobId: c.jobId,
          description: `${c.name} moved to ${c.stage} for ${job.title}`,
          createdAt: d
        });
      }
    }

    for (const j of createdJobs) {
      activities.push({
        actionType: 'job_created',
        jobId: j._id,
        description: `New job posting created: ${j.title} in ${j.department}`,
        createdAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000)
      });
    }

    await Activity.insertMany(activities);
    console.log(`📝 Created ${activities.length} activity records`);

    const stageCounts = {};
    for (const c of createdCandidates) {
      stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1;
    }
    console.log('📊 Candidate distribution by stage:');
    Object.entries(stageCounts).forEach(([stage, count]) => {
      console.log(`   ${stage}: ${count}`);
    });

    console.log('✅ Seed completed successfully!\n');
    if (exitOnComplete) {
      process.exit(0);
    }
    return { createdJobs, createdCandidates };
  } catch (error) {
    console.error('❌ Seed error:', error);
    if (exitOnComplete) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = { seedData, jobs, candidateTemplates };
