import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useBluetooth } from '../context/BluetoothContext';
import { Trash2, Activity } from 'lucide-react-native';

export default function HistoryScreen({ navigation }) {
  const { history, clearHistory } = useBluetooth();

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('EventDetail', { event: item })}
    >
      <View style={styles.iconContainer}>
        <Activity color={item.force > 8 ? '#D32F2F' : '#4CAF50'} size={24} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.zoneText}>{item.zone.toUpperCase()}</Text>
        <Text style={styles.timeText}>{item.date} - {item.timestamp}</Text>
      </View>
      <View style={styles.forceContainer}>
        <Text style={[styles.forceText, { color: item.force > 8 ? '#D32F2F' : '#333' }]}>
          {item.force} G
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial de Impactos</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={clearHistory}>
            <Trash2 color="#666" size={20} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay impactos registrados aún.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    padding: 15,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  zoneText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timeText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  forceContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  forceText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});