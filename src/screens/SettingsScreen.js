import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useBluetooth } from '../context/BluetoothContext';
import { User, Save } from 'lucide-react-native';

export default function SettingsScreen() {
  const { userData, saveUserData } = useBluetooth();
  const [formData, setFormData] = useState(userData);

  useEffect(() => {
    setFormData(userData);
  }, [userData]);

  const handleSave = async () => {
    if (!formData.name) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    const success = await saveUserData(formData);
    if (success) {
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#1976D2" />
            <Text style={styles.sectionTitle}>Perfil de Usuario</Text>
          </View>
          
          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(val) => setFormData({...formData, name: val})}
            placeholder="Ej: Said Alejandro"
          />

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Edad</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(val) => setFormData({...formData, age: val})}
                keyboardType="numeric"
                placeholder="25"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Estatura (cm)</Text>
              <TextInput
                style={styles.input}
                value={formData.height}
                onChangeText={(val) => setFormData({...formData, height: val})}
                keyboardType="numeric"
                placeholder="175"
              />
            </View>
          </View>

          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput
            style={styles.input}
            value={formData.weight}
            onChangeText={(val) => setFormData({...formData, weight: val})}
            keyboardType="numeric"
            placeholder="70"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 40, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  scrollContent: { padding: 20 },
  section: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, color: '#333' },
  label: { fontSize: 14, color: '#666', marginBottom: 8 },
  input: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 },
  row: { flexDirection: 'row', gap: 15 },
  col: { flex: 1 },
  saveButton: { backgroundColor: '#1976D2', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});