import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const SOURCE = join(ROOT, 'src', 'data', 'prompts.json');
const ENV_FILE = join(ROOT, '.env.production');
const OUTPUT_DIR = join(ROOT, 'dist');
const OUTPUT = join(OUTPUT_DIR, 'sitemap.xml');

const STATIC_ROUTES = ['/', '/explore', '/pricing'];

const DEFAULT_ORIGIN = 'https://prompt-generator-ratul.surge.sh';

function loadEnvValue(key) {
  if (process.env[key] && process.env[key].trim() !== '') {
    return process.env[key].trim();
  }

  try {
    const content = readFileSync(ENV_FILE, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const k = trimmed.slice(0, eqIndex).trim();
      if (k === key) {
        return trimmed.slice(eqIndex + 1).trim();
      }
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function normalizeOrigin(origin) {
  if (!origin) return DEFAULT_ORIGIN;
  try {
    return new URL(origin).origin;
  } catch {
    return origin.replace(/\/+$/, '');
  }
}

function xmlEscape(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildUrlEntry(loc) {
  return `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n  </url>`;
}

function extractSlugsFromApi(data) {
  if (!data || !Array.isArray(data)) return [];
  const slugs = new Set();
  for (const record of data) {
    if (record === null || record === undefined || typeof record !== 'object' || Array.isArray(record)) continue;
    const slug = record.slug;
    if (slug === undefined || slug === null) continue;
    const slugStr = String(slug).trim();
    if (slugStr === '') continue;
    slugs.add(slugStr);
  }
  return [...slugs];
}

function extractSlugsFromJson(prompts) {
  if (!Array.isArray(prompts)) {
    throw new Error('Invalid prompts data: prompts.json must contain a JSON array of prompt records.');
  }

  const slugs = new Set();
  for (const record of prompts) {
    if (record === null || record === undefined || typeof record !== 'object' || Array.isArray(record)) {
      throw new Error('Invalid prompts data: each prompt record must be a non-null object.');
    }

    const slug = record.slug;
    if (slug === undefined || slug === null) {
      throw new Error('Invalid prompts data: each prompt record must define a required "slug" field.');
    }

    const slugStr = String(slug).trim();
    if (slugStr === '') {
      throw new Error('Invalid prompts data: each prompt record must have a non-empty "slug" value.');
    }

    slugs.add(slugStr);
  }
  return [...slugs];
}

async function fetchWithRetry(url, { retries = 2, delayMs = 1000, timeoutMs = 10000 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      return response;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

try {
  const apiBaseUrl = loadEnvValue('VITE_API_BASE_URL');
  const siteOrigin = normalizeOrigin(loadEnvValue('VITE_SITE_URL'));

  let slugs = [];
  let usedFallback = false;

  if (apiBaseUrl) {
    try {
      const apiUrl = `${apiBaseUrl.replace(/\/+$/, '')}/prompts`;
      const response = await fetchWithRetry(apiUrl, { retries: 2, delayMs: 1000, timeoutMs: 10000 });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const body = await response.json();

      if (body.success !== true) {
        throw new Error('API response "success" is not true');
      }

      if (!Array.isArray(body.data)) {
        throw new Error('API response "data" is not an array');
      }

      slugs = extractSlugsFromApi(body.data);
      console.log(`Sitemap: Fetched ${slugs.length} style slugs from production API.`);
    } catch (err) {
      console.warn(
        `WARNING: Production API unavailable (${err.message}). Sitemap generated from local prompts.json fallback. Database-only Styles may be missing.`
      );
      usedFallback = true;
    }
  }

  if (usedFallback || slugs.length === 0) {
    let raw;
    try {
      raw = readFileSync(SOURCE, 'utf8');
    } catch (err) {
      throw new Error(`Failed to read prompts data source: ${err.message}`);
    }

    let prompts;
    try {
      prompts = JSON.parse(raw);
    } catch (err) {
      throw new Error(`Failed to parse prompts.json (malformed JSON): ${err.message}`);
    }

    slugs = extractSlugsFromJson(prompts);

    if (usedFallback) {
      console.log(`Sitemap: Using ${slugs.length} style slugs from local prompts.json fallback.`);
    }
  }

  if (slugs.length === 0) {
    throw new Error('No valid style slugs found from any data source.');
  }

  const urls = new Set();

  for (const route of STATIC_ROUTES) {
    urls.add(`${siteOrigin}${route}`);
  }

  for (const slug of slugs) {
    const encodedSlug = encodeURIComponent(slug);
    urls.add(`${siteOrigin}/styles/${encodedSlug}`);
  }

  const sortedUrls = [...urls].sort();

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sortedUrls.map(buildUrlEntry),
    '</urlset>',
    '',
  ].join('\n');

  writeFileSync(OUTPUT, xml, 'utf8');

  console.log(`Sitemap generated: ${OUTPUT}`);
  console.log(`Total URLs: ${sortedUrls.length}`);
} catch (err) {
  console.error(`Sitemap generation failed: ${err.message}`);
  process.exitCode = 1;
}
