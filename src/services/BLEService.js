import { BleManager, State } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';

const DEVICE_NAME = 'Shield Sense';
const SERVICE_UUID        = '5a4f0001-1b3c-4f5e-8a9b-1c2d3e4f5a6b';
const CHAR_TIME_SYNC_UUID = '5a4f0002-1b3c-4f5e-8a9b-1c2d3e4f5a6b';
const CHAR_IMPACT_UUID    = '5a4f0003-1b3c-4f5e-8a9b-1c2d3e4f5a6b';
const TARGET_MTU          = 185;

const REGION_MAP = [
  'frontal',
  'posterior',
  'lateral_izquierdo',
  'lateral_derecho',
  'superior',
  'inferior',
];

// El manager se recrea si fue destruido (ej. app abierta después de cerrar)
let manager = new BleManager();
let connectedDevice = null;
let impactSubscription = null;
let autoReconnect = false;
let isConnecting = false;  // guard contra conexiones simultáneas

// --- Helpers de codificación ---

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint64LeToBase64(ms) {
  const bytes = new Uint8Array(8);
  const lo = ms >>> 0;
  const hi = Math.floor(ms / 0x100000000) >>> 0;
  bytes[0] = lo & 0xFF;
  bytes[1] = (lo >>> 8) & 0xFF;
  bytes[2] = (lo >>> 16) & 0xFF;
  bytes[3] = (lo >>> 24) & 0xFF;
  bytes[4] = hi & 0xFF;
  bytes[5] = (hi >>> 8) & 0xFF;
  bytes[6] = (hi >>> 16) & 0xFF;
  bytes[7] = (hi >>> 24) & 0xFF;
  return btoa(String.fromCharCode(...bytes));
}

// --- Parser del payload binario de 26 bytes (little-endian) ---

function parsePayload(base64) {
  const bytes = base64ToUint8Array(base64);
  if (bytes.length < 26) {
    throw new Error(`Payload truncado: ${bytes.length} bytes (esperados 26). MTU insuficiente.`);
  }
  const dv = new DataView(bytes.buffer);
  const magnitude_mg = dv.getUint16(8, true);
  const region = dv.getUint8(24);
  return {
    id: Date.now().toString(),
    force: parseFloat((magnitude_mg / 1000).toFixed(2)),
    zone: REGION_MAP[region] ?? 'frontal',
    region,
    dir: {
      x: dv.getInt16(10, true) / 1000,
      y: dv.getInt16(12, true) / 1000,
      z: dv.getInt16(14, true) / 1000,
    },
    rot_mag_dps: dv.getUint16(16, true),
    timestamp_ms: dv.getUint32(0, true) + dv.getUint32(4, true) * 0x100000000,
    timestamp: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
  };
}

// --- Permisos Android ---

async function requestAndroidPermissions() {
  if (Platform.OS !== 'android') return true;
  if (Platform.Version >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
    return Object.values(results).every(r => r === PermissionsAndroid.RESULTS.GRANTED);
  }
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

// --- Esperar a que el Bluetooth esté encendido ---

function waitForPoweredOn() {
  return new Promise(resolve => {
    const sub = manager.onStateChange(s => {
      if (s === State.PoweredOn) { sub.remove(); resolve(); }
    }, true);
  });
}

// --- Sincronización de tiempo al conectar ---

async function sendTimeSync(device) {
  const base64 = uint64LeToBase64(Date.now());
  await device.writeCharacteristicWithResponseForService(
    SERVICE_UUID,
    CHAR_TIME_SYNC_UUID,
    base64,
  );
}

// --- Conexión y suscripción a impactos ---

async function connectAndSubscribe(device, onImpact, onConnect, onDisconnect) {
  // Pedir MTU explícitamente para que el payload de 26 bytes llegue completo
  const connected = await device.connect({ requestMTU: TARGET_MTU });
  await connected.discoverAllServicesAndCharacteristics();
  connectedDevice = connected;

  try {
    await sendTimeSync(connected);
  } catch (e) {
    console.warn('[BLE] Time sync falló (no crítico):', e);
  }
  onConnect?.();

  connected.onDisconnected(() => {
    connectedDevice = null;
    impactSubscription = null;
    isConnecting = false;
    onDisconnect?.();
    if (autoReconnect) {
      setTimeout(() => BLEService.startScan(onImpact, onConnect, onDisconnect), 2000);
    }
  });

  impactSubscription = connected.monitorCharacteristicForService(
    SERVICE_UUID,
    CHAR_IMPACT_UUID,
    (err, char) => {
      if (err || !char?.value) return;
      try {
        onImpact?.(parsePayload(char.value));
      } catch (parseErr) {
        console.warn('[BLE] Error al parsear payload:', parseErr.message);
      }
    },
  );
}

// --- API pública ---

export const BLEService = {
  async startScan(onImpact, onConnect, onDisconnect) {
    // Recrear el manager si fue destruido al cerrar la app
    if (!manager) {
      manager = new BleManager();
    }

    const granted = await requestAndroidPermissions();
    if (!granted) {
      console.warn('[BLE] Permisos de Bluetooth denegados');
      return;
    }

    const state = await manager.state();
    if (state !== State.PoweredOn) {
      await waitForPoweredOn();
    }

    autoReconnect = true;

    manager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        console.warn('[BLE] Error en escaneo:', error);
        return;
      }
      if (!device || device.name !== DEVICE_NAME) return;
      if (isConnecting || connectedDevice) return;  // evitar conexiones simultáneas

      isConnecting = true;
      manager.stopDeviceScan();

      try {
        await connectAndSubscribe(device, onImpact, onConnect, onDisconnect);
      } catch (e) {
        console.error('[BLE] Error al conectar:', e);
        connectedDevice = null;
        isConnecting = false;
        onDisconnect?.();
      }
    });
  },

  disconnect() {
    autoReconnect = false;
    isConnecting = false;
    impactSubscription?.remove();
    impactSubscription = null;
    connectedDevice?.cancelConnection().catch(() => {});
    connectedDevice = null;
  },

  isConnected() {
    return connectedDevice !== null;
  },

  destroy() {
    this.disconnect();
    if (manager) {
      manager.destroy();
      manager = null;
    }
  },
};
