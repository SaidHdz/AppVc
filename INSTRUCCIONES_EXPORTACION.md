# Guía de Exportación y Pruebas — Shield Sense

Este documento detalla los pasos para generar el instalador final (APK) y cómo validar la conexión con el hardware de Caleb.

## 1. Generación del APK (Android)
Debido a que la app usa Bluetooth nativo, no se puede usar Expo Go. Debes generar un **Development Build**.

### Opción A: Compilación en la Nube (EAS Build)
Recomendado si no tienes Android Studio configurado para compilación.
1. En la terminal ejecuta:
   ```powershell
   npx eas-cli build -p android --profile preview
   ```
2. Escanea el código QR resultante al final del proceso para descargar e instalar el APK en tu teléfono.

### Opción B: Compilación Local
Si tienes Android Studio y el teléfono conectado por USB/WiFi:
```powershell
npx expo run:android
```

## 2. Configuración del Servidor de Desarrollo
Para ver cambios en tiempo real una vez instalada la app:
1. Inicia Metro: `npx expo start --dev-client`
2. Abre la app **Shield Sense** en tu teléfono (no Expo Go).

## 3. Checklist para Caleb (Firmware Arduino)
La app ya está configurada para el protocolo real detectado (**familia FEED**), pero el hardware **no está transmitiendo**. Para que funcione, el código de Arduino debe incluir:

1. **Descriptor VITAL:** `pCharImpact->addDescriptor(new BLE2902());` (Sin esto Android bloquea los datos).
2. **Función de Envío:** `pCharImpact->notify();` después de actualizar el valor.
3. **UUIDs Actuales:**
   - Servicio: `0000feed-0000-1000-8000-00805f9b34fb`
   - Impacto: `9d410019-35d6-f4dd-ba60-e7bd8dc491c0`

## 4. Prueba de Impacto
- **Real:** Presiona "Reconectar". Cuando diga "Vínculo Activo", el sensor enviará datos automáticamente.
- **Simulada:** Presiona "Test Impacto" para validar que el modelo 3D, las alertas rojas y el PDF funcionan correctamente.
