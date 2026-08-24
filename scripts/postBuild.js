#!/usr/bin/env node

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')
const DIST_ASSETS = join(ROOT, 'dist', 'assets')
const CONFIG_PATH = join(ROOT, 'powerpages.config.json')

// Matches Vite-style hashed bundles like About-ABC123.js or index-XYZ987.css
const HASHED_BUNDLE_PATTERN = /^(.+)-[A-Za-z0-9_-]{6,}\.(js|css)$/

function sortedUnique(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

try {
  const files = readdirSync(DIST_ASSETS)
  const patterns = []

  for (const fileName of files) {
    const match = fileName.match(HASHED_BUNDLE_PATTERN)
    if (!match) continue

    const [, baseName, ext] = match
    patterns.push(`${baseName}-*.${ext}`)
  }

  const nextPatterns = sortedUnique(patterns)
  if (nextPatterns.length === 0) {
    console.log('No hashed JS/CSS bundles found. Skipping bundleFilePatterns update.')
    process.exit(0)
  }

  const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))
  const prevPatterns = Array.isArray(config.bundleFilePatterns) ? sortedUnique(config.bundleFilePatterns) : []

  const changed =
    prevPatterns.length !== nextPatterns.length ||
    nextPatterns.some((pattern, idx) => pattern !== prevPatterns[idx])

  if (!changed) {
    console.log(`bundleFilePatterns already up to date (${nextPatterns.length} patterns).`)
    process.exit(0)
  }

  config.bundleFilePatterns = nextPatterns
  writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, 'utf8')

  console.log(`Updated bundleFilePatterns (${nextPatterns.length}):`)
  for (const pattern of nextPatterns) {
    console.log(`- ${pattern}`)
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`postbuild failed: ${message}`)
  process.exit(1)
}
