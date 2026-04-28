# **Guía Técnica de Desarrollo: Shield Sense**

Este documento detalla la arquitectura, el stack tecnológico, y la resolución de problemas específicos encontrados durante el desarrollo de la aplicación **Shield Sense**.

## **1. Arquitectura y Estructura**
La aplicación utiliza un patrón de diseño basado en **Contextos** para el estado global y **Servicios** para funcionalidades de hardware/sistema.

```text
src/
├── components/     # UI Atómica y Visores (HeadModelViewer, AlertModal)
├── context/        # Lógica de Negocio y Estado (BluetoothContext)
├── screens/        # Vistas de Navegación (Splash, Home, History, Settings)
└── services/       # Interfaces de Sistema (NotificationService)
```

## **2. Stack Tecnológico (Versiones Estables)**
Para evitar conflictos de dependencias, se han fijado las siguientes versiones en `package.json`:

*   **Expo SDK:** `54.0.0`
*   **React Native:** `0.81.5`
*   **Three.js:** `0.166.1` (Fijado mediante `overrides`)
*   **Navegación:** `React Navigation v7`
*   **UI/Estilos:** `NativeWind v2.0.11` (Tailwind CSS)
*   **Iconos:** `Lucide React Native`

## **3. Gestión de Dependencias Críticas (Three.js)**
Uno de los mayores retos en apps con 3D es el duplicado de versiones de `three`. Se ha forzado una única versión para evitar errores de contexto en el renderizado:

```json
"overrides": {
  "three": "0.166.1"
}
```
*Si se actualizan paquetes de `@react-three`, siempre verificar que no se introduzcan versiones duplicadas con `npm list three`.*

## **4. Resolución de Errores Comunes (Troubleshooting)**

### **A. SyntaxError: Identifier Already Declared**
*   **Causa:** Conflicto de nombres entre módulos nativos de Expo y componentes locales (ej. `SplashScreen`).
*   **Solución:** Usar alias para las pantallas locales (ej. `import ShieldSplashScreen from './src/screens/SplashScreen'`).

### **B. Notificaciones en Expo Go**
*   **Advertencia:** `expo-notifications functionality is not fully supported in Expo Go`.
*   **Nota:** Es un aviso esperado. La lógica implementada con `scheduleNotificationAsync` es la correcta para producción y funcionará al generar el APK/AAB nativo.

### **C. Pantalla de Carga (Splash Screen)**
*   **Flujo:** `Splash nativo Expo` -> `App.js (hideAsync)` -> `ShieldSplashScreen (Lógica personalizada)`.
*   **Importante:** Se usa `SplashScreen.preventAutoHideAsync()` para que la transición entre la carga nativa y nuestra UI sea fluida.

## **5. Lógica de Severidad (Semáforo)**
La aplicación clasifica los impactos basados en la fuerza G detectada:

*   🟡 **Amarillo (Leve):** `< 7G`. Requiere atención básica.
*   🟠 **Naranja (Moderado):** `7G - 11G`. Requiere monitoreo del usuario.
*   🔴 **Rojo (Severo):** `> 11G`. Dispara alerta crítica visual y sonora.

## **6. Persistencia de Datos**
Se utiliza `AsyncStorage` para almacenar:
*   `@user_data`: Perfil del usuario (Nombre, Edad, Estatura, Peso).
*   `@impact_history`: Registro de los últimos 50 eventos de impacto.

---
*Documento generado el 27 de Abril, 2026.*
