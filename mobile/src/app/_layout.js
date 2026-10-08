
import React from 'react';
import { Stack, ErrorBoundaryProps } from 'expo-router';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import { SessionProvider } from '../context/SessionContext';

export function ErrorBoundary({ error }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>⚠️ መተግበሪያው ላይ ስህተት ተፈጥሯል (App Crash)</Text>
      <ScrollView style={styles.scrollBox}>
        <Text style={styles.errorText}>{error?.message}</Text>
        <Text style={styles.stackText}>{error?.stack}</Text>
      </ScrollView>
    </View>
  );
}

// export default function RootLayout() {
//   const isWeb = Platform.OS === 'web';

//   if (isWeb) {
//     return (
//       <SessionProvider>
//         <View style={styles.webContainer}>
//           <View style={styles.phoneFrame}>
//             <Stack />
//           </View>
//         </View>
//       </SessionProvider>
//     );
//   }

//   return (
//     <SessionProvider>
//       <Stack />
//     </SessionProvider>
//   );
// }
export default function RootLayout() {
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    return (
      <SessionProvider>
        <View style={styles.webContainer}>
          <View style={styles.phoneFrame}>
            <Stack screenOptions={{ headerShown: false }} />
          </View>
        </View>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <Stack screenOptions={{ headerShown: false }} />
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
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 12,
    textAlign: 'center',
  },
  scrollBox: {
    maxHeight: '80%',
    width: '100%',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  stackText: {
    fontSize: 11,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});