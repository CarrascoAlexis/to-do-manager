// Demo data generator for testing TaskCard component
// Run this in browser console to populate localStorage with sample tasks

const sampleTasks = [
  {
    id: '1',
    title: 'Design new landing page',
    description: 'Create mockups and wireframes for the new homepage redesign',
    status: 1, // IN_PROGRESS
    createdAt: new Date('2025-10-15').toISOString(),
    updatedAt: new Date('2025-10-28').toISOString(),
    deadline: new Date('2025-11-05').toISOString(), // Soon (6 days)
    tags: [0, 2] // WORK, URGENT
  },
  {
    id: '2',
    title: 'Review pull requests',
    description: 'Check and merge pending PRs from team members',
    status: 0, // TODO
    createdAt: new Date('2025-10-25').toISOString(),
    updatedAt: new Date('2025-10-25').toISOString(),
    deadline: new Date('2025-10-30').toISOString(), // Today
    tags: [0] // WORK
  },
  {
    id: '3',
    title: 'Update documentation',
    description: 'Add API documentation for new endpoints',
    status: 2, // DONE
    createdAt: new Date('2025-10-20').toISOString(),
    updatedAt: new Date('2025-10-27').toISOString(),
    deadline: new Date('2025-10-29').toISOString(), // Completed before deadline
    tags: [0, 3] // WORK, LOW_PRIORITY
  },
  {
    id: '4',
    title: 'Plan weekend trip',
    description: 'Book hotel and plan activities for the weekend getaway',
    status: 0, // TODO
    createdAt: new Date('2025-10-28').toISOString(),
    updatedAt: new Date('2025-10-28').toISOString(),
    deadline: new Date('2025-11-15').toISOString(), // Normal (future)
    tags: [1] // PERSONAL
  },
  {
    id: '5',
    title: 'Fix authentication bug',
    description: 'Resolve login issues reported by users in production',
    status: 1, // IN_PROGRESS
    createdAt: new Date('2025-10-29').toISOString(),
    updatedAt: new Date('2025-10-30').toISOString(),
    deadline: new Date('2025-10-28').toISOString(), // Overdue!
    tags: [0, 2] // WORK, URGENT
  },
  {
    id: '6',
    title: 'Old project cleanup',
    description: 'Archive old code repositories and documentation',
    status: 4, // ARCHIVED
    createdAt: new Date('2025-09-15').toISOString(),
    updatedAt: new Date('2025-10-01').toISOString(),
    deadline: new Date('2025-10-31').toISOString(), // Had a deadline
    tags: [0, 3] // WORK, LOW_PRIORITY
  },
  {
    id: '7',
    title: 'Prepare presentation',
    description: 'Create slides for the quarterly review meeting',
    status: 0, // TODO
    createdAt: new Date('2025-10-29').toISOString(),
    updatedAt: new Date('2025-10-29').toISOString(),
    deadline: new Date('2025-11-01').toISOString(), // Soon (2 days)
    tags: [0, 2] // WORK, URGENT
  }
]

// Save to localStorage
localStorage.setItem('tasks', JSON.stringify(sampleTasks))

console.log('✅ Sample tasks added to localStorage!')
console.log('Reload the page to see the TaskCard components in action.')
