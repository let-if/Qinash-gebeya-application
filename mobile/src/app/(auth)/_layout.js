import { Redirect, Stack } from 'expo-router';
import { useSession } from '../../context/SessionContext';

export default function AuthLayout() {
  const { ready, token } = useSession();
  if (ready && token) return <Redirect href="/(tabs)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
// import React from 'react';
// import { ActivityIndicator, View, StyleSheet } from 'react-native';
// import { Redirect, Stack } from 'expo-router';
// import { useSession } from '../../context/SessionContext';

// export default function AuthLayout() {
//   const { loading, token } = useSession();

//   // 1. Wait until AsyncStorage finishes loading the token
//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#0F7B4A" />
//       </View>
//     );
//   }

//   // 2. If logged in, redirect to main tabs
//   if (token) {
//     return <Redirect href="/(tabs)" />;
//   }

//   // 3. If not logged in, show auth screens (login, verify-otp, etc.)
//   return <Stack screenOptions={{ headerShown: false }} />;
// }

// const styles = StyleSheet.create({
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5F7F3',
//   },
// });