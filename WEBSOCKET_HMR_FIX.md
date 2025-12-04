# Production Deployment Fixes

## WebSocket HMR Issue - FIXED ✅

### Problem
Browser console showed: `WebSocket connection to 'ws://localhost:8081/' failed`

This was Vite's HMR (Hot Module Replacement) trying to connect to localhost, which only works in development mode.

### Solution Applied
Updated `frontend/vite.config.ts`:
- Added HMR configuration that **only enables in development mode** (`mode === 'development'`)
- Disabled HMR for production builds (`hmr: false`)
- Added build optimizations for production

### Before
```typescript
export default defineConfig(({ mode }) => ({
  server: {
    // No HMR config - defaults to localhost:5173
    ...
  }
}));
```

### After
```typescript
export default defineConfig(({ mode }) => ({
  server: {
    hmr: mode === 'development' ? {
      host: 'localhost',
      port: 8080,
      protocol: 'ws'
    } : false,
  },
  build: {
    minify: 'terser',
    sourcemap: false,
  }
}));
```

## What This Does

✅ **Development Mode (`npm run dev`)**
- HMR WebSocket connects to `ws://localhost:8080`
- Fast refresh on code changes
- Works as expected

✅ **Production Build (`npm run build`)**
- HMR is completely disabled
- No WebSocket connections attempted
- Clean, optimized bundle
- No development code in production

## Deployment Steps

1. **Redeploy frontend to Vercel:**
   ```bash
   git add frontend/vite.config.ts
   git commit -m "Fix: Disable HMR in production build"
   git push origin main
   ```
   
   Vercel will auto-redeploy.

2. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or open DevTools → Network → Disable cache → Reload

3. **Verify no WebSocket errors in console**

## Related Issue: CORS Still Not Working?

The WebSocket error was just noise. **The real issue is the CORS error** preventing `/jobs` API calls.

The backend must be running and returning CORS headers. See `RAILWAY_ENV_SETUP.md` for fixing the backend deployment.

**Once backend env vars are set:**
- ✅ WebSocket errors gone (after redeploy)
- ✅ CORS errors should be gone (if backend is running)
- ✅ `/jobs` page should load jobs

## Technical Details

- **HMR in Vite**: Hot Module Replacement allows live code updates during development
- **Production Mode**: Vite `build` command uses `mode === 'production'` and strips HMR code
- **Why Disable**: Production builds are static HTML/JS/CSS served by Vercel - no live reload needed
- **Result**: No WebSocket connections in production, smaller bundle size
