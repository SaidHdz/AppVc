import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuración de cómo se muestran las notificaciones cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Servicio para gestionar las notificaciones locales de Shield Sense.
 */
export const NotificationService = {
  /**
   * Solicita permisos de notificación y configura canales de Android.
   */
  async setup() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (Platform.OS === 'android') {
      // Configuración del canal de impacto (Crítico/Alto)
      await Notifications.setNotificationChannelAsync('impact-alerts', {
        name: 'Impact Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D32F2F', // Rojo Alerta
        sound: 'default',
        description: 'Notificaciones de impactos detectados por el sensor.',
      });

      // Configuración del canal de estado (Informativo/Bajo)
      await Notifications.setNotificationChannelAsync('status-updates', {
        name: 'Status Updates',
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: '#1976D2', // Azul Médico
        sound: 'default',
        description: 'Actualizaciones de estado de conexión y batería.',
      });
    }

    return finalStatus === 'granted';
  },

  /**
   * Dispara una notificación de impacto.
   * @param {string} zone - Zona del impacto (ej. Frontal)
   * @param {number} force - Fuerza en G
   */
  async notifyImpact(zone, force) {
    const isCritical = force > 11;
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: isCritical ? "🚨 ¡ALERTA DE IMPACTO CRÍTICO!" : "⚠️ Impacto Detectado",
        body: `Zona: ${zone} | Fuerza: ${force}G. Revise el estado del usuario.`,
        data: { zone, force, type: 'impact' },
        color: isCritical ? '#D32F2F' : '#1976D2', // Color de la notificación en Android
        android: {
          channelId: 'impact-alerts',
          priority: 'max',
        }
      },
      trigger: null, // Envío inmediato
    });
  }
};
