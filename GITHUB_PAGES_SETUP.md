# GitHub Pages Deployment Guide

## Configuration Done

Your project has been configured for GitHub Pages deployment with the following changes:

### 1. **Vite Configuration** (`vite.config.ts`)
- Added dynamic `base` path that switches between `/` (local development) and `/ForesTracker-0/` (GitHub Pages)
- The base path is controlled by the `GITHUB_PAGES` environment variable

### 2. **Package Scripts** (`package.json`)
- Added `build:gh` script for GitHub Pages deployment:
  ```bash
  npm run build:gh
  ```
  This builds the project with the correct base path for GitHub Pages

### 3. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
- Automated CI/CD pipeline that:
  - Builds on every push to `main` or `master` branch
  - Deploys automatically to GitHub Pages after successful build
  - Uses Node.js 18 for consistent builds

## Deployment Steps

### Step 1: Push to GitHub
1. Add your repository as a remote (if not already done):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ForesTracker-0.git
   ```

2. Push your code:
   ```bash
   git push -u origin main
   ```

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - Set **Source** to "GitHub Actions"
   - The workflow will automatically be used for deployment

### Step 3: Verify Deployment
- Your site will be available at: `https://YOUR_USERNAME.github.io/ForesTracker-0/`
- Check the **Actions** tab in your repository to see deployment status

## Local Testing

To test the build locally:

```bash
npm run build:gh
# Or with explicit environment variable
GITHUB_PAGES=true npm run build
```

## Notes

- The `build:gh` script only builds the client (Vite build)
- For a full production build including server, use `npm run build`
- Assets and API routes will need to be configured if using the Express server
- If using Client-Side Routing (React Router), ensure `404.html` handling (included by default with GitHub Pages)
