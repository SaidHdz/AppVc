import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useBluetooth } from '../context/BluetoothContext';
import { Shield, Save } from 'lucide-react-native';

export default function SettingsScreen() {
  const { sosNumber, saveSosNumber } = useBluetooth();
  const [number, setNumber] = useState(sosNumber);

  const handleSave = async () => {
    if (number.length < 3) {
      Alert.alert('Error', 'Ingresa un número válido');
      return;
    }
    const success = await saveSosNumber(number);
    if (success) {
      Alert.alert('Éxito', 'Número SOS guardado correctamente');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Ajustes</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color="#1976D2" />
            <Text style={styles.sectionTitle}>Configuración SOS</Text>
          </View>
          
          <Text style={styles.label}>Número de Emergencia</Text>
          <TextInput
            style={styles.input}
            value={number}
            onChangeText={setNumber}
            keyboardType="phone-pad"
            placeholder="Ej: 911"
          />
          <Text style={styles.helperText}>
            Este número será llamado automáticamente cuando presiones el botón SOS en la alerta de impacto.
          </Text>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Revyn Studio | Said & Caleb</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 40, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  content: { flex: 1, padding: 20, justifyContent: 'space-between' },
  section: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, color: '#333' },
  label: { fontSize: 14, color: '#666', marginBottom: 8 },
  input: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, fontSize: 18, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
  helperText: { fontSize: 12, color: '#999', marginBottom: 20, lineHeight: 18 },
  saveButton: { backgroundColor: '#1976D2', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footer: { paddingBottom: 20, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#999', fontWeight: '500' },
});