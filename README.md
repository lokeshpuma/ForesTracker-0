# ForesTracker

Frontend-ready forest management dashboard deployed with GitHub Pages.

## Live Site

- [https://lokeshpuma.github.io/ForesTracker-0/](https://lokeshpuma.github.io/ForesTracker-0/)

## What Was Changed

- Configured GitHub Pages build to run in static demo mode (`VITE_STATIC_DEMO=true`)
- Added a frontend mock API layer so `/api/*` pages work without backend hosting
- Kept the existing GitHub Actions workflow to auto-deploy from `main`

## Run Locally

```bash
npm install
npm run dev
```

## Build for GitHub Pages

```bash
npm run build:gh
```

Output is generated in `dist/public` and deployed by `.github/workflows/deploy.yml`.

## Notes

- GitHub Pages is static hosting, so backend API routes are not available there.
- The deployed site uses seeded demo data through the in-app mock API.
