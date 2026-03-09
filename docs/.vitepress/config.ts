import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Awesome Emerging',
  description: 'A curated list of emerging open source projects that actually matter',
  base: '/awesome-emerging/',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/awesome-emerging/logo.svg' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Awesome Emerging' }],
    ['meta', { property: 'og:description', content: 'A curated list of emerging open source projects that actually matter' }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Categories', items: [
        { text: 'AI Agents & Frameworks', link: '/ai-agents' },
        { text: 'CLI Tools', link: '/cli-tools' },
        { text: 'Developer Tools', link: '/developer-tools' },
        { text: 'Open Source Infrastructure', link: '/open-source-infra' },
      ]},
      { text: 'About', link: '/about' },
    ],
    sidebar: [
      {
        text: 'Categories',
        items: [
          { text: 'AI Agents & Frameworks', link: '/ai-agents' },
          { text: 'CLI Tools', link: '/cli-tools' },
          { text: 'Developer Tools', link: '/developer-tools' },
          { text: 'Open Source Infrastructure', link: '/open-source-infra' },
        ]
      },
      {
        text: 'Info',
        items: [
          { text: 'About', link: '/about' },
          { text: 'Contributing', link: '/contributing' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/tidoemanuele/awesome-emerging' }
    ],
    search: {
      provider: 'local'
    },
    editLink: {
      pattern: 'https://github.com/tidoemanuele/awesome-emerging/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },
    footer: {
      message: 'Curated with care. Signal over noise.',
      copyright: 'MIT License'
    }
  }
})
