
import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { SessionProvider } from '../context/SessionContext';
import { CartProvider } from '../context/CartContext';

export default function RootLayout() {
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    return (
      <SessionProvider>
        <View style={styles.webContainer}>
          <View style={styles.phoneFrame}>
            <Stack />
          </View>
        </View>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <Stack />
    </SessionProvider>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#0D1712',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
  },

  phoneFrame: {
    width: '100%',
    maxWidth: 400,
    height: '92vh',
    maxHeight: 844,
    backgroundColor: '#F5F7F3',
    borderRadius: 44,
    overflow: 'hidden',
    borderWidth: 8,
    borderColor: '#1C2E24',
    boxShadow: '0px 12px 30px rgba(0, 0, 0, 0.45)',
  },
});
