When I tag nuke.md, it means I want to completely reset the database and rebuild the migration structure from scratch.

Your Responsibilities

Analyze all existing migration files

Review the entire migration history.

Understand the current final schema state after all incremental changes.

Identify incremental / patch migrations

Detect fix-based, hotfix, or incremental adjustment migrations.

Determine what changes were applied over time.

Assume a full database reset

Since the database is being nuked, we do not need layered fix migrations.

The goal is a clean, consolidated schema — not a replay of historical fixes.

Consolidate into a new base migration

Merge all structural changes into a single, clean base migration file.

Ensure the new base migration reflects the final intended schema.

Remove unnecessary historical complexity.

Archive previous migrations

Move all old migration files into an archive directory (e.g., /migrations/archive/).

Do not delete them.

Preserve them for future debugging or historical reference.

Expected Outcome

One clean, authoritative base migration.

No redundant incremental fixes.

All previous migrations safely archived.

A simplified, maintainable migration structure going forward.

example new migration

migrations/
 ├── 01_extensions.sql
 ├── 02_types.sql
 ├── 03_tables.sql
 ├── 04_indexes.sql
 ├── 05_functions.sql
 ├── 06_triggers.sql
 ├── 07_rls_policies.sql

 