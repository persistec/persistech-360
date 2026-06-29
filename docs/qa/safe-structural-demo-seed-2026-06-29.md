# Safe Structural and Demo Seed Execution

**Date**: 2026-06-29
**Author**: Antigravity / Persistec Team

## Context

The seeding strategy for Persistech-360 has been restructured to strictly separate structural data from demonstration data. This ensures that production environments can safely run seeds for essential rules without inadvertently generating fake users, test departments, or cycles.

## Principles
1. **Structural Seed**: Upserts core domain data (Hierarchy Levels, Dimensions, Criteria, Criterion Options, Applicability Rules, Weight Rules, Retention Policies). Safe to run anywhere, though typically only needed in lower environments or once during initial setup.
2. **Demo Seed**: Runs only when executing with the `--mode=demo` argument AND either the `--allow-demo-seed` flag or `ALLOW_DEMO_SEED=true` in the environment. It seeds test departments, users (using `@example.test` reserved domain), and test cycles.
3. **Safety Guards**: Any attempt to run demo seeds in a production environment (based on `NODE_ENV=production` or matching the Neon production pooler hostname `ep-morning-wave-aciutlo4`) will be blocked by safety checks.

## Scripts

Available in `apps/api/package.json`:

- `npm run db:seed:structural`: Runs the structural seed (uses `ts-node prisma/seed.ts --mode=structural`).
- `npm run db:seed:demo`: Runs the demo seed (uses `ts-node prisma/seed.ts --mode=demo --allow-demo-seed`).

## Executed Validation

Validation was successfully performed on **2026-06-29** against the `new-neon-validation` environment (`ep-proud-block-ac6syq6s-pooler.sa-east-1.aws.neon.tech`).

### Results of Structural Seed
Running `npm run db:seed:structural` resulted in:
- Seeded 6 hierarchy levels.
- Seeded 3 dimensions.
- Seeded 13 criteria.
- Seeded 65 criterion options.
- Seeded applicability rules.
- Seeded weight rules.
- Seeded retention policy.

### Results of Demo Seed
Running `npm run db:seed:demo` resulted in:
- Seeded 5 departments.
- Seeded 10 roles.
- Seeded 10 users (with `@example.test` domains).
- Seeded 1 cycle.

### Table Counts Post-Validation
- `users`: 11 (10 demo users + 1 pre-existing admin)
- `departments`: 5
- `hierarchy_levels`: 6
- `roles`: 10
- `cycles`: 1
- `dimensions`: 3
- `criteria`: 13
- `criterion_options`: 65
- `applicability_rules`: 3
- `weight_rules`: 4
- `retention_policies`: 1
- `evaluation_assignments`: 0
- `evaluation_submissions`: 0
- `evaluation_answers`: 0

## Production Restrictions

- NEVER run demo seeds in production.
- Do NOT set `ALLOW_DEMO_SEED=true` or pass `--allow-demo-seed` on production servers.
- Production deployments typically do not require manual seeding unless initializing a completely fresh instance with baseline structural rules.
