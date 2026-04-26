@echo off
echo ========================================
echo  Instalando dependencias de todos los servicios
echo ========================================
echo.

echo [1/5] Instalando frontend...
cd frontend
call npm install
cd ..

echo [2/5] Instalando api-Gateway...
cd api-Gateway
call npm install
cd ..

echo [3/5] Instalando hallazgos-service...
cd hallazgos-service
call npm install
cd ..

echo [4/5] Instalando perdidas-service...
cd perdidas-service
call npm install
cd ..

echo [5/5] Instalando buscador-service...
cd buscador-service
call npm install
cd ..

echo.
echo ========================================
echo  ¡Todos los servicios instalados!
echo ========================================
pause