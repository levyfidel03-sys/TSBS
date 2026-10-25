# The South Barbers — UI Prototype

A responsive, frontend-only single-page barbershop prototype. All booking and contact interactions are demonstrations: nothing is transmitted, persisted, or sent to the shop.

## Run locally

Requirements: Node.js 22 or newer and pnpm 11.25.0 (pinned in `package.json`).

```bash
pnpm install
pnpm dev
```

Open the Vite local URL printed in the terminal. Create a production build with `pnpm build`.

## Edit the sample content

Haircut, service, barber, product, benefit, testimonial, date-slot, and image-sheet references are in `src/data.ts`. Contact details and reviews are explicitly placeholders. The generated WebP image sheets are bundled under `public/images/` so a local run does not rely on a Manus-only storage route.
