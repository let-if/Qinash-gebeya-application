
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useSession } from '../context/SessionContext';

export default function Index() {
  const { token, isLoading } = useSession?.() || {};

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7F3' }}>
        <ActivityIndicator size="large" color="#0F7B4A" />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/(auth)/phone" />;
  }

  return <Redirect href="/(tabs)" />;
}