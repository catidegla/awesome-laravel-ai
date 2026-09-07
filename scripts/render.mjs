#!/usr/bin/env node
/**
 * Rewrites the generated section of README.md from data/packages.json plus the
 * live figures in data/metrics.json.
 *
 * Everything between the LIST markers is machine-owned. Edit data/packages.json
 * instead, then run this. Prose outside the markers is left alone.
 *
 * Usage:
 *   node scripts/render.mjs           write README.md
 *   node scripts/render.mjs --check   exit 1 if README.md is out of date
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

const START = '<!-- LIST:START -->';
const END = '<!-- LIST:END -->';

const BADGES = {
  official: '`official`',
  popular: '`popular`',
};

/** 34443384 -> 34.4M */
function compact(n) {
  if (n === null || n === undefined) return '?';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

function slug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** Pipes inside a table cell would break the row. */
function cell(text) {
  return text.replace(/\|/g, '\\|');
}

function repoLink(name, metrics) {
  const url = metrics?.repository ?? `https://packagist.org/packages/${name}`;
  return `[${name}](${url})`;
}

function healthNote(m) {
  if (!m) return '';
  if (m.archived) return ' <br>`archived`';
  if (m.abandoned) return ' <br>`abandoned`';
  if (m.stale) return ' <br>`no recent commits`';
  return '';
}

function buildTable(packages, metrics) {
  const rows = packages.map((p) => {
    const m = metrics[p.packagist];
    const badge = p.badge ? ` ${BADGES[p.badge] ?? ''}` : '';
    return `| ${repoLink(p.packagist, m)}${badge}${healthNote(m)} | ${compact(m?.stars)} | ${compact(m?.downloads)} | ${cell(p.summary)} |`;
  });

  return [
    '| Package | Stars | Installs | What it does |',
    '| :--- | ---: | ---: | :--- |',
    ...rows,
  ].join('\n');
}

function buildSection(data, metrics) {
  const out = [];

  // Table of contents.
  out.push('## Contents', '');
  for (const cat of data.categories) {
    const count = data.packages.filter((p) => p.category === cat.id).length;
    if (!count) continue;
    out.push(`- [${cat.title}](#${slug(cat.title)}) <sup>${count}</sup>`);
  }
  out.push('');

  for (const cat of data.categories) {
    const packages = data.packages.filter((p) => p.category === cat.id);
    if (!packages.length) continue;

    // Heaviest first, so the table doubles as a rough recommendation order.
    packages.sort((a, b) => {
      const rank = (p) => (p.badge === 'official' ? 2 : p.badge === 'popular' ? 1 : 0);
      const byBadge = rank(b) - rank(a);
      if (byBadge) return byBadge;
      return (metrics[b.packagist]?.stars ?? 0) - (metrics[a.packagist]?.stars ?? 0);
    });

    out.push(`## ${cat.title}`, '', cat.blurb, '', buildTable(packages, metrics), '');
  }

  return out.join('\n');
}

async function main() {
  const data = JSON.parse(await readFile(join(ROOT, 'data', 'packages.json'), 'utf8'));

  let metrics = { packages: {}, generatedAt: null };
  try {
    metrics = JSON.parse(await readFile(join(ROOT, 'data', 'metrics.json'), 'utf8'));
  } catch {
    console.log('[render] no metrics.json yet, rendering without live figures');
  }

  const readmePath = join(ROOT, 'README.md');
  const current = await readFile(readmePath, 'utf8');

  const startAt = current.indexOf(START);
  const endAt = current.indexOf(END);
  if (startAt === -1 || endAt === -1) {
    throw new Error(`README.md is missing the ${START} / ${END} markers`);
  }

  const stamp = metrics.generatedAt
    ? `_${data.packages.length} packages. Figures refreshed ${metrics.generatedAt.slice(0, 10)}._`
    : `_${data.packages.length} packages._`;

  const body = [START, '', stamp, '', buildSection(data, metrics.packages ?? {}), END].join('\n');
  const next = current.slice(0, startAt) + body + current.slice(endAt + END.length);

  if (CHECK) {
    if (next !== current) {
      console.error('[render] README.md is out of date. Run: node scripts/render.mjs');
      process.exitCode = 1;
    } else {
      console.log('[render] README.md is up to date');
    }
    return;
  }

  await writeFile(readmePath, next);
  console.log(`[render] README.md updated with ${data.packages.length} packages`);
}

main().catch((error) => {
  console.error('[render] fatal:', error);
  process.exitCode = 1;
});
