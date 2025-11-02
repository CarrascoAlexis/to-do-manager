import { render, fireEvent } from '@testing-library/vue'
import HeaderControls from '../HeaderControls.vue'

describe('HeaderControls.vue', () => {
  it('emits update:view when view toggle clicked, emits update:search on input, and clears dateFilter when badge clicked', async () => {
    const { getByTitle, getByPlaceholderText, emitted } = render(HeaderControls, {
      props: { view: 'list', dateFilter: 'today', titleIcon: 'home', search: '' },
      global: { stubs: { FiltersBar: true } }
    })

    // Click the kanban view button
    const kanbanBtn = getByTitle('Kanban view')
    await fireEvent.click(kanbanBtn)
    expect(emitted()['update:view']).toBeTruthy()
    expect(emitted()['update:view'][0]).toEqual(['kanban'])

    // Type in the search input
    const input = getByPlaceholderText('Search tasks...') as HTMLInputElement
    await fireEvent.update(input, 'buy milk')
    expect(emitted()['update:search']).toBeTruthy()
    // last emitted search value should be 'buy milk'
    expect(emitted()['update:search'].slice(-1)[0]).toEqual(['buy milk'])

    // Click the date badge (title is 'Today' for dateFilter='today')
    const badge = getByTitle('Today')
    await fireEvent.click(badge)
    expect(emitted()['update:dateFilter']).toBeTruthy()
    expect(emitted()['update:dateFilter'][0]).toEqual(['all'])
  })
})
