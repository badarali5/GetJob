# Backend Setup & SSL Certificate Fix Guide

## Current Status

❌ **Backend Issue:** Spring Boot won't start due to Maven SSL certificate validation error
- Error: `PKIX path building failed: unable to find valid certification path to requested target`
- Cause: Maven can't download dependencies from Maven Central due to SSL certificate issues

---

## Solution Options (Choose One)

### Option 1: Update Java Certificate Store (RECOMMENDED)

Java 8 has outdated certificate bundles. Update them:

```powershell
cd "C:\Program Files\Java\jre1.8.0_51"

# Download latest certificates
$url = "https://curl.se/ca/cacert.pem"
$output = "lib\security\cacert_new.pem"
Invoke-WebRequest -Uri $url -OutFile $output

# Backup old cert store
Copy-Item "lib\security\cacerts" "lib\security\cacerts.bak"

# Use keytool to import new certificates
# This may require Administrator mode
keytool -import -trustcacerts -alias root -file $output -keystore "lib\security\cacerts" -storepass changeit
```

---

### Option 2: Use HTTP Instead of HTTPS for Maven (Quick but Less Secure)

Edit `pom.xml` to use HTTP repositories:

```xml
<repositories>
    <repository>
        <id>central</id>
        <url>http://repo.maven.apache.org/maven2</url>
    </repository>
</repositories>
```

---

### Option 3: Skip SSL Verification (Development Only)

Run Maven with SSL verification disabled:

```powershell
cd "C:\Users\shaya\GJ\backend"

# Option A: Using mvnw
.\mvnw.cmd clean install `
  -Dmaven.wagon.http.ssl.insecure=true `
  -Dmaven.wagon.http.ssl.allowall=true

# Option B: If mvnw doesn't work
mvn clean install ^
  -Dmaven.wagon.http.ssl.insecure=true ^
  -Dmaven.wagon.http.ssl.allowall=true
```

Then start the backend:

```powershell
cd "C:\Users\shaya\GJ\backend"
.\mvnw.cmd spring-boot:run
```

---

### Option 4: Configure Maven Settings

Create or edit `C:\Users\shaya\.m2\settings.xml`:

```xml
<settings>
  <profiles>
    <profile>
      <id>insecure</id>
      <activation>
        <activeByDefault>true</activeByDefault>
      </activation>
      <repositories>
        <repository>
          <id>central</id>
          <url>http://central.maven.org/maven2</url>
          <releases>
            <enabled>true</enabled>
          </releases>
        </repository>
      </repositories>
    </profile>
  </profiles>
</settings>
```

---

## Verify Backend is Running

Once you start the backend, test it:

```powershell
# Test if backend is responding
$response = Invoke-WebRequest -Uri "http://localhost:8081/api/jobs" -ErrorAction SilentlyContinue
$response.StatusCode  # Should return 200
```

---

## Backend Endpoints to Verify

Once running, test these endpoints:

```powershell
# Get all jobs
curl "http://localhost:8081/api/jobs"

# Get jobs with filters
curl "http://localhost:8081/api/jobs?jobType=full-time&minSalary=80000"

# Sync jobs from external API
curl -X POST "http://localhost:8081/api/jobs/sync"

# Search jobs
curl "http://localhost:8081/api/jobs/search?q=React"
```

---

## Database Setup (if needed)

The backend expects a PostgreSQL database at:
- **Host:** localhost
- **Port:** 5432
- **Database:** getjobdb
- **Username:** postgres
- **Password:** badar512

To change these, edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/getjobdb
spring.datasource.username=postgres
spring.datasource.password=badar512
```

---

## Frontend Configuration

The frontend is already configured to proxy API requests to:

```
Proxy Target: http://localhost:8081
Frontend Dev: http://localhost:8080
```

When you open http://localhost:8080/jobs:
1. Frontend requests `/api/jobs`
2. Vite proxy forwards to `http://localhost:8081/api/jobs`
3. Backend responds with job data
4. Frontend displays jobs with all filters/algorithms active

---

## Recommended Quick Start (Option 3)

```powershell
# Terminal 1: Start Frontend
cd "C:\Users\shaya\GJ\frontend"
npm run dev
# Frontend will be at http://localhost:8080/jobs

# Terminal 2: Start Backend
cd "C:\Users\shaya\GJ\backend"
$env:MAVEN_OPTS = "-Dmaven.wagon.http.ssl.insecure=true -Dmaven.wagon.http.ssl.allowall=true"
.\mvnw.cmd spring-boot:run
# Backend will be at http://localhost:8081

# Backend will take 30-60 seconds to start
# Once started, frontend will automatically fetch real job data
```

---

## Current Fallback (Mock Data)

Until backend is fixed:
- ✅ Frontend loads with **10 mock jobs**
- ✅ All algorithms work with mock data
- ✅ Filters, sorting, and search all functional
- ✅ Perfect for testing without backend

---

## Environment Variables (Optional)

You can set these to configure the backend:

```powershell
# Database configuration
$env:DATABASE_URL = "jdbc:postgresql://localhost:5432/getjobdb"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "badar512"

# JWT Secret
$env:JWT_SECRET = "your-secret-key-here"

# CORS Origins (frontend URL)
$env:FRONTEND_URL = "http://localhost:8080,http://localhost:5173"

# JSearch API Key (for job scraping)
$env:RAPID_API_KEY = "your-rapidapi-key-here"
```

---

## Troubleshooting

### "mvnw.cmd is not recognized"
```powershell
cd "C:\Users\shaya\GJ\backend"
.\mvnw.cmd --version  # Should work from backend directory
```

### Backend won't start
```powershell
# Check Java version
java -version

# Check if port 8081 is in use
Get-NetTcpConnection -LocalPort 8081 -ErrorAction SilentlyContinue

# Kill process on port 8081 if needed
Stop-Process -Id (Get-NetTcpConnection -LocalPort 8081).OwningProcess -Force
```

### Frontend can't reach backend
```powershell
# Verify backend is running
Invoke-WebRequest http://localhost:8081/api/jobs

# Check Vite proxy config
cat "C:\Users\shaya\GJ\frontend\vite.config.ts"  # Should have target: 'http://localhost:8081'
```

---

## Summary

| Step | Action | Command |
|------|--------|---------|
| 1 | Frontend is running ✅ | Already running on 8080 |
| 2 | Fix backend SSL | Choose Option 3 above |
| 3 | Start backend | `.\mvnw.cmd spring-boot:run` |
| 4 | Test connection | `Invoke-WebRequest http://localhost:8081/api/jobs` |
| 5 | Open frontend | http://localhost:8080/jobs |
| 6 | Test features | Use FRONTEND_TEST_GUIDE.md |

