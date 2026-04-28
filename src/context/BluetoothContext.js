import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from '../services/NotificationService';

const BluetoothContext = createContext();

export const BluetoothProvider = ({ children }) => {
  const [lastEvent, setLastEvent] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [history, setHistory] = useState([]);
  const [userData, setUserData] = useState({
    name: 'Said Alejandro',
    age: '',
    height: '',
    weight: ''
  });

  useEffect(() => {
    loadHistory();
    loadUserData();
    NotificationService.setup(); // Inicializar permisos y canales de notificación
  }, []);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('@impact_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (e) { console.error("Error cargando historial", e); }
  };

  const loadUserData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('@user_data');
      if (savedData) setUserData(JSON.parse(savedData));
    } catch (e) { console.error("Error cargando datos de usuario", e); }
  };

  const saveUserData = async (data) => {
    try {
      setUserData(data);
      await AsyncStorage.setItem('@user_data', JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Error guardando datos de usuario", e);
      return false;
    }
  };

  const onDataReceived = async (data) => {
    setLastEvent(data);
    const newHistory = [data, ...history].slice(0, 50);
    setHistory(newHistory);
    await AsyncStorage.setItem('@impact_history', JSON.stringify(newHistory));
    
    // Disparar notificación si las alertas están habilitadas
    if (alertsEnabled) {
      NotificationService.notifyImpact(data.zone, data.force);
    }

    if (data.force > 11 && alertsEnabled) {
      setIsAlertActive(true);
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
    const randomZone = zones[Math.floor(Math.random() * zones.length)];
    const randomForce = (Math.random() * 15 + 5).toFixed(1); 
    onDataReceived({
      id: Date.now().toString(),
      zone: randomZone,
      force: parseFloat(randomForce),
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
      setIsConnected, setAlertsEnabled, saveUserData
    }}>
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => useContext(BluetoothContext);