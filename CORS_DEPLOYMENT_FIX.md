# CORS Error Troubleshooting & Deployment Fix

## Current Error
```
Access to fetch at 'https://getjob-production.up.railway.app/jobs' from origin 
'https://getjobportal.vercel.app' has been blocked by CORS policy
```

## Root Cause
The Railway backend is either **not running** or **crashed on startup** due to missing environment variables.

When the backend isn't running, the browser gets no response to CORS preflight requests (OPTIONS), so it blocks the actual request with a CORS error.

## Fix Steps

### 1. Check Railway Dashboard
1. Go to [https://railway.app](https://railway.app)
2. Select your GetJob project
3. Click on the backend service
4. Check the **Logs** tab for startup errors

### 2. Set Required Environment Variables on Railway

Go to **Variables** tab in Railway and set:

```
DATABASE_URL=postgresql://user:password@host:port/dbname
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
JWT_SECRET=71d24f41ecd93411f5952623fb73e90f62fc2b66fe4700db51e5075cc1d4e0a7
```

**Where to get DATABASE_URL:**
- If using Railway's PostgreSQL plugin: Copy the connection string from the PostgreSQL service's Variables
- Format: `postgresql://username:password@hostname:5432/railway`

### 3. Verify application.properties Configuration

The file at `backend/src/main/resources/application.properties` should reference these env vars:

```properties
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
```

**Check if these match your Railway env var names.** If not, update either:
- The Railway env var names to match `application.properties`, OR
- Update `application.properties` to use `DATABASE_URL`, `DB_USERNAME`, `DB_PASSWORD`

Current mismatch issue: `application.properties` uses:
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

But you might have set:
- `DATABASE_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

**Solution:** Rename Railway env vars to match what `application.properties` expects:
```
SPRING_DATASOURCE_URL=postgresql://...
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...
JWT_SECRET=...
```

### 4. Redeploy

1. In Railway, click **Deploy** button
2. Wait for deployment to complete
3. Check **Logs** for successful startup
4. When you see "Started GetJobApplication in X seconds", backend is ready

### 5. Test Backend Directly

Before testing from frontend, verify backend is running:

```bash
curl -X GET https://getjob-production.up.railway.app/jobs \
  -H "Origin: https://getjobportal.vercel.app"
```

You should get a 200 response with CORS headers:
```
Access-Control-Allow-Origin: https://getjobportal.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### 6. Test Frontend
Once backend is running, reload https://getjobportal.vercel.app/jobs in your browser.

## CORS Configuration (Already Set Up)

Your backend has proper CORS configuration in:
- `backend/src/main/java/.../config/CorsConfig.java` - Allows getjobportal.vercel.app
- `backend/src/main/java/.../auth/config/SecurityConfig.java` - Enables CORS with OPTIONS preflight

These are correct and don't need changes.

## Common Issues

| Issue | Solution |
|-------|----------|
| "Failed to load resource: net::ERR_FAILED" | Backend crashed - check Railway logs |
| No `Access-Control-Allow-Origin` header | Backend not responding - check env vars |
| "Invalid credentials" on signup | JWT_SECRET mismatch between local and Railway |
| 404 errors after auth | Backend running but endpoints not found |

## Local Testing (Before Deploying)

To test locally first:

```bash
# Terminal 1 - Start backend
cd backend
./mvnw spring-boot:run

# Terminal 2 - Start frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173/jobs` - should work without CORS errors (both on localhost).

## Production Deployment Checklist

- [ ] Railway env vars set (SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME, SPRING_DATASOURCE_PASSWORD, JWT_SECRET)
- [ ] Backend deployed and running (check Railway logs)
- [ ] Backend logs show "Started GetJobApplication"
- [ ] `curl https://getjob-production.up.railway.app/jobs` returns 200
- [ ] Frontend loads at https://getjobportal.vercel.app
- [ ] Can navigate to /jobs page without CORS errors
- [ ] Can sign up/sign in with Google
