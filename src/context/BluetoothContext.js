import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from '../services/NotificationService';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { PermissionsAndroid, Platform } from 'react-native';

const BluetoothContext = createContext();

// UUIDs REALES DEL CASCO DE CALEB
const SERVICE_UUID = '0000feed-0000-1000-8000-00805f9b34fb';
const CHAR_TIME_SYNC_UUID = '9d410018-35d6-f4dd-ba60-e7bd8dc491c0';
const CHAR_IMPACT_UUID = '9d410019-35d6-f4dd-ba60-e7bd8dc491c0';

export const BluetoothProvider = ({ children }) => {
  const manager = useRef(new BleManager()).current;
  const [device, setDevice] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [history, setHistory] = useState([]);
  const [userData, setUserData] = useState({ name: '', age: '', height: '', weight: '' });
  
  const pollInterval = useRef(null);
  const lastRawData = useRef(null);

  useEffect(() => {
    loadHistory();
    loadUserData();
    NotificationService.setup();
    return () => {
      stopPolling();
      manager.destroy();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      return Object.values(granted).every(status => status === 'granted');
    }
    return true;
  };

  const startScan = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    manager.stopDeviceScan();
    console.log("--- BUSCANDO CASCO ---");
    manager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) return console.error(error.message);
      if (scannedDevice && (scannedDevice.id === '40:00:C6:66:F9:09' || scannedDevice.id === '40:00:CA:77:2C:B9' || scannedDevice.name === 'Shield Sense')) {
        console.log("Casco encontrado. Conectando...");
        manager.stopDeviceScan();
        connectToDevice(scannedDevice);
      }
    });
    setTimeout(() => manager.stopDeviceScan(), 10000);
  };

  const connectToDevice = async (targetDevice) => {
    try {
      const connectedDevice = await targetDevice.connect();
      await connectedDevice.discoverAllServicesAndCharacteristics();
      setDevice(connectedDevice);
      setIsConnected(true);
      console.log("¡Vínculo Activo!");
      
      // Iniciar el Polling (Preguntar por datos cada 250ms)
      startPolling(connectedDevice);

      connectedDevice.onDisconnected(() => {
        stopPolling();
        setIsConnected(false);
        setDevice(null);
      });
    } catch (e) {
      console.error("Fallo:", e.message);
    }
  };

  const startPolling = (connectedDevice) => {
    console.log("Iniciando Polling de Impactos...");
    pollInterval.current = setInterval(async () => {
      try {
        const characteristic = await connectedDevice.readCharacteristicForService(SERVICE_UUID, CHAR_IMPACT_UUID);
        if (characteristic?.value && characteristic.value !== lastRawData.current) {
          lastRawData.current = characteristic.value;
          console.log(">>> NUEVO IMPACTO DETECTADO POR POLLING <<<");
          parseImpactData(characteristic.value);
        }
      } catch (e) {
        // Ignorar errores de lectura momentáneos
      }
    }, 250); // 4 veces por segundo
  };

  const stopPolling = () => {
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }
  };

  const syncTime = async () => {
    if (!device) return false;
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64LE(BigInt(Date.now()));
    try {
      await device.writeCharacteristicWithResponseForService(SERVICE_UUID, CHAR_TIME_SYNC_UUID, buffer.toString('base64'));
      return true;
    } catch (e) { return false; }
  };

  const parseImpactData = (base64Value) => {
    const buffer = Buffer.from(base64Value, 'base64');
    if (buffer.length < 24) return;
    const timestamp = buffer.readBigUInt64LE(0);
    const magnitudeG = buffer.readUInt16LE(8) / 1000;
    const regionId = buffer.readUInt8(24);
    const regionMap = ['frontal', 'posterior', 'lateral_izquierdo', 'lateral_derecho', 'superior', 'inferior'];
    
    onDataReceived({
      id: Date.now().toString(),
      zone: regionMap[regionId] || 'desconocida',
      force: parseFloat(magnitudeG.toFixed(1)),
      timestamp: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
    });
  };

  const loadHistory = async () => {
    const saved = await AsyncStorage.getItem('@impact_history');
    if (saved) setHistory(JSON.parse(saved));
  };

  const loadUserData = async () => {
    const saved = await AsyncStorage.getItem('@user_data');
    if (saved) setUserData(JSON.parse(saved));
  };

  const saveUserData = async (data) => {
    setUserData(data);
    await AsyncStorage.setItem('@user_data', JSON.stringify(data));
    return true;
  };

  const onDataReceived = (data) => {
    setLastEvent(data);
    const newHistory = [data, ...history].slice(0, 50);
    setHistory(newHistory);
    AsyncStorage.setItem('@impact_history', JSON.stringify(newHistory));
    if (alertsEnabled) NotificationService.notifyImpact(data.zone, data.force);
    if (data.force > 11 && alertsEnabled) setIsAlertActive(true);
  };

  const simulateImpact = () => {
    onDataReceived({
      id: Date.now().toString(),
      zone: 'frontal',
      force: 9.5,
      timestamp: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
    });
  };

  const dismissAlert = () => setIsAlertActive(false);
  const clearHistory = async () => { setHistory([]); await AsyncStorage.removeItem('@impact_history'); };

  return (
    <BluetoothContext.Provider value={{ 
      lastEvent, isConnected, isAlertActive, alertsEnabled, history, userData,
      onDataReceived, simulateImpact, dismissAlert, clearHistory,
      setAlertsEnabled, saveUserData, startScan, syncTime
    }}>
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => useContext(BluetoothContext);