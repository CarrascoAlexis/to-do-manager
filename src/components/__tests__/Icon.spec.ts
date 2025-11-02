import { render } from '@testing-library/vue'
import Icon from '../Icon.vue'

describe('Icon.vue', () => {
	it('renders an svg when given a known icon name', () => {
		const { container } = render(Icon, { props: { name: 'home', size: 24 } })
		const svg = container.querySelector('svg')
		expect(svg).toBeTruthy()
		// basic structural assertion: contains a path element for the home icon
		expect(svg?.querySelector('path')).toBeTruthy()
	})

	it('renders fallback svg for unknown icon name', () => {
		const { container } = render(Icon, { props: { name: 'nope' } })
		const svg = container.querySelector('svg')
		expect(svg).toBeTruthy()
		// fallback contains a circle
		expect(svg?.querySelector('circle')).toBeTruthy()
	})
})
