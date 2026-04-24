import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeadModelViewer from '../components/HeadModelViewer';
import AlertModal from '../components/AlertModal';
import { useBluetooth } from '../context/BluetoothContext';
import { 
  Battery, 
  Wifi, 
  Clock, 
  Bell, 
  BellOff, 
  ShieldAlert,
  Activity
} from 'lucide-react-native';

export default function HomeScreen() {
  const { 
    lastEvent, 
    isConnected, 
    simulateImpact, 
    setIsConnected, 
    alertsEnabled, 
    setAlertsEnabled 
  } = useBluetooth();

  // Lógica de severidad clínica
  const getSeverity = (force) => {
    if (force < 7) return { label: 'Leve', color: '#4CAF50', bg: '#E8F5E9' };
    if (force <= 11) return { label: 'Moderado', color: '#FFA000', bg: '#FFF8E1' };
    return { label: 'Severo', color: '#D32F2F', bg: '#FFEBEE' };
  };

  const severity = lastEvent ? getSeverity(lastEvent.force) : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Clínico */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>REVYN HEAD GUARD</Text>
          <Text style={styles.patientName}>Paciente: Said Alejandro</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setAlertsEnabled(!alertsEnabled)}
          style={[styles.alertToggle, { backgroundColor: alertsEnabled ? '#E3F2FD' : '#F5F5F5' }]}
        >
          {alertsEnabled ? <Bell size={20} color="#1976D2" /> : <BellOff size={20} color="#9E9E9E" />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tarjeta de Estado del Sensor */}
        <View style={styles.statusCard}>
          <View style={styles.statusItem}>
            <Battery size={20} color={isConnected ? '#4CAF50' : '#9E9E9E'} />
            <Text style={styles.statusVal}>85%</Text>
            <Text style={styles.statusLab}>Batería</Text>
          </View>
          <View style={[styles.statusItem, styles.statusBorder]}>
            <Wifi size={20} color={isConnected ? '#1976D2' : '#D32F2F'} />
            <Text style={styles.statusVal}>{isConnected ? 'Fuerte' : 'Sin señal'}</Text>
            <Text style={styles.statusLab}>Conexión</Text>
          </View>
          <View style={styles.statusItem}>
            <Clock size={20} color="#616161" />
            <Text style={styles.statusVal}>14:20</Text>
            <Text style={styles.statusLab}>Sincro</Text>
          </View>
        </View>
        
        {/* Visor 3D */}
        <View style={styles.viewerContainer}>
          <HeadModelViewer 
            impactZone={lastEvent?.zone} 
            lastEventId={lastEvent?.id}
          />
        </View>

        {/* Panel de Impacto Reciente */}
        <View style={styles.impactPanel}>
          <View style={styles.panelHeader}>
            <View style={styles.row}>
              <Activity size={20} color="#333" />
              <Text style={styles.panelTitle}>Impacto Reciente</Text>
            </View>
            {severity && (
              <View style={[styles.severityBadge, { backgroundColor: severity.bg }]}>
                <Text style={[styles.severityText, { color: severity.color }]}>
                  {severity.label.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {lastEvent ? (
            <View style={styles.eventGrid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>ZONA</Text>
                <Text style={styles.gridValue}>{lastEvent.zone.replace('_', ' ').toUpperCase()}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>ACELERACIÓN</Text>
                <Text style={[styles.gridValue, { color: severity.color }]}>{lastEvent.force} G</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.emptyMsg}>Esperando telemetría del sensor...</Text>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.simBtn} onPress={simulateImpact}>
              <ShieldAlert size={18} color="#fff" />
              <Text style={styles.btnText}>Test Impacto</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.connBtn, { borderColor: isConnected ? '#4CAF50' : '#D32F2F' }]} 
              onPress={() => setIsConnected(!isConnected)}
            >
              <Text style={[styles.btnText, { color: isConnected ? '#4CAF50' : '#D32F2F' }]}>
                {isConnected ? 'Activo' : 'Reconectar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <AlertModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    backgroundColor: '#fff'
  },
  brand: { fontSize: 12, fontWeight: '900', color: '#1976D2', letterSpacing: 1 },
  patientName: { fontSize: 18, fontWeight: 'bold', color: '#212121' },
  alertToggle: { padding: 10, borderRadius: 12 },
  scrollContent: { paddingBottom: 20 },
  statusCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    margin: 20, 
    borderRadius: 20, 
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  statusItem: { flex: 1, alignItems: 'center' },
  statusBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#F5F5F5' },
  statusVal: { fontSize: 14, fontWeight: 'bold', color: '#212121', marginTop: 4 },
  statusLab: { fontSize: 10, color: '#9E9E9E', fontWeight: '600', marginTop: 2 },
  viewerContainer: { height: 350, backgroundColor: '#0A0C10', marginHorizontal: 20, borderRadius: 25, overflow: 'hidden' },
  impactPanel: { backgroundColor: '#fff', margin: 20, borderRadius: 25, padding: 20, elevation: 5 },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  panelTitle: { fontSize: 16, fontWeight: 'bold', color: '#424242' },
  severityBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  severityText: { fontSize: 11, fontWeight: '900' },
  eventGrid: { flexDirection: 'row', gap: 20, backgroundColor: '#FAFAFA', padding: 15, borderRadius: 15 },
  gridItem: { flex: 1 },
  gridLabel: { fontSize: 10, fontWeight: '800', color: '#9E9E9E', marginBottom: 4 },
  gridValue: { fontSize: 18, fontWeight: 'bold', color: '#212121' },
  emptyMsg: { textAlign: 'center', color: '#9E9E9E', fontStyle: 'italic', marginVertical: 20 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  simBtn: { flex: 2, backgroundColor: '#1976D2', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 15, gap: 8 },
  connBtn: { flex: 1, borderWidth: 2, justifyContent: 'center', alignItems: 'center', borderRadius: 15 },
  btnText: { fontWeight: 'bold', fontSize: 14, color: '#fff' }
});