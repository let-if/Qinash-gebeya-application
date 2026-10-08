// import React, { useEffect, useRef, useState } from 'react';
// import {
//   Image,
//   Linking,
//   Platform,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   useWindowDimensions,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { apiRequest } from '../lib/api';
// import { useSession } from '../context/SessionContext';
// import { useVideoPlayer, VideoView } from 'expo-video';

// export default function AdInterstitialScreen() {
//   const router = useRouter();
//   const { token } = useSession();
//   const { width: SCREEN_W, height: SCREEN_H } = useWindowDimensions();

//   const [activeAd, setActiveAd] = useState(null);
//   const [adMuted, setAdMuted] = useState(false);
//   const webVideoRef = useRef(null);

//   const videoUrl = activeAd?.mediaUrl || '';
//   const isVideoAsset =
//     activeAd?.mediaType === 'VIDEO' ||
//     /\.(mp4|mov|webm)(\?.*)?$/i.test(videoUrl);

//   // ቀለል ያለ የቪዲዮ ማጫወቻ ኪክ
//   const adVideoPlayer = useVideoPlayer(isVideoAsset ? videoUrl : '', (player) => {
//     player.loop = true;
//     player.muted = adMuted;
//     player.play();
//   });

//   useEffect(() => {
//     if (adVideoPlayer && isVideoAsset) {
//       adVideoPlayer.muted = adMuted;
//     }
//   }, [adMuted, adVideoPlayer, isVideoAsset]);

//   // ማስታወቂያውን ከዳታቤዝ መጫን
//   useEffect(() => {
//     async function fetchAd() {
//       try {
//         const res = await apiRequest('/catalog/post-order-ad', { token }).catch(() => null);
//         if (res?.ad) {
//           setActiveAd(res.ad);
//         }
//       } catch (err) {
//         console.log('Ad fetch error:', err);
//       }
//     }
//     fetchAd();
//   }, [token]);

//   const finishAndGoToShop = () => {
//     router.replace('/(tabs)');
//   };

//   const handleOpenActionLink = async () => {
//     if (!activeAd?.actionLink) return;
//     try {
//       const canOpen = await Linking.canOpenURL(activeAd.actionLink);
//       if (canOpen) {
//         await Linking.openURL(activeAd.actionLink);
//       }
//     } catch {}
//   };

//   const cardWidth = Math.min(SCREEN_W * 0.92, 420);
//   const cardHeight = Math.min(SCREEN_H * 0.82, 640);

//   return (
//     <SafeAreaView style={styles.safe}>
//       <View style={styles.container}>
//         <View style={[styles.adCard, { width: cardWidth, height: cardHeight }]}>
          
//           {/* ቪዲዮ ወይም ምስል ማሳያ ሬክታንግል */}
//           <View style={styles.mediaContainer}>
//             {isVideoAsset ? (
//               Platform.OS === 'web' ? (
//                 <video
//                   ref={webVideoRef}
//                   src={videoUrl}
//                   autoPlay
//                   muted={adMuted}
//                   playsInline
//                   loop
//                   style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                 />
//               ) : (
//                 <VideoView
//                   player={adVideoPlayer}
//                   style={{ width: '100%', height: '100%' }}
//                   contentFit="cover"
//                   nativeControls={false}
//                   startsAutomatically={true}
//                 />
//               )
//             ) : (
//               <Image
//                 source={{ uri: videoUrl || 'https://via.placeholder.com/400' }}
//                 style={StyleSheet.absoluteFillObject}
//                 resizeMode="cover"
//               />
//             )}
//           </View>

//           {/* መቆጣጠሪያዎች (ዝለል / Skip ቁልፍ) */}
//           <View style={styles.topControlRow}>
//             <View style={styles.sponsorBadge}>
//               <Text style={styles.sponsorBadgeText}>ልዩ ማስታወቂያ</Text>
//             </View>

//             <TouchableOpacity onPress={finishAndGoToShop} style={styles.skipBtn}>
//               <Text style={styles.skipBtnText}>ዝለል (Skip)</Text>
//             </TouchableOpacity>
//           </View>

//           {/* የታችኛው ክፍል */}
//           <View style={styles.bottomPanel}>
//             <Text style={styles.headline} numberOfLines={2}>
//               {activeAd?.title || 'ቅናሽ ገበያ ልዩ ቅናሾች'}
//             </Text>
//             <TouchableOpacity style={styles.ctaButton} onPress={finishAndGoToShop}>
//               <Text style={styles.ctaText}>ግባ ›</Text>
//             </TouchableOpacity>
//           </View>

//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: '#0B150F' },
//   container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
//   adCard: {
//     backgroundColor: '#0B150F',
//     borderRadius: 20,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: 'rgba(52, 211, 153, 0.3)',
//     position: 'relative',
//   },
//   mediaContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
//   topControlRow: {
//     position: 'absolute',
//     top: 16,
//     left: 16,
//     right: 16,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   sponsorBadge: {
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 12,
//   },
//   sponsorBadgeText: { color: '#34D399', fontSize: 11, fontWeight: 'bold' },
//   skipBtn: {
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#34D399',
//   },
//   skipBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
//   bottomPanel: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     padding: 16,
//     backgroundColor: 'rgba(0,0,0,0.8)',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   headline: { color: '#FFF', fontSize: 14, fontWeight: 'bold', flex: 1, marginRight: 10 },
//   ctaButton: { backgroundColor: '#10B981', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
//   ctaText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
// });
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiRequest } from '../lib/api';
import { useSession } from '../context/SessionContext';
import { useVideoPlayer, VideoView } from 'expo-video';

export default function AdInterstitialScreen() {
  const router = useRouter();
  const { token } = useSession();
  const { width: SCREEN_W, height: SCREEN_H } = useWindowDimensions();

  const [activeAd, setActiveAd] = useState(null);
  const [adMuted, setAdMuted] = useState(false);
  const webVideoRef = useRef(null);

  // Countdown & Animation States
  const [skipCountingDown, setSkipCountingDown] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(3);
  const circleProgressAnim = useRef(new Animated.Value(1)).current;
  const pulseScaleAnim = useRef(new Animated.Value(1)).current;
  const countdownTimerRef = useRef(null);

  const videoUrl = activeAd?.mediaUrl || '';
  const isVideoAsset =
    activeAd?.mediaType === 'VIDEO' ||
    /\.(mp4|mov|webm)(\?.*)?$/i.test(videoUrl);

  const adVideoPlayer = useVideoPlayer(isVideoAsset ? videoUrl : '', (player) => {
    player.loop = true;
    player.muted = adMuted;
    player.play();
  });

  useEffect(() => {
    if (adVideoPlayer && isVideoAsset) {
      adVideoPlayer.muted = adMuted;
    }
  }, [adMuted, adVideoPlayer, isVideoAsset]);

  useEffect(() => {
    async function fetchAd() {
      try {
        const res = await apiRequest('/catalog/post-order-ad', { token }).catch(() => null);
        if (res?.ad) {
          setActiveAd(res.ad);
        }
      } catch (err) {
        console.log('Ad fetch error:', err);
      }
    }
    fetchAd();

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [token]);

  const finishAndGoToShop = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    router.replace('/(tabs)');
  };

  const handleOpenActionLink = async () => {
    if (!activeAd?.actionLink) return;
    try {
      const canOpen = await Linking.canOpenURL(activeAd.actionLink);
      if (canOpen) {
        await Linking.openURL(activeAd.actionLink);
      }
    } catch {}
  };

  // Launch the 3-Second Circular Countdown on Skip click
  const handleInitiateSkip = () => {
    if (skipCountingDown) return;

    setSkipCountingDown(true);
    setSecondsRemaining(3);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScaleAnim, {
          toValue: 1.08,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScaleAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    circleProgressAnim.setValue(1);
    Animated.timing(circleProgressAnim, {
      toValue: 0,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    let count = 3;
    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      setSecondsRemaining(count);

      if (count <= 0) {
        clearInterval(countdownTimerRef.current);
        finishAndGoToShop();
      }
    }, 1000);
  };

  const cardWidth = Math.min(SCREEN_W * 0.92, 420);
  const cardHeight = Math.min(SCREEN_H * 0.82, 640);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={[styles.adCard, { width: cardWidth, height: cardHeight }]}>
          
          {/* Media Container */}
          <View style={styles.mediaContainer}>
            {isVideoAsset ? (
              Platform.OS === 'web' ? (
                <video
                  ref={webVideoRef}
                  src={videoUrl}
                  autoPlay
                  muted={adMuted}
                  playsInline
                  loop
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <VideoView
                  player={adVideoPlayer}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  nativeControls={false}
                  startsAutomatically={true}
                />
              )
            ) : (
              <Image
                source={{ uri: videoUrl || 'https://via.placeholder.com/400' }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
            )}
          </View>

          {/* Top Controls with Circular Countdown */}
          <View style={styles.topControlRow}>
            <View style={styles.sponsorBadge}>
              <Text style={styles.sponsorBadgeText}>ልዩ ማስታወቂያ</Text>
            </View>

            <TouchableOpacity onPress={handleInitiateSkip} activeOpacity={0.85}>
              {skipCountingDown ? (
                <Animated.View
                  style={[
                    styles.circleProgressShell,
                    { transform: [{ scale: pulseScaleAnim }] },
                  ]}
                >
                  <View style={styles.circularTrackRing} />
                  <Animated.View
                    style={[
                      styles.circularActiveIndicator,
                      { opacity: circleProgressAnim },
                    ]}
                  />
                  <Text style={styles.countdownNumberText}>{secondsRemaining}s</Text>
                </Animated.View>
              ) : (
                <View style={styles.skipBtn}>
                  <Text style={styles.skipBtnText}>ዝለል (Skip)</Text>
                  <Text style={styles.skipArrow}>›</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom Panel */}
          <View style={styles.bottomPanel}>
            <Text style={styles.headline} numberOfLines={2}>
              {activeAd?.title || 'ቅናሽ ገበያ ልዩ ቅናሾች'}
            </Text>
            <TouchableOpacity style={styles.ctaButton} onPress={finishAndGoToShop}>
              <Text style={styles.ctaText}>ግባ ›</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B150F' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  adCard: {
    backgroundColor: '#0B150F',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    position: 'relative',
  },
  mediaContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
  topControlRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  sponsorBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  sponsorBadgeText: { color: '#34D399', fontSize: 11, fontWeight: 'bold' },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#34D399',
  },
  skipBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  skipArrow: { color: '#34D399', fontSize: 16, fontWeight: 'bold' },
  circleProgressShell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  circularTrackRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  circularActiveIndicator: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#10B981',
    borderTopColor: '#34D399',
  },
  countdownNumberText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headline: { color: '#FFF', fontSize: 14, fontWeight: 'bold', flex: 1, marginRight: 10 },
  ctaButton: { backgroundColor: '#10B981', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  ctaText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});