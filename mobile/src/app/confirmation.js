
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { useSession } from '../context/SessionContext';

// const RECORDED_VOICE = require('../../assets/Voice 261001_134911.m4a');

// export default function ConfirmationScreen() {
//   const router = useRouter();
//   const { lang } = useSession();
//   const {
//     orderNumber = '1044',
//     deliveryTime = '12:00 ሰዓት',
//   } = useLocalSearchParams();

//   const [isPlaying, setIsPlaying] = useState(false);
//   const soundRef = useRef(null);

//   const cleanOrderNumber = String(orderNumber).replace(/[^0-9]/g, '');

//   async function playAudio() {
//     try {
//       const ExpoAV = require('expo-av');
//       const Audio = ExpoAV.Audio;

//       if (!Audio) return;

//       if (soundRef.current) {
//         await soundRef.current.unloadAsync();
//         soundRef.current = null;
//       }

//       await Audio.setAudioModeAsync({
//         playsInSilentModeIOS: true,
//         staysActiveInBackground: false,
//         shouldDuckAndroid: true,
//       });

//       const { sound } = await Audio.Sound.createAsync(
//         RECORDED_VOICE,
//         { shouldPlay: true },
//         (status) => {
//           if (status.isLoaded) {
//             setIsPlaying(status.isPlaying);
//             if (status.didJustFinish) {
//               setIsPlaying(false);
//             }
//           }
//         }
//       );

//       soundRef.current = sound;
//     } catch {
//       setIsPlaying(false);
//     }
//   }

//   async function togglePlayPause() {
//     if (!soundRef.current) {
//       await playAudio();
//       return;
//     }

//     try {
//       const status = await soundRef.current.getStatusAsync();

//       if (status.isLoaded) {
//         if (status.isPlaying) {
//           await soundRef.current.pauseAsync();
//           setIsPlaying(false);
//         } else {
//           await soundRef.current.playAsync();
//           setIsPlaying(true);
//         }
//       }
//     } catch {
//       setIsPlaying(false);
//     }
//   }

//   async function stopAndCleanup() {
//     if (soundRef.current) {
//       try {
//         await soundRef.current.stopAsync();
//         await soundRef.current.unloadAsync();
//       } catch {}
//       soundRef.current = null;
//     }
//     setIsPlaying(false);
//   }

//   useEffect(() => {
//     playAudio();
//     return () => {
//       stopAndCleanup();
//     };
//   }, []);

//   const handleReturnToShop = async () => {
//     await stopAndCleanup();
//     // Seamlessly transition to the dedicated standalone ad page
//     router.replace('/ad-interstitial');
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <View style={styles.container}>
//         {/* Success Circle */}
//         <View style={styles.checkCircle}>
//           <Text style={styles.checkSymbol}>✓</Text>
//         </View>

//         {/* Headings */}
//         <Text style={styles.title}>
//           {lang === 'om' ? 'Ajajni Keessan Ergameera!' : 'ትእዛዝዎ በስኬት ተልኳል!'}
//         </Text>

//         <Text style={styles.subtitle}>
//           #{cleanOrderNumber} · {deliveryTime}{' '}
//           {lang === 'om' ? 'isin ga’a' : 'ይደርስዎታል'}
//         </Text>

//         {/* Voice Confirmation Card */}
//         <View style={styles.voiceCard}>
//           <TouchableOpacity
//             style={styles.voicePlayBtn}
//             onPress={togglePlayPause}
//             activeOpacity={0.8}
//           >
//             <Text style={styles.voicePlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
//           </TouchableOpacity>

//           <View style={styles.voiceWaveWrap}>
//             <Text style={styles.voiceWaveBars}>{isPlaying ? 'ıııııı' : '······'}</Text>

//             <View>
//               <Text style={styles.voiceLabel}>
//                 የድምፅ ማረጋገጫ (Voice Confirmation)
//               </Text>
//               <Text style={styles.voiceStatusText}>
//                 {isPlaying ? 'እየተጫወተ ነው...' : 'እንደገና ለማዳመጥ ይጫኑ'}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Return Button */}
//         <TouchableOpacity
//           style={styles.returnBtn}
//           onPress={handleReturnToShop}
//           activeOpacity={0.8}
//         >
//           <Text style={styles.returnBtnText}>
//             {lang === 'om' ? 'Gara Gabaatti Deebi’i' : 'ወደ ገበያ ተመለስ'}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: '#F5F7F3',
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//   },
//   checkCircle: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: '#0F7B4A',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//     shadowColor: '#0F7B4A',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.35,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   checkSymbol: {
//     fontSize: 40,
//     color: '#FFFFFF',
//     fontWeight: '900',
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: '900',
//     color: '#12241A',
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#62726A',
//     fontWeight: '700',
//     marginTop: 6,
//     marginBottom: 28,
//     textAlign: 'center',
//   },
//   voiceCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: '#E6ECE7',
//     padding: 13,
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '100%',
//     marginBottom: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   voicePlayBtn: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: '#F59E0B',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//     shadowColor: '#F59E0B',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 4,
//   },
//   voicePlayIcon: {
//     fontSize: 17,
//     color: '#12241A',
//   },
//   voiceWaveWrap: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },
//   voiceWaveBars: {
//     color: '#0F7B4A',
//     fontSize: 18,
//     fontWeight: '900',
//   },
//   voiceLabel: {
//     fontSize: 13,
//     color: '#12241A',
//     fontWeight: '800',
//   },
//   voiceStatusText: {
//     fontSize: 11,
//     color: '#62726A',
//     fontWeight: '600',
//     marginTop: 2,
//   },
//   returnBtn: {
//     backgroundColor: '#0F7B4A',
//     width: '100%',
//     height: 52,
//     borderRadius: 14,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#0F7B4A',
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 6,
//   },
//   returnBtnText: {
//     color: '#FFFFFF',
//     fontSize: 15,
//     fontWeight: '800',
//   },
// });
// import React, { useEffect, useState } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { useSession } from '../context/SessionContext';
// import { useVideoPlayer, VideoView } from 'expo-video';

// const RECORDED_VOICE = require('../../assets/Voice 261001_134911.m4a');

// export default function ConfirmationScreen() {
//   const router = useRouter();
//   const { lang } = useSession();
//   const {
//     orderNumber = '1044',
//     deliveryTime = '12:00 ሰዓት',
//   } = useLocalSearchParams();

//   const [isPlaying, setIsPlaying] = useState(false);

//   const cleanOrderNumber = String(orderNumber).replace(/[^0-9]/g, '');

//   // Initialize expo-video player for the audio asset
//   const player = useVideoPlayer(RECORDED_VOICE, (playerInstance) => {
//     playerInstance.loop = false;
//     playerInstance.play(); // Auto-play on load
//   });

//   useEffect(() => {
//     const subscription = player.addListener('playingChange', (event) => {
//       setIsPlaying(event.isPlaying);
//     });

//     return () => {
//       subscription.remove();
//       player.pause();
//     };
//   }, [player]);

//   const togglePlayPause = () => {
//     if (player.playing) {
//       player.pause();
//     } else {
//       player.play();
//     }
//   };

//   const handleReturnToShop = async () => {
//     player.pause();
//     router.replace('/ad-interstitial');
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       {/* Hidden VideoView required by expo-video to manage audio playback state */}
//       <VideoView player={player} style={{ width: 0, height: 0 }} nativeControls={false} />

//       <View style={styles.container}>
//         {/* Success Circle */}
//         <View style={styles.checkCircle}>
//           <Text style={styles.checkSymbol}>✓</Text>
//         </View>

//         {/* Headings */}
//         <Text style={styles.title}>
//           {lang === 'om' ? 'Ajajni Keessan Ergameera!' : 'ትእዛዝዎ በስኬት ተልኳል!'}
//         </Text>

//         <Text style={styles.subtitle}>
//           #{cleanOrderNumber} · {deliveryTime}{' '}
//           {lang === 'om' ? 'isin ga’a' : 'ይደርስዎታል'}
//         </Text>

//         {/* Voice Confirmation Card */}
//         <View style={styles.voiceCard}>
//           <TouchableOpacity
//             style={styles.voicePlayBtn}
//             onPress={togglePlayPause}
//             activeOpacity={0.8}
//           >
//             <Text style={styles.voicePlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
//           </TouchableOpacity>

//           <View style={styles.voiceWaveWrap}>
//             <Text style={styles.voiceWaveBars}>{isPlaying ? 'ıııııı' : '······'}</Text>

//             <View>
//               <Text style={styles.voiceLabel}>
//                 የድምፅ ማረጋገጫ (Voice Confirmation)
//               </Text>
//               <Text style={styles.voiceStatusText}>
//                 {isPlaying ? 'እየተጫወተ ነው...' : 'እንደገና ለማዳመጥ ይጫኑ'}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Return Button */}
//         <TouchableOpacity
//           style={styles.returnBtn}
//           onPress={handleReturnToShop}
//           activeOpacity={0.8}
//         >
//           <Text style={styles.returnBtnText}>
//             {lang === 'om' ? 'Gara Gabaatti Deebi’i' : 'ወደ ገበያ ተመለስ'}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: '#F5F7F3',
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//   },
//   checkCircle: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: '#0F7B4A',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//     shadowColor: '#0F7B4A',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.35,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   checkSymbol: {
//     fontSize: 40,
//     color: '#FFFFFF',
//     fontWeight: '900',
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: '900',
//     color: '#12241A',
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#62726A',
//     fontWeight: '700',
//     marginTop: 6,
//     marginBottom: 28,
//     textAlign: 'center',
//   },
//   voiceCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: '#E6ECE7',
//     padding: 13,
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '100%',
//     marginBottom: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   voicePlayBtn: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: '#F59E0B',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//     shadowColor: '#F59E0B',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 4,
//   },
//   voicePlayIcon: {
//     fontSize: 17,
//     color: '#12241A',
//   },
//   voiceWaveWrap: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },
//   voiceWaveBars: {
//     color: '#0F7B4A',
//     fontSize: 18,
//     fontWeight: '900',
//   },
//   voiceLabel: {
//     fontSize: 13,
//     color: '#12241A',
//     fontWeight: '800',
//   },
//   voiceStatusText: {
//     fontSize: 11,
//     color: '#62726A',
//     fontWeight: '600',
//     marginTop: 2,
//   },
//   returnBtn: {
//     backgroundColor: '#0F7B4A',
//     width: '100%',
//     height: 52,
//     borderRadius: 14,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#0F7B4A',
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 6,
//   },
//   returnBtnText: {
//     color: '#FFFFFF',
//     fontSize: 15,
//     fontWeight: '800',
//   },
// });
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../context/SessionContext';
import { useVideoPlayer, VideoView } from 'expo-video';

const RECORDED_VOICE = require('../../assets/Voice 261001_134911.m4a');

export default function ConfirmationScreen() {
  const router = useRouter();
  const { lang } = useSession();
  const {
    orderNumber = '1044',
    deliveryTime = '12:00 ሰዓት',
  } = useLocalSearchParams();

  const [isPlaying, setIsPlaying] = useState(false);

  const cleanOrderNumber = String(orderNumber).replace(/[^0-9]/g, '');

  // Initialize expo-video player for the audio asset
  const player = useVideoPlayer(RECORDED_VOICE, (playerInstance) => {
    playerInstance.loop = false;
    playerInstance.play();
  });

  useEffect(() => {
    if (!player) return;

    const playingSub = player.addListener('playingChange', (event) => {
      setIsPlaying(event.isPlaying);
    });

    const statusSub = player.addListener('statusChange', (payload) => {
      // If playback finishes, reset icon and position back to start
      if (payload.status === 'idle' || payload.isLoaded && player.currentTime >= player.duration) {
        setIsPlaying(false);
        try {
          player.currentTime = 0;
        } catch (e) {}
      }
    });

    return () => {
      playingSub.remove();
      statusSub.remove();
      try {
        if (player && typeof player.pause === 'function') {
          player.pause();
        }
      } catch (e) {}
    };
  }, [player]);

  const togglePlayPause = () => {
    try {
      if (!player) return;

      if (player.playing) {
        player.pause();
      } else {
        // If it reached the end, reset to start before playing again
        if (player.currentTime >= player.duration || player.currentTime === 0 && !isPlaying) {
          player.currentTime = 0;
        }
        player.play();
      }
    } catch (e) {
      console.log('Playback toggle error:', e);
    }
  };

  const handleReturnToShop = () => {
    try {
      if (player && typeof player.pause === 'function') {
        player.pause();
      }
    } catch (e) {}
    router.replace('/ad-interstitial');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Hidden VideoView required by expo-video */}
      <VideoView player={player} style={{ width: 0, height: 0 }} nativeControls={false} />

      <View style={styles.container}>
        {/* Success Circle */}
        <View style={styles.checkCircle}>
          <Text style={styles.checkSymbol}>✓</Text>
        </View>

        {/* Headings */}
        <Text style={styles.title}>
          {lang === 'om' ? 'Ajajni Keessan Ergameera!' : 'ትእዛዝዎ በስኬት ተልኳል!'}
        </Text>

        <Text style={styles.subtitle}>
          #{cleanOrderNumber} · {deliveryTime}{' '}
          {lang === 'om' ? 'isin ga’a' : 'ይደርስዎታል'}
        </Text>

        {/* Voice Confirmation Card */}
        <View style={styles.voiceCard}>
          <TouchableOpacity
            style={styles.voicePlayBtn}
            onPress={togglePlayPause}
            activeOpacity={0.8}
          >
            <Text style={styles.voicePlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>

          <View style={styles.voiceWaveWrap}>
            <Text style={styles.voiceWaveBars}>{isPlaying ? 'ıııııı' : '······'}</Text>

            <View>
              <Text style={styles.voiceLabel}>
                የድምፅ ማረጋገጫ (Voice Confirmation)
              </Text>
              <Text style={styles.voiceStatusText}>
                {isPlaying ? 'እየተጫወተ ነው...' : 'እንደገና ለማዳመጥ ይጫኑ'}
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
            {lang === 'om' ? 'Gara Gabaatti Deebi’i' : 'ወደ ገበያ ተመለስ'}
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
    shadowColor: '#0F7B4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6ECE7',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  voicePlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  voicePlayIcon: {
    fontSize: 17,
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
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F7B4A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  returnBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});