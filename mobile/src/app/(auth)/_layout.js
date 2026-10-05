import { Redirect, Stack } from 'expo-router';
import { useSession } from '../../context/SessionContext';

export default function AuthLayout() {
  const { ready, token } = useSession();
  if (ready && token) return <Redirect href="/(tabs)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
