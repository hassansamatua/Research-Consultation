@echo off
echo Killing MySQL Processes and Restarting...
echo.

echo 1. Killing MySQL processes...
taskkill /f /im mysqld.exe >nul 2>&1
taskkill /f /im mysql.exe >nul 2>&1

echo 2. Waiting 3 seconds...
timeout /t 3 /nobreak > nul

echo 3. Starting MySQL...
cd "C:\xampp\mysql\bin"
start /b mysqld.exe --defaults-file="my.ini" --standalone --console

echo 4. MySQL restart initiated!
echo.
echo 5. Wait 10 seconds for MySQL to fully start...
timeout /t 10 /nobreak > nul

echo 6. Testing connection...
cd "C:\xampp\mysql\bin"
mysql.exe -u root -e "SELECT 'Connection successful' as status;" 2>nul
if %errorlevel% equ 0 (
    echo    MySQL is running and accepting connections!
) else (
    echo    MySQL is still starting up, please wait a bit more...
)

echo.
echo Press any key to exit...
pause > nul
