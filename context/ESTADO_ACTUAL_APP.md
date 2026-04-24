# **Estado Actual del Proyecto: Revyn Head Guard**
**Fecha:** 23 de Abril, 2026 (Sesión Finalizada)
**Lead Developer:** Said Alejandro & AI Agent

## **1. Resumen de la Aplicación**
Revyn Head Guard es una plataforma de monitoreo clínico para traumatismos craneales en tiempo real. Utiliza un visor 3D interactivo para localizar impactos recibidos desde un sensor externo, clasifica la severidad del golpe y activa protocolos de emergencia automáticos.

## **2. Stack Tecnológico Final (Estable)**
*   **Framework:** Expo SDK 54 (Blank Template).
*   **Lenguaje:** JavaScript / React Native.
*   **Motor 3D:** Three.js (`@react-three/fiber` / `@react-three/drei`).
*   **UI:** NativeWind v2.0.11 (Tailwind CSS) con Tailwind v3.3.2 para estabilidad síncrona.
*   **Navegación:** React Navigation (Tabs + Stack).
*   **Gráficas:** `react-native-chart-kit`.
*   **Servicios:** `expo-print` y `expo-sharing` (Generación de PDF).
*   **Estabilidad:** Se eliminó `react-native-reanimated` de componentes críticos para evitar conflictos de TurboModules en Windows, sustituyéndolo por el módulo `Animated` nativo.

## **3. Estructura de Archivos**
*   `App.js`: Router principal y Global Providers.
*   `src/components/HeadModelViewer.js`: Visor 3D con rotación de 14 zonas e iluminación zonal suave.
*   `src/components/AlertModal.js`: Sistema de emergencia con temporizador 30s y Auto-SOS.
*   `src/context/BluetoothContext.js`: Cerebro de la app (Historial, SOS, Sensores).
*   `src/screens/HomeScreen.js`: Dashboard clínico con tarjeta de estado y batería.
*   `src/screens/HistoryScreen.js`: Analíticas de impacto y filtros de severidad.
*   `src/screens/EventDetail.js`: Telemetría, curva de aceleración y exportación PDF.
*   `src/screens/SettingsScreen.js`: Configuración de contacto SOS y paciente.

## **4. Funcionalidades Clave Implementadas**
1.  **Monitoreo 360°:** El modelo 3D rota a 14 puntos específicos y parpadea en rojo solo en la zona afectada.
2.  **Protocolo SOS:** Si el impacto supera los 10G, inicia cuenta regresiva. Si el usuario no responde, llama al número guardado.
3.  **Analíticas Clínicas:** El historial muestra picos máximos, zonas frecuentes y permite filtrar por nivel de riesgo.
4.  **Telemetría con Umbral:** Gráfica de fuerza G con línea roja de seguridad en los 8G.
5.  **Exportación Médica:** Capacidad de compartir un reporte PDF profesional del evento.

## **5. Notas para la Próxima Sesión**
*   **Integración:** Pendiente conectar la inyección de datos reales desde el módulo Bluetooth de Caleb.
*   **Repositorio:** El código está sincronizado en `SaidHdz/AppVc` (rama master).
*   **Mantenimiento:** No intentar subir NativeWind a v4 ni forzar React 19 sin antes resolver la arquitectura de TurboModules en el entorno local.
