// Removes pages marked `dev_only: true` in their frontmatter, so they exist locally but never reach
// the live site. It only runs on Netlify (which sets NETLIFY=true), where the checkout is thrown
// away after the build, so a local `npm run build` never deletes your files.
//
// If the removed page is the home page (pages/index.md), the site's address would have nothing to
// show, so a small page is written in its place that sends visitors on to HOME_REDIRECT.
import { readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const HOME_REDIRECT = '/ag-data/market-trends/'

if (process.env.NETLIFY !== 'true') {
  console.log('drop-dev-pages: not a Netlify build, leaving dev_only pages in place')
  process.exit(0)
}

const dir = 'pages'
for (const name of readdirSync(dir)) {
  if (!name.endsWith('.md')) continue
  const file = join(dir, name)
  const front = /^---\n([\s\S]*?)\n---/.exec(readFileSync(file, 'utf8'))
  if (!front || !/^dev_only:\s*true\s*$/m.test(front[1])) continue
  unlinkSync(file)
  console.log(`drop-dev-pages: removed ${file}`)
  if (name === 'index.md') {
    // The query is there because Evidence only writes a data file for a page that has one, and a page
    // without it fails to start. components/Redirect.svelte writes the redirect into the page's head.
    writeFileSync(file, `---
title: Home
sidebar_link: false
---

<Redirect to="${HOME_REDIRECT}" />

Taking you to [Market Trends](${HOME_REDIRECT}).

\`\`\`sql nothing
select 1 as nothing
\`\`\`
`)
    console.log(`drop-dev-pages: wrote a home page that redirects to ${HOME_REDIRECT}`)
  }
}
