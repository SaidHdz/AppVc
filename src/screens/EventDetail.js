import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Zap, Clock, AlertTriangle, FileText, Activity } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function EventDetail({ route, navigation }) {
  const { event } = route.params;
  const screenWidth = Dimensions.get('window').width;
  
  // Animación usando el módulo Animated estándar de React Native (Altamente compatible)
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.4,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [fadeAnim]);

  // Datos para la telemetría (se añade la línea de umbral de 8G)
  const chartData = {
    labels: ["0", "20", "40", "60", "80", "100"],
    datasets: [
      {
        data: [1, 2, event.force, event.force * 0.4, 1.5, 1],
        color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
        strokeWidth: 3
      },
      {
        data: [8, 8, 8, 8, 8, 8],
        color: (opacity = 1) => `rgba(211, 47, 47, ${opacity})`,
        strokeWidth: 2,
        withDots: false
      }
    ],
    legend: ["Impacto (G)", "Umbral Seguro (8G)"]
  };

  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#1976D2" }
  };

  const exportPDF = async () => {
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; color: #333; padding: 20px; }
              h1 { color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 10px; }
              .card { background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
              .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
              .label { font-weight: bold; color: #666; }
              .value { font-size: 18px; color: #212121; }
              .alert { background-color: #FFEBEE; color: #D32F2F; padding: 10px; border-radius: 5px; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Reporte Clínico de Impacto - Revyn Head Guard</h1>
            <div class="card">
              <div class="row">
                <span class="label">ID de Evento:</span>
                <span class="value">#${event.id}</span>
              </div>
              <div class="row">
                <span class="label">Fecha y Hora:</span>
                <span class="value">${event.date} - ${event.timestamp}</span>
              </div>
              <div class="row">
                <span class="label">Paciente:</span>
                <span class="value">Said Alejandro</span>
              </div>
            </div>
            
            <h2>Telemetría Detectada</h2>
            <div class="card">
              <div class="row">
                <span class="label">Zona de Impacto:</span>
                <span class="value">${event.zone.toUpperCase()}</span>
              </div>
              <div class="row">
                <span class="label">Aceleración Máxima:</span>
                <span class="value">${event.force} G</span>
              </div>
            </div>
            <p style="margin-top: 50px; font-size: 12px; text-align: center; color: #999;">Generado automáticamente por Revyn Studio</p>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Evento #{event.id.slice(-4)}</Text>
        <TouchableOpacity onPress={exportPDF}>
          <FileText size={24} color="#1976D2" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Alerta Prioritaria Parpadeante usando Animated nativo */}
        <Animated.View style={[styles.priorityAlert, { opacity: fadeAnim }]}>
          <AlertTriangle color="#F57F17" size={24} />
          <Text style={styles.priorityAlertText}>⚠️ ALERTA CRÍTICA: El usuario permaneció inmóvil 10s tras el impacto.</Text>
        </Animated.View>

        <View style={[styles.severityCard, { backgroundColor: event.force > 10 ? '#FFEBEE' : '#E8F5E9' }]}>
          <Activity color={event.force > 10 ? '#D32F2F' : '#4CAF50'} size={24} />
          <Text style={[styles.severityText, { color: event.force > 10 ? '#D32F2F' : '#4CAF50' }]}>
            Severidad: {event.force > 10 ? 'Alta' : 'Moderada'}
          </Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Zap size={20} color="#1976D2" />
            <Text style={styles.metricLabel}>Impacto Máx</Text>
            <Text style={styles.metricValue}>{event.force} G</Text>
          </View>
          <View style={styles.metricItem}>
            <Clock size={20} color="#1976D2" />
            <Text style={styles.metricLabel}>Duración Total</Text>
            <Text style={styles.metricValue}>1.6 seg</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Curva de Aceleración</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withShadow={false}
          />
        </View>

        <View style={styles.timelineContainer}>
          <Text style={styles.sectionTitle}>Timeline Clínico</Text>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#1976D2' }]} />
            <View style={styles.timelineLine} />
            <View>
              <Text style={styles.timelineText}>Actividad Base Normal</Text>
              <Text style={styles.latencyText}>T=0.0s</Text>
            </View>
          </View>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#D32F2F' }]} />
            <View style={styles.timelineLine} />
            <View>
              <Text style={styles.timelineText}>Impacto Detectado ({event.zone.replace('_', ' ').toUpperCase()})</Text>
              <Text style={styles.latencyText}>+0.4s desde la anomalía inicial</Text>
            </View>
          </View>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#00BCD4' }]} />
            <View>
              <Text style={styles.timelineText}>Fase de Estabilización</Text>
              <Text style={styles.latencyText}>+1.2s post-impacto</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  content: { padding: 20 },
  priorityAlert: { flexDirection: 'row', backgroundColor: '#FFF9C4', padding: 15, borderRadius: 12, marginBottom: 20, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#FBC02D' },
  priorityAlertText: { flex: 1, fontSize: 13, color: '#F57F17', fontWeight: 'bold' },
  severityCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 20, gap: 10 },
  severityText: { fontSize: 16, fontWeight: 'bold' },
  metricsRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  metricItem: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 12, alignItems: 'center', elevation: 2 },
  metricLabel: { fontSize: 12, color: '#666', marginTop: 5 },
  metricValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  chartContainer: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 25, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  chart: { marginVertical: 8, borderRadius: 16 },
  timelineContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 35, elevation: 2 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 60 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, marginRight: 15, zIndex: 1, marginTop: 4 },
  timelineLine: { position: 'absolute', left: 6, top: 18, width: 2, height: '100%', backgroundColor: '#E0E0E0' },
  timelineText: { fontSize: 15, fontWeight: '600', color: '#424242' },
  latencyText: { fontSize: 12, color: '#9E9E9E', marginTop: 2, fontStyle: 'italic' }
});