# Iniciar API Gateway
Start-Process powershell -WindowStyle Minimized -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\api-gateway'; npm run dev"

Start-Sleep -Seconds 2

# Iniciar Perdidas Service
Start-Process powershell -WindowStyle Minimized -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\perdidas-service'; npm run dev"

Start-Sleep -Seconds 2

# Iniciar Hallazgos Service
Start-Process powershell -WindowStyle Minimized -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\hallazgos-service'; npm run dev"

Start-Sleep -Seconds 2

# Iniciar Buscador Service
Start-Process powershell -WindowStyle Minimized -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\buscador-service'; npm run dev"

Start-Sleep -Seconds 2

# Iniciar Usuario Service (Spring Boot con Maven)
Start-Process powershell -WindowStyle Minimized -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\usuario-service'; .\mvnw.cmd spring-boot:run"

Start-Sleep -Seconds 2

# Iniciar Frontend
Start-Process powershell -WindowStyle Minimized -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; ionic serve"

Write-Host "Todos los servicios han sido iniciados!" -ForegroundColor Green