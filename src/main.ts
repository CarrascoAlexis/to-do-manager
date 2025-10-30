/**
 * @file main.ts
 * @description Application entry point for the To-Do Manager.
 * Initializes the Vue 3 application, configures routing, applies theming,
 * and mounts the root component to the DOM.
 * 
 * @module main
 * @author Alexis Carrasco
 */

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/global.css'

/**
 * Theme Initialization Block
 * 
 * Applies the user's stored theme preference before the Vue app mounts
 * to prevent a flash of unstyled content (FOUC) or theme flicker.
 * 
 * @remarks
 * - Runs synchronously before app initialization
 * - Reads theme preference from localStorage
 * - Validates theme value against supported themes
 * - Adds appropriate CSS class to document root element
 * - Gracefully handles localStorage access errors (e.g., private browsing mode)
 * 
 * Supported themes:
 * - light: Default light theme
 * - dark: Dark mode theme
 * - halloween: Halloween-themed colors
 * - christmas: Christmas-themed colors
 * - france: French flag colors
 * - italy: Italian flag colors
 * - spain: Spanish flag colors
 * - lgbt: Pride flag colors
 */
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
	// Silently ignore localStorage errors (e.g., privacy mode, quota exceeded)
	// Application will fall back to default theme defined in CSS
}

/**
 * Vue Application Initialization
 * 
 * Creates and configures the Vue 3 application instance with:
 * - Root App component
 * - Vue Router for single-page navigation
 * - Global CSS styles
 * 
 * @remarks
 * - Mounts to #app element in index.html
 * - Router is installed before mounting
 * - Global styles are imported and applied
 */
createApp(App).use(router).mount('#app')
