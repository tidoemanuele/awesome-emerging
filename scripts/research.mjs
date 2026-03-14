#!/usr/bin/env node
// Research scraper using Lightpanda CDP — fetches HN, GitHub Trending, Lobsters
// Usage: Start lightpanda serve first, then: node scripts/research.mjs

import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'fs';

const BROWSER_WS = process.env.BROWSER_ADDRESS ?? 'ws://127.0.0.1:9222';
const TODAY = new Date().toISOString().slice(0, 10);

const SOURCES = [
  // --- News aggregators ---
  {
    name: 'Hacker News Front Page',
    url: `https://news.ycombinator.com/front?day=${TODAY}`,
  },
  {
    name: 'HN Show',
    url: 'https://news.ycombinator.com/show',
  },
  {
    name: 'Lobsters',
    url: 'https://lobste.rs/',
  },
  {
    name: 'Tildes ~comp',
    url: 'https://tildes.net/~comp',
  },
  // --- Repo discovery ---
  {
    name: 'GitHub Trending (Today)',
    url: 'https://github.com/trending',
  },
  {
    name: 'Trendshift',
    url: 'https://trendshift.io/',
  },
  // --- Community signals ---
  {
    name: 'Reddit r/LocalLLaMA',
    url: 'https://old.reddit.com/r/LocalLLaMA/hot/',
  },
  {
    name: 'ArXiv cs.AI Recent',
    url: 'https://arxiv.org/list/cs.AI/recent',
  },
];

async function scrapeToMarkdown(browser, source) {
  const start = performance.now();
  const context = await browser.createBrowserContext();
  const page = await context.newPage();

  try {
    const client = page._client();

    // Block heavy resources for speed
    await page.setRequestInterception(true);
    page.on('request', req => {
      if (req.isInterceptResolutionHandled()) return;
      const type = req.resourceType();
      if (['image', 'font', 'stylesheet', 'media'].includes(type)) {
        return req.abort();
      }
      req.continue();
    });

    await page.goto(source.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    // Brief settle for JS-rendered content
    await new Promise(r => setTimeout(r, 2000));

    // Use Lightpanda's native LP.getMarkdown CDP command
    const { markdown } = await client.send('LP.getMarkdown', {});
    const title = await page.title();
    const elapsed = ((performance.now() - start) / 1000).toFixed(2);

    return {
      name: source.name,
      url: source.url,
      title,
      markdown,
      elapsed: `${elapsed}s`,
    };
  } catch (err) {
    const elapsed = ((performance.now() - start) / 1000).toFixed(2);
    return {
      name: source.name,
      url: source.url,
      title: 'ERROR',
      markdown: `Error: ${err.message}`,
      elapsed: `${elapsed}s`,
    };
  } finally {
    try { await page.close(); } catch {}
    try { await context.close(); } catch {}
  }
}

async function main() {
  console.log(`Research scraper — ${TODAY}`);
  console.log(`Connecting to Lightpanda CDP at ${BROWSER_WS}...\n`);

  const browser = await puppeteer.connect({ browserWSEndpoint: BROWSER_WS });
  const results = [];

  for (const source of SOURCES) {
    process.stdout.write(`  Scraping ${source.name}...`);
    const result = await scrapeToMarkdown(browser, source);
    console.log(` done (${result.elapsed})`);
    results.push(result);
  }

  await browser.disconnect();

  // Build combined output
  const output = results.map(r =>
    `# ${r.name}\n> Source: ${r.url}\n> Fetched in ${r.elapsed}\n\n${r.markdown}`
  ).join('\n\n---\n\n');

  const outPath = `scripts/research-${TODAY}.md`;
  writeFileSync(outPath, output, 'utf-8');

  console.log(`\nDone! ${results.length} sources scraped.`);
  console.log(`Output: ${outPath}`);
  console.log(`\nTimings:`);
  for (const r of results) {
    console.log(`  ${r.name}: ${r.elapsed}`);
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
