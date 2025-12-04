# CORS Configuration Guide

## Overview
This document explains the CORS configuration setup and provides troubleshooting steps.

## Architecture

### Files Involved
1. **CorsConfig.java** - Defines CORS configuration bean
2. **SecurityConfig.java** - Applies CORS to Spring Security
3. **application.properties** - CORS origins configuration
4. **TestController.java** - CORS testing endpoints

## Configuration

### Environment Variables (Railway)
Set these in your Railway dashboard under "Variables":

```properties
CORS_ALLOWED_ORIGINS=https://getjobportal.vercel.app,https://*.vercel.app,http://localhost:5173
```

### Local Development
Uses default from `application.properties`:
```properties
cors.allowed.origins=http://localhost:5173,http://localhost:3000,https://getjobportal.vercel.app,https://*.vercel.app
```

### Allowed HTTP Methods
- GET
- POST
- PUT
- DELETE
- PATCH
- OPTIONS (preflight requests)

### Allowed Headers
- Authorization
- Content-Type
- X-Requested-With
- Accept
- Origin
- Access-Control-Request-Method
- Access-Control-Request-Headers

### Exposed Headers
- Access-Control-Allow-Origin
- Access-Control-Allow-Credentials
- Authorization

## Testing CORS

### 1. Using Test Endpoints
```bash
# Test GET
curl http://localhost:8081/api/test/cors

# Test POST
curl -X POST http://localhost:8081/api/test/cors \
  -H "Content-Type: application/json" \
  -d "test data"

# Health check
curl http://localhost:8081/api/test/health
```

### 2. Test Preflight Request
```bash
curl -X OPTIONS http://localhost:8081/api/auth/signup \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

Look for these response headers:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Authorization, Content-Type, ...
Access-Control-Allow-Credentials: true
```

### 3. Browser Console Testing
Open browser DevTools → Network tab → Try making a request:
```javascript
fetch('http://localhost:8081/api/test/cors', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({ test: 'data' })
})
.then(r => r.text())
.then(console.log)
.catch(console.error)
```

## Common Issues

### Issue 1: CORS Error on Frontend
**Error:** `Access to XMLHttpRequest at 'http://localhost:8081/...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution:**
1. Check if origin is in `CORS_ALLOWED_ORIGINS`
2. Verify the exact frontend URL
3. Restart backend after changing configuration
4. Check Rails logs: `curl -v` to see response headers

### Issue 2: Preflight Request Fails
**Error:** `OPTIONS method not allowed`

**Solution:**
- The `.cors()` configuration in SecurityConfig handles this
- Verify SecurityConfig is loaded
- Check that `.csrf(csrf -> csrf.disable())` is present

### Issue 3: Credentials Not Sent
**Error:** Cookies/Authorization headers missing

**Solution:**
- Frontend: Add `credentials: 'include'` to fetch options
- Backend: Verify `setAllowCredentials(true)` is set
- Check Exposed Headers include Authorization

### Issue 4: Railway Deployment CORS Fails
**Error:** Works locally but not on Railway

**Solution:**
1. Check Railway environment variables
2. Verify `CORS_ALLOWED_ORIGINS` is set correctly
3. Use exact Vercel URL (check Vercel dashboard)
4. Check Railway logs for actual origin being sent

## Railway Debugging

### Step 1: Check Current Environment Variables
Go to Railway Dashboard → Your App → Settings → Environment Variables

Should have:
```
CORS_ALLOWED_ORIGINS=https://getjobportal.vercel.app,https://*.vercel.app
```

### Step 2: View Logs
Railway Dashboard → Deployments → Latest → View Logs

Look for any CORS-related issues or property loading errors.

### Step 3: Test External Connection
```bash
# From your local machine
curl -X OPTIONS https://getjob-production.up.railway.app/api/test/cors \
  -H "Origin: https://getjobportal.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Should show proper CORS headers
```

## Verification Checklist

- [ ] CorsConfig.java has `@Value` annotation
- [ ] CorsConfig reads from `cors.allowed.origins` property
- [ ] SecurityConfig uses `corsConfigurationSource()` bean
- [ ] TestController endpoints are accessible
- [ ] application.properties has `cors.allowed.origins` property
- [ ] Railway environment variables are set
- [ ] Frontend URL matches exactly in CORS_ALLOWED_ORIGINS
- [ ] Preflight requests return 200 (not 403/401)

## Security Notes

⚠️ **DO NOT USE `*` IN PRODUCTION**

While `*` works for testing, it's a security risk. Always specify exact origins:
```java
// ❌ NOT SECURE
configuration.setAllowedOrigins(Arrays.asList("*"));

// ✅ SECURE
configuration.setAllowedOrigins(Arrays.asList(
    "https://getjobportal.vercel.app",
    "https://yourdomain.com"
));
```

## Notes
- Wildcard patterns like `https://*.vercel.app` are NOT supported by Spring CORS
- Use exact URLs for production
- Max-Age is set to 3600 seconds (1 hour)
- Remove TestController in production
