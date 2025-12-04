# Railway Environment Variables Setup

## Required Variables for GetJob Backend

Copy these exact names into your Railway dashboard **Variables** section:

### Database Configuration
```
SPRING_DATASOURCE_URL=postgresql://user:password@host:port/dbname
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_password
```

### Authentication
```
JWT_SECRET=71d24f41ecd93411f5952623fb73e90f62fc2b66fe4700db51e5075cc1d4e0a7
```

### API Keys (Optional - has fallback)
```
RAPID_API_KEY=b2d573306dmsh94f1e8659ce9dbcp1ed860jsn85deba6d519f
```

## How to Get Database Connection String

### If using Railway's PostgreSQL Plugin:

1. In Railway dashboard, go to your PostgreSQL service
2. Click **Variables** tab
3. Copy the `DATABASE_PUBLIC_URL` value
4. Format is: `postgresql://username:password@hostname:5432/database`

Example:
```
postgresql://postgres:password@containers-us-west-34.railway.app:5432/railway
```

Then break it down into:
- **SPRING_DATASOURCE_URL**: `postgresql://username:password@hostname:5432/dbname`
- **SPRING_DATASOURCE_USERNAME**: `postgres` (or your username)
- **SPRING_DATASOURCE_PASSWORD**: `your_password` (extracted from URL)

## Steps to Deploy

1. **Go to Railway Dashboard** → Your GetJob Project
2. **Click Backend Service** (Java/Spring Boot one)
3. **Click Variables tab**
4. **Add each variable:**
   - Click "Add Variable"
   - Paste variable name (e.g., `SPRING_DATASOURCE_URL`)
   - Paste value (e.g., connection string)
   - Click Add
5. **Repeat for all variables above**
6. **Click Deploy button** at top
7. **Watch Logs tab** - wait for "Started GetJobApplication"

## Verify It's Working

Once deployment completes:

```bash
# Test if backend is running
curl https://getjob-production.up.railway.app/jobs

# Should return JSON jobs array (or empty [])
# If it hangs or times out, backend crashed - check Railway logs
```

## Common Issues

| Error | Fix |
|-------|-----|
| 502 Bad Gateway | Env vars not set - check Railway Variables tab |
| Timeout | Backend crashed - check Logs for errors |
| 404 | Backend running but endpoint not found |
| CORS error in browser | Backend crashed - env vars needed |

## Next Steps

1. ✅ Set all env vars above in Railway
2. ✅ Redeploy
3. ✅ Check logs for "Started GetJobApplication"
4. ✅ Test with curl command above
5. ✅ Reload https://getjobportal.vercel.app in browser
6. ✅ Try signing up/signing in with Google
