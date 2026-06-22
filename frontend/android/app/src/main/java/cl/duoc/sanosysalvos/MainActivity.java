package cl.duoc.sanosysalvos;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    public static final String CHANNEL_ID = "sanos_y_salvos_default";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        crearCanalNotificaciones();
    }

    private void crearCanalNotificaciones() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel canal = new NotificationChannel(
                    CHANNEL_ID,
                    "Sanos y Salvos",
                    NotificationManager.IMPORTANCE_HIGH
            );
            canal.setDescription("Notificaciones de mensajes y coincidencias de Sanos y Salvos");
            canal.enableVibration(true);
            canal.setShowBadge(true);

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(canal);
            }
        }
    }
}