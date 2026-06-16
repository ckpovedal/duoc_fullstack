@echo off
echo ========================================
echo  Instalando dependencias de todos los servicios
echo ========================================
echo.

echo [1/8] Instalando frontend...
cd frontend
call npm install
cd ..

echo [2/8] Instalando api-gateway...
cd api-gateway
call npm install
cd ..

echo [3/8] Instalando hallazgos-service...
cd hallazgos-service
call npm install
cd ..

echo [4/8] Instalando perdidas-service...
cd perdidas-service
call npm install
cd ..

echo [5/8] Instalando buscador-service...
cd buscador-service
call npm install
cd ..

echo [6/8] Instalando geolocalizacion-service...
cd geolocalizacion-service
call npm install
cd ..

echo [7/8] Instalando mensajeria-service...
cd mensajeria-service
call npm install
cd ..

echo [8/8] Instalando donativos-service...
cd donativos-service
call npm install
cd ..

echo.
echo ========================================
echo  Todos los servicios instalados!
echo ========================================
pause
