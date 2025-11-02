import { render, fireEvent } from '@testing-library/vue'
import FiltersBar from '../FiltersBar.vue'

describe('FiltersBar.vue', () => {
  it('emits update:activeFilter when status buttons clicked (buttons mode)', async () => {
    const { getByText, emitted } = render(FiltersBar, { props: { showStatus: true, statusMode: 'buttons', activeFilter: 'all' } })
    const todoBtn = getByText('To Do')
    await fireEvent.click(todoBtn)
    expect(emitted()['update:activeFilter']).toBeTruthy()
    expect(emitted()['update:activeFilter'][0]).toEqual([0])
  })

  it('emits update:dateFilter when date select changed', async () => {
    const { getByLabelText, emitted } = render(FiltersBar, { props: { showDateFilter: true, dateFilter: 'all' } })
    const select = getByLabelText('Date') as HTMLSelectElement
    await fireEvent.update(select, 'soon')
    expect(emitted()['update:dateFilter']).toBeTruthy()
    expect(emitted()['update:dateFilter'][0]).toEqual(['soon'])
  })

  it('emits sort change events when sort select changed', async () => {
    const { getByLabelText, emitted } = render(FiltersBar, { props: { showSort: true, sortBy: 'deadline', sortOrder: 'asc' } })
    const select = getByLabelText('Sort') as HTMLSelectElement
    await fireEvent.update(select, 'createdAt|desc')
    expect(emitted()['update:sortBy']).toBeTruthy()
    expect(emitted()['update:sortBy'][0]).toEqual(['createdAt'])
    expect(emitted()['update:sortOrder'][0]).toEqual(['desc'])
  })
})
