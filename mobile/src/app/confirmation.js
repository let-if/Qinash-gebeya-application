
import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { useSession } from '../context/SessionContext';

// Import your custom recorded audio asset directly
const RECORDED_VOICE = require('../../assets/Voice 261001_134911.m4a');

export default function ConfirmationScreen() {
  const router = useRouter();
  const { lang } = useSession();
  const {
    orderNumber = '1044',
    deliveryTime = '12:00 ሰዓት',
  } = useLocalSearchParams();

  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef(null);

  const cleanOrderNumber = String(orderNumber).replace(/[^0-9]/g, '');

  async function playAudio() {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        RECORDED_VOICE,
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);

            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        }
      );

      soundRef.current = sound;
    } catch (error) {
      console.log('Audio playback error:', error);
      setIsPlaying(false);
    }
  }

  async function togglePlayPause() {
    if (!soundRef.current) {
      await playAudio();
      return;
    }

    const status = await soundRef.current.getStatusAsync();

    if (status.isLoaded) {
      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    }
  }

  async function stopAndCleanup() {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {
        // ignore cleanup error
      }

      soundRef.current = null;
    }

    setIsPlaying(false);
  }

  useEffect(() => {
    // Automatically play your voice on arrival
    playAudio();

    // Immediately kill audio if user navigates back or away
    return () => {
      stopAndCleanup();
    };
  }, []);

  const handleReturnToShop = async () => {
    await stopAndCleanup();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Success Circle */}
        <View style={styles.checkCircle}>
          <Text style={styles.checkSymbol}>✓</Text>
        </View>

        {/* Headings */}
        <Text style={styles.title}>
          {lang === 'om'
            ? 'Ajajni Keessan Ergameera!'
            : 'ትእዛዝዎ በስኬት ተልኳል!'}
        </Text>

        <Text style={styles.subtitle}>
          #{cleanOrderNumber} · {deliveryTime}{' '}
          {lang === 'om'
            ? 'isin ga’a'
            : 'ይደርስዎታል'}
        </Text>

        {/* Voice Confirmation Card */}
        <View style={styles.voiceCard}>
          <TouchableOpacity
            style={styles.voicePlayBtn}
            onPress={togglePlayPause}
            activeOpacity={0.8}
          >
            <Text style={styles.voicePlayIcon}>
              {isPlaying ? '⏸' : '▶'}
            </Text>
          </TouchableOpacity>

          <View style={styles.voiceWaveWrap}>
            <Text style={styles.voiceWaveBars}>
              {isPlaying ? 'ıııııı' : '······'}
            </Text>

            <View>
              <Text style={styles.voiceLabel}>
                የድምፅ ማረጋገጫ (Voice Confirmation)
              </Text>

              <Text style={styles.voiceStatusText}>
                {isPlaying
                  ? 'እየተጫወተ ነው...'
                  : 'እንደገና ለማዳመጥ ይጫኑ'}
              </Text>
            </View>
          </View>
        </View>

        {/* Return Button */}
        <TouchableOpacity
          style={styles.returnBtn}
          onPress={handleReturnToShop}
          activeOpacity={0.8}
        >
          <Text style={styles.returnBtnText}>
            {lang === 'om'
              ? 'Gara Gabaatti Deebi’i'
              : 'ወደ ገበያ ተመለስ'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7F3',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0F7B4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  checkSymbol: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: '900',
  },

  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#12241A',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#62726A',
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 28,
    textAlign: 'center',
  },

  voiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6ECE7',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },

  voicePlayBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F2B705',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  voicePlayIcon: {
    fontSize: 16,
    color: '#12241A',
  },

  voiceWaveWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  voiceWaveBars: {
    color: '#0F7B4A',
    fontSize: 18,
    fontWeight: '900',
  },

  voiceLabel: {
    fontSize: 13,
    color: '#12241A',
    fontWeight: '800',
  },

  voiceStatusText: {
    fontSize: 11,
    color: '#62726A',
    fontWeight: '600',
    marginTop: 2,
  },

  returnBtn: {
    backgroundColor: '#0F7B4A',
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  returnBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

