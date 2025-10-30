import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/global.css'

// Apply stored theme early to avoid flash of default colors
try {
		if (typeof localStorage !== 'undefined') {
			const stored = localStorage.getItem('theme')
				if (
					stored === 'light' ||
					stored === 'dark' ||
					stored === 'halloween' ||
					stored === 'christmas' ||
					stored === 'france' ||
					stored === 'italy' ||
					stored === 'spain' ||
					stored === 'lgbt'
				) {
					document.documentElement.classList.add(`theme-${stored}`)
				}
		}
} catch (e) {
	// ignore (e.g., privacy mode blocking localStorage)
}

createApp(App).use(router).mount('#app')
