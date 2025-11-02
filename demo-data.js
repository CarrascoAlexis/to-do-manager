// Demo data generator for testing TaskCard component
// Run this in browser console to populate localStorage with sample tasks

const sampleTasks = [
  { id: '1', title: 'Design new landing page', description: 'Create mockups and wireframes for the new homepage redesign', status: 1, createdAt: new Date('2025-10-15').toISOString(), updatedAt: new Date('2025-10-28').toISOString(), deadline: new Date('2025-11-05').toISOString(), tags: [0,2] },
  { id: '2', title: 'Review pull requests', description: 'Check and merge pending PRs from team members', status: 0, createdAt: new Date('2025-10-25').toISOString(), updatedAt: new Date('2025-10-25').toISOString(), deadline: new Date('2025-10-30').toISOString(), tags: [0] },
  { id: '3', title: 'Update documentation', description: 'Add API documentation for new endpoints', status: 2, createdAt: new Date('2025-10-20').toISOString(), updatedAt: new Date('2025-10-27').toISOString(), deadline: new Date('2025-10-29').toISOString(), tags: [0,3] },
  { id: '4', title: 'Plan weekend trip', description: 'Book hotel and plan activities for the weekend getaway', status: 0, createdAt: new Date('2025-10-28').toISOString(), updatedAt: new Date('2025-10-28').toISOString(), deadline: new Date('2025-11-15').toISOString(), tags: [1] },
  { id: '5', title: 'Fix authentication bug', description: 'Resolve login issues reported by users in production', status: 1, createdAt: new Date('2025-10-29').toISOString(), updatedAt: new Date('2025-10-30').toISOString(), deadline: new Date('2025-10-28').toISOString(), tags: [0,2] },
  { id: '6', title: 'Old project cleanup', description: 'Archive old code repositories and documentation', status: 4, createdAt: new Date('2025-09-15').toISOString(), updatedAt: new Date('2025-10-01').toISOString(), deadline: new Date('2025-10-31').toISOString(), tags: [0,3] },
  { id: '7', title: 'Prepare presentation', description: 'Create slides for the quarterly review meeting', status: 0, createdAt: new Date('2025-10-29').toISOString(), updatedAt: new Date('2025-10-29').toISOString(), deadline: new Date('2025-11-01').toISOString(), tags: [0,2] },
  { id: '8', title: 'Onboard new hire', description: 'Set up accounts and run onboarding session', status: 1, createdAt: new Date('2025-10-22').toISOString(), updatedAt: new Date('2025-10-30').toISOString(), deadline: new Date('2025-11-03').toISOString(), tags: [0,1] },
  { id: '9', title: 'Refactor auth module', description: 'Improve code quality and add unit tests', status: 0, createdAt: new Date('2025-10-18').toISOString(), updatedAt: new Date('2025-10-26').toISOString(), deadline: new Date('2025-11-10').toISOString(), tags: [0] },
  { id: '10', title: 'Grocery shopping', description: 'Buy supplies for the week', status: 0, createdAt: new Date('2025-10-31').toISOString(), updatedAt: new Date('2025-10-31').toISOString(), deadline: new Date('2025-11-02').toISOString(), tags: [1] },
  { id: '11', title: 'Pay invoices', description: 'Pay outstanding vendor invoices', status: 2, createdAt: new Date('2025-10-12').toISOString(), updatedAt: new Date('2025-10-20').toISOString(), deadline: new Date('2025-10-20').toISOString(), tags: [0] },
  { id: '12', title: 'Customer follow-up', description: 'Email customers who reported issues', status: 1, createdAt: new Date('2025-10-27').toISOString(), updatedAt: new Date('2025-10-29').toISOString(), deadline: new Date('2025-11-04').toISOString(), tags: [0,2] },
  { id: '13', title: 'Write blog post', description: 'Draft the monthly engineering update', status: 0, createdAt: new Date('2025-10-10').toISOString(), updatedAt: new Date('2025-10-25').toISOString(), deadline: new Date('2025-11-12').toISOString(), tags: [0,3] },
  { id: '14', title: 'Dentist appointment', description: 'Routine cleaning', status: 0, createdAt: new Date('2025-10-05').toISOString(), updatedAt: new Date('2025-10-05').toISOString(), deadline: new Date('2025-11-07').toISOString(), tags: [1] },
  { id: '15', title: 'Sprint retrospective', description: 'Run retro and capture action items', status: 2, createdAt: new Date('2025-10-01').toISOString(), updatedAt: new Date('2025-10-15').toISOString(), deadline: new Date('2025-10-02').toISOString(), tags: [0] },
  { id: '16', title: 'Server security patch', description: 'Apply urgent security updates', status: 1, createdAt: new Date('2025-10-21').toISOString(), updatedAt: new Date('2025-10-30').toISOString(), deadline: new Date('2025-11-01').toISOString(), tags: [0,2] },
  { id: '17', title: 'Family dinner', description: 'Host family for dinner', status: 0, createdAt: new Date('2025-10-24').toISOString(), updatedAt: new Date('2025-10-24').toISOString(), deadline: new Date('2025-11-08').toISOString(), tags: [1] },
  { id: '18', title: 'Research new DB', description: 'Compare performance of candidate databases', status: 0, createdAt: new Date('2025-10-11').toISOString(), updatedAt: new Date('2025-10-20').toISOString(), deadline: new Date('2025-11-20').toISOString(), tags: [0,3] },
  { id: '19', title: 'Clean inbox', description: 'Triage and archive old emails', status: 3, createdAt: new Date('2025-09-20').toISOString(), updatedAt: new Date('2025-10-02').toISOString(), deadline: new Date('2025-09-30').toISOString(), tags: [0,3] },
  { id: '20', title: 'Book flight', description: 'Book tickets for conference', status: 0, createdAt: new Date('2025-10-16').toISOString(), updatedAt: new Date('2025-10-16').toISOString(), deadline: new Date('2025-11-25').toISOString(), tags: [1] },
  { id: '21', title: 'Optimize image assets', description: 'Reduce bundle size by optimizing images', status: 1, createdAt: new Date('2025-10-13').toISOString(), updatedAt: new Date('2025-10-30').toISOString(), deadline: new Date('2025-11-06').toISOString(), tags: [0] },
  { id: '22', title: 'Plan team offsite', description: 'Find venue and set agenda', status: 0, createdAt: new Date('2025-10-19').toISOString(), updatedAt: new Date('2025-10-19').toISOString(), deadline: new Date('2025-12-01').toISOString(), tags: [0,1] },
  { id: '23', title: 'Migrate analytics', description: 'Switch analytics provider to new platform', status: 0, createdAt: new Date('2025-10-08').toISOString(), updatedAt: new Date('2025-10-28').toISOString(), deadline: new Date('2025-11-18').toISOString(), tags: [0] },
  { id: '24', title: 'Renew subscription', description: 'Renew annual software subscription', status: 2, createdAt: new Date('2025-09-01').toISOString(), updatedAt: new Date('2025-10-01').toISOString(), deadline: new Date('2025-09-30').toISOString(), tags: [0] },
  { id: '25', title: 'Test accessibility', description: 'Run accessibility audit and fix blockers', status: 1, createdAt: new Date('2025-10-26').toISOString(), updatedAt: new Date('2025-10-30').toISOString(), deadline: new Date('2025-11-09').toISOString(), tags: [0,3] }
]

// Save to localStorage
localStorage.setItem('tasks', JSON.stringify(sampleTasks))

console.log('✅ Sample tasks (25) added to localStorage!')
console.log('Reload the page to see the TaskCard components in action.')
