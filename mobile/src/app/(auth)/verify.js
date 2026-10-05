import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { apiRequest } from '../../lib/api';
import { useSession } from '../../context/SessionContext';
import { t } from '../../i18n';

export default function VerifyScreen() {
  const { phone, devOtp } = useLocalSearchParams();
  const { signIn } = useSession();
  const router = useRouter();
  const [shopName, setShopName] = useState('');
  const [otp, setOtp] = useState(typeof devOtp === 'string' ? devOtp : '');
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({});
        setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } catch {
        // GPS is best-effort on first onboarding; delivery can still be confirmed later.
      }
    })();
  }, []);

  const handleVerify = async () => {
    if (String(otp).trim().length !== 4) {
      Alert.alert('', t('am', 'otpLabel'));
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest('/auth/verify-otp', {
        method: 'POST',
        body: {
          phoneNumber: String(phone),
          code: String(otp).trim(),
          shopName: shopName.trim() || 'ሱቅ',
          preferredLanguage: 'am',
          gpsLatitude: coords ? coords.lat : undefined,
          gpsLongitude: coords ? coords.lng : undefined,
        },
      });
      await signIn(data.token, data.user);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('ስህተት', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        <Text style={styles.title}>{t('am', 'appName')}</Text>
        <Text style={styles.label}>{t('am', 'shopNameLabel')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('am', 'shopNamePlaceholder')}
          value={shopName}
          onChangeText={setShopName}
        />
        <Text style={[styles.gps, coords ? styles.gpsOn : styles.gpsOff]}>
          {coords ? t('am', 'gpsActive') : t('am', 'gpsInactive')}
        </Text>
        <Text style={styles.label}>{t('am', 'otpLabel')}</Text>
        <TextInput
          style={[styles.input, styles.otp]}
          keyboardType="number-pad"
          maxLength={4}
          value={String(otp)}
          onChangeText={setOtp}
        />
        <TouchableOpacity style={styles.btn} onPress={handleVerify} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('am', 'signInBtn')}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7F3' },
  wrap: { flex: 1, justifyContent: 'center', padding: 24, gap: 10 },
  title: { fontSize: 34, fontWeight: '800', color: '#0F7B4A', textAlign: 'center', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#12241A' },
  input: {
    height: 52,
    borderWidth: 2,
    borderColor: '#DDE4DD',
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  otp: { fontSize: 24, letterSpacing: 8, textAlign: 'center' },
  gps: { fontSize: 13, fontWeight: '600', textAlign: 'center', paddingVertical: 8 },
  gpsOn: { color: '#0F7B4A' },
  gpsOff: { color: '#62726A' },
  btn: {
    height: 54,
    backgroundColor: '#0F7B4A',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
});
