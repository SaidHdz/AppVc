import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BluetoothContext = createContext();

export const BluetoothProvider = ({ children }) => {
  const [lastEvent, setLastEvent] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [history, setHistory] = useState([]);
  const [sosNumber, setSosNumber] = useState('911'); // Valor por defecto

  useEffect(() => {
    loadHistory();
    loadSosNumber();
  }, []);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('@impact_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (e) { console.error("Error cargando historial", e); }
  };

  const loadSosNumber = async () => {
    try {
      const savedNumber = await AsyncStorage.getItem('@sos_number');
      if (savedNumber) setSosNumber(savedNumber);
    } catch (e) { console.error("Error cargando número SOS", e); }
  };

  const saveSosNumber = async (number) => {
    try {
      setSosNumber(number);
      await AsyncStorage.setItem('@sos_number', number);
      return true;
    } catch (e) {
      console.error("Error guardando número SOS", e);
      return false;
    }
  };

  const onDataReceived = async (data) => {
    setLastEvent(data);
    const newHistory = [data, ...history].slice(0, 50);
    setHistory(newHistory);
    await AsyncStorage.setItem('@impact_history', JSON.stringify(newHistory));
    
    if (data.force > 10 && alertsEnabled) {
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
      lastEvent, isConnected, isAlertActive, alertsEnabled, history, sosNumber,
      onDataReceived, simulateImpact, dismissAlert, clearHistory,
      setIsConnected, setAlertsEnabled, saveSosNumber
    }}>
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => useContext(BluetoothContext);