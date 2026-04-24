## **1\. Configuración del Entorno (Stack Tecnológico)**

**Instalación y Configuración del Proyecto RevynHeadGuard**

1. **Crear proyecto Expo:**  
   `npx create-expo-app RevynHeadGuard --template blank`  
   `cd RevynHeadGuard`  
2. **Instalar NativeWind (Tailwind):**  
   `npm install nativewind tailwindcss`  
   `npx tailwindcss init`  
3. **Instalar dependencias 3D y Navegación:**  
   `npm install three @react-three/fiber @react-three/expo expo-gl`  
   `npm install @react-navigation/native @react-navigation/bottom-tabs`  
   `npm install lucide-react-native react-native-reanimated react-native-svg`

**2\. Identidad Visual (Tailwind Config)**

Para que los colores sean consistentes, configura tu `tailwind.config.js`:

* **Primario (Confianza):** `#1976D2` (Azul Médico)  
* **Alerta (Peligro):** `#D32F2F` (Rojo)  
* **Estado (Seguro):** `#4CAF50` (Verde)  
* **Fondo:** `#F5F7FA` (Gris muy claro)

**Componentes (`/components`)**

* `HeadModel.js`: Contiene el modelo 3D implementado con Three.js.  
* `ImpactCard.js`: Componente de tarjeta para el último evento registrado.  
* `AlertModal.js`: Pantalla modal de color rojo para las alertas.

**Pantallas (`/screens`)**

* `Dashboard.js`  
* `History.js`  
* `Detail.js`  
* `Settings.js`

**Contextos (`/context`)**

* `BluetoothContext.js`: Manejará la información proveniente del módulo de Caleb (datos por Bluetooth).

## **4\. Implementación de Pantallas y Funcionalidad**

### **A. Dashboard (La "Home")**

* **Visual:** El modelo 3D ocupa la parte superior. Debajo, un indicador de batería y conexión.  
* **Botones:** \* `Ver Historial`: Navega a `History`.  
  * `Configuración`: Navega a `Settings`.  
* **Lógica:** Si llega un dato de "impacto" desde el Context, la cámara del 3D rota hacia el ángulo del golpe.

### **B. Impact Alert Modal (La pantalla de emergencia)**

* **Trigger:** Se activa automáticamente cuando el valor de `g` (fuerza) supera el umbral (ej. \> 8g).  
* **Visual:** Fondo rojo vibrante, texto masivo con los G's detectados.  
* **Botón Crítico:** `LLAMAR SOS` (Lanza el `Linking.openURL('tel:911')`).  
* **Botón Secundario:** `ESTOY BIEN` (Cierra la modal y guarda el log como "Falsa alarma").

### **C. History & Detail (El registro)**

* **History:** Una lista (`FlatList`) que renderiza los impactos guardados en el almacenamiento local (`AsyncStorage`).  
* **Detail:** Muestra la gráfica. Para el MVP, usa un componente de `react-native-svg` para dibujar una línea de pico basada en el valor máximo de G enviado por Caleb.

## **5\. El Modelo 3D (Integración con Three.js)**

Aquí es donde brilla el proyecto. En `HeadModel.js`, usarás un `Canvas`:

import { Canvas } from '@react-three/fiber/native';

import { useGLTF } from '@react-three/drei/native';

function Head({ impactZone }) {

  const { scene } \= useGLTF(require('./assets/head\_model.glb'));


  // Lógica: Si impactZone \== 'frontal', iluminar material en rojo

  return \<primitive object={scene} scale={2} /\>;

}

## **6\. Preparación para Caleb (Bluetooth)**

Para que Caleb solo tenga que "inyectar" la data, crea un **Simulador de Datos** en tu Contexto:

// BluetoothContext.js

export const useBluetooth \= () \=\> {

  const \[lastEvent, setLastEvent\] \= useState(null);

  // Función que Caleb usará para mandar datos desde el Arduino

  const onDataReceived \= (data) \=\> {

    // Ejemplo de data: { zone: 'frontal', force: 12, time: '16:20' }

    setLastEvent(data);

    if(data.force \> 10\) setShowAlert(true);

  };

  return { lastEvent, onDataReceived };

};

