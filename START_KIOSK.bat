@echo off
echo ==========================================
echo  Low Tide Corals - Fish Browser V23
echo ==========================================
echo.
echo Put reef-bg.mp4 in this folder for video background.
echo.
echo Killing any existing server on port 8080...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" 2>nul
timeout /t 1 /nobreak >nul
echo Starting server...
start "" "http://localhost:8080/index.html"
powershell -NoProfile -ExecutionPolicy Bypass -Command "& { $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:8080/'); $listener.Start(); Write-Host 'Server running at http://localhost:8080/ - do not close this window'; Write-Host 'Press Ctrl+C to stop.'; $root = (Get-Location).Path; while ($listener.IsListening) { $context = $listener.GetContext(); $response = $context.Response; $file = $context.Request.Url.LocalPath.TrimStart('/'); if ($file -eq '') { $file = 'index.html' }; $path = Join-Path $root $file; if (Test-Path $path) { $bytes = [System.IO.File]::ReadAllBytes($path); $ext = [System.IO.Path]::GetExtension($path).ToLower(); $mime = switch ($ext) { '.html' {'text/html'} '.css' {'text/css'} '.js' {'application/javascript'} '.json' {'application/json'} '.mp4' {'video/mp4'} '.webm' {'video/webm'} '.png' {'image/png'} '.jpg' {'image/jpeg'} '.jpeg' {'image/jpeg'} '.svg' {'image/svg+xml'} '.ico' {'image/x-icon'} default {'application/octet-stream'} }; $response.ContentType = $mime; $response.ContentLength64 = $bytes.Length; $response.OutputStream.Write($bytes, 0, $bytes.Length) } else { $response.StatusCode = 404 }; $response.Close() } }"
pause
