import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBluetooth } from '../context/BluetoothContext';
import { Trash2, Activity, AlertTriangle, Crosshair, Calendar } from 'lucide-react-native';

export default function HistoryScreen({ navigation }) {
  const { history, clearHistory } = useBluetooth();
  const [filterSeverity, setFilterSeverity] = useState('Todos');

  // Lógica de severidad clínica (igual que en Dashboard)
  const getSeverity = (force) => {
    if (force < 7) return { label: 'Leve', color: '#FBC02D', bg: '#FFFDE7' };
    if (force <= 11) return { label: 'Moderado', color: '#FF9800', bg: '#FFF3E0' };
    return { label: 'Severo', color: '#D32F2F', bg: '#FFEBEE' };
  };

  // Cálculos Analíticos
  const analytics = useMemo(() => {
    if (!history || history.length === 0) return { totalToday: 0, maxForce: 0, topZone: 'N/A' };
    
    const today = new Date().toLocaleDateString();
    let maxF = 0;
    const zonesCount = {};
    let todayCount = 0;

    history.forEach(item => {
      // Total hoy
      if (item.date === today) todayCount++;
      // Fuerza Máxima
      if (item.force > maxF) maxF = item.force;
      // Zonas
      zonesCount[item.zone] = (zonesCount[item.zone] || 0) + 1;
    });

    // Zona más frecuente
    let topZ = 'N/A';
    let maxCount = 0;
    for (const [z, count] of Object.entries(zonesCount)) {
      if (count > maxCount) {
        maxCount = count;
        topZ = z;
      }
    }

    return { totalToday: todayCount, maxForce: maxF, topZone: topZ.replace('_', ' ').toUpperCase() };
  }, [history]);

  // Filtrado de Historial
  const filteredHistory = useMemo(() => {
    if (filterSeverity === 'Todos') return history;
    return history.filter(item => getSeverity(item.force).label === filterSeverity);
  }, [history, filterSeverity]);

  const renderItem = ({ item }) => {
    const severity = getSeverity(item.force);
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('EventDetail', { event: item })}
      >
        <View style={[styles.iconContainer, { backgroundColor: severity.bg }]}>
          <Activity color={severity.color} size={24} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.zoneText}>{item.zone.replace('_', ' ').toUpperCase()}</Text>
          <Text style={styles.timeText}>{item.date} - {item.timestamp}</Text>
        </View>
        <View style={styles.forceContainer}>
          <Text style={[styles.forceText, { color: severity.color }]}>{item.force} G</Text>
          <Text style={[styles.severityLabel, { color: severity.color }]}>{severity.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterChip = ({ label }) => (
    <TouchableOpacity 
      style={[
        styles.chip, 
        filterSeverity === label ? styles.chipActive : styles.chipInactive
      ]}
      onPress={() => setFilterSeverity(label)}
    >
      <Text style={[
        styles.chipText, 
        filterSeverity === label ? styles.chipTextActive : styles.chipTextInactive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analíticas de Impacto</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={clearHistory} style={styles.clearBtn}>
            <Trash2 color="#D32F2F" size={20} />
          </TouchableOpacity>
        )}
      </View>

      {/* Header de Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Calendar size={20} color="#1976D2" />
          <Text style={styles.statVal}>{analytics.totalToday}</Text>
          <Text style={styles.statLabel}>Impactos Hoy</Text>
        </View>
        <View style={styles.statCard}>
          <AlertTriangle size={20} color="#D32F2F" />
          <Text style={styles.statVal}>{analytics.maxForce} G</Text>
          <Text style={styles.statLabel}>Pico Máximo</Text>
        </View>
        <View style={styles.statCard}>
          <Crosshair size={20} color="#FFA000" />
          <Text style={styles.statValZone} numberOfLines={1} adjustsFontSizeToFit>{analytics.topZone}</Text>
          <Text style={styles.statLabel}>Zona Frecuente</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
          <FilterChip label="Todos" />
          <FilterChip label="Leve" />
          <FilterChip label="Moderado" />
          <FilterChip label="Severo" />
        </ScrollView>
      </View>

      {/* Lista */}
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron impactos para este filtro.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1976D2' },
  clearBtn: { padding: 8, backgroundColor: '#FFEBEE', borderRadius: 8 },
  statsContainer: { flexDirection: 'row', padding: 20, gap: 10, backgroundColor: '#1976D2', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, elevation: 5 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 15, alignItems: 'center', elevation: 2 },
  statVal: { fontSize: 18, fontWeight: '900', color: '#212121', marginTop: 8 },
  statValZone: { fontSize: 14, fontWeight: '900', color: '#212121', marginTop: 8, textAlign: 'center', height: 22 },
  statLabel: { fontSize: 10, color: '#757575', fontWeight: 'bold', marginTop: 4, textAlign: 'center' },
  filtersWrapper: { marginTop: 15 },
  filtersContainer: { paddingHorizontal: 20, gap: 10, paddingBottom: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipActive: { backgroundColor: '#1976D2', borderColor: '#1976D2' },
  chipInactive: { backgroundColor: '#fff', borderColor: '#E0E0E0' },
  chipText: { fontWeight: 'bold', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  chipTextInactive: { color: '#757575' },
  listContent: { padding: 20 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 12, alignItems: 'center', elevation: 2 },
  iconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  infoContainer: { flex: 1 },
  zoneText: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  timeText: { fontSize: 12, color: '#888', marginTop: 4 },
  forceContainer: { alignItems: 'flex-end' },
  forceText: { fontSize: 20, fontWeight: '900' },
  severityLabel: { fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  emptyContainer: { marginTop: 40, alignItems: 'center' },
  emptyText: { color: '#9E9E9E', fontSize: 14, fontStyle: 'italic' },
});