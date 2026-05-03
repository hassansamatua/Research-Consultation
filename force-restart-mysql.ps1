# PowerShell script to force restart MySQL and clear connections
# Run as Administrator

Write-Host "Force Restarting MySQL Service..." -ForegroundColor Yellow

# Stop all MySQL processes forcefully
Write-Host "1. Stopping MySQL processes..." -ForegroundColor Green
Get-Process -Name "mysqld" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "mysql" -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait for processes to fully stop
Write-Host "2. Waiting 5 seconds..." -ForegroundColor Green
Start-Sleep -Seconds 5

# Stop MySQL service
Write-Host "3. Stopping MySQL service..." -ForegroundColor Green
try {
    Stop-Service -Name "mysql" -Force -ErrorAction Stop
    Write-Host "   MySQL service stopped successfully" -ForegroundColor Green
} catch {
    Write-Host "   MySQL service was not running or couldn't be stopped" -ForegroundColor Yellow
}

# Wait additional time
Write-Host "4. Waiting 3 seconds..." -ForegroundColor Green
Start-Sleep -Seconds 3

# Start MySQL service
Write-Host "5. Starting MySQL service..." -ForegroundColor Green
try {
    Start-Service -Name "mysql" -ErrorAction Stop
    Write-Host "   MySQL service started successfully" -ForegroundColor Green
} catch {
    Write-Host "   Failed to start MySQL service" -ForegroundColor Red
    Write-Host "   Trying alternative method..." -ForegroundColor Yellow
    
    # Try alternative start method
    & "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone --console
}

Write-Host "6. MySQL service restart completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Wait 10 seconds for MySQL to fully start" -ForegroundColor White
Write-Host "2. Run the connection optimization script" -ForegroundColor White
Write-Host "3. Test the application" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
