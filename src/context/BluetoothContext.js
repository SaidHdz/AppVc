import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from '../services/NotificationService';
import { BLEService } from '../services/BLEService';

const BluetoothContext = createContext();

export const BluetoothProvider = ({ children }) => {
  const [lastEvent, setLastEvent] = useState(null);
  const [isConnected, _setIsConnected] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const alertsEnabledRef = useRef(true);
  const [history, setHistory] = useState([]);
  const [userData, setUserData] = useState({
    name: 'Said Alejandro',
    age: '',
    height: '',
    weight: ''
  });

  useEffect(() => { alertsEnabledRef.current = alertsEnabled; }, [alertsEnabled]);

  useEffect(() => {
    loadHistory();
    loadUserData();
    NotificationService.setup();

    // Iniciar escaneo BLE automáticamente al montar
    BLEService.startScan(
      onDataReceived,
      () => _setIsConnected(true),
      () => _setIsConnected(false),
    );

    return () => BLEService.destroy();
  }, []);

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem('@impact_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) { console.error('Error cargando historial', e); }
  };

  const loadUserData = async () => {
    try {
      const saved = await AsyncStorage.getItem('@user_data');
      if (saved) setUserData(JSON.parse(saved));
    } catch (e) { console.error('Error cargando datos de usuario', e); }
  };

  const saveUserData = async (data) => {
    try {
      setUserData(data);
      await AsyncStorage.setItem('@user_data', JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error guardando datos de usuario', e);
      return false;
    }
  };

  // Usamos useCallback para que la referencia sea estable al pasarla a BLEService
  const onDataReceived = useCallback(async (data) => {
    setLastEvent(data);
    setHistory(prev => {
      const updated = [data, ...prev].slice(0, 50);
      AsyncStorage.setItem('@impact_history', JSON.stringify(updated));
      return updated;
    });

    if (alertsEnabledRef.current) {
      NotificationService.notifyImpact(data.zone, data.force);
    }

    if (data.force > 11 && alertsEnabledRef.current) {
      setIsAlertActive(true);
    }
  }, []);

  // setIsConnected público: si se llama con true → escanear/conectar; con false → desconectar
  const setIsConnected = (val) => {
    if (val) {
      BLEService.startScan(
        onDataReceived,
        () => _setIsConnected(true),
        () => _setIsConnected(false),
      );
    } else {
      BLEService.disconnect();
      _setIsConnected(false);
    }
  };

  const simulateImpact = () => {
    const zones = [
      'frontal', 'posterior', 'lateral_derecho', 'lateral_izquierdo',
      'superior', 'inferior', 'frontal_derecho', 'frontal_izquierdo',
      'posterior_derecho', 'posterior_izquierdo',
      'frontal_superior', 'posterior_superior',
      'lateral_derecho_superior', 'lateral_izquierdo_superior'
    ];
    onDataReceived({
      id: Date.now().toString(),
      zone: zones[Math.floor(Math.random() * zones.length)],
      force: parseFloat((Math.random() * 15 + 5).toFixed(1)),
      timestamp: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
    });
  };

  const dismissAlert = () => setIsAlertActive(false);

  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.removeItem('@impact_history');
  };

  return (
    <BluetoothContext.Provider value={{
      lastEvent, isConnected, isAlertActive, alertsEnabled, history, userData,
      onDataReceived, simulateImpact, dismissAlert, clearHistory,
      setIsConnected, setAlertsEnabled, saveUserData,
    }}>
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => useContext(BluetoothContext);
