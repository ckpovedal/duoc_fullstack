@echo off
echo ========================================
echo  Instalando dependencias de todos los servicios
echo ========================================
echo.

echo [1/9] Instalando frontend...
cd frontend
call npm install
cd ..

echo [2/9] Instalando api-gateway...
cd api-gateway
call npm install
cd ..

echo [3/9] Instalando hallazgos-service...
cd hallazgos-service
call npm install
cd ..

echo [4/9] Instalando perdidas-service...
cd perdidas-service
call npm install
cd ..

echo [5/9] Instalando buscador-service...
cd buscador-service
call npm install
cd ..

echo [6/9] Instalando geolocalizacion-service...
cd geolocalizacion-service
call npm install
cd ..

echo [7/9] Instalando mensajeria-service...
cd mensajeria-service
call npm install
cd ..

echo [8/9] Instalando notificaciones-service...
cd notificaciones-service
call npm install
cd ..

echo [9/9] Instalando donativos-service...
cd donativos-service
call npm install
cd ..

echo.
echo ========================================
echo  Todos los servicios instalados!
echo ========================================
pause
