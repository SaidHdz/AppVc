import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Zap, Clock, AlertTriangle } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';

export default function EventDetail({ route, navigation }) {
  const { event } = route.params;
  const screenWidth = Dimensions.get('window').width;

  // Datos simulados para la telemetría del pico de impacto
  const chartData = {
    labels: ["0", "20", "40", "60", "80", "100"],
    datasets: [
      {
        data: [
          1, 
          2, 
          event.force, // Pico de impacto
          event.force * 0.4, 
          1.5, 
          1
        ],
        color: (opacity = 1) => `rgba(211, 47, 47, ${opacity})`, 
        strokeWidth: 3
      }
    ],
    legend: ["Fuerza G vs Tiempo (ms)"]
  };

  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#D32F2F" }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Evento #{event.id.slice(-4)}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Card de Severidad */}
        <View style={[styles.severityCard, { backgroundColor: event.force > 10 ? '#FFEBEE' : '#E8F5E9' }]}>
          <AlertTriangle color={event.force > 10 ? '#D32F2F' : '#4CAF50'} size={24} />
          <Text style={[styles.severityText, { color: event.force > 10 ? '#D32F2F' : '#4CAF50' }]}>
            Severidad: {event.force > 10 ? 'Alta' : 'Moderada'}
          </Text>
        </View>

        {/* Métricas Clave */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Zap size={20} color="#1976D2" />
            <Text style={styles.metricLabel}>Impacto Máx</Text>
            <Text style={styles.metricValue}>{event.force} G</Text>
          </View>
          <View style={styles.metricItem}>
            <Clock size={20} color="#1976D2" />
            <Text style={styles.metricLabel}>Duración</Text>
            <Text style={styles.metricValue}>0.4 seg</Text>
          </View>
        </View>

        {/* Gráfica de Telemetría */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Gráfica de Telemetría</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Timeline de Eventos */}
        <View style={styles.timelineContainer}>
          <Text style={styles.sectionTitle}>Timeline del Evento</Text>
          
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#1976D2' }]} />
            <View style={styles.timelineLine} />
            <Text style={styles.timelineText}>Actividad Normal</Text>
          </View>
          
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#D32F2F' }]} />
            <View style={styles.timelineLine} />
            <Text style={styles.timelineText}>Impacto Detectado ({event.zone.toUpperCase()})</Text>
          </View>
          
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#00BCD4' }]} />
            <Text style={styles.timelineText}>Estabilización</Text>
          </View>
        </View>

        {/* Cuadro de Notas */}
        <View style={styles.notesCard}>
          <Text style={styles.notesText}>
            ⚠️ Usuario permaneció inmóvil 10 s tras el impacto.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  content: { padding: 20 },
  severityCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 20, gap: 10 },
  severityText: { fontSize: 16, fontWeight: 'bold' },
  metricsRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  metricItem: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 12, alignItems: 'center', elevation: 2 },
  metricLabel: { fontSize: 12, color: '#666', marginTop: 5 },
  metricValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  chartContainer: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 25, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  chart: { marginVertical: 8, borderRadius: 16 },
  timelineContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 25, elevation: 2 },
  timelineItem: { flexDirection: 'row', alignItems: 'center', height: 40 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginRight: 15, zIndex: 1 },
  timelineLine: { position: 'absolute', left: 5, top: 20, width: 2, height: 30, backgroundColor: '#eee' },
  timelineText: { fontSize: 14, color: '#444' },
  notesCard: { backgroundColor: '#FFF9C4', padding: 15, borderRadius: 12, marginBottom: 30, borderLeftWidth: 5, borderLeftColor: '#FBC02D' },
  notesText: { fontSize: 14, color: '#5D4037', fontWeight: '500' },
});