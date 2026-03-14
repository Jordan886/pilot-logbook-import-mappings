#!/usr/bin/env node

/**
 * Sorts all aircraft mapping files by source_id (case-insensitive).
 *
 * Usage: node scripts/sort.js
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

const SOURCES = ["xplane", "msfs", "flightlogger"];

for (const source of SOURCES) {
  const filePath = join(ROOT, "mappings", source, "aircraft.json");
  const relPath = relative(ROOT, filePath);

  if (!existsSync(filePath)) {
    console.log(`⏭  ${relPath} — not found, skipping`);
    continue;
  }

  const data = JSON.parse(readFileSync(filePath, "utf-8"));

  const before = data.mappings.map((m) => m.source_id);
  data.mappings.sort((a, b) =>
    a.source_id.localeCompare(b.source_id, undefined, { sensitivity: "base" })
  );
  const after = data.mappings.map((m) => m.source_id);

  const changed = before.some((id, i) => id !== after[i]);
  if (changed) {
    writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
    console.log(`✅ ${relPath} — sorted ${data.mappings.length} entries`);
  } else {
    console.log(`✅ ${relPath} — already sorted`);
  }
}
