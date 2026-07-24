# Contabo-style VPS Carousel

## Goal

Replace the Atlas Cloud VPS plan selection with a horizontally scrollable comparison carousel that matches the supplied Contabo reference: six Cloud VPS cards, an Auto Backup switch, a 24-month promotional price, and a row-by-row comparison of plan resources.

## Chosen approach

Use one shared, typed VPS catalogue as the source of truth for both the carousel and checkout calculation. This avoids the current mismatch where the browser and server have separate hard-coded plan and price tables.

The carousel will be the product selector. Selecting a card continues to the existing configuration flow, carrying a stable Atlas plan id. The existing detailed configurator stays in scope only to consume the same catalogue; regional and other add-on changes are outside this first slice unless needed to keep checkout valid.

## Catalogue and pricing

The six plans are Cloud VPS 4, 6, 8, 12, 16, and 18. Their resource comparison exactly follows the supplied references:

| Plan | vCPU | RAM | SSD | Snapshots | Port | Traffic |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| 4 | 4 | 8 GB | 100 GB | 1 | 200 Mbit/s | Unlimited |
| 6 | 6 | 12 GB | 200 GB | 2 | 300 Mbit/s | Unlimited |
| 8 | 8 | 24 GB | 300 GB | 3 | 600 Mbit/s | Unlimited |
| 12 | 12 | 48 GB | 400 GB | 3 | 800 Mbit/s | Unlimited |
| 16 | 16 | 64 GB | 500 GB | 3 | 1 Gbit/s | Unlimited |
| 18 | 18 | 96 GB | 600 GB | 3 | 1 Gbit/s | Unlimited |

The reference's 24-month promotional values are doubled before presenting or charging in Atlas. Auto Backup adds the doubled difference between the corresponding on/off prices. The UI labels the period as 24 months; it must not retain 1/6/12-month controls for these plans.

## Flow and safeguards

1. The client renders cards from the shared catalogue and toggles the included Auto Backup state.
2. A selected plan passes its stable identifier, `duration=24`, and backup selection to checkout.
3. The server resolves every displayed/charged price from the same catalogue. It never trusts a price supplied by query parameters.
4. Unsupported legacy durations redirect or normalize to 24 months for this product family.
5. The invoice stores the resolved configuration and price snapshot as it does today.

## Verification

- Unit-test price resolution for every plan with backup off/on.
- Verify each plan's card rows and doubled 24-month values.
- Run TypeScript/lint checks and a production build.
- Manually verify horizontal scrolling, backup toggling, plan selection, and generated checkout total.

## Scope boundaries

This change does not provision through the Contabo API, scrape Contabo prices, or change VPS Windows/Storage products. Those can be migrated later to the same catalogue pattern after their separate references are supplied.
