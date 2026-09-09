@echo off
echo ===================================================
echo  Building Audi Museum Wiki Docker Image
echo ===================================================
docker build --progress=plain -t museumswiki:latest .
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker build failed. Please check if Docker Desktop is running.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ===================================================
echo  Exporting Image to museumswiki.tar
echo ===================================================
docker save -o museumswiki.tar museumswiki:latest
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Export failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [SUCCESS] Build complete! File created: museumswiki.tar
pause
