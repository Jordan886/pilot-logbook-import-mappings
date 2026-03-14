#!/usr/bin/env node

/**
 * Validates all aircraft mapping files against the JSON Schema,
 * checks for duplicate source_id entries, and verifies sort order.
 *
 * Usage: node scripts/validate.js
 */

import Ajv from "ajv";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

const schema = JSON.parse(
  readFileSync(join(ROOT, "schemas", "aircraft-mapping.schema.json"), "utf-8")
);

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

const SOURCES = ["xplane", "msfs", "flightlogger"];
let hasErrors = false;

for (const source of SOURCES) {
  const filePath = join(ROOT, "mappings", source, "aircraft.json");
  const relPath = relative(ROOT, filePath);

  if (!existsSync(filePath)) {
    console.log(`⏭  ${relPath} — not found, skipping`);
    continue;
  }

  let data;
  try {
    data = JSON.parse(readFileSync(filePath, "utf-8"));
  } catch (e) {
    console.error(`❌ ${relPath} — invalid JSON: ${e.message}`);
    hasErrors = true;
    continue;
  }

  // Validate against schema
  const valid = validate(data);
  if (!valid) {
    console.error(`❌ ${relPath} — schema validation failed:`);
    for (const err of validate.errors) {
      console.error(`   ${err.instancePath} ${err.message}`);
    }
    hasErrors = true;
    continue;
  }

  // Check for duplicate source_ids
  const simIds = data.mappings.map((m) => m.source_id);
  const seen = new Set();
  const duplicates = [];
  for (const id of simIds) {
    if (seen.has(id)) {
      duplicates.push(id);
    }
    seen.add(id);
  }

  if (duplicates.length > 0) {
    console.error(`❌ ${relPath} — duplicate source_id values: ${duplicates.join(", ")}`);
    hasErrors = true;
    continue;
  }

  // Check sort order (case-insensitive by source_id)
  const ids = data.mappings.map((m) => m.source_id);
  const sorted = [...ids].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
  const unsortedIndex = ids.findIndex((id, i) => id !== sorted[i]);
  if (unsortedIndex !== -1) {
    console.error(
      `❌ ${relPath} — entries are not sorted by source_id (first out of order: "${ids[unsortedIndex]}"). Run "npm run sort" to fix.`
    );
    hasErrors = true;
    continue;
  }

  // Check source field matches directory
  if (data.source !== source) {
    console.error(
      `❌ ${relPath} — source field is "${data.source}" but file is in "${source}/" directory`
    );
    hasErrors = true;
    continue;
  }

  console.log(`✅ ${relPath} — ${data.mappings.length} mappings, all valid`);
}

if (hasErrors) {
  console.error("\n❌ Validation failed. Please fix the errors above.");
  process.exit(1);
} else {
  console.log("\n✅ All mapping files are valid.");
  process.exit(0);
}
