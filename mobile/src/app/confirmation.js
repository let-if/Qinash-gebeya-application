
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   Animated,
//   Easing,
//   Image,
//   Linking,
//   Modal,
//   Platform,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   useWindowDimensions,
// } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { apiRequest } from '../lib/api';
// import { useSession } from '../context/SessionContext';

// // Safely attempt to import expo-av video modules with a fallback if native module is missing
// let Audio = null;
// let Video = null;
// let ResizeMode = null;
// try {
//   const ExpoAV = require('expo-av');
//   Audio = ExpoAV.Audio;
//   Video = ExpoAV.Video;
//   ResizeMode = ExpoAV.ResizeMode;
// } catch (e) {
//   // Fallback if native module isn't linked or running in restricted environment
// }

// const RECORDED_VOICE = require('../../assets/Voice 261001_134911.m4a');

// export default function ConfirmationScreen() {
//   const router = useRouter();
//   const { lang, token } = useSession();
//   const { width: SCREEN_W, height: SCREEN_H } = useWindowDimensions();
//   const {
//     orderNumber = '1044',
//     deliveryTime = '12:00 ሰዓት',
//   } = useLocalSearchParams();

//   const [isPlaying, setIsPlaying] = useState(false);
//   const soundRef = useRef(null);

//   // Modern Interstitial Ad State
//   const [adModalVisible, setAdModalVisible] = useState(false);
//   const [activeAd, setActiveAd] = useState(null);
//   const [adMuted, setAdMuted] = useState(false);

//   // Smooth Countdown & Circular Animations
//   const [skipCountingDown, setSkipCountingDown] = useState(false);
//   const [secondsRemaining, setSecondsRemaining] = useState(3);
  
//   const circleProgressAnim = useRef(new Animated.Value(1)).current;
//   const pulseScaleAnim = useRef(new Animated.Value(1)).current;
//   const modalFadeAnim = useRef(new Animated.Value(0)).current;
//   const cardScaleAnim = useRef(new Animated.Value(0.92)).current;
//   const countdownTimerRef = useRef(null);

//   const cleanOrderNumber = String(orderNumber).replace(/[^0-9]/g, '');

//   async function playAudio() {
//     try {
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
//       if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
//     };
//   }, []);

//   // Preload Post-Order Interstitial Ad
//   useEffect(() => {
//     async function fetchAd() {
//       try {
//         const res = await apiRequest('/catalog/post-order-ad', { token }).catch(() => null);
//         if (res?.ad) {
//           setActiveAd(res.ad);
//         } else {
//           const adminRes = await apiRequest('/admin/interstitial-ad', { token }).catch(() => null);
//           if (adminRes && adminRes.mediaUrl) {
//             setActiveAd(adminRes);
//           }
//         }
//       } catch {
//         setActiveAd(null);
//       }
//     }
//     fetchAd();
//   }, [token]);

//   const finishAndGoToShop = () => {
//     if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
//     Animated.parallel([
//       Animated.timing(modalFadeAnim, {
//         toValue: 0,
//         duration: 220,
//         useNativeDriver: true,
//       }),
//       Animated.timing(cardScaleAnim, {
//         toValue: 0.9,
//         duration: 220,
//         useNativeDriver: true,
//       }),
//     ]).start(() => {
//       setAdModalVisible(false);
//       router.replace('/(tabs)');
//     });
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

//   // Launch the 3-Second Modern Circular Countdown
//   const handleInitiateSkip = () => {
//     if (skipCountingDown) return;

//     setSkipCountingDown(true);
//     setSecondsRemaining(3);

//     // Continuous soft pulse on the countdown badge
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseScaleAnim, {
//           toValue: 1.08,
//           duration: 400,
//           easing: Easing.out(Easing.ease),
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulseScaleAnim, {
//           toValue: 1,
//           duration: 400,
//           easing: Easing.in(Easing.ease),
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();

//     // 3000ms smooth circular drain
//     circleProgressAnim.setValue(1);
//     Animated.timing(circleProgressAnim, {
//       toValue: 0,
//       duration: 3000,
//       easing: Easing.linear,
//       useNativeDriver: false,
//     }).start();

//     let count = 3;
//     countdownTimerRef.current = setInterval(() => {
//       count -= 1;
//       setSecondsRemaining(count);

//       if (count <= 0) {
//         clearInterval(countdownTimerRef.current);
//         finishAndGoToShop();
//       }
//     }, 1000);
//   };

//   const handleReturnToShop = async () => {
//     await stopAndCleanup();

//     if (activeAd && activeAd.mediaUrl) {
//       setAdModalVisible(true);
//       Animated.parallel([
//         Animated.timing(modalFadeAnim, {
//           toValue: 1,
//           duration: 300,
//           useNativeDriver: true,
//         }),
//         Animated.spring(cardScaleAnim, {
//           toValue: 1,
//           tension: 65,
//           friction: 9,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     } else {
//       router.replace('/(tabs)');
//     }
//   };

//   const cardWidth = Math.min(SCREEN_W * 0.92, 420);
//   const cardHeight = Math.min(SCREEN_H * 0.82, 640);

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

//       {/* LUXURY INTERSTITIAL AD MODAL */}
//       <Modal
//         visible={adModalVisible}
//         transparent={true}
//         animationType="none"
//         onRequestClose={finishAndGoToShop}
//       >
//         <Animated.View style={[styles.adBackdropOverlay, { opacity: modalFadeAnim }]}>
//           <Animated.View
//             style={[
//               styles.luxuryAdCard,
//               {
//                 width: cardWidth,
//                 height: cardHeight,
//                 transform: [{ scale: cardScaleAnim }],
//               },
//             ]}
//           >
//             {/* Background Ambient Glows */}
//             <View style={styles.adGlowCircleTop} />
//             <View style={styles.adGlowCircleBottom} />

//             {/* Media Canvas */}
//             <View style={styles.mediaContainer}>
//               {activeAd?.mediaType === 'VIDEO' ||
//               /\.(mp4|mov|webm)$/i.test(activeAd?.mediaUrl || '') ? (
//                 Platform.OS === 'web' ? (
//                   <video
//                     src={activeAd.mediaUrl}
//                     autoPlay
//                     muted={adMuted}
//                     playsInline
//                     onEnded={finishAndGoToShop}
//                     style={{
//                       width: '100%',
//                       height: '100%',
//                       objectFit: 'cover',
//                     }}
//                   />
//                 ) : Video ? (
//                   <Video
//                     source={{ uri: activeAd.mediaUrl }}
//                     style={StyleSheet.absoluteFillObject}
//                     resizeMode={ResizeMode.COVER}
//                     shouldPlay={true}
//                     isLooping={false}
//                     isMuted={adMuted}
//                     useNativeControls={false}
//                     onPlaybackStatusUpdate={(s) => {
//                       if (s?.isLoaded && s?.didJustFinish) {
//                         finishAndGoToShop();
//                       }
//                     }}
//                   />
//                 ) : (
//                   <Image
//                     source={{ uri: activeAd.mediaUrl }}
//                     style={StyleSheet.absoluteFillObject}
//                     resizeMode="cover"
//                   />
//                 )
//               ) : (
//                 <Image
//                   source={{ uri: activeAd?.mediaUrl }}
//                   style={StyleSheet.absoluteFillObject}
//                   resizeMode="cover"
//                 />
//               )}

//               {/* Glassmorphism Dark Vignette Gradients */}
//               <View style={styles.vignetteTop} />
//               <View style={styles.vignetteBottom} />
//             </View>

//             {/* TOP HEADER CONTROLS */}
//             <View style={styles.topControlRow}>
//               {/* Badge & Mute Toggle */}
//               <View style={styles.topLeftGroup}>
//                 <View style={styles.sponsorBadge}>
//                   <Text style={styles.sponsorBadgeText}>ልዩ ማስታወቂያ</Text>
//                 </View>

//                 {activeAd?.mediaType === 'VIDEO' && (
//                   <TouchableOpacity
//                     style={styles.soundToggleBtn}
//                     onPress={() => setAdMuted(!adMuted)}
//                     activeOpacity={0.8}
//                   >
//                     <Text style={styles.soundToggleIcon}>{adMuted ? '🔇' : '🔊'}</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>

//               {/* MODERN CIRCULAR SKIP BUTTON */}
//               <TouchableOpacity
//                 onPress={handleInitiateSkip}
//                 activeOpacity={0.85}
//               >
//                 {skipCountingDown ? (
//                   <Animated.View
//                     style={[
//                       styles.circleProgressShell,
//                       { transform: [{ scale: pulseScaleAnim }] },
//                     ]}
//                   >
//                     <View style={styles.circularTrackRing} />
//                     <Animated.View
//                       style={[
//                         styles.circularActiveIndicator,
//                         {
//                           opacity: circleProgressAnim,
//                         },
//                       ]}
//                     />
//                     <Text style={styles.countdownNumberText}>{secondsRemaining}s</Text>
//                   </Animated.View>
//                 ) : (
//                   <View style={styles.skipButtonInitial}>
//                     <Text style={styles.skipButtonInitialText}>ዝለል (Skip)</Text>
//                     <Text style={styles.skipArrowIcon}>›</Text>
//                   </View>
//                 )}
//               </TouchableOpacity>
//             </View>

//             {/* BOTTOM AD DETAILS & CALL TO ACTION */}
//             <View style={styles.bottomInfoPanel}>
//               <View style={styles.adTextCol}>
//                 <Text style={styles.adHeadline} numberOfLines={2}>
//                   {activeAd?.title || 'ቅናሽ ገበያ ልዩ ቅናሾች'}
//                 </Text>
//                 <Text style={styles.adSubtitle} numberOfLines={1}>
//                   ምርጥ ጥራት ከአስተማማኝ የፋብሪካ ዋጋ ጋር
//                 </Text>
//               </View>

//               {activeAd?.actionLink && (
//                 <TouchableOpacity
//                   style={styles.ctaButton}
//                   onPress={handleOpenActionLink}
//                   activeOpacity={0.85}
//                 >
//                   <Text style={styles.ctaButtonText}>ይመልከቱ ›</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </Animated.View>
//         </Animated.View>
//       </Modal>
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
//   adBackdropOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(5, 18, 12, 0.88)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   luxuryAdCard: {
//     backgroundColor: '#0B150F',
//     borderRadius: 28,
//     overflow: 'hidden',
//     position: 'relative',
//     borderWidth: 1.5,
//     borderColor: 'rgba(52, 211, 153, 0.4)',
//     shadowColor: '#10B981',
//     shadowOffset: { width: 0, height: 16 },
//     shadowOpacity: 0.35,
//     shadowRadius: 28,
//     elevation: 25,
//   },
//   adGlowCircleTop: {
//     position: 'absolute',
//     top: -60,
//     right: -40,
//     width: 180,
//     height: 180,
//     borderRadius: 90,
//     backgroundColor: 'rgba(16, 185, 129, 0.18)',
//   },
//   adGlowCircleBottom: {
//     position: 'absolute',
//     bottom: -60,
//     left: -40,
//     width: 200,
//     height: 200,
//     borderRadius: 100,
//     backgroundColor: 'rgba(245, 158, 11, 0.14)',
//   },
//   mediaContainer: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: '#000000',
//   },
//   vignetteTop: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 110,
//     backgroundColor: 'rgba(0, 0, 0, 0.55)',
//   },
//   vignetteBottom: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 140,
//     backgroundColor: 'rgba(0, 0, 0, 0.75)',
//   },
//   topControlRow: {
//     position: 'absolute',
//     top: 16,
//     left: 16,
//     right: 16,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     zIndex: 20,
//   },
//   topLeftGroup: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   sponsorBadge: {
//     backgroundColor: 'rgba(11, 21, 15, 0.85)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.25)',
//   },
//   sponsorBadgeText: {
//     color: '#34D399',
//     fontSize: 11,
//     fontWeight: '900',
//     letterSpacing: 0.3,
//   },
//   soundToggleBtn: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: 'rgba(11, 21, 15, 0.85)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.2)',
//   },
//   soundToggleIcon: {
//     fontSize: 13,
//   },
//   skipButtonInitial: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     backgroundColor: 'rgba(11, 21, 15, 0.88)',
//     paddingLeft: 14,
//     paddingRight: 10,
//     paddingVertical: 7,
//     borderRadius: 22,
//     borderWidth: 1.2,
//     borderColor: '#10B981',
//     shadowColor: '#10B981',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.4,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   skipButtonInitialText: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     fontWeight: '900',
//   },
//   skipArrowIcon: {
//     color: '#34D399',
//     fontSize: 16,
//     fontWeight: '900',
//     marginTop: -1,
//   },
//   circleProgressShell: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: 'rgba(11, 21, 15, 0.95)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1.5,
//     borderColor: 'rgba(255, 255, 255, 0.15)',
//     shadowColor: '#10B981',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.5,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   circularTrackRing: {
//     position: 'absolute',
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     borderWidth: 3,
//     borderColor: 'rgba(255, 255, 255, 0.12)',
//   },
//   circularActiveIndicator: {
//     position: 'absolute',
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     borderWidth: 3,
//     borderColor: '#10B981',
//     borderTopColor: '#34D399',
//     borderRightColor: '#059669',
//   },
//   countdownNumberText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '900',
//     fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Bold' : 'sans-serif-medium',
//   },
//   bottomInfoPanel: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 18,
//     paddingBottom: 18,
//     paddingTop: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     gap: 12,
//     zIndex: 20,
//   },
//   adTextCol: {
//     flex: 1,
//   },
//   adHeadline: {
//     color: '#FFFFFF',
//     fontSize: 15,
//     fontWeight: '900',
//     lineHeight: 19,
//     marginBottom: 3,
//     textShadowColor: 'rgba(0, 0, 0, 0.8)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 4,
//   },
//   adSubtitle: {
//     color: 'rgba(255, 255, 255, 0.75)',
//     fontSize: 11.5,
//     fontWeight: '600',
//   },
//   ctaButton: {
//     backgroundColor: '#10B981',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 14,
//     shadowColor: '#10B981',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.4,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   ctaButtonText: {
//     color: '#FFFFFF',
//     fontSize: 12.5,
//     fontWeight: '900',
//   },
// });
import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../context/SessionContext';

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
      const ExpoAV = require('expo-av');
      const Audio = ExpoAV.Audio;

      if (!Audio) return;

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
    } catch {
      setIsPlaying(false);
    }
  }

  async function togglePlayPause() {
    if (!soundRef.current) {
      await playAudio();
      return;
    }

    try {
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
    } catch {
      setIsPlaying(false);
    }
  }

  async function stopAndCleanup() {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    setIsPlaying(false);
  }

  useEffect(() => {
    playAudio();
    return () => {
      stopAndCleanup();
    };
  }, []);

  const handleReturnToShop = async () => {
    await stopAndCleanup();
    // Seamlessly transition to the dedicated standalone ad page
    router.replace('/ad-interstitial');
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