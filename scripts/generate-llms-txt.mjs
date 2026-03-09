/**
 * Generate llms.txt — a single LLM-friendly markdown file with all projects.
 *
 * Reads Astro page files, extracts project data via regex parsing,
 * and generates a flat markdown file any AI agent can fetch.
 *
 * Run: node scripts/generate-llms-txt.mjs
 * Output: public/llms.txt
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const categories = [
  {
    file: 'src/pages/ai-agents.astro',
    title: 'AI Agents & Frameworks',
    description: 'Frameworks, tools, and infrastructure for building, deploying, and orchestrating AI agents.',
  },
  {
    file: 'src/pages/cli-tools.astro',
    title: 'CLI Tools',
    description: 'Command-line utilities, headless browsers, sandboxed execution, and terminal tools.',
  },
  {
    file: 'src/pages/developer-tools.astro',
    title: 'Developer Tools',
    description: 'Package managers, AI code assistants, build systems, runtime managers, and dev workflow tools.',
  },
  {
    file: 'src/pages/open-source-infra.astro',
    title: 'Open Source Infrastructure',
    description: 'Networking, alternative platforms, and foundational open source software.',
  },
];

/**
 * Parse project objects from Astro frontmatter using regex.
 */
function extractProjects(filePath) {
  const content = readFileSync(join(root, filePath), 'utf-8');
  const frontmatterMatch = content.match(/---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return [];

  const fm = frontmatterMatch[1];
  const projects = [];

  // Match each object block in the projects array
  const blockRegex = /\{\s*\n\s*name:\s*"([^"]*)",\s*\n\s*url:\s*"([^"]*)",\s*\n\s*description:\s*"([^"]*)",\s*\n\s*discovered:\s*"([^"]*)",\s*\n\s*signal:\s*"([^"]*)",\s*\n\s*signalLevel:\s*"([^"]*)"[^}]*?\}/g;

  let match;
  while ((match = blockRegex.exec(fm)) !== null) {
    const project = {
      name: match[1],
      url: match[2],
      description: match[3],
      discovered: match[4],
      signal: match[5],
      signalLevel: match[6],
      tags: [],
    };

    // Extract tags from the same block
    const tagsMatch = match[0].match(/tags:\s*\[([^\]]*)\]/);
    if (tagsMatch && tagsMatch[1].trim()) {
      project.tags = tagsMatch[1].match(/"([^"]*)"/g)?.map(t => t.replace(/"/g, '')) || [];
    }

    projects.push(project);
  }

  return projects;
}

function signalEmoji(level) {
  return { hot: '🔥', rising: '⚡', early: '🌱' }[level] || '🌱';
}

const now = new Date().toISOString().split('T')[0];
let totalProjects = 0;
let md = '';

md += `# Awesome Emerging — LLM-Ready Catalog\n\n`;
md += `> A curated list of emerging open source projects that actually matter.\n`;
md += `> Signal-filtered, momentum-tracked, community-curated.\n\n`;
md += `**Last updated**: ${now}\n`;
md += `**Website**: https://tidoemanuele.github.io/awesome-emerging/\n`;
md += `**GitHub**: https://github.com/tidoemanuele/awesome-emerging\n\n`;
md += `---\n\n`;
md += `## Signal Legend\n\n`;
md += `| Rating | Meaning | Threshold |\n`;
md += `|--------|---------|----------|\n`;
md += `| 🔥 Hot | Massive community attention | >500 HN points or >10k GitHub stars |\n`;
md += `| ⚡ Rising | Clear upward trajectory | >100 HN points or >1k GitHub stars |\n`;
md += `| 🌱 Early | Promising but nascent | Growing interest |\n\n`;
md += `---\n\n`;

for (const cat of categories) {
  const projects = extractProjects(cat.file);
  totalProjects += projects.length;

  md += `## ${cat.title}\n\n`;
  md += `${cat.description}\n\n`;
  md += `**${projects.length} projects**\n\n`;

  for (const p of projects) {
    const emoji = signalEmoji(p.signalLevel);
    md += `### ${emoji} [${p.name}](${p.url})\n\n`;
    md += `${p.description}\n\n`;
    md += `- **Discovered**: ${p.discovered}\n`;
    md += `- **Signal**: ${emoji} ${p.signal}\n`;
    if (p.tags && p.tags.length > 0) {
      md += `- **Tags**: ${p.tags.map(t => `\`${t}\``).join(' ')}\n`;
    }
    md += `\n`;
  }

  md += `---\n\n`;
}

md += `## Summary\n\n`;
md += `**Total projects**: ${totalProjects}\n`;
md += `**Categories**: ${categories.length}\n`;
md += `**Updated**: ${now}\n\n`;
md += `---\n\n`;
md += `*This file is auto-generated from the Awesome Emerging catalog. `;
md += `Fetch it at: \`https://tidoemanuele.github.io/awesome-emerging/llms.txt\`*\n`;

writeFileSync(join(root, 'public', 'llms.txt'), md, 'utf-8');

console.log(`Generated llms.txt — ${totalProjects} projects across ${categories.length} categories`);
