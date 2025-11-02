import { render, fireEvent } from '@testing-library/vue'
import TaskCard from '../TaskCard.vue'
import type { Task } from '@/resources/tasks'

function makeTask(overrides: Partial<Task> = {}): Task {
  const now = new Date()
  return {
    id: 't1',
    title: 'Test task',
    description: 'A test',
    status: 0,
    tags: [],
    createdAt: now,
    updatedAt: now,
    deadline: undefined,
    ...overrides
  } as Task
}

describe('TaskCard.vue', () => {
  it('renders title and emits click when card clicked, emits delete when delete button clicked', async () => {
    const task = makeTask()
    const { getByText, emitted, container } = render(TaskCard, { props: { task, showDescription: true } })

    // title visible
    getByText('Test task')

    // click card area
    const card = container.querySelector('.task-card') as HTMLElement
    await fireEvent.click(card)
    expect(emitted()['click']).toBeTruthy()
    expect(emitted()['click'][0]).toEqual([task])

    // click delete button
    const delBtn = container.querySelector('.delete-btn') as HTMLElement
    await fireEvent.click(delBtn)
    expect(emitted()['delete']).toBeTruthy()
    expect(emitted()['delete'][0]).toEqual([task])
  })
})
