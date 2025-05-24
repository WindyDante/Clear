@echo off
setlocal enabledelayedexpansion

echo ================================
echo Starting Clear Project Build and Deploy
echo ================================

REM Set error handling
set "ERROR_OCCURRED=0"

REM Build backend image
echo.
echo [1/3] Building backend image...
cd /d "E:\Clear\Clear-Backend"
if not exist "Dockerfile" (
    echo ERROR: Dockerfile not found in Clear-Backend directory
    set ERROR_OCCURRED=1
    goto error
)

docker build -t eastwind996/clear-java-backend:0.1.5 .
if !errorlevel! neq 0 (
    echo ERROR: Backend image build failed
    set ERROR_OCCURRED=1
    goto error
)
echo Backend image build successful!

REM Build frontend image
echo.
echo [2/3] Building frontend image...
cd /d "E:\Clear\Clear-Web"
if not exist "Dockerfile" (
    echo ERROR: Dockerfile not found in Clear-Web directory
    set ERROR_OCCURRED=1
    goto error
)

docker build -t eastwind996/clear-frontend:0.1.5 .
if !errorlevel! neq 0 (
    echo ERROR: Frontend image build failed
    set ERROR_OCCURRED=1
    goto error
)
echo Frontend image build successful!

REM Start Docker Compose
echo.
echo [3/3] Starting Docker Compose...
cd /d "E:\Clear"
if not exist "docker-compose.yml" (
    echo ERROR: docker-compose.yml not found in Clear directory
    set ERROR_OCCURRED=1
    goto error
)

docker-compose up -d
if !errorlevel! neq 0 (
    echo ERROR: Docker Compose startup failed
    set ERROR_OCCURRED=1
    goto error
)

echo.
echo ================================
echo Deploy successful! Services are running...
echo Frontend URL: http://localhost:3668
echo Backend API URL: http://localhost:5673
echo ================================
echo.
echo Press any key to stop all services and exit...
pause >nul

goto cleanup

:error
echo.
echo ================================
echo Error occurred during deployment, cleaning up...
echo ================================
cd /d "E:\Clear"

:cleanup
echo.
echo Stopping Docker Compose services...
cd /d "E:\Clear"
docker-compose down
if !errorlevel! equ 0 (
    echo Services stopped successfully
) else (
    echo WARNING: Problem occurred while stopping services
)

echo.
if !ERROR_OCCURRED! equ 1 (
    echo Script completed with errors
    pause
    exit /b 1
) else (
    echo Script completed successfully
    pause
    exit /b 0
)