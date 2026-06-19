@echo off
REM Docker Compose Helper Script for GetJob Project
REM Usage: docker-compose-helper.bat [command]

setlocal enabledelayedexpansion

if "%1"=="" (
    echo Docker Compose Helper - GetJob Project
    echo.
    echo Usage: docker-compose-helper.bat [command]
    echo.
    echo Commands:
    echo   start          - Start all services in background
    echo   stop           - Stop all services
    echo   logs           - View logs for all services
    echo   logs-backend   - View backend service logs
    echo   logs-frontend  - View frontend service logs
    echo   logs-db        - View database service logs
    echo   rebuild        - Rebuild all images
    echo   rebuild-backend- Rebuild backend image only
    echo   rebuild-frontend- Rebuild frontend image only
    echo   status         - Show status of all services
    echo   clean          - Remove all containers, volumes, and networks
    echo   shell-backend  - Open shell in backend container
    echo   shell-frontend - Open shell in frontend container
    echo   shell-db       - Open PostgreSQL shell
    echo   help           - Show this help message
    goto :eof
)

if "%1"=="start" (
    echo Starting GetJob services...
    docker-compose up -d
    echo Services started! Check status with: docker-compose-helper.bat status
    goto :eof
)

if "%1"=="stop" (
    echo Stopping GetJob services...
    docker-compose down
    echo Services stopped!
    goto :eof
)

if "%1"=="logs" (
    docker-compose logs -f
    goto :eof
)

if "%1"=="logs-backend" (
    docker-compose logs -f backend
    goto :eof
)

if "%1"=="logs-frontend" (
    docker-compose logs -f frontend
    goto :eof
)

if "%1"=="logs-db" (
    docker-compose logs -f postgres
    goto :eof
)

if "%1"=="rebuild" (
    echo Rebuilding all Docker images...
    docker-compose build --no-cache
    echo Rebuild complete!
    goto :eof
)

if "%1"=="rebuild-backend" (
    echo Rebuilding backend image...
    docker-compose build --no-cache backend
    echo Backend rebuilt!
    goto :eof
)

if "%1"=="rebuild-frontend" (
    echo Rebuilding frontend image...
    docker-compose build --no-cache frontend
    echo Frontend rebuilt!
    goto :eof
)

if "%1"=="status" (
    docker-compose ps
    goto :eof
)

if "%1"=="clean" (
    echo WARNING: This will remove all containers, volumes, and networks!
    set /p confirm="Are you sure? (yes/no): "
    if /i "%confirm%"=="yes" (
        docker-compose down -v
        echo Cleanup complete!
    ) else (
        echo Cleanup cancelled.
    )
    goto :eof
)

if "%1"=="shell-backend" (
    docker-compose exec backend sh
    goto :eof
)

if "%1"=="shell-frontend" (
    docker-compose exec frontend sh
    goto :eof
)

if "%1"=="shell-db" (
    docker-compose exec postgres psql -U postgres -d getjobdb
    goto :eof
)

if "%1"=="help" (
    echo Docker Compose Helper - GetJob Project
    echo.
    echo Usage: docker-compose-helper.bat [command]
    echo.
    echo Commands:
    echo   start          - Start all services in background
    echo   stop           - Stop all services
    echo   logs           - View logs for all services
    echo   logs-backend   - View backend service logs
    echo   logs-frontend  - View frontend service logs
    echo   logs-db        - View database service logs
    echo   rebuild        - Rebuild all images
    echo   rebuild-backend- Rebuild backend image only
    echo   rebuild-frontend- Rebuild frontend image only
    echo   status         - Show status of all services
    echo   clean          - Remove all containers, volumes, and networks
    echo   shell-backend  - Open shell in backend container
    echo   shell-frontend - Open shell in frontend container
    echo   shell-db       - Open PostgreSQL shell
    echo   help           - Show this help message
    goto :eof
)

echo Unknown command: %1
echo Run: docker-compose-helper.bat help
