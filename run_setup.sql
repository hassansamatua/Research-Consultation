@echo off
echo Running MySQL setup...
"C:\xampp\mysql\bin\mysql.exe" -u root -p research_consultant < setup_simple.sql
echo.
if %ERRORLEVEL% EQU 0 (
    echo Tables created successfully!
) else (
    echo Error: %ERRORLEVEL%
)
echo.
pause
