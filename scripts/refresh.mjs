#!/usr/bin/env node
/**
 * Pulls live metrics for every entry in data/packages.json and writes data/metrics.json.
 *
 * Packagist gives us install counts and the canonical repository URL.
 * GitHub gives us stars, last push date and archive status, fetched in a single
 * GraphQL call so we stay well inside the rate limit.
 *
 * A single dropped request should not fail the daily run. Packagist lookups are
 * retried, and the two failure modes are kept apart: a 404 or 410 means the
 * package is genuinely gone or renamed and still fails the build, because that
 * is the signal this script exists to surface. A dropped socket, a 5xx or a 429
 * is noise about the network, not the package, so after retries it falls back to
 * the figures from the last run and only warns.
 *
 * Usage:
 *   node scripts/refresh.mjs            fail if a package is unresolvable (404/410)
 *   node scripts/refresh.mjs --lenient  warn instead of failing on those too
 *
 * Set GITHUB_TOKEN to raise the GitHub rate limit. Without it the GraphQL call
 * is skipped and only Packagist data is written.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LENIENT = process.argv.includes('--lenient');

const PACKAGIST_CONCURRENCY = 6;
const PACKAGIST_ATTEMPTS = 3;
const RETRY_BASE_MS = 500;
const STALE_AFTER_DAYS = 365;

function log(...args) {
  console.log('[refresh]', ...args);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** A 404 or 410 is a real verdict about the package. Anything else is noise. */
function isPermanentStatus(status) {
  return status === 404 || status === 410;
}

async function getJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'user-agent': 'awesome-laravel-ai-refresh',
      accept: 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = new Error(`${res.status} ${res.statusText} for ${url}`);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

/** Run tasks with a fixed worker pool so we do not hammer Packagist. */
async function pool(items, size, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

function parseGitHubRepo(repositoryUrl) {
  if (!repositoryUrl) return null;
  const match = repositoryUrl.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?\/?$/i);
  return match ? { owner: match[1], name: match[2] } : null;
}

async function fetchPackagist(name) {
  let lastError;

  for (let attempt = 1; attempt <= PACKAGIST_ATTEMPTS; attempt++) {
    try {
      const { package: pkg } = await getJson(`https://packagist.org/packages/${name}.json`);
      return {
        name,
        ok: true,
        description: pkg.description ?? '',
        downloads: pkg.downloads?.total ?? 0,
        downloadsMonthly: pkg.downloads?.monthly ?? 0,
        favers: pkg.favers ?? 0,
        repository: pkg.repository ?? null,
        abandoned: pkg.abandoned ?? false,
        github: parseGitHubRepo(pkg.repository),
      };
    } catch (error) {
      lastError = error;

      // Gone or renamed. Retrying cannot change the answer, and softening it
      // would hide the one thing a maintainer needs to act on.
      if (isPermanentStatus(error.status)) {
        return { name, ok: false, transient: false, error: error.message };
      }

      if (attempt < PACKAGIST_ATTEMPTS) await sleep(RETRY_BASE_MS * attempt);
    }
  }

  // Out of retries on a transient error. Caller keeps the last known figures.
  return { name, ok: false, transient: true, error: lastError?.message ?? 'unknown error' };
}

/** One GraphQL request covering every repo, aliased by index. */
async function fetchGitHub(targets, token) {
  if (!targets.length) return {};

  const fields = 'stargazerCount pushedAt isArchived licenseInfo { spdxId }';
  const selections = targets
    .map((t, i) => `r${i}: repository(owner: ${JSON.stringify(t.owner)}, name: ${JSON.stringify(t.name)}) { ${fields} }`)
    .join('\n');

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      authorization: `bearer ${token}`,
      'content-type': 'application/json',
      'user-agent': 'awesome-laravel-ai-refresh',
    },
    body: JSON.stringify({ query: `query { ${selections} }` }),
  });

  if (!res.ok) {
    throw new Error(`GitHub GraphQL responded ${res.status} ${res.statusText}`);
  }

  const body = await res.json();
  // Missing or renamed repos come back as null entries alongside an errors array.
  // That is expected and non-fatal, so we log and carry on.
  if (body.errors?.length) {
    for (const err of body.errors) log('github:', err.message);
  }

  const out = {};
  targets.forEach((t, i) => {
    const node = body.data?.[`r${i}`];
    if (node) {
      out[t.key] = {
        stars: node.stargazerCount,
        pushedAt: node.pushedAt,
        archived: node.isArchived,
        license: node.licenseInfo?.spdxId ?? null,
      };
    }
  });
  return out;
}

/** The GitHub-derived half of a stored metrics entry, for fallback. */
function priorGitHub(entry) {
  if (!entry) return null;
  return {
    stars: entry.stars ?? null,
    pushedAt: entry.pushedAt ?? null,
    archived: entry.archived ?? false,
    license: entry.license ?? null,
  };
}

async function readPriorMetrics() {
  try {
    const prev = JSON.parse(await readFile(join(ROOT, 'data', 'metrics.json'), 'utf8'));
    return prev.packages ?? {};
  } catch {
    return {};
  }
}

function daysSince(iso) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

async function main() {
  const data = JSON.parse(await readFile(join(ROOT, 'data', 'packages.json'), 'utf8'));
  const prior = await readPriorMetrics();
  const names = data.packages.map((p) => p.packagist);
  log(`resolving ${names.length} packages on Packagist`);

  const packagist = await pool(names, PACKAGIST_CONCURRENCY, fetchPackagist);

  const unresolved = packagist.filter((p) => !p.ok && !p.transient);
  const transient = packagist.filter((p) => !p.ok && p.transient);

  for (const f of unresolved) log(`could not resolve ${f.name}: ${f.error}`);
  for (const f of transient) log(`transient error for ${f.name}, keeping last known data: ${f.error}`);

  const token = process.env.GITHUB_TOKEN;
  let github = {};
  let githubAttempted = false;
  let githubOk = false;
  if (token) {
    githubAttempted = true;
    const targets = packagist
      .filter((p) => p.ok && p.github)
      .map((p) => ({ ...p.github, key: p.name }));
    log(`querying GitHub for ${targets.length} repositories`);
    try {
      github = await fetchGitHub(targets, token);
      githubOk = true;
    } catch (error) {
      log(`GitHub lookup failed, keeping last known stars: ${error.message}`);
    }
  } else {
    log('no GITHUB_TOKEN set, skipping star counts');
  }

  const metrics = {};
  const warnings = [];

  for (const p of packagist) {
    if (!p.ok) {
      // A transient failure keeps its last good row so the table does not blank
      // out and the gate does not trip. A permanent one is dropped on purpose.
      if (p.transient && prior[p.name]) {
        metrics[p.name] = prior[p.name];
        warnings.push(`${p.name} could not be refreshed this run, showing last known figures`);
      }
      continue;
    }

    // No fresh node. Reuse the last known stars only when a GraphQL call was
    // made and failed, so one bad request does not blank every row. When the
    // call worked and this repo was simply absent, or when there was no token
    // and we skipped GitHub on purpose, leave it empty rather than show stale.
    let gh = github[p.name];
    if (!gh) gh = (githubAttempted && !githubOk) ? (priorGitHub(prior[p.name]) ?? {}) : {};

    const idle = daysSince(gh.pushedAt);

    metrics[p.name] = {
      downloads: p.downloads,
      downloadsMonthly: p.downloadsMonthly,
      favers: p.favers,
      repository: p.repository,
      stars: gh.stars ?? null,
      pushedAt: gh.pushedAt ?? null,
      license: gh.license ?? null,
      archived: Boolean(gh.archived),
      abandoned: Boolean(p.abandoned),
      stale: idle !== null && idle > STALE_AFTER_DAYS,
    };

    if (p.abandoned) warnings.push(`${p.name} is marked abandoned on Packagist`);
    if (gh.archived) warnings.push(`${p.name} is archived on GitHub`);
    if (idle !== null && idle > STALE_AFTER_DAYS) {
      warnings.push(`${p.name} has had no commits in ${idle} days`);
    }
  }

  const output = {
    generatedAt: new Date().toISOString(),
    resolved: packagist.filter((p) => p.ok).length,
    unresolved: unresolved.map((f) => f.name),
    transient: transient.map((f) => f.name),
    warnings,
    packages: metrics,
  };

  await writeFile(join(ROOT, 'data', 'metrics.json'), `${JSON.stringify(output, null, 2)}\n`);
  log(
    `wrote data/metrics.json (${output.resolved} resolved, ` +
      `${unresolved.length} unresolved, ${transient.length} carried forward)`,
  );

  for (const w of warnings) log(`warning: ${w}`);

  if (unresolved.length && !LENIENT) {
    log('run with --lenient to ignore unresolved packages');
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('[refresh] fatal:', error);
  process.exitCode = 1;
});
