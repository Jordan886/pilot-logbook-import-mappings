# Contributing to Pilot Logbook Import Mappings

Thank you for helping fellow pilots get their flight hours imported correctly! This project relies on the community to keep up with the ever-growing ecosystem of flight simulator addons.

## What You Can Contribute

### 1. Aircraft Mappings (Most Common)

If you fly an addon aircraft that isn't recognized during import, you can add a mapping entry. This is the most common and valuable contribution — no coding required.

### 2. Parser Improvements

If you find a bug in how a logbook file is parsed (wrong column, missed edge case), you can fix or improve the parser logic in `parsers/`.

### 3. Test Fixtures

Sample logbook snippets (anonymized) help us catch regressions. Drop them in `tests/fixtures/`.

---

## Adding an Aircraft Mapping

This is the simplest way to contribute. You're adding a single JSON entry that tells the importer: "When the simulator says `X`, that means ICAO type `Y`."

### Step 1: Find the `source_id`

The `source_id` is the exact string the simulator uses to identify the aircraft in its logbook file.

**X-Plane:** Open your `X-Plane Pilot.txt` file (found in `Output/logbooks/`). Look at the aircraft column — it's typically the aircraft folder name (e.g. `Cessna_172SP`, `a321`, `FF_A320U`).

**MSFS:** Export your logbook to CSV using a tool like [MSFS Flight Logger](https://github.com/) or [FlightRecorder](https://github.com/). The `AircraftTitle` column contains the source_id (e.g. `PMDG 737-800`, `Fenix A320 CEO`).

**FlightLogger:** Export your logbook. The aircraft type column contains the source_id.

### Step 2: Find the ICAO type designator

Look up the real-world ICAO type code for the aircraft. Common references:

- [ICAO Aircraft Type Designators (Doc 8643)](https://www.icao.int/publications/doc8643/Pages/Search.aspx)
- [Wikipedia list](https://en.wikipedia.org/wiki/List_of_ICAO_aircraft_type_designators)

Common examples: `C172` (Cessna 172), `B738` (Boeing 737-800), `A320` (Airbus A320), `A20N` (A320neo).

### Step 3: Add the entry

Open the appropriate mapping file:

- `mappings/xplane/aircraft.json` for X-Plane
- `mappings/msfs/aircraft.json` for MSFS
- `mappings/flightlogger/aircraft.json` for FlightLogger

Add your entry to the `mappings` array:

```json
{
  "source_id": "PMDG 737-900ER",
  "icao_type": "B739",
  "display_name": "Boeing 737-900ER",
  "addon_vendor": "PMDG",
  "tags": ["addon", "payware"]
}
```

**Required fields:** `source_id` and `icao_type`.

**Optional fields:**

| Field          | Description                                       |
| -------------- | ------------------------------------------------- |
| `display_name` | Human-friendly name (e.g. "Boeing 737-900ER")     |
| `addon_vendor` | Developer name (e.g. "PMDG", "Fenix", "ToLiss")   |
| `tags`         | Array from: `stock`, `addon`, `freeware`, `payware`, `military`, `helicopter`, `glider`, `experimental` |
| `notes`        | Version-specific caveats or other context          |

### Step 4: Validate

Run the validation script to make sure your JSON is valid against the schema:

```bash
npm test
```

### Step 5: Submit a PR

1. Fork the repo
2. Create a branch: `git checkout -b add-pmdg-739`
3. Add your mapping entry
4. Run `npm test` to validate
5. Commit: `git commit -m "feat(msfs): add PMDG 737-900ER mapping"`
6. Push and open a Pull Request

---

## Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(xplane): add ToLiss A340 mapping
feat(msfs): add Fenix A319 mapping
fix(xplane): correct Rotate MD-80 ICAO type
fix(parser): handle empty tail number in X-Plane logbook
docs: update CONTRIBUTING with MSFS export instructions
test: add fixture for X-Plane 12 logbook format
```

The scope should be the source: `xplane`, `msfs`, `flightlogger`, `parser`, or `schema`.

---

## Improving Parsers

Parsers live in `parsers/` and are written in TypeScript. They are pure functions: input is the raw logbook text, output is a structured array of flight entries.

If you want to improve a parser:

1. Add a test fixture in `tests/fixtures/<source>/` with a minimal, anonymized snippet that demonstrates the issue.
2. Write or update the corresponding test.
3. Fix the parser.
4. Make sure all existing tests still pass: `npm test`

---

## Guidelines

- **`source_id` must be exact.** Copy-paste from the actual logbook file. Casing and spacing matter.
- **One entry per addon variant.** If an addon ships multiple liveries with different logbook strings, each needs its own entry.
- **Don't guess ICAO codes.** Look them up. A wrong ICAO type is worse than a missing mapping (users get a clear "unmapped aircraft" prompt for missing ones).
- **Keep it alphabetical** within each mapping file, grouped by vendor when practical.
- **Anonymize test fixtures.** Strip or replace any personal information (pilot name, real tail numbers) from sample logbook files.
- **Don't modify `schema_version`.** That's managed by the maintainer.

---

## Schema Version

The mapping files include a `schema_version` field (currently `1`). If you need to propose a structural change to the mapping format, open an issue first to discuss it. Schema changes are breaking and need to be coordinated with the consuming application.

---

## Questions?

Open an issue. There are no dumb questions — if you weren't sure how to find your `source_id`, chances are someone else isn't either, and we can improve these docs.
