# Contabo VPS Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy VPS plan matrix with a Contabo-style carousel and ensure its six 24-month plans retain their selected backup option through checkout.

**Architecture:** `src/lib/vps-catalog.ts` remains the typed source of truth for the six sellable cloud tiers and their doubled Atlas prices. The landing client renders that catalogue in an Embla carousel. The configurator and invoice action recognize the stable catalogue ids and derive the 24-month base price server-side; legacy plans retain their existing behaviour.

**Tech Stack:** Next.js App Router, React, Embla carousel, Bun test runner, TypeScript.

## Global Constraints

- Cloud VPS ids `4`, `6`, `8`, `12`, `16`, and `18` use a fixed 24-month duration.
- Displayed and charged Atlas prices are twice the supplied Contabo monthly values.
- Auto Backup selects the corresponding catalogue price; the server never accepts a client-supplied price.
- Legacy VPS, VDS, storage, and Windows checkout behaviour remains unchanged.

---

### Task 1: Catalogue guards and pricing behaviour

**Files:**
- Modify: `src/lib/vps-catalog.ts`
- Test: `src/lib/vps-catalog.test.ts`

- [ ] Add a failing test proving valid cloud ids are recognized, invalid ids are rejected, and backup pricing is resolved only from the catalogue.
- [ ] Run `bun test src/lib/vps-catalog.test.ts` and confirm the test fails because the guard is unavailable.
- [ ] Implement the smallest typed cloud-plan guard and price lookup needed by the page and invoice action.
- [ ] Re-run `bun test src/lib/vps-catalog.test.ts` and confirm all catalogue tests pass.

### Task 2: Carousel and handoff to configuration

**Files:**
- Modify: `src/app/landing/components/VpsCloudPage.tsx`
- Modify: `src/app/vps/configure/[id]/page.tsx`

- [ ] Render each plan from `CLOUD_VPS_PLANS` in the existing carousel primitive, with price, backup state, and all six resource rows.
- [ ] Pass `duration=24` and the selected backup state when a card is selected.
- [ ] Make cloud-plan configuration use one 24-month duration and catalogue-derived names, resources, prices, and backup increments; preserve legacy configuration data for all other ids.
- [ ] Run the targeted catalogue tests and TypeScript/lint checks.

### Task 3: Server-side checkout price resolution

**Files:**
- Modify: `src/app/actions.ts`
- Test: `src/lib/vps-catalog.test.ts`

- [ ] Add a failing catalogue test for the six plan/backup monthly amounts required by invoice calculation.
- [ ] Run the test and verify the expected assertion fails before the server-action change.
- [ ] Normalize Contabo plan durations to 24 and use the catalogue for the plan base price; do not add backup twice because it is already included in that price.
- [ ] Run targeted tests and the production build; inspect the diff to ensure legacy pricing remains isolated.
