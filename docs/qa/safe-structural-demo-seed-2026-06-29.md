# Safe Structural and Demo Seed Execution

**Date**: 2026-06-29
**Author**: Antigravity / Persistec Team

## Context

The seeding strategy for Persistech-360 has been restructured to strictly separate structural data from demonstration data. This ensures that production environments can safely run seeds for essential rules without inadvertently generating fake users, test departments, or cycles.

## Principles
1. **Structural Seed**: Upserts core domain data (Hierarchy Levels, Global Settings, Roles, Dimensions, Criteria, Rules, Retention Policies). Safe to run anywhere, though typically only needed in lower environments or once during initial setup.
2. **Demo Seed**: Runs only if `ALLOW_DEMO_SEED=true` AND `NODE_ENV !== 'production'`. Creates test departments, users, cycles, and other illustrative data.
3. **Safety Guards**: Any attempt to run demo seeds in a production environment will explicitly fail or exit safely without making changes.

## Scripts

Available in `apps/api/package.json`:

- `npm run db:seed` or `npm run db:seed:structural`: Runs the standard structural seed.
- `npm run db:seed:demo`: Runs the seed with `ALLOW_DEMO_SEED=true` using `cross-env`.

## Execution in Local/Disposable Environments

### Structural
1. Ensure your database is running and up-to-date with migrations.
2. Ensure you have the `INITIAL_ADMIN_EMAIL` env var set if bootstrapping the admin.
3. Run: `npm run db:seed:structural -w apps/api`

### Demo
1. Ensure your database is a local or disposable test instance.
2. Run: `npm run db:seed:demo -w apps/api`
3. The script will output confirmation that demo records (users, cycles, etc.) have been seeded.

## Production Restrictions

- NEVER run demo seeds in production.
- Do NOT set `ALLOW_DEMO_SEED=true` on production servers (Neon).
- Production deployments typically do not require manual seeding unless initializing a completely fresh instance with baseline structural rules.
