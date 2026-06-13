$logsPath = Join-Path $PSScriptRoot "logs"
New-Item -ItemType Directory -Force -Path $logsPath | Out-Null

Start-Process powershell -WindowStyle Minimized -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\api-gateway'; npm run dev"

Start-Sleep -Seconds 2

Start-Process powershell -WindowStyle Minimized -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\perdidas-service'; npm run dev"

Start-Sleep -Seconds 2

Start-Process powershell -WindowStyle Minimized -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\hallazgos-service'; npm run dev"

Start-Sleep -Seconds 2

Start-Process powershell -WindowStyle Minimized -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\buscador-service'; npm run dev"

Start-Sleep -Seconds 2

Start-Process powershell -WindowStyle Minimized -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\geolocalizacion-service'; npm run dev"

Start-Sleep -Seconds 2

Start-Process powershell -WindowStyle Minimized -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\mensajeria-service'; npm run dev"

Start-Sleep -Seconds 2

Start-Process powershell -WindowStyle Minimized -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\usuario-service'; .\mvnw.cmd spring-boot:run"

Start-Sleep -Seconds 2

Start-Process powershell -WindowStyle Minimized -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start"

Write-Host "Todos los servicios han sido iniciados!" -ForegroundColor Green
Write-Host "Logs disponibles en: $logsPath" -ForegroundColor Cyan
