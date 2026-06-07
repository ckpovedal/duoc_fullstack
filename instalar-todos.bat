@echo off
echo ========================================
echo  Instalando dependencias de todos los servicios
echo ========================================
echo.

echo [1/6] Instalando frontend...
cd frontend
call npm install
cd ..

echo [2/6] Instalando api-gateway...
cd api-gateway
call npm install
cd ..

echo [3/6] Instalando hallazgos-service...
cd hallazgos-service
call npm install
cd ..

echo [4/6] Instalando perdidas-service...
cd perdidas-service
call npm install
cd ..

echo [5/6] Instalando buscador-service...
cd buscador-service
call npm install
cd ..

echo [6/6] Instalando geolocalizacion-service...
cd geolocalizacion-service
call npm install
cd ..

echo.
echo ========================================
echo  Todos los servicios instalados!
echo ========================================
pause
