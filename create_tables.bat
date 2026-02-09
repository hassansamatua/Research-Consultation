@echo off
echo Creating missing database tables...
C:\xampp\mysql\bin\mysql.exe -u root -p research_consultant -e "source database/missing_tables.sql"
echo.
if %ERRORLEVEL% EQU 0 (
    echo Tables created successfully!
) else (
    echo Error creating tables: %ERRORLEVEL%
    echo Check your MySQL configuration.
)
echo.
pause
