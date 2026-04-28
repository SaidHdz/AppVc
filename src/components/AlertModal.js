import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBluetooth } from '../context/BluetoothContext';

export default function AlertModal() {
  const { isAlertActive, lastEvent, dismissAlert, userData } = useBluetooth();

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isAlertActive}
      onRequestClose={dismissAlert}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.warningText}>¡ALERTA DE IMPACTO!</Text>
          
          {lastEvent && (
            <View style={styles.dataContainer}>
              <Text style={styles.gForceText}>{lastEvent.force} G</Text>
            </View>
          )}

          <Text style={styles.instructionText}>
            {userData.name} ha sufrido un golpe fuerte en {lastEvent?.zone?.replace('_', ' ').toUpperCase()}, se requiere monitoreo.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.dismissButton]} 
              onPress={dismissAlert}
            >
              <Text style={styles.dismissButtonText}>CONFIRMAR LECTURA</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D32F2F' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  warningText: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginBottom: 20, textAlign: 'center' },
  dataContainer: { alignItems: 'center', marginBottom: 30 },
  gForceText: { fontSize: 80, fontWeight: 'bold', color: '#FFF' },
  subText: { fontSize: 18, color: '#FFF', opacity: 0.9, marginTop: 5 },
  instructionText: { fontSize: 16, color: '#FFF', textAlign: 'center', marginBottom: 40, lineHeight: 24 },
  buttonContainer: { width: '100%', gap: 15 },
  button: { width: '100%', paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
  sosButton: { backgroundColor: '#FFF' },
  sosButtonText: { color: '#D32F2F', fontSize: 20, fontWeight: 'bold' },
  dismissButton: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#FFF' },
  dismissButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});