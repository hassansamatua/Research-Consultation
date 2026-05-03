@echo off
echo Fixing MySQL Database Connection Issues...
echo.

echo 1. Stopping MySQL service...
net stop mysql
if %errorlevel% neq 0 (
    echo Failed to stop MySQL. Try running as Administrator.
    pause
    exit /b 1
)

echo 2. Waiting 3 seconds...
timeout /t 3 /nobreak > nul

echo 3. Starting MySQL service...
net start mysql
if %errorlevel% neq 0 (
    echo Failed to start MySQL service.
    pause
    exit /b 1
)

echo 4. MySQL service restarted successfully!
echo.
echo 5. To prevent this issue in the future, increase max_connections:
echo    - Open my.ini (usually in C:\xampp\mysql\bin\)
echo    - Add or modify: max_connections=200
echo    - Restart MySQL service
echo.
echo 6. Application has been optimized with reduced connection pool:
echo    - Connection limit reduced from 20 to 5
echo    - Added proper connection management
echo    - Added better error handling
echo.
echo Press any key to continue...
pause > nul
