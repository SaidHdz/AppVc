import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    // Simular tiempo de carga antes de entrar a la app
    const timer = setTimeout(() => {
      navigation.replace('MainTabs');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.logoContainer}>
        <Text style={styles.brandName}>SHIELD SENSE</Text>
        <Text style={styles.tagline}>Intelligent Head Protection</Text>
      </View>
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#1976D2" />
        <Text style={styles.loadingText}>Inicializando sistema...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 40,
    fontWeight: '900',
    color: '#1976D2',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    color: '#9E9E9E',
    fontWeight: '600',
    marginTop: 5,
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '500',
  },
});