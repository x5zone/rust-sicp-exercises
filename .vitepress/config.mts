import { defineConfig } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3'

export default defineConfig({
  base: '/rust-sicp-exercises/', // 对应你的新项目名
  title: "SICP in Rust",
  description: "Exercises from the wizard book implemented in Rust",
  markdown: {
    config: (md) => {
      md.use(mathjax3)
    }
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'GitHub', link: 'https://github.com/x5zone/rust-sicp-exercises' }
    ],
    sidebar: [
      {
        text: '第一章：构造抽象',
        items: [
          // 这里的 link 对应你实际的 .md 文件路径，不带后缀
          { text: '练习 1.1', link: '/exercises/1.1' }, 
          { text: '练习 1.2', link: '/exercises/1.2' }
        ]
      }
    ]
  }
})