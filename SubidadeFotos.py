import psycopg2
import os

# CONFIGURACIÓN - DATOS DE RAILWAY
DB_CONFIG = {
    "host": "rlwy.net",        # Ej: containers-us-west.railway.app
    "port": 0000,
    "database": "railway",
    "user": "postgres",
    "password": "Contraseña"
}

# Ruta de tu imagen en Windows
p_id = "PRD00006"
ruta_imagen = r"C:\Users\Carlos\Desktop\imagenes\MaineCoon.jpg"

def subir_foto_a_railway():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("✅ Conectado a Railway exitosamente")
        
        # Verificar que la imagen existe
        if not os.path.exists(ruta_imagen):
            print(f"❌ No se encontró la imagen en: {ruta_imagen}")
            return
        
        # Leer imagen desde tu PC
        with open(ruta_imagen, 'rb') as archivo:
            imagen_bytes = psycopg2.Binary(archivo.read())
        
        print(f"📸 Imagen leída correctamente. Tamaño: {os.path.getsize(ruta_imagen)} bytes")
        
        # Actualizar en Railway
        cursor.execute("""
            UPDATE PERDIDA
            SET P_Imagen = %s 
            WHERE P_ID = %s
        """, (imagen_bytes, p_id))
        
        conn.commit()
        print("✅ Foto subida exitosamente a Railway")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nVerifica que los datos de conexión sean correctos")
        print("Los encuentras en Railway Dashboard → PostgreSQL → Connect")

if __name__ == "__main__":
    subir_foto_a_railway()