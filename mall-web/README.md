# mall-web

Mall storefront frontend built with React, TypeScript, and Vite.

## Dev

The default npm scripts are tuned for lower memory usage on 16 GB machines:

```powershell
npm run dev
npm run build
npm run lint
```

If the backend is already running on `http://localhost:18080`, Vite will proxy `/api` requests automatically.

## Recommended local workflow

Start the backend in compact mode from the repo root:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\start-local.ps1 -SkipPackage
```

Then start the frontend:

```powershell
cd .\mall-web
npm run dev
```

Or start both together from the repo root:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\start-dev.ps1 -SkipPackage
```
