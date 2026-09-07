#!/usr/bin/env node
/**
 * Structural checks on data/packages.json. Runs on every pull request, before
 * anything touches the network, so a malformed entry fails fast and cheaply.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const NAME_PATTERN = /^[a-z0-9]([_.-]?[a-z0-9]+)*\/[a-z0-9]([_.-]?[a-z0-9]+)*$/;
const SUMMARY_MIN = 20;
const SUMMARY_MAX = 240;
const EM_DASH = '—';

const errors = [];
const fail = (msg) => errors.push(msg);

const data = JSON.parse(await readFile(join(ROOT, 'data', 'packages.json'), 'utf8'));

if (!Array.isArray(data.categories) || !data.categories.length) {
  fail('categories must be a non-empty array');
}
if (!Array.isArray(data.packages) || !data.packages.length) {
  fail('packages must be a non-empty array');
}

const categoryIds = new Set();
for (const cat of data.categories ?? []) {
  for (const field of ['id', 'title', 'blurb']) {
    if (!cat[field]) fail(`category ${cat.id ?? '(no id)'} is missing "${field}"`);
  }
  if (categoryIds.has(cat.id)) fail(`duplicate category id: ${cat.id}`);
  categoryIds.add(cat.id);
}

const seen = new Set();
for (const pkg of data.packages ?? []) {
  const id = pkg.packagist ?? '(no packagist field)';

  if (!pkg.packagist) {
    fail('an entry is missing "packagist"');
  } else if (!NAME_PATTERN.test(pkg.packagist)) {
    fail(`${id} is not a valid vendor/package name`);
  }

  if (seen.has(pkg.packagist)) fail(`duplicate entry: ${id}`);
  seen.add(pkg.packagist);

  if (!categoryIds.has(pkg.category)) {
    fail(`${id} points at unknown category "${pkg.category}"`);
  }

  const summary = pkg.summary ?? '';
  if (!summary) {
    fail(`${id} is missing "summary"`);
  } else {
    if (summary.length < SUMMARY_MIN) fail(`${id} summary is too short, write a real sentence`);
    if (summary.length > SUMMARY_MAX) fail(`${id} summary is over ${SUMMARY_MAX} characters`);
    if (!/[.!?]$/.test(summary.trim())) fail(`${id} summary should end with a full stop`);
    if (summary.includes(EM_DASH)) fail(`${id} summary contains an em dash, use a comma or a full stop`);
  }

  if (pkg.badge && !['official', 'popular'].includes(pkg.badge)) {
    fail(`${id} has unknown badge "${pkg.badge}"`);
  }

  const allowed = new Set(['packagist', 'category', 'summary', 'badge']);
  for (const key of Object.keys(pkg)) {
    if (!allowed.has(key)) fail(`${id} has unexpected field "${key}"`);
  }
}

const empty = [...categoryIds].filter((id) => !data.packages.some((p) => p.category === id));
for (const id of empty) fail(`category "${id}" has no packages`);

if (errors.length) {
  console.error(`[validate] ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`[validate] ok: ${data.packages.length} packages across ${categoryIds.size} categories`);
