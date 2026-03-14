# Pilot Logbook Import Mappings

Community-maintained aircraft mappings and logbook parsers for flight simulator import.

This repository powers the import feature of [Your App Name], mapping simulator-specific aircraft identifiers to standardized [ICAO type designators](https://www.icao.int/publications/doc8643/Pages/Search.aspx). Because the flight sim addon ecosystem is massive and constantly evolving, we rely on the community to keep mappings up to date.

## Supported Sources

| Source        | Format                        | Status    |
| ------------- | ----------------------------- | --------- |
| X-Plane 11/12 | `X-Plane Pilot.txt`          | Supported |
| MSFS 2020/2024 | CSV export (via third-party) | Supported |
| FlightLogger  | CSV/JSON export               | Supported |

## How It Works

When you import a logbook, the importer:

1. **Parses** the raw file using the appropriate parser in `parsers/`
2. **Looks up** each aircraft string against the mapping file in `mappings/<source>/aircraft.json`
3. **Resolves** to an ICAO type designator used by the app's aircraft reference database
4. If no mapping is found, the flight is flagged for manual aircraft assignment

## Repository Structure

```
pilotlog-import-mappings/
├── mappings/
│   ├── xplane/
│   │   └── aircraft.json        # X-Plane source_id → ICAO type
│   ├── msfs/
│   │   └── aircraft.json        # MSFS AircraftTitle → ICAO type
│   └── flightlogger/
│       └── aircraft.json        # FlightLogger type → ICAO type
├── parsers/
│   ├── xplane.ts                # X-Plane Pilot.txt parser
│   ├── msfs-csv.ts              # MSFS CSV export parser
│   └── flightlogger.ts          # FlightLogger export parser
├── schemas/
│   └── aircraft-mapping.schema.json  # JSON Schema for mapping files
├── tests/
│   └── fixtures/                # Sample logbook snippets for testing
├── CONTRIBUTING.md              # How to add mappings and submit PRs
├── LICENSE
└── README.md
```

## Quick Start: Add a Missing Aircraft

The most common contribution is adding a mapping for an addon aircraft. The short version:

1. Find the `source_id` — the exact string the simulator writes to its logbook
2. Look up the ICAO type designator for that aircraft
3. Add an entry to the appropriate `mappings/<source>/aircraft.json`
4. Run `npm test` to validate
5. Open a PR

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed step-by-step instructions.

## For Developers

### Install

```bash
npm install
```

### Validate Mappings

```bash
npm test
```

This validates all mapping files against the JSON Schema and runs parser tests.

### Use Programmatically

```typescript
import xplaneMappings from './mappings/xplane/aircraft.json';

function resolveAircraft(sourceId: string, source: string): string | null {
  const file = getMappingFile(source); // load the right JSON
  const entry = file.mappings.find(m => m.source_id === sourceId);
  return entry?.icao_type ?? null;
}
```

## Schema

Mapping files follow a versioned JSON Schema (`schemas/aircraft-mapping.schema.json`). Key fields per entry:

| Field          | Required | Description                                          |
| -------------- | -------- | ---------------------------------------------------- |
| `source_id`       | Yes      | Exact aircraft string from the simulator logbook      |
| `icao_type`    | Yes      | ICAO type designator (`C172`, `B738`, `A320`, etc.)   |
| `display_name` | No       | Human-friendly name for UI display                    |
| `addon_vendor` | No       | Developer name (`PMDG`, `Fenix`, `ToLiss`, etc.)      |
| `tags`         | No       | Categorization: `stock`, `addon`, `payware`, etc.     |
| `notes`        | No       | Version caveats or special handling notes              |

## License

Apache 2.0 — see [LICENSE](LICENSE).
