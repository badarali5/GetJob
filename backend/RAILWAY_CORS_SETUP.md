# Railway Deployment CORS Configuration

## Quick Setup (5 minutes)

### Step 1: Go to Railway Dashboard
1. Navigate to https://railway.app
2. Select your GetJob application
3. Click on "Settings"

### Step 2: Add Environment Variables
In the Environment section, add or update:

```
CORS_ALLOWED_ORIGINS=https://getjobportal.vercel.app,https://yourdomain.com
```

Replace `yourdomain.com` with your actual frontend domain if different.

### Step 3: Redeploy
The app will automatically redeploy with the new environment variables.

### Step 4: Verify in Logs
Go to Deployments → Latest → View Logs

Look for successful startup and no CORS-related errors.

## Finding Your Exact URLs

### Backend URL (Railway)
1. Go to Railway Dashboard
2. Select your backend app
3. Go to "Settings" → "Environment"
4. Copy the `Railway Domain` (usually `getjob-production.up.railway.app`)

### Frontend URL (Vercel)
1. Go to Vercel Dashboard
2. Select your frontend project
3. Copy the Production URL from the deployments section

Example:
```
Frontend: https://getjobportal.vercel.app
Backend: https://getjob-production.up.railway.app
```

## Multiple Domain Support

If you need to support multiple domains:

```
CORS_ALLOWED_ORIGINS=https://getjobportal.vercel.app,https://yourdomain.com,https://staging.yourdomain.com
```

Use comma-separated values (no spaces between domains).

## Testing After Deployment

### Test 1: Direct API Call
```bash
curl https://getjob-production.up.railway.app/api/test/health
```

Expected response: `Backend is healthy and running!`

### Test 2: CORS Preflight
```bash
curl -X OPTIONS https://getjob-production.up.railway.app/api/test/cors \
  -H "Origin: https://getjobportal.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

Expected response headers:
```
< HTTP/2 200
< Access-Control-Allow-Origin: https://getjobportal.vercel.app
< Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
< Access-Control-Allow-Credentials: true
```

### Test 3: From Frontend
In your browser console at `https://getjobportal.vercel.app`:

```javascript
fetch('https://getjob-production.up.railway.app/api/test/cors', {
  method: 'GET',
  credentials: 'include'
})
.then(r => r.text())
.then(console.log)
.catch(console.error)
```

Expected response: `GET CORS is working!`

## Troubleshooting

### Issue: CORS blocked on frontend
1. Check frontend is accessing correct backend URL
2. Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL exactly
3. Redeploy backend after changing environment variables
4. Wait 2-3 minutes for changes to propagate

### Issue: `500 Internal Server Error`
1. Check Railway logs for stack traces
2. Verify all required environment variables are set
3. Check database connection is working
4. Redeploy if configuration changed

### Issue: Cannot connect to backend at all
1. Check Railway backend is running (Green status)
2. Verify the backend URL is correct
3. Check if Railway domain changed
4. Ensure frontend is using HTTPS (not HTTP)

## Environment Variables Reference

All CORS configuration environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000,https://getjobportal.vercel.app,https://*.vercel.app` | Allowed frontend origins |
| `SPRING_DATASOURCE_URL` | (required) | PostgreSQL database URL |
| `SPRING_DATASOURCE_USERNAME` | (required) | Database username |
| `SPRING_DATASOURCE_PASSWORD` | (required) | Database password |
| `JWT_SECRET` | (required) | Secret key for JWT tokens |
| `RAPID_API_KEY` | (optional) | JSearch API key for job data |
| `JSEARCH_API_HOST` | `jsearch.p.rapidapi.com` | JSearch API host |

## Common Configurations

### Production (Vercel + Railway)
```
CORS_ALLOWED_ORIGINS=https://getjobportal.vercel.app
```

### Development + Production
```
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://getjobportal.vercel.app
```

### Multiple Deployments
```
CORS_ALLOWED_ORIGINS=https://main.yourdomain.com,https://staging.yourdomain.com,https://getjobportal.vercel.app
```

## Notes

- Changes take effect on next deployment
- No code changes needed to update CORS origins
- Use commas without spaces to separate multiple origins
- Restart/redeploy may be needed for immediate effect
- Check logs if CORS still fails after updating

## Still Having Issues?

1. Check `CORS_DEBUGGING_GUIDE.md` in backend folder
2. Review Railway logs in detail
3. Ensure frontend is calling the correct backend URL
4. Verify TLS/SSL certificates are valid for HTTPS
5. Test with `curl` first, then browser
