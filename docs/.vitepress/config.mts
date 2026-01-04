import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'

// Try to read sidebar.json, fallback to empty object if not exists
let sidebarConfig: Record<string, any[]> = {}
try {
  const sidebarPath = path.resolve(__dirname, '../sidebar.json')
  if (fs.existsSync(sidebarPath)) {
    sidebarConfig = JSON.parse(fs.readFileSync(sidebarPath, 'utf-8'))
  }
} catch (e) {
  console.warn('sidebar.json not found or invalid')
}

// Merge hooks and utils for the root sidebar to keep them together
const mergedSidebar = [
  ...(sidebarConfig['/hooks/'] || []),
  ...(sidebarConfig['/utils/'] || [])
]

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "@dev-tookit/registry",
  description: "Component registry for dev-tookit",
  vite: {},
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/hooks/' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' }
          ]
        },
        {
          text: 'API Reference',
          items: [
            { text: 'Hooks Overview', link: '/hooks/' }
          ]
        }
      ],
      // Show both Hooks and Utils in the sidebar for API pages
      '/': mergedSidebar
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/lyb-ai/dev-tookit-registry' }
    ]
  }
})
