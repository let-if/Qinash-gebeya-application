
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

// // const RECORDED_VOICE = require('../../assets/Voice 261001_134911.m4a');
// const RECORDED_VOICE = require('../../assets/audio_2026-10-12_07-15-06.m4a');

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
//     playerInstance.play();
//   });

//   useEffect(() => {
//     if (!player) return;

//     const playingSub = player.addListener('playingChange', (event) => {
//       setIsPlaying(event.isPlaying);
//     });

//     const statusSub = player.addListener('statusChange', (payload) => {
//       // If playback finishes, reset icon and position back to start
//       if (payload.status === 'idle' || payload.isLoaded && player.currentTime >= player.duration) {
//         setIsPlaying(false);
//         try {
//           player.currentTime = 0;
//         } catch (e) {}
//       }
//     });

//     return () => {
//       playingSub.remove();
//       statusSub.remove();
//       try {
//         if (player && typeof player.pause === 'function') {
//           player.pause();
//         }
//       } catch (e) {}
//     };
//   }, [player]);

//   const togglePlayPause = () => {
//     try {
//       if (!player) return;

//       if (player.playing) {
//         player.pause();
//       } else {
//         // If it reached the end, reset to start before playing again
//         if (player.currentTime >= player.duration || player.currentTime === 0 && !isPlaying) {
//           player.currentTime = 0;
//         }
//         player.play();
//       }
//     } catch (e) {
//       console.log('Playback toggle error:', e);
//     }
//   };

//   const handleReturnToShop = () => {
//     try {
//       if (player && typeof player.pause === 'function') {
//         player.pause();
//       }
//     } catch (e) {}
//     router.replace('/ad-interstitial');
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       {/* Hidden VideoView required by expo-video */}
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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../context/SessionContext';
import { useVideoPlayer, VideoView } from 'expo-video';

const RECORDED_VOICE = require('../../assets/audio_2026-10-12_07-15-06.m4a');

export default function ConfirmationScreen() {
  const router = useRouter();
  const { lang } = useSession();
  const params = useLocalSearchParams();

  const {
    orderNumber = '1044',
    deliveryTime = '12:00 ሰዓት',
    distanceKm = '2',
    deliveryFee = '89',
    totalPrice = '0',
    finalTotal = '0',
    orderItemsData = '[]',
  } = params;

  const [isPlaying, setIsPlaying] = useState(false);

  const cleanOrderNumber = String(orderNumber).replace(/[^0-9]/g, '');

  let parsedItems = [];
  try {
    parsedItems = JSON.parse(orderItemsData);
  } catch {
    parsedItems = [];
  }

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
      if (payload.status === 'idle' || (payload.isLoaded && player.currentTime >= player.duration)) {
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
        if (player.currentTime >= player.duration || (player.currentTime === 0 && !isPlaying)) {
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
      <VideoView player={player} style={{ width: 0, height: 0 }} nativeControls={false} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
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

            <View style={{ flex: 1 }}>
              <Text style={styles.voiceLabel}>
                የድምፅ ማረጋገጫ (Voice Confirmation)
              </Text>
              <Text style={styles.voiceStatusText}>
                {isPlaying ? 'እየተጫወተ ነው...' : 'እንደገና ለማዳመጥ ይጫኑ'}
              </Text>
            </View>
          </View>
        </View>

        {/* --- SHINING & GLOWING RECEIPT & ORDER DETAIL CARD --- */}
        <View style={styles.receiptCard}>
          {/* Top Decorative Glowing Shine Overlay */}
          <View pointerEvents="none" style={styles.receiptShine} />

          <View style={styles.receiptHeaderRow}>
            <Text style={styles.receiptTitle}>📋 የትእዛዝ ደረሰኝ (Receipt Summary)</Text>
          </View>
          <Text style={styles.screenshotNotice}>
            📸 ለትዝታ ወይም ለምዝገባ ይህንን ገጽ ስክሪንሾት (Screenshot) ማንሳት ይችላሉ።
          </Text>

          <View style={styles.divider} />

          {/* Warehouse & Distance Info Box */}
          <View style={styles.warehouseInfoBox}>
            <View style={styles.warehouseRow}>
              <Text style={styles.receiptMetaText}>መነሻ መጋዝን:</Text>
              <Text style={styles.receiptMetaHighlight}>መብራት ሃይል አራዳ (አዳማ)</Text>
            </View>
            <View style={[styles.warehouseRow, { marginTop: 4 }]}>
              <Text style={styles.receiptMetaText}>የርቀት መጠን:</Text>
              <Text style={styles.receiptMetaHighlight}>{distanceKm} ኪ.ሜ (KM)</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Items List */}
          <View style={styles.itemsListContainer}>
            {parsedItems.length > 0 ? (
              parsedItems.map((it, idx) => (
                <View key={idx} style={styles.receiptItemRow}>
                  <Text style={styles.receiptItemName} numberOfLines={1}>
                    • {it.name} <Text style={{ color: '#62726A', fontWeight: '600' }}>({it.quantity} {it.unit})</Text>
                  </Text>
                  <Text style={styles.receiptItemPrice}>
                    {(Number(it.price) * Number(it.quantity)).toLocaleString()} ብር
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ fontSize: 12, color: '#62726A', fontStyle: 'italic', marginBottom: 8, textAlign: 'center' }}>
                ምንም እቃዎች አልተዘረዘሩም
              </Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* Pricing Totals Breakdown */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>የእቃዎች ድምር (Subtotal):</Text>
            <Text style={styles.summaryValue}>{Number(totalPrice).toLocaleString()} ብር</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>የመላኪያ ዋጋ (Delivery Fee):</Text>
            <Text style={styles.summaryValue}>{Number(deliveryFee).toLocaleString()} ብር</Text>
          </View>

          {/* Grand Total Highlight Box */}
          <View style={styles.grandTotalContainer}>
            <Text style={styles.grandTotalLabel}>ጠቅላላ ድምር (Grand Total):</Text>
            <Text style={styles.grandTotalValue}>{Number(finalTotal).toLocaleString()} ብር</Text>
          </View>
        </View>

        {/* Return Button */}
        <TouchableOpacity
          style={styles.returnBtn}
          onPress={handleReturnToShop}
          activeOpacity={0.85}
        >
          <View pointerEvents="none" style={styles.btnShine} />
          <Text style={styles.returnBtnText}>
            {lang === 'om' ? 'Gara Gabaatti Deebi’i' : 'ወደ ገበያ ተመለስ'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7F3',
  },
  container: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0F7B4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#0F7B4A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  checkSymbol: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  title: {
    fontSize: 21,
    fontWeight: '900',
    color: '#12241A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#62726A',
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
  },
  voiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#DDE4DD',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    shadowColor: '#0B2A1B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  voicePlayBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
    fontSize: 16,
    fontWeight: '900',
  },
  voiceLabel: {
    fontSize: 12.5,
    color: '#12241A',
    fontWeight: '800',
  },
  voiceStatusText: {
    fontSize: 10.5,
    color: '#62726A',
    fontWeight: '600',
    marginTop: 1,
  },
  /* --- SHINING & GLOWING RECEIPT CARD STYLES --- */
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.8,
    borderColor: '#0F7B4A', // High-end shining emerald green border
    padding: 18,
    width: '100%',
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#0F7B4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6,
  },
  receiptShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 45,
    backgroundColor: 'rgba(15, 123, 74, 0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 123, 74, 0.1)',
  },
  receiptHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#12241A',
  },
  screenshotNotice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
    marginBottom: 10,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E6ECE7',
    marginVertical: 10,
  },
  warehouseInfoBox: {
    backgroundColor: '#F4F9F6',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#D2EADD',
  },
  warehouseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptMetaText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#62726A',
  },
  receiptMetaHighlight: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#0F7B4A',
  },
  itemsListContainer: {
    maxHeight: 160,
    marginVertical: 2,
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptItemName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#12241A',
    flex: 1,
    marginRight: 8,
  },
  receiptItemPrice: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0F7B4A',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#62726A',
  },
  summaryValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#12241A',
  },
  grandTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#0F7B4A',
    backgroundColor: '#EAF6F0',
    marginHorizontal: -18,
    marginBottom: -18,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  grandTotalLabel: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F7B4A',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F7B4A',
  },
  returnBtn: {
    backgroundColor: '#0F7B4A',
    width: '100%',
    height: 52,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3FD08A',
    shadowColor: '#0F7B4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  btnShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  returnBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});