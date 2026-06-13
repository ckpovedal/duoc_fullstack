@echo off
echo ========================================
echo  Instalando dependencias de todos los servicios
echo ========================================
echo.

echo [1/7] Instalando frontend...
cd frontend
call npm install
cd ..

echo [2/7] Instalando api-gateway...
cd api-gateway
call npm install
cd ..

echo [3/7] Instalando hallazgos-service...
cd hallazgos-service
call npm install
cd ..

echo [4/7] Instalando perdidas-service...
cd perdidas-service
call npm install
cd ..

echo [5/7] Instalando buscador-service...
cd buscador-service
call npm install
cd ..

echo [6/7] Instalando geolocalizacion-service...
cd geolocalizacion-service
call npm install
cd ..

echo [7/7] Instalando mensajeria-service...
cd mensajeria-service
call npm install
cd ..

echo.
echo ========================================
echo  Todos los servicios instalados!
echo ========================================
pause
