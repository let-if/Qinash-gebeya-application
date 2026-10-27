
// // import React, { useCallback, useMemo, useState } from 'react';
// // import {
// //   ActivityIndicator,
// //   Image,
// //   Linking,
// //   Platform,
// //   SafeAreaView,
// //   ScrollView,
// //   StyleSheet,
// //   Text,
// //   TouchableOpacity,
// //   View,
// //   useWindowDimensions,
// // } from 'react-native';
// // import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import * as Location from 'expo-location';
// // import { apiRequest } from '../lib/api';
// // import { useSession } from '../context/SessionContext';
// // import CustomAlert from '../components/CustomAlert';

// // const ADMIN_DESTINATION_PHONE = '0968821059';

// // const UNIT_MAP = {
// //   'ካርቶን': 'CARTON',
// //   'ግማሽ': 'HALF_CARTON',
// //   'ግማሽ ካርቶን': 'HALF_CARTON',
// //   'ግማሽ ደርዘን': 'HALF_DOZEN',
// //   'ፓኬት': 'PACK',
// //   'ደርዘን': 'DOZEN',
// //   'ኪሎ': 'KG',
// //   'ኩንታል': 'QUINTAL',
// //   'ቁራጭ': 'PIECE',
// //   'መረብ': 'MEREB',
// //   CARTON: 'CARTON',
// //   HALF_CARTON: 'HALF_CARTON',
// //   HALF_DOZEN: 'HALF_DOZEN',
// //   PACK: 'PACK',
// //   DOZEN: 'DOZEN',
// //   KG: 'KG',
// //   QUINTAL: 'QUINTAL',
// //   PIECE: 'PIECE',
// //   MEREB: 'MEREB',
// // };

// // export default function CheckoutScreen() {
// //   const router = useRouter();
// //   const params = useLocalSearchParams();
// //   const { token, lang } = useSession();
// //   const { width: SCREEN_W } = useWindowDimensions();

// //   const [cart, setCart] = useState({});
// //   const [drafts, setDrafts] = useState({});
// //   const [selectedDraftKeys, setSelectedDraftKeys] = useState({});
// //   const [draftExpanded, setDraftExpanded] = useState(false);
// //   const [canOrderOnCredit, setCanOrderOnCredit] = useState(false);
// //   const [currentUserId, setCurrentUserId] = useState('guest');

// //   const [slot, setSlot] = useState('BATCH_12PM');
// //   const [isCredit, setIsCredit] = useState(false);
// //   const [submitting, setSubmitting] = useState(false);
// //   const [loadingCart, setLoadingCart] = useState(true);

// //   const [offlinePromptVisible, setOfflinePromptVisible] = useState(false);
// //   const [pendingSmsPayload, setPendingSmsPayload] = useState('');

// //   const [alertConfig, setAlertConfig] = useState({
// //     visible: false,
// //     title: '',
// //     message: '',
// //     type: 'error',
// //   });

// //   const isSmall = SCREEN_W < 350;
// //   const isTablet = SCREEN_W >= 680;
// //   const S = isSmall ? 0.9 : isTablet ? 1.12 : SCREEN_W >= 420 ? 1.06 : 1;
// //   const dyn = useMemo(() => buildDynamic(S, isTablet), [S, isTablet]);

// //   const loadUserDataAndStorage = async () => {
// //     try {
// //       let resolvedUserId = 'guest';

// //       if (token) {
// //         const res = await apiRequest('/auth/me', { token }).catch(() => null);
// //         const userData = res?.user || res?.data;
// //         if (userData) {
// //           resolvedUserId = String(userData.id || userData._id || 'guest');
// //           const eligible = Boolean(userData.canOrderOnCredit);
// //           setCanOrderOnCredit(eligible);
// //           await AsyncStorage.setItem('user_credit_eligible', eligible ? '1' : '0');
// //         }
// //       }

// //       if (resolvedUserId === 'guest') {
// //         const storedUser = await AsyncStorage.getItem('user_data').catch(() => null);
// //         if (storedUser) {
// //           const parsed = JSON.parse(storedUser);
// //           resolvedUserId = String(parsed?.id || parsed?._id || 'guest');
// //           setCanOrderOnCredit(Boolean(parsed?.canOrderOnCredit));
// //         }
// //       }

// //       setCurrentUserId(resolvedUserId);

// //       const scopedCartKey = `user_cart_${resolvedUserId}`;
// //       const scopedDraftKey = `user_draft_cart_${resolvedUserId}`;

// //       let parsedCart = {};
// //       let parsedDrafts = {};

// //       const storedDraftsJson = await AsyncStorage.getItem(scopedDraftKey).catch(() => null);
// //       parsedDrafts = storedDraftsJson ? JSON.parse(storedDraftsJson) : {};

// //       if (params?.cartData) {
// //         try {
// //           const incomingData = JSON.parse(params.cartData);
// //           if (params?.isDraft === 'true') {
// //             Object.entries(incomingData).forEach(([k, item]) => {
// //               parsedDrafts[k] = { ...item };
// //             });
// //             await AsyncStorage.setItem(scopedDraftKey, JSON.stringify(parsedDrafts));
// //             await AsyncStorage.setItem('user_draft_cart', JSON.stringify(parsedDrafts));
// //           } else {
// //             parsedCart = incomingData;
// //             await AsyncStorage.setItem(scopedCartKey, JSON.stringify(parsedCart));
// //             await AsyncStorage.setItem('user_cart', JSON.stringify(parsedCart));
// //           }
// //         } catch {}
// //       }

// //       if (Object.keys(parsedCart).length === 0) {
// //         const storedCart = await AsyncStorage.getItem(scopedCartKey).catch(() => null);
// //         if (storedCart) {
// //           parsedCart = JSON.parse(storedCart);
// //         }
// //       }

// //       setCart(parsedCart);
// //       setDrafts(parsedDrafts);

// //       setDraftExpanded((prev) => (params?.isDraft === 'true' || Object.keys(parsedCart).length === 0 ? true : prev));
// //     } catch {
// //       setCart({});
// //       setDrafts({});
// //     } finally {
// //       setLoadingCart(false);
// //     }
// //   };

// //   useFocusEffect(
// //     useCallback(() => {
// //       loadUserDataAndStorage();
// //     }, [token])
// //   );

// //   const updateQuantity = useCallback(async (key, delta) => {
// //     setCart((prevCart) => {
// //       const updated = { ...prevCart };
// //       if (!updated[key]) return prevCart;

// //       const nextQty = (updated[key].quantity || 0) + delta;

// //       if (nextQty <= 0) {
// //         delete updated[key];
// //       } else {
// //         updated[key] = {
// //           ...updated[key],
// //           quantity: nextQty,
// //         };
// //       }

// //       AsyncStorage.setItem(`user_cart_${currentUserId}`, JSON.stringify(updated)).catch(() => {});
// //       return updated;
// //     });
// //   }, [currentUserId]);

// //   const removeItem = useCallback(async (key) => {
// //     setCart((prevCart) => {
// //       const updated = { ...prevCart };
// //       delete updated[key];
// //       AsyncStorage.setItem(`user_cart_${currentUserId}`, JSON.stringify(updated)).catch(() => {});
// //       return updated;
// //     });
// //   }, [currentUserId]);

// //   const toggleDraftItemSelection = useCallback((key) => {
// //     setSelectedDraftKeys((prev) => ({ ...prev, [key]: !prev[key] }));
// //   }, []);

// //   const handleToggleAllDrafts = useCallback(() => {
// //     setSelectedDraftKeys((prev) => {
// //       const allSelected = Object.keys(drafts).every((k) => prev[k]);
// //       const nextState = {};
// //       Object.keys(drafts).forEach((k) => {
// //         nextState[k] = !allSelected;
// //       });
// //       return nextState;
// //     });
// //   }, [drafts]);

// //   // Count only drafts that still exist (ignores stale selected keys)
// //   const selectedDraftCount = useMemo(() => {
// //     return Object.keys(drafts).filter((k) => selectedDraftKeys[k]).length;
// //   }, [drafts, selectedDraftKeys]);

// //   const handleMoveSelectedToActiveOrder = useCallback(async () => {
// //     const keysToMove = Object.keys(drafts).filter((k) => selectedDraftKeys[k]);

// //     if (keysToMove.length === 0) {
// //       setAlertConfig({
// //         visible: true,
// //         title: 'እቃ አልተመረጠም',
// //         message: 'እባክዎ ወደ ትእዛዝ ዝርዝር የሚዛወሩትን እቃዎች በሳጥኑ (checkbox) ላይ ይምረጡ',
// //         type: 'error',
// //       });
// //       return;
// //     }

// //     // Compute first, then set each state once (no state updates inside an updater)
// //     const mergedCart = { ...cart };
// //     const remainingDrafts = { ...drafts };

// //     keysToMove.forEach((k) => {
// //       const draftItem = drafts[k];
// //       if (mergedCart[k]) {
// //         mergedCart[k] = {
// //           ...mergedCart[k],
// //           quantity: (mergedCart[k].quantity || 0) + (draftItem.quantity || 1),
// //         };
// //       } else {
// //         mergedCart[k] = { ...draftItem };
// //       }
// //       delete remainingDrafts[k];
// //     });

// //     setCart(mergedCart);
// //     setDrafts(remainingDrafts);
// //     setSelectedDraftKeys({});

// //     AsyncStorage.setItem(`user_cart_${currentUserId}`, JSON.stringify(mergedCart)).catch(() => {});
// //     AsyncStorage.setItem(`user_draft_cart_${currentUserId}`, JSON.stringify(remainingDrafts)).catch(() => {});

// //     setAlertConfig({
// //       visible: true,
// //       title: 'እቃዎች ተዛውረዋል',
// //       message: `የተመረጡት ${keysToMove.length} እቃዎች ወደ ትእዛዝ ዝርዝር ገብተዋል።`,
// //       type: 'success',
// //     });
// //   }, [cart, drafts, selectedDraftKeys, currentUserId]);

// //   const handleDeleteSelectedDrafts = useCallback(async () => {
// //     const keysToDelete = Object.keys(drafts).filter((k) => selectedDraftKeys[k]);

// //     if (keysToDelete.length === 0) {
// //       setAlertConfig({
// //         visible: true,
// //         title: 'እቃ አልተመረጠም',
// //         message: 'እባክዎ የሚሰረዙትን የረቂቅ እቃዎች ይምረጡ',
// //         type: 'error',
// //       });
// //       return;
// //     }

// //     const remainingDrafts = { ...drafts };
// //     keysToDelete.forEach((k) => {
// //       delete remainingDrafts[k];
// //     });

// //     setDrafts(remainingDrafts);
// //     setSelectedDraftKeys({});
// //     await AsyncStorage.setItem(`user_draft_cart_${currentUserId}`, JSON.stringify(remainingDrafts)).catch(() => {});

// //     setAlertConfig({
// //       visible: true,
// //       title: 'ተሰርዟል',
// //       message: `${keysToDelete.length} እቃዎች ከረቂቅ ተሰርዘዋል`,
// //       type: 'success',
// //     });
// //   }, [drafts, selectedDraftKeys, currentUserId]);

// //   const handleSafeBack = () => {
// //     if (router.canGoBack()) {
// //       router.back();
// //     } else {
// //       router.replace('/(tabs)');
// //     }
// //   };

// //   const cartEntries = Object.entries(cart);
// //   const draftEntries = Object.entries(drafts);

// //   const totalPrice = cartEntries.reduce(
// //     (sum, [_, item]) =>
// //       sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
// //     0
// //   );

// //   const draftTotalPrice = draftEntries.reduce(
// //     (sum, [_, item]) =>
// //       sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
// //     0
// //   );

// //   const generateSmsOrderText = (loc) => {
// //     if (cartEntries.length === 0) return '';

// //     const itemsListAmharic = cartEntries.map(([_, it], index) => {
// //       const name = it.name || 'እቃ';
// //       const qty = Math.max(1, Math.round(Number(it.quantity) || 1));
// //       const unit = it.unit || 'ካርቶን';
// //       const subTotal = ((Number(it.price) || 0) * qty).toLocaleString();
// //       return `${index + 1}. ${name} ብዛት: ${qty} ${unit} (ዋጋ: ${subTotal} ብር)`;
// //     }).join('\n');

// //     const slotTimeText = slot === 'BATCH_6AM' ? 'ጠዋት 6:00 ሰዓት' : 'ቀትር 12:00 ሰዓት';
// //     const creditStatusText = isCredit && canOrderOnCredit ? 'በብድር (Credit Order)' : 'ጥሬ ገንዘብ (Cash)';
// //     const locPart = loc?.latitude ? `\nመገኛ (GPS): ${loc.latitude},${loc.longitude}` : '';

// //     return `ሰላም! አዲስ የትእዛዝ ጥያቄ ከቅናሽ ገበያ መተግበሪያ:\n\nየተመረጡ እቃዎች:\n${itemsListAmharic}\n\nጠቅላላ ድምር: ${totalPrice.toLocaleString()} ብር\nየመላኪያ ሰዓት: ${slotTimeText}\nየክፍያ ሁኔታ: ${creditStatusText}${locPart}`;
// //   };

// //   const acquireAccurateGps = async () => {
// //     try {
// //       if (Platform.OS === 'web') {
// //         return new Promise((resolve) => {
// //           if (typeof navigator !== 'undefined' && navigator.geolocation) {
// //             navigator.geolocation.getCurrentPosition(
// //               (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
// //               () => resolve({ latitude: null, longitude: null }),
// //               { timeout: 5000 }
// //             );
// //           } else {
// //             resolve({ latitude: null, longitude: null });
// //           }
// //         });
// //       }

// //       const { status } = await Location.requestForegroundPermissionsAsync();
// //       if (status !== 'granted') return { latitude: null, longitude: null };

// //       const location = await Location.getCurrentPositionAsync({
// //         accuracy: Location.Accuracy.Balanced,
// //       });

// //       return {
// //         latitude: location.coords.latitude,
// //         longitude: location.coords.longitude,
// //       };
// //     } catch {
// //       return { latitude: null, longitude: null };
// //     }
// //   };

// //   const checkIsDeviceOnline = async () => {
// //     if (Platform.OS === 'web') {
// //       return typeof navigator !== 'undefined' ? navigator.onLine : true;
// //     }
// //     try {
// //       const controller = new AbortController();
// //       const timeoutId = setTimeout(() => controller.abort(), 3500);
// //       await fetch('https://clients3.google.com/generate_204', {
// //         method: 'HEAD',
// //         signal: controller.signal,
// //       });
// //       clearTimeout(timeoutId);
// //       return true;
// //     } catch {
// //       return false;
// //     }
// //   };

// //   const openSmsApplicationWithPayload = async (payload) => {
// //     setOfflinePromptVisible(false);
// //     const separator = Platform.OS === 'ios' ? '&' : '?';
// //     const smsUrl = `sms:${ADMIN_DESTINATION_PHONE}${separator}body=${encodeURIComponent(payload)}`;

// //     try {
// //       const supported = await Linking.canOpenURL(smsUrl);
// //       if (supported) {
// //         await Linking.openURL(smsUrl);
// //       } else {
// //         await Linking.openURL(`sms:${ADMIN_DESTINATION_PHONE}`);
// //       }
// //     } catch {
// //       setAlertConfig({
// //         visible: true,
// //         title: 'መልእክት ስህተት',
// //         message: 'የ SMS መተግበሪያውን በስልኮ ላይ መክፈት አልተቻለም',
// //         type: 'error',
// //       });
// //     }
// //   };

// //   const handleOpenMobileDataSettings = async () => {
// //     setOfflinePromptVisible(false);
// //     try {
// //       if (Platform.OS === 'android') {
// //         await Linking.sendIntent('android.settings.DATA_ROAMING_SETTINGS').catch(async () => {
// //           await Linking.openSettings();
// //         });
// //       } else if (Platform.OS === 'ios') {
// //         await Linking.openURL('App-Prefs:root=MOBILE_DATA_SETTINGS_ID').catch(async () => {
// //           await Linking.openSettings();
// //         });
// //       } else {
// //         await Linking.openSettings();
// //       }
// //     } catch {
// //       await Linking.openSettings();
// //     }
// //   };

// //   const handleSubmitOrder = async () => {
// //     if (cartEntries.length === 0) {
// //       setAlertConfig({
// //         visible: true,
// //         title: 'ቅርጫት ባዶ ነው',
// //         message: 'እባክዎ መጀመሪያ እቃ ይምረጡ ወይም ከረቂቅ ወደ ትእዛዝ ያዛውሩ',
// //         type: 'error',
// //       });
// //       return;
// //     }

// //     setSubmitting(true);

// //     const isOnline = await checkIsDeviceOnline();

// //     // GPS lookup is limited to 7 seconds so the button can never stay stuck
// //     const gpsLocation = await Promise.race([
// //       acquireAccurateGps(),
// //       new Promise((resolve) =>
// //         setTimeout(() => resolve({ latitude: null, longitude: null }), 7000)
// //       ),
// //     ]);

// //     if (!isOnline) {
// //       setSubmitting(false);
// //       const offlineSmsString = generateSmsOrderText(gpsLocation);
// //       setPendingSmsPayload(offlineSmsString);
// //       setOfflinePromptVisible(true);
// //       return;
// //     }

// //     try {
// //       const payload = cartEntries.map(([_, item]) => ({
// //         productId: item.productId,
// //         quantity: Math.max(1, Math.round(Number(item.quantity))),
// //         selectedUnit: UNIT_MAP[item.unit] || 'CARTON',
// //         unitPrice: Number(item.price),
// //       }));

// //       const res = await apiRequest('/orders', {
// //         method: 'POST',
// //         token,
// //         body: {
// //           deliverySlot: slot,
// //           isCreditOrder: Boolean(isCredit && canOrderOnCredit),
// //           latitude: gpsLocation.latitude,
// //           longitude: gpsLocation.longitude,
// //           items: payload,
// //         },
// //       });

// //       const orderData = res?.order || res;
// //       const orderId = orderData?.id || `${Math.floor(1000 + Math.random() * 9000)}`;
// //       const orderNumber = String(orderId).slice(-4).toUpperCase();

// //       const slotTimeText =
// //         slot === 'BATCH_6AM'
// //           ? 'ጠዋት 6:00 ሰዓት'
// //           : 'ቀትር 12:00 ሰዓት';

// //       await AsyncStorage.removeItem(`user_cart_${currentUserId}`);
// //       setCart({});

// //       if (isCredit && canOrderOnCredit) {
// //         router.replace('/(tabs)/ledger');
// //       } else {
// //         router.replace({
// //           pathname: '/confirmation',
// //           params: {
// //             orderNumber,
// //             deliveryTime: slotTimeText,
// //             orderLang: lang || 'am',
// //           },
// //         });
// //       }
// //     } catch (err) {
// //       setAlertConfig({
// //         visible: true,
// //         title: 'ስህተት',
// //         message: err.message || 'ትእዛዝ ማስተላለፍ አልተቻለም',
// //         type: 'error',
// //       });
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   if (loadingCart) {
// //     return (
// //       <SafeAreaView style={styles.safe}>
// //         <View style={styles.center}>
// //           <View style={styles.loaderCard}>
// //             <ActivityIndicator size="large" color="#0F7B4A" />
// //           </View>
// //         </View>
// //       </SafeAreaView>
// //     );
// //   }

// //   // Draft card: rendered INSIDE the scroll area so every button stays reachable
// //   const draftSection =
// //     draftEntries.length > 0 ? (
// //       <View style={styles.draftCardMaster}>
// //         <View style={styles.draftToggleHeader}>
// //           <TouchableOpacity
// //             style={styles.draftLeftTitle}
// //             activeOpacity={0.8}
// //             onPress={() => setDraftExpanded(!draftExpanded)}
// //           >
// //             <View style={styles.draftIconTag}>
// //               <Text style={styles.draftIconEmoji}>📁</Text>
// //             </View>
// //             <View style={{ flex: 1 }}>
// //               <Text style={styles.draftHeadText}>የተቀመጡ ረቂቆች ({draftEntries.length} እቃዎች)</Text>
// //               <Text style={styles.draftSubText}>ጠቅላላ ዋጋ: {draftTotalPrice.toLocaleString()} ብር</Text>
// //             </View>
// //           </TouchableOpacity>

// //           <TouchableOpacity
// //             style={styles.draftToggleArrow}
// //             activeOpacity={0.8}
// //             onPress={() => setDraftExpanded(!draftExpanded)}
// //             hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
// //           >
// //             <Text style={styles.draftArrowSymbol}>{draftExpanded ? '▲ ዝጋ' : '▼ ክፈት'}</Text>
// //           </TouchableOpacity>
// //         </View>

// //         {draftExpanded && (
// //           <View style={styles.draftExpandedBody}>
// //             <View style={styles.draftItemsDivider} />

// //             <View style={styles.draftSelectAllRow}>
// //               <TouchableOpacity
// //                 onPress={handleToggleAllDrafts}
// //                 style={styles.selectAllBtn}
// //                 activeOpacity={0.7}
// //                 hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
// //               >
// //                 <Text style={styles.selectAllBtnText}>
// //                   {selectedDraftCount === draftEntries.length ? 'ምርጫ ሰርዝ ✕' : 'ሁሉንም ምረጥ ✓'}
// //                 </Text>
// //               </TouchableOpacity>
// //               <Text style={styles.draftCountSelectedText}>
// //                 የተመረጡ: {selectedDraftCount}/{draftEntries.length}
// //               </Text>
// //             </View>

// //             {draftEntries.map(([dKey, dItem]) => {
// //               const isSelected = Boolean(selectedDraftKeys[dKey]);

// //               return (
// //                 <TouchableOpacity
// //                   key={dKey}
// //                   style={[styles.draftRowSingle, isSelected && styles.draftRowSelected]}
// //                   activeOpacity={0.7}
// //                   onPress={() => toggleDraftItemSelection(dKey)}
// //                   accessibilityRole="checkbox"
// //                   accessibilityState={{ checked: isSelected }}
// //                 >
// //                   <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
// //                     <View
// //                       pointerEvents="none"
// //                       style={[styles.draftCheckbox, isSelected && styles.draftCheckboxActive]}
// //                     >
// //                       {isSelected && <Text style={styles.draftCheckmark}>✓</Text>}
// //                     </View>

// //                     <View pointerEvents="none" style={styles.draftItemDetails}>
// //                       <Text style={styles.draftItemName} numberOfLines={1}>{dItem.name}</Text>
// //                       <Text style={styles.draftItemSpec}>
// //                         {dItem.quantity} {dItem.unit} · {(Number(dItem.price) * Number(dItem.quantity)).toLocaleString()} ብር
// //                       </Text>
// //                     </View>
// //                   </View>
// //                 </TouchableOpacity>
// //               );
// //             })}

// //             <View style={styles.draftControlButtons}>
// //               <TouchableOpacity
// //                 style={[styles.draftDiscardBtn, selectedDraftCount === 0 && { opacity: 0.5 }]}
// //                 onPress={handleDeleteSelectedDrafts}
// //                 activeOpacity={0.75}
// //                 disabled={selectedDraftCount === 0}
// //               >
// //                 <Text style={styles.draftDiscardBtnText}>የተመረጡትን ሰርዝ 🗑️</Text>
// //               </TouchableOpacity>

// //               <TouchableOpacity
// //                 style={[styles.draftApplyBtn, selectedDraftCount === 0 && { opacity: 0.5 }]}
// //                 onPress={handleMoveSelectedToActiveOrder}
// //                 activeOpacity={0.8}
// //                 disabled={selectedDraftCount === 0}
// //               >
// //                 <Text style={styles.draftApplyBtnText}>
// //                   ወደ ትእዛዝ ላክ ({selectedDraftCount}) ›
// //                 </Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         )}
// //       </View>
// //     ) : null;

// //   return (
// //     <SafeAreaView style={styles.safe}>
// //       <View pointerEvents="none" style={styles.glowOrbA} />
// //       <View pointerEvents="none" style={styles.glowOrbB} />

// //       <View style={[styles.container, dyn.container]}>
// //         <View style={[styles.contentWrap, dyn.contentWrap]}>
// //           <View style={styles.headerRow}>
// //             <TouchableOpacity
// //               style={[styles.backLink, dyn.backChip]}
// //               onPress={handleSafeBack}
// //               activeOpacity={0.7}
// //               hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
// //             >
// //               <Text style={[styles.backText, dyn.backText]}>‹ ተመለስ</Text>
// //             </TouchableOpacity>
// //           </View>

// //           <Text style={[styles.pageTitle, dyn.pageTitle]}>ትእዛዙን ላክ</Text>

// //           {cartEntries.length === 0 ? (
// //             <ScrollView
// //               style={styles.scroll}
// //               contentContainerStyle={styles.emptyScrollContent}
// //               showsVerticalScrollIndicator={false}
// //               keyboardShouldPersistTaps="handled"
// //             >
// //               {draftSection}

// //               <View style={styles.emptyContainer}>
// //                 <View style={[styles.emptyIconWrap, dyn.emptyIconWrap]}>
// //                   <Text style={[styles.emptyIcon, dyn.emptyIcon]}>🛒</Text>
// //                 </View>

// //                 <Text style={[styles.emptyTitle, dyn.emptyTitle]}>
// //                   {draftEntries.length > 0
// //                     ? 'እቃዎች በረቂቅ ውስጥ ተቀምጠዋል። ወደ ትእዛዝ ለማዛወር ከላይ ያለውን ረቂቅ ይክፈቱ።'
// //                     : 'ቅርጫትዎ ውስጥ ምንም እቃ የለም'}
// //                 </Text>

// //                 <TouchableOpacity
// //                   style={[styles.goShopBtn, dyn.goShopBtn]}
// //                   onPress={() => router.replace('/(tabs)')}
// //                   activeOpacity={0.8}
// //                 >
// //                   <View pointerEvents="none" style={styles.btnShine} />
// //                   <Text style={[styles.goShopBtnText, dyn.goShopBtnText]}>
// //                     ወደ ገበያ ተመለስ
// //                   </Text>
// //                 </TouchableOpacity>
// //               </View>
// //             </ScrollView>
// //           ) : (
// //             <ScrollView
// //               style={styles.scroll}
// //               contentContainerStyle={[styles.scrollContent, dyn.scrollContent]}
// //               showsVerticalScrollIndicator={false}
// //               keyboardShouldPersistTaps="handled"
// //             >
// //               {draftSection}

// //               {cartEntries.map(([key, item]) => {
// //                 const isImageFile =
// //                   item.imageUrl &&
// //                   (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/'));

// //                 return (
// //                   <View style={[styles.itemCard, dyn.itemCard]} key={key}>
// //                     <View pointerEvents="none" style={styles.itemAccent} />

// //                     <View style={styles.itemLeft}>
// //                       <View style={[styles.itemEmojiBox, dyn.itemEmojiBox]}>
// //                         {isImageFile ? (
// //                           <Image
// //                             source={{ uri: item.imageUrl }}
// //                             style={styles.itemImage}
// //                             resizeMode="cover"
// //                           />
// //                         ) : (
// //                           <Text style={[styles.itemEmoji, dyn.itemEmoji]}>
// //                             {item.imageUrl || '📦'}
// //                           </Text>
// //                         )}
// //                       </View>

// //                       <View style={styles.itemTextWrap}>
// //                         <Text style={[styles.itemName, dyn.itemName]} numberOfLines={1}>
// //                           {item.name}
// //                         </Text>

// //                         <Text style={[styles.itemUnitSub, dyn.itemUnitSub]} numberOfLines={1}>
// //                           {item.unit} · {(Number(item.price) || 0).toLocaleString()} ብር
// //                         </Text>
// //                       </View>
// //                     </View>

// //                     <View style={styles.actionGroupRight}>
// //                       <View style={[styles.stepperContainer, dyn.stepperContainer]}>
// //                         <TouchableOpacity
// //                           style={[styles.stepBtn, dyn.stepBtn]}
// //                           onPress={() => updateQuantity(key, -1)}
// //                           activeOpacity={0.6}
// //                         >
// //                           <Text style={[styles.stepBtnText, dyn.stepBtnText]}>−</Text>
// //                         </TouchableOpacity>

// //                         <View pointerEvents="none" style={[styles.stepQtyBox, dyn.stepQtyBox]}>
// //                           <Text style={[styles.stepQtyText, dyn.stepQtyText]}>
// //                             {item.quantity}
// //                           </Text>
// //                         </View>

// //                         <TouchableOpacity
// //                           style={[styles.stepBtnPlus, dyn.stepBtn]}
// //                           onPress={() => updateQuantity(key, 1)}
// //                           activeOpacity={0.6}
// //                         >
// //                           <Text style={[styles.stepBtnTextPlus, dyn.stepBtnText]}>+</Text>
// //                         </TouchableOpacity>
// //                       </View>

// //                       <TouchableOpacity
// //                         style={styles.deleteItemBtn}
// //                         onPress={() => removeItem(key)}
// //                         activeOpacity={0.75}
// //                         hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
// //                       >
// //                         <Text style={styles.deleteItemText}>✕</Text>
// //                       </TouchableOpacity>
// //                     </View>
// //                   </View>
// //                 );
// //               })}

// //               <View style={[styles.sectionHeaderRow, styles.sectionHeaderRowSpaced]}>
// //                 <View style={styles.sectionAccent} />
// //                 <Text style={[styles.sectionHeader, dyn.sectionHeader]}>
// //                   የመላኪያ ሰዓት ይምረጡ
// //                 </Text>
// //               </View>

// //               <View style={[styles.slotRow, dyn.slotRow]}>
// //                 <TouchableOpacity
// //                   style={[
// //                     styles.slotPill,
// //                     dyn.slotPill,
// //                     slot === 'BATCH_12PM' && styles.slotPillActive,
// //                   ]}
// //                   onPress={() => setSlot('BATCH_12PM')}
// //                   activeOpacity={0.8}
// //                 >
// //                   <Text
// //                     style={[
// //                       styles.slotPillText,
// //                       dyn.slotPillText,
// //                       slot === 'BATCH_12PM' && styles.slotPillTextActive,
// //                     ]}
// //                     numberOfLines={1}
// //                   >
// //                     🌅 6:00 ሰዓት (ቀትር)
// //                   </Text>
// //                 </TouchableOpacity>

// //                 <TouchableOpacity
// //                   style={[
// //                     styles.slotPill,
// //                     dyn.slotPill,
// //                     slot === 'BATCH_6AM' && styles.slotPillActive,
// //                   ]}
// //                   onPress={() => setSlot('BATCH_6AM')}
// //                   activeOpacity={0.8}
// //                 >
// //                   <Text
// //                     style={[
// //                       styles.slotPillText,
// //                       dyn.slotPillText,
// //                       slot === 'BATCH_6AM' && styles.slotPillTextActive,
// //                     ]}
// //                     numberOfLines={1}
// //                   >
// //                     ☀️ 12:00 ሰዓት (ተዋት)
// //                   </Text>
// //                 </TouchableOpacity>
// //               </View>

// //               {canOrderOnCredit && (
// //                 <>
// //                   <View style={[styles.sectionHeaderRow, styles.sectionHeaderRowSpaced]}>
// //                     <View style={styles.sectionAccent} />
// //                     <Text style={[styles.sectionHeader, dyn.sectionHeader]}>
// //                       የክፍያ አማራጭ
// //                     </Text>
// //                   </View>

// //                   <TouchableOpacity
// //                     style={[
// //                       styles.creditOptionBox,
// //                       dyn.creditOptionBox,
// //                       isCredit && styles.creditOptionBoxActive,
// //                     ]}
// //                     onPress={() => setIsCredit(!isCredit)}
// //                     activeOpacity={0.85}
// //                   >
// //                     <View
// //                       pointerEvents="none"
// //                       style={[
// //                         styles.checkbox,
// //                         dyn.checkbox,
// //                         isCredit && styles.checkboxActive,
// //                       ]}
// //                     >
// //                       {isCredit && <Text style={[styles.checkMark, dyn.checkMark]}>✓</Text>}
// //                     </View>

// //                     <View pointerEvents="none" style={styles.creditTextWrap}>
// //                       <Text style={[styles.creditTitle, dyn.creditTitle]}>
// //                         በብድር ይሁን (Request on Credit)
// //                       </Text>
// //                       <Text style={[styles.creditSubtitle, dyn.creditSubtitle]}>
// //                         ይህ ትእዛዝ በቀጥታ ወደ ሂሳብ መዝገብ ይላካል፤ ከአስተዳዳሪው ፈቃድ እስኪሰጥ ድረስ ይጠብቃል።
// //                       </Text>
// //                     </View>

// //                     {isCredit && <View pointerEvents="none" style={styles.creditGlow} />}
// //                   </TouchableOpacity>
// //                 </>
// //               )}

// //               <View style={styles.scrollTailSpacer} />
// //             </ScrollView>
// //           )}
// //         </View>

// //         {cartEntries.length > 0 && (
// //           <View style={[styles.footer, dyn.footer]}>
// //             <View pointerEvents="none" style={styles.footerTopLine} />

// //             <View style={[styles.footerInner, dyn.contentWrap]}>
// //               <View style={[styles.totalRow, dyn.totalRow]}>
// //                 <View style={styles.totalLabelWrap}>
// //                   <Text style={[styles.totalLabel, dyn.totalLabel]}>
// //                     ጠቅላላ ክፍያ ድምር
// //                   </Text>
// //                 </View>

// //                 <Text style={[styles.totalDigits, dyn.totalDigits]} numberOfLines={1}>
// //                   {totalPrice.toLocaleString()} ብር
// //                 </Text>
// //               </View>

// //               <TouchableOpacity
// //                 style={[
// //                   styles.submitOrderBtn,
// //                   dyn.submitOrderBtn,
// //                   isCredit && canOrderOnCredit && styles.submitOrderBtnCredit,
// //                   submitting && styles.submitOrderBtnBusy,
// //                 ]}
// //                 onPress={handleSubmitOrder}
// //                 activeOpacity={0.85}
// //                 disabled={submitting}
// //               >
// //                 <View pointerEvents="none" style={styles.btnShine} />

// //                 {submitting ? (
// //                   <ActivityIndicator size="small" color="#FFFFFF" />
// //                 ) : (
// //                   <Text
// //                     style={[styles.submitOrderBtnText, dyn.submitOrderBtnText]}
// //                     numberOfLines={1}
// //                   >
// //                     {isCredit && canOrderOnCredit
// //                       ? `የብድር ጥያቄ ላክ (${totalPrice.toLocaleString()} ብር)`
// //                       : `ትእዛዙን ላክ (${totalPrice.toLocaleString()} ብር)`}
// //                   </Text>
// //                 )}
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         )}
// //       </View>

// //       {offlinePromptVisible && (
// //         <View style={styles.modalOverlay}>
// //           <View style={styles.offlineModalCard}>
// //             <View style={styles.offlineIconBox}>
// //               <Text style={styles.offlineModalEmoji}>📡</Text>
// //             </View>

// //             <Text style={styles.offlineModalTitle}>የኢንተርኔት ግንኙነት አልተገኘም</Text>
// //             <Text style={styles.offlineModalMessage}>
// //               ስልክዎ ከኢንተርኔት ውጭ ነው። ትእዛዝዎን ለማጠናቀቅ ከታች ካሉት አማራጮች አንዱን ይምረጡ፡
// //             </Text>

// //             <View style={styles.offlineActionRow}>
// //               <TouchableOpacity
// //                 style={styles.mobileDataBtn}
// //                 onPress={handleOpenMobileDataSettings}
// //                 activeOpacity={0.85}
// //               >
// //                 <Text style={styles.mobileDataBtnText}>📶 ዳታ ክፈት (Mobile Data)</Text>
// //               </TouchableOpacity>

// //               <TouchableOpacity
// //                 style={styles.smsDirectBtn}
// //                 onPress={() => openSmsApplicationWithPayload(pendingSmsPayload)}
// //                 activeOpacity={0.85}
// //               >
// //                 <Text style={styles.smsDirectBtnText}>✉️ በ SMS ላክ</Text>
// //               </TouchableOpacity>
// //             </View>

// //             <TouchableOpacity
// //               style={styles.cancelOfflineBtn}
// //               onPress={() => setOfflinePromptVisible(false)}
// //               hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
// //             >
// //               <Text style={styles.cancelOfflineBtnText}>ተመለስ</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       )}

// //       <CustomAlert
// //         visible={alertConfig.visible}
// //         title={alertConfig.title}
// //         message={alertConfig.message}
// //         type={alertConfig.type}
// //         onClose={() =>
// //           setAlertConfig((prev) => ({
// //             ...prev,
// //             visible: false,
// //           }))
// //         }
// //       />
// //     </SafeAreaView>
// //   );
// // }

// // const GREEN = '#0F7B4A';
// // const INK = '#12241A';
// // const MUTED = '#62726A';
// // const LINE = '#E6ECE7';
// // const SOFT = '#E4F2EA';

// // const CARD_SHADOW = {
// //   shadowColor: '#0B2A1B',
// //   shadowOffset: { width: 0, height: 4 },
// //   shadowOpacity: 0.06,
// //   shadowRadius: 10,
// //   elevation: 2,
// // };

// // const buildDynamic = (s, isTablet) =>
// //   StyleSheet.create({
// //     container: {
// //       paddingHorizontal: isTablet ? 26 : 13 * s,
// //       paddingTop: 10 * s,
// //     },
// //     contentWrap: {
// //       width: '100%',
// //       maxWidth: isTablet ? 620 : '100%',
// //       alignSelf: 'center',
// //     },
// //     scrollContent: {
// //       paddingTop: 2,
// //       paddingBottom: 25,
// //     },
// //     backChip: {
// //       paddingHorizontal: 11 * s,
// //       paddingVertical: 7 * s,
// //       borderRadius: 11 * s,
// //     },
// //     backText: { fontSize: 12.5 * s },
// //     pageTitle: {
// //       fontSize: 21 * s,
// //       marginTop: 11 * s,
// //       marginBottom: 6 * s,
// //     },
// //     emptyIconWrap: {
// //       width: 62 * s,
// //       height: 62 * s,
// //       borderRadius: 22 * s,
// //       marginBottom: 14 * s,
// //     },
// //     emptyIcon: { fontSize: 28 * s },
// //     emptyTitle: { fontSize: 15 * s, marginBottom: 18 * s },
// //     goShopBtn: {
// //       paddingHorizontal: 24 * s,
// //       paddingVertical: 12 * s,
// //       borderRadius: 13 * s,
// //     },
// //     goShopBtnText: { fontSize: 13.5 * s },
// //     sectionHeader: { fontSize: 13 * s },
// //     itemCard: {
// //       borderRadius: 16 * s,
// //       padding: 11 * s,
// //       paddingLeft: 13 * s,
// //       marginBottom: 9 * s,
// //     },
// //     itemEmojiBox: {
// //       width: 44 * s,
// //       height: 44 * s,
// //       borderRadius: 13 * s,
// //       marginRight: 10 * s,
// //     },
// //     itemEmoji: { fontSize: 21 * s },
// //     itemName: { fontSize: 13.5 * s },
// //     itemUnitSub: { fontSize: 11.5 * s, marginTop: 3 * s },
// //     stepperContainer: { borderRadius: 11 * s },
// //     // Larger touch targets for + and −
// //     stepBtn: { width: 36 * s, height: 36 * s },
// //     stepBtnText: { fontSize: 17 * s },
// //     stepQtyBox: { minWidth: 28 * s },
// //     stepQtyText: { fontSize: 13 * s },
// //     slotRow: { gap: 9 * s, marginBottom: 4 },
// //     slotPill: {
// //       paddingVertical: 12 * s,
// //       borderRadius: 13 * s,
// //     },
// //     slotPillText: { fontSize: 12.5 * s },
// //     creditOptionBox: {
// //       borderRadius: 15 * s,
// //       padding: 13 * s,
// //     },
// //     checkbox: {
// //       width: 23 * s,
// //       height: 23 * s,
// //       borderRadius: 7 * s,
// //       marginRight: 11 * s,
// //     },
// //     checkMark: { fontSize: 14 * s, lineHeight: 17 * s },
// //     creditTitle: { fontSize: 13.5 * s },
// //     creditSubtitle: { fontSize: 11 * s, lineHeight: 15.5 * s, marginTop: 3 * s },
// //     footer: {
// //       paddingTop: 11 * s,
// //       paddingBottom: Platform.OS === 'ios' ? 12 * s : 13 * s,
// //       paddingHorizontal: isTablet ? 26 : 13 * s,
// //     },
// //     totalRow: {
// //       borderRadius: 15 * s,
// //       paddingVertical: 11 * s,
// //       paddingHorizontal: 13 * s,
// //       marginBottom: 10 * s,
// //     },
// //     totalLabel: { fontSize: 13 * s },
// //     totalDigits: { fontSize: 19 * s },
// //     submitOrderBtn: {
// //       height: 52 * s,
// //       borderRadius: 15 * s,
// //     },
// //     submitOrderBtnText: { fontSize: 14.5 * s },
// //   });

// // const styles = StyleSheet.create({
// //   safe: {
// //     flex: 1,
// //     backgroundColor: '#F5F7F3',
// //   },
// //   center: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   loaderCard: {
// //     width: 68,
// //     height: 68,
// //     borderRadius: 22,
// //     backgroundColor: '#FFFFFF',
// //     borderWidth: 1,
// //     borderColor: LINE,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     ...CARD_SHADOW,
// //   },
// //   glowOrbA: {
// //     position: 'absolute',
// //     top: -80,
// //     right: -60,
// //     width: 230,
// //     height: 230,
// //     borderRadius: 115,
// //     backgroundColor: 'rgba(15, 123, 74, 0.10)',
// //   },
// //   glowOrbB: {
// //     position: 'absolute',
// //     bottom: -90,
// //     left: -70,
// //     width: 240,
// //     height: 240,
// //     borderRadius: 120,
// //     backgroundColor: 'rgba(242, 183, 5, 0.09)',
// //   },
// //   container: {
// //     flex: 1,
// //   },
// //   contentWrap: {
// //     flex: 1,
// //   },
// //   headerRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //   },
// //   backLink: {
// //     alignSelf: 'flex-start',
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#EEF6F0',
// //     borderWidth: 1,
// //     borderColor: '#DCEAE1',
// //   },
// //   backText: {
// //     color: GREEN,
// //     fontWeight: '800',
// //   },
// //   pageTitle: {
// //     fontWeight: '900',
// //     color: INK,
// //     letterSpacing: 0.2,
// //   },
// //   scroll: {
// //     flex: 1,
// //   },
// //   scrollContent: {
// //     paddingTop: 2,
// //   },
// //   emptyScrollContent: {
// //     flexGrow: 1,
// //     paddingTop: 2,
// //     paddingBottom: 25,
// //   },
// //   scrollTailSpacer: {
// //     height: 12,
// //   },
// //   draftCardMaster: {
// //     backgroundColor: '#FFFBEB',
// //     borderRadius: 16,
// //     borderWidth: 1.2,
// //     borderColor: '#FDE68A',
// //     marginBottom: 12,
// //     overflow: 'hidden',
// //     ...CARD_SHADOW,
// //   },
// //   draftToggleHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     paddingHorizontal: 13,
// //     paddingVertical: 10,
// //   },
// //   draftLeftTitle: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 9,
// //     flex: 1,
// //   },
// //   draftIconTag: {
// //     width: 32,
// //     height: 32,
// //     borderRadius: 10,
// //     backgroundColor: '#FEF3C7',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   draftIconEmoji: {
// //     fontSize: 16,
// //   },
// //   draftHeadText: {
// //     fontSize: 12.5,
// //     fontWeight: '900',
// //     color: '#92400E',
// //   },
// //   draftSubText: {
// //     fontSize: 10.5,
// //     fontWeight: '700',
// //     color: '#B45309',
// //   },
// //   draftToggleArrow: {
// //     backgroundColor: '#FEF3C7',
// //     paddingHorizontal: 9,
// //     paddingVertical: 4.5,
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     borderColor: '#FDE68A',
// //   },
// //   draftArrowSymbol: {
// //     fontSize: 10.5,
// //     fontWeight: '900',
// //     color: '#92400E',
// //   },
// //   draftExpandedBody: {
// //     paddingHorizontal: 13,
// //     paddingBottom: 11,
// //   },
// //   draftItemsDivider: {
// //     height: 1,
// //     backgroundColor: '#FDE68A',
// //     marginBottom: 8,
// //   },
// //   draftSelectAllRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 8,
// //   },
// //   selectAllBtn: {
// //     paddingVertical: 3,
// //     paddingHorizontal: 8,
// //     backgroundColor: '#FEF3C7',
// //     borderRadius: 6,
// //     borderWidth: 1,
// //     borderColor: '#FDE68A',
// //   },
// //   selectAllBtnText: {
// //     fontSize: 10.5,
// //     fontWeight: '800',
// //     color: '#92400E',
// //   },
// //   draftCountSelectedText: {
// //     fontSize: 10.5,
// //     fontWeight: '800',
// //     color: '#B45309',
// //   },
// //   draftRowSingle: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     paddingVertical: 8,
// //     paddingHorizontal: 8,
// //     borderRadius: 10,
// //     marginBottom: 4,
// //     backgroundColor: 'rgba(255, 255, 255, 0.6)',
// //     borderWidth: 1,
// //     borderColor: 'transparent',
// //   },
// //   draftRowSelected: {
// //     backgroundColor: '#FFFFFF',
// //     borderColor: '#F59E0B',
// //   },
// //   draftCheckbox: {
// //     width: 20,
// //     height: 20,
// //     borderRadius: 5,
// //     borderWidth: 1.8,
// //     borderColor: '#D97706',
// //     backgroundColor: '#FFFFFF',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginRight: 9,
// //   },
// //   draftCheckboxActive: {
// //     backgroundColor: '#D97706',
// //     borderColor: '#D97706',
// //   },
// //   draftCheckmark: {
// //     color: '#FFFFFF',
// //     fontSize: 12,
// //     fontWeight: '900',
// //     lineHeight: 14,
// //   },
// //   draftItemDetails: {
// //     flex: 1,
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //   },
// //   draftItemName: {
// //     fontSize: 11.5,
// //     fontWeight: '800',
// //     color: '#78350F',
// //     flex: 1,
// //   },
// //   draftItemSpec: {
// //     fontSize: 11,
// //     fontWeight: '800',
// //     color: '#92400E',
// //     marginLeft: 6,
// //   },
// //   draftControlButtons: {
// //     flexDirection: 'row',
// //     gap: 8,
// //     marginTop: 10,
// //   },
// //   draftDiscardBtn: {
// //     paddingHorizontal: 12,
// //     paddingVertical: 9,
// //     borderRadius: 9,
// //     backgroundColor: '#FEE2E2',
// //     borderWidth: 1,
// //     borderColor: '#FCA5A5',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   draftDiscardBtnText: {
// //     color: '#DC2626',
// //     fontSize: 11,
// //     fontWeight: '900',
// //   },
// //   draftApplyBtn: {
// //     flex: 1,
// //     paddingVertical: 9,
// //     borderRadius: 9,
// //     backgroundColor: '#D97706',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   draftApplyBtnText: {
// //     color: '#FFFFFF',
// //     fontSize: 11.5,
// //     fontWeight: '900',
// //   },
// //   emptyContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     paddingBottom: 70,
// //     paddingHorizontal: 20,
// //   },
// //   emptyIconWrap: {
// //     backgroundColor: SOFT,
// //     borderWidth: 1,
// //     borderColor: '#CFE7D9',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   emptyTitle: {
// //     fontWeight: '800',
// //     color: MUTED,
// //     textAlign: 'center',
// //     lineHeight: 21,
// //   },
// //   goShopBtn: {
// //     backgroundColor: GREEN,
// //     overflow: 'hidden',
// //     borderWidth: 1,
// //     borderColor: '#3FD08A',
// //     shadowColor: GREEN,
// //     shadowOffset: { width: 0, height: 6 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 10,
// //     elevation: 5,
// //   },
// //   goShopBtnText: {
// //     color: '#FFFFFF',
// //     fontWeight: '800',
// //   },
// //   btnShine: {
// //     position: 'absolute',
// //     top: 0,
// //     left: 0,
// //     right: 0,
// //     height: '50%',
// //     backgroundColor: 'rgba(255, 255, 255, 0.14)',
// //   },
// //   sectionHeaderRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 8,
// //     marginBottom: 9,
// //   },
// //   sectionHeaderRowSpaced: {
// //     marginTop: 16,
// //   },
// //   sectionAccent: {
// //     width: 3,
// //     height: 14,
// //     borderRadius: 2,
// //     backgroundColor: GREEN,
// //   },
// //   sectionHeader: {
// //     fontWeight: '900',
// //     color: INK,
// //     letterSpacing: 0.2,
// //     flexShrink: 1,
// //   },
// //   itemCard: {
// //     backgroundColor: '#FFFFFF',
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     borderWidth: 1,
// //     borderColor: LINE,
// //     overflow: 'hidden',
// //     gap: 8,
// //     ...CARD_SHADOW,
// //   },
// //   itemAccent: {
// //     position: 'absolute',
// //     left: 0,
// //     top: 10,
// //     bottom: 10,
// //     width: 3,
// //     borderRadius: 2,
// //     backgroundColor: 'rgba(15, 123, 74, 0.35)',
// //   },
// //   itemLeft: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     flex: 1,
// //     minWidth: 0,
// //   },
// //   itemEmojiBox: {
// //     backgroundColor: SOFT,
// //     borderWidth: 1,
// //     borderColor: '#D6EBE0',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     overflow: 'hidden',
// //   },
// //   itemImage: {
// //     width: '100%',
// //     height: '100%',
// //   },
// //   itemTextWrap: {
// //     flex: 1,
// //     minWidth: 0,
// //   },
// //   itemName: {
// //     fontWeight: '800',
// //     color: INK,
// //   },
// //   itemUnitSub: {
// //     color: MUTED,
// //     fontWeight: '600',
// //   },
// //   actionGroupRight: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 7,
// //   },
// //   stepperContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     borderWidth: 1,
// //     borderColor: '#DDE4DD',
// //     backgroundColor: '#FBFCFB',
// //     overflow: 'hidden',
// //     flexShrink: 0,
// //   },
// //   stepBtn: {
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#FFFFFF',
// //   },
// //   stepBtnPlus: {
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: SOFT,
// //   },
// //   stepBtnText: {
// //     fontWeight: '800',
// //     color: INK,
// //     marginTop: -1,
// //   },
// //   stepBtnTextPlus: {
// //     fontWeight: '900',
// //     color: GREEN,
// //     marginTop: -1,
// //   },
// //   stepQtyBox: {
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     borderLeftWidth: 1,
// //     borderRightWidth: 1,
// //     borderLeftColor: '#EDF2EE',
// //     borderRightColor: '#EDF2EE',
// //     paddingVertical: 4,
// //   },
// //   stepQtyText: {
// //     fontWeight: '900',
// //     color: INK,
// //   },
// //   deleteItemBtn: {
// //     width: 30,
// //     height: 30,
// //     borderRadius: 15,
// //     backgroundColor: '#FEE2E2',
// //     borderWidth: 1,
// //     borderColor: '#FCA5A5',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   deleteItemText: {
// //     color: '#EF4444',
// //     fontSize: 12,
// //     fontWeight: '900',
// //   },
// //   slotRow: {
// //     flexDirection: 'row',
// //     flexWrap: 'wrap',
// //   },
// //   slotPill: {
// //     flex: 1,
// //     minWidth: 130,
// //     borderWidth: 1.2,
// //     borderColor: '#DDE4DD',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#FFFFFF',
// //     paddingHorizontal: 6,
// //   },
// //   slotPillActive: {
// //     borderColor: GREEN,
// //     backgroundColor: SOFT,
// //     borderWidth: 1.6,
// //     shadowColor: GREEN,
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 8,
// //     elevation: 4,
// //   },
// //   slotPillText: {
// //     fontWeight: '800',
// //     color: MUTED,
// //     textAlign: 'center',
// //   },
// //   slotPillTextActive: {
// //     color: GREEN,
// //     fontWeight: '900',
// //   },
// //   creditOptionBox: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#FFFFFF',
// //     borderWidth: 1.2,
// //     borderColor: '#DDE4DD',
// //     overflow: 'hidden',
// //     ...CARD_SHADOW,
// //   },
// //   creditOptionBoxActive: {
// //     borderColor: GREEN,
// //     backgroundColor: '#F2FAF5',
// //     borderWidth: 1.6,
// //     shadowColor: GREEN,
// //     shadowOffset: { width: 0, height: 5 },
// //     shadowOpacity: 0.22,
// //     shadowRadius: 10,
// //     elevation: 5,
// //   },
// //   creditGlow: {
// //     position: 'absolute',
// //     top: -40,
// //     right: -30,
// //     width: 110,
// //     height: 110,
// //     borderRadius: 55,
// //     backgroundColor: 'rgba(15, 123, 74, 0.10)',
// //   },
// //   checkbox: {
// //     borderWidth: 2,
// //     borderColor: '#8DA396',
// //     backgroundColor: '#FFFFFF',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   checkboxActive: {
// //     borderColor: GREEN,
// //     backgroundColor: GREEN,
// //   },
// //   checkMark: {
// //     color: '#FFFFFF',
// //     fontWeight: '900',
// //   },
// //   creditTextWrap: {
// //     flex: 1,
// //     minWidth: 0,
// //   },
// //   creditTitle: {
// //     fontWeight: '900',
// //     color: INK,
// //   },
// //   creditSubtitle: {
// //     color: MUTED,
// //     fontWeight: '600',
// //   },
// //   footer: {
// //     backgroundColor: 'rgba(255, 255, 255, 0.96)',
// //     borderTopWidth: 1,
// //     borderTopColor: LINE,
// //     shadowColor: '#0B2A1B',
// //     shadowOffset: { width: 0, height: -4 },
// //     shadowOpacity: 0.07,
// //     shadowRadius: 12,
// //     elevation: 10,
// //   },
// //   footerTopLine: {
// //     position: 'absolute',
// //     top: 0,
// //     left: 24,
// //     right: 24,
// //     height: 1.5,
// //     backgroundColor: 'rgba(63, 208, 138, 0.45)',
// //   },
// //   footerInner: {
// //     width: '100%',
// //     alignSelf: 'center',
// //   },
// //   totalRow: {
// //     backgroundColor: '#FFFFFF',
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     borderWidth: 1,
// //     borderColor: LINE,
// //     gap: 10,
// //     ...CARD_SHADOW,
// //   },
// //   totalLabelWrap: {
// //     flexShrink: 1,
// //   },
// //   totalLabel: {
// //     fontWeight: '800',
// //     color: INK,
// //   },
// //   totalDigits: {
// //     fontWeight: '900',
// //     color: GREEN,
// //     letterSpacing: 0.2,
// //     flexShrink: 1,
// //   },
// //   submitOrderBtn: {
// //     backgroundColor: GREEN,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     overflow: 'hidden',
// //     borderWidth: 1,
// //     borderColor: '#3FD08A',
// //     paddingHorizontal: 12,
// //     shadowColor: GREEN,
// //     shadowOffset: { width: 0, height: 6 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 12,
// //     elevation: 6,
// //   },
// //   submitOrderBtnCredit: {
// //     backgroundColor: '#1B4D3E',
// //     borderColor: '#3E7A66',
// //     shadowColor: '#1B4D3E',
// //   },
// //   submitOrderBtnBusy: {
// //     opacity: 0.85,
// //   },
// //   submitOrderBtnText: {
// //     color: '#FFFFFF',
// //     fontWeight: '900',
// //     letterSpacing: 0.2,
// //     textAlign: 'center',
// //   },
// //   modalOverlay: {
// //     position: 'absolute',
// //     top: 0,
// //     left: 0,
// //     right: 0,
// //     bottom: 0,
// //     backgroundColor: 'rgba(11, 31, 20, 0.55)',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     zIndex: 99999,
// //     // Android draws by elevation first, so the overlay must be above the footer
// //     elevation: 100,
// //     paddingHorizontal: 20,
// //   },
// //   offlineModalCard: {
// //     width: '100%',
// //     maxWidth: 360,
// //     backgroundColor: '#FFFFFF',
// //     borderRadius: 24,
// //     padding: 22,
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 8 },
// //     shadowOpacity: 0.25,
// //     shadowRadius: 16,
// //     elevation: 12,
// //   },
// //   offlineIconBox: {
// //     width: 60,
// //     height: 60,
// //     borderRadius: 30,
// //     backgroundColor: '#FEF3C7',
// //     borderWidth: 1,
// //     borderColor: '#FDE68A',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginBottom: 12,
// //   },
// //   offlineModalEmoji: {
// //     fontSize: 28,
// //   },
// //   offlineModalTitle: {
// //     fontSize: 16,
// //     fontWeight: '900',
// //     color: '#12241A',
// //     textAlign: 'center',
// //     marginBottom: 6,
// //   },
// //   offlineModalMessage: {
// //     fontSize: 12.5,
// //     fontWeight: '600',
// //     color: '#62726A',
// //     textAlign: 'center',
// //     lineHeight: 18,
// //     marginBottom: 18,
// //   },
// //   offlineActionRow: {
// //     width: '100%',
// //     gap: 9,
// //   },
// //   mobileDataBtn: {
// //     backgroundColor: GREEN,
// //     paddingVertical: 12,
// //     borderRadius: 13,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     shadowColor: GREEN,
// //     shadowOffset: { width: 0, height: 3 },
// //     shadowOpacity: 0.25,
// //     shadowRadius: 6,
// //     elevation: 3,
// //   },
// //   mobileDataBtnText: {
// //     color: '#FFFFFF',
// //     fontSize: 13,
// //     fontWeight: '900',
// //   },
// //   smsDirectBtn: {
// //     backgroundColor: '#F59E0B',
// //     paddingVertical: 12,
// //     borderRadius: 13,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   smsDirectBtnText: {
// //     color: '#FFFFFF',
// //     fontSize: 13,
// //     fontWeight: '900',
// //   },
// //   cancelOfflineBtn: {
// //     marginTop: 12,
// //     paddingVertical: 6,
// //     paddingHorizontal: 16,
// //   },
// //   cancelOfflineBtnText: {
// //     color: '#94A3B8',
// //     fontSize: 12,
// //     fontWeight: '700',
// //   },
// // });
// import React, { useCallback, useMemo, useState, useEffect } from 'react';
// import {
//   ActivityIndicator,
//   Image,
//   Linking,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   useWindowDimensions,
// } from 'react-native';
// import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Location from 'expo-location';
// import { apiRequest } from '../lib/api';
// import { useSession } from '../context/SessionContext';
// import CustomAlert from '../components/CustomAlert';

// const ADMIN_DESTINATION_PHONE = '0968821059';

// // Exact Warehouse coordinates for Mebrat Hail Arada in Adama
// const WAREHOUSE_LAT = 8.5414; 
// const WAREHOUSE_LNG = 39.2705; 

// function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
//   const R = 6371; // Radius of the earth in km
//   const dLat = deg2rad(lat2 - lat1);
//   const dLon = deg2rad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
//     Math.sin(dLon / 2) * Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// }

// function deg2rad(deg) {
//   return deg * (Math.PI / 180);
// }

// const UNIT_MAP = {
//   'ካርቶን': 'CARTON',
//   'ግማሽ': 'HALF_CARTON',
//   'ግማሽ ካርቶን': 'HALF_CARTON',
//   'ግማሽ ደርዘን': 'HALF_DOZEN',
//   'ፓኬት': 'PACK',
//   'ደርዘን': 'DOZEN',
//   'ኪሎ': 'KG',
//   'ኩንታል': 'QUINTAL',
//   'ቁራጭ': 'PIECE',
//   'መረብ': 'MEREB',
//   CARTON: 'CARTON',
//   HALF_CARTON: 'HALF_CARTON',
//   HALF_DOZEN: 'HALF_DOZEN',
//   PACK: 'PACK',
//   DOZEN: 'DOZEN',
//   KG: 'KG',
//   QUINTAL: 'QUINTAL',
//   PIECE: 'PIECE',
//   MEREB: 'MEREB',
// };

// export default function CheckoutScreen() {
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   const { token, lang } = useSession();
//   const { width: SCREEN_W } = useWindowDimensions();

//   const [cart, setCart] = useState({});
//   const [drafts, setDrafts] = useState({});
//   const [selectedDraftKeys, setSelectedDraftKeys] = useState({});
//   const [draftExpanded, setDraftExpanded] = useState(false);
//   const [canOrderOnCredit, setCanOrderOnCredit] = useState(false);
//   const [currentUserId, setCurrentUserId] = useState('guest');

//   const [slot, setSlot] = useState('BATCH_12PM');
//   const [isCredit, setIsCredit] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [loadingCart, setLoadingCart] = useState(true);
// const [locatingUser, setLocatingUser] = useState(false);
//   // Distance input state (auto-calculated via GPS from Adama warehouse, editable by user)
//   const [distanceKm, setDistanceKm] = useState('2');

//   const [offlinePromptVisible, setOfflinePromptVisible] = useState(false);
//   const [pendingSmsPayload, setPendingSmsPayload] = useState('');

//   const [alertConfig, setAlertConfig] = useState({
//     visible: false,
//     title: '',
//     message: '',
//     type: 'error',
//   });

//   const isSmall = SCREEN_W < 350;
//   const isTablet = SCREEN_W >= 680;
//   const S = isSmall ? 0.9 : isTablet ? 1.12 : SCREEN_W >= 420 ? 1.06 : 1;
//   const dyn = useMemo(() => buildDynamic(S, isTablet), [S, isTablet]);

//   // const acquireAccurateGps = async () => {
//   //   try {
//   //     if (Platform.OS === 'web') {
//   //       return new Promise((resolve) => {
//   //         if (typeof navigator !== 'undefined' && navigator.geolocation) {
//   //           navigator.geolocation.getCurrentPosition(
//   //             (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
//   //             () => resolve({ latitude: null, longitude: null }),
//   //             { timeout: 5000 }
//   //           );
//   //         } else {
//   //           resolve({ latitude: null, longitude: null });
//   //         }
//   //       });
//   //     }

//   //     const { status } = await Location.requestForegroundPermissionsAsync();
//   //     if (status !== 'granted') return { latitude: null, longitude: null };

//   //     const location = await Location.getCurrentPositionAsync({
//   //       accuracy: Location.Accuracy.Balanced,
//   //     });

//   //     return {
//   //       latitude: location.coords.latitude,
//   //       longitude: location.coords.longitude,
//   //     };
//   //   } catch {
//   //     return { latitude: null, longitude: null };
//   //   }
//   // };

//   // // Auto-calculate distance from Adama warehouse using GPS on load
//   // useEffect(() => {
//   //   const initGpsDistance = async () => {
//   //     const gps = await acquireAccurateGps();
//   //     if (gps.latitude && gps.longitude) {
//   //       const dist = getDistanceFromLatLonInKm(
//   //         WAREHOUSE_LAT,
//   //         WAREHOUSE_LNG,
//   //         gps.latitude,
//   //         gps.longitude
//   //       );
//   //       if (dist > 0 && dist < 100) {
//   //         setDistanceKm(dist.toFixed(1));
//   //       }
//   //     }
//   //   };
//   //   initGpsDistance();
//   // }, []);
//   // Function triggered when user clicks "መገኛዬን 📌"
//   // const handleFetchPreciseLocation = async () => {
//   //   setLocatingUser(true);
//   //   try {
//   //     const gps = await acquireAccurateGps();
//   //     if (gps.latitude && gps.longitude) {
//   //       const exactDist = getDistanceFromLatLonInKm(
//   //         WAREHOUSE_LAT,
//   //         WAREHOUSE_LNG,
//   //         gps.latitude,
//   //         gps.longitude
//   //       );
//   //       if (exactDist > 0 && exactDist < 200) {
//   //         setDistanceKm(exactDist.toFixed(1));
//   //       } else {
//   //         setAlertConfig({
//   //           visible: true,
//   //           title: 'ርቀት ማስላት',
//   //           message: 'የእርስዎ መገኛ ከመጋዝኑ በጣም የራቀ ነው ወይም ማግኘት አልተቻለም።',
//   //           type: 'error',
//   //         });
//   //       }
//   //     } else {
//   //       setAlertConfig({
//   //         visible: true,
//   //         title: 'ጂፒኤስ ስህተት',
//   //         message: 'የስልክዎን ጂፒኤስ (GPS Location) ማግኘት አልተቻለም። እባክዎ ፈቃድ (Permission) ይስጡ።',
//   //         type: 'error',
//   //       });
//   //     }
//   //   } catch {
//   //     setAlertConfig({
//   //       visible: true,
//   //       title: 'ስህተት',
//   //       message: 'መገኛን ማግኘት አልተቻለም',
//   //       type: 'error',
//   //     });
//   //   } finally {
//   //     setLocatingUser(false);
//   //   }
//   // };
//   const handleFetchPreciseLocation = async () => {
//     setLocatingUser(true);
//     try {
//       const gps = await acquireFastGps();
      
//       if (gps.latitude && gps.longitude) {
//         const exactDist = getDistanceFromLatLonInKm(
//           WAREHOUSE_LAT,
//           WAREHOUSE_LNG,
//           gps.latitude,
//           gps.longitude
//         );

//         if (exactDist > 0) {
//           const formattedDist = exactDist.toFixed(1);
//           setDistanceKm(formattedDist);
          
//           setAlertConfig({
//             visible: true,
//             title: 'ተሳክቷል! ✅',
//             message: `የሱቅዎ ርቀት ከመጋዝኑ: ${formattedDist} ኪ.ሜ ሆኖ ተሰልቷል።`,
//             type: 'success',
//           });
//         }
//       } else {
//         // If GPS fails, check if we have shopCoords saved from profile as a backup
//         const savedCoordsJson = await AsyncStorage.getItem('shopCoords').catch(() => null);
//         if (!savedCoordsJson) {
//           setAlertConfig({
//             visible: true,
//             title: 'መገኛ ማግኘት አልተቻለም',
//             message: 'እባክዎ መጀመሪያ መገኛዎን በፕሮፋይል ገጽ (Profile) ያስቀምጡ ወይም ርቀቱን በእጅ (Manual) ያስገቡ።',
//             type: 'error',
//           });
//         }
//       }
//     } catch (err) {
//       setAlertConfig({
//         visible: true,
//         title: 'ስህተት',
//         message: 'ርቀት በሚሰላበት ጊዜ ችግር ተፈጥሯል',
//         type: 'error',
//       });
//     } finally {
//       setLocatingUser(false);
//     }
//   };
// // const acquireFastGps = async () => {
// //     try {
// //       if (Platform.OS === 'web') {
// //         return new Promise((resolve) => {
// //           if (typeof navigator !== 'undefined' && navigator.geolocation) {
// //             navigator.geolocation.getCurrentPosition(
// //               (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
// //               () => resolve({ latitude: null, longitude: null }),
// //               { timeout: 3000, maximumAge: 10000 }
// //             );
// //           } else {
// //             resolve({ latitude: null, longitude: null });
// //           }
// //         });
// //       }

// //       const { status } = await Location.requestForegroundPermissionsAsync();
// //       if (status !== 'granted') return { latitude: null, longitude: null };

// //       // Fast location fetch with a strict 2.5 second timeout race
// //       const locationPromise = Location.getCurrentPositionAsync({
// //         accuracy: Location.Accuracy.Balanced,
// //       });

// //       const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2500));

// //       const location = await Promise.race([locationPromise, timeoutPromise]);

// //       if (location && location.coords) {
// //         return {
// //           latitude: location.coords.latitude,
// //           longitude: location.coords.longitude,
// //         };
// //       }
// //       return { latitude: null, longitude: null };
// //     } catch {
// //       return { latitude: null, longitude: null };
// //     }
// //   };
// const acquireFastGps = async () => {
//     try {
//       // 1. Instantly check AsyncStorage where your profile saves the shop coordinates
//       const savedCoordsJson = await AsyncStorage.getItem('shopCoords').catch(() => null);
//       if (savedCoordsJson) {
//         const parsed = JSON.parse(savedCoordsJson);
//         if (parsed?.lat && parsed?.lng) {
//           return {
//             latitude: parsed.lat,
//             longitude: parsed.lng,
//           };
//         }
//       }

//       // 2. Fallback check for Web environment
//       if (Platform.OS === 'web') {
//         return new Promise((resolve) => {
//           if (typeof navigator !== 'undefined' && navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//               (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
//               () => resolve({ latitude: null, longitude: null }),
//               { timeout: 5000, maximumAge: 10000 }
//             );
//           } else {
//             resolve({ latitude: null, longitude: null });
//           }
//         });
//       }

//       // 3. Safe fallback with generous timeout for Expo Go mobile testing
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') return { latitude: null, longitude: null };

//       const locationPromise = Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Balanced,
//       });

//       // Increased timeout to 5 seconds to prevent premature failure in Expo Go
//       const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 5000));

//       const location = await Promise.race([locationPromise, timeoutPromise]);

//       if (location && location.coords) {
//         return {
//           latitude: location.coords.latitude,
//           longitude: location.coords.longitude,
//         };
//       }
//       return { latitude: null, longitude: null };
//     } catch (e) {
//       console.log('GPS Fetch Exception:', e);
//       return { latitude: null, longitude: null };
//     }
//   };
//   // Instant distance estimation on load
//   useEffect(() => {
//     const initFastDistanceEstimation = async () => {
//       const gps = await acquireFastGps();
//       if (gps.latitude && gps.longitude) {
//         const dist = getDistanceFromLatLonInKm(
//           WAREHOUSE_LAT,
//           WAREHOUSE_LNG,
//           gps.latitude,
//           gps.longitude
//         );
//         if (dist > 0 && dist < 100) {
//           setDistanceKm(dist.toFixed(1));
//         }
//       }
//     };
//     initFastDistanceEstimation();
//   }, []);
//   const loadUserDataAndStorage = async () => {
//     try {
//       let resolvedUserId = 'guest';

//       if (token) {
//         const res = await apiRequest('/auth/me', { token }).catch(() => null);
//         const userData = res?.user || res?.data;
//         if (userData) {
//           resolvedUserId = String(userData.id || userData._id || 'guest');
//           const eligible = Boolean(userData.canOrderOnCredit);
//           setCanOrderOnCredit(eligible);
//           await AsyncStorage.setItem('user_credit_eligible', eligible ? '1' : '0');
//         }
//       }

//       if (resolvedUserId === 'guest') {
//         const storedUser = await AsyncStorage.getItem('user_data').catch(() => null);
//         if (storedUser) {
//           const parsed = JSON.parse(storedUser);
//           resolvedUserId = String(parsed?.id || parsed?._id || 'guest');
//           setCanOrderOnCredit(Boolean(parsed?.canOrderOnCredit));
//         }
//       }

//       setCurrentUserId(resolvedUserId);

//       const scopedCartKey = `user_cart_${resolvedUserId}`;
//       const scopedDraftKey = `user_draft_cart_${resolvedUserId}`;

//       let parsedCart = {};
//       let parsedDrafts = {};

//       const storedDraftsJson = await AsyncStorage.getItem(scopedDraftKey).catch(() => null);
//       parsedDrafts = storedDraftsJson ? JSON.parse(storedDraftsJson) : {};

//       if (params?.cartData) {
//         try {
//           const incomingData = JSON.parse(params.cartData);
//           if (params?.isDraft === 'true') {
//             Object.entries(incomingData).forEach(([k, item]) => {
//               parsedDrafts[k] = { ...item };
//             });
//             await AsyncStorage.setItem(scopedDraftKey, JSON.stringify(parsedDrafts));
//             await AsyncStorage.setItem('user_draft_cart', JSON.stringify(parsedDrafts));
//           } else {
//             parsedCart = incomingData;
//             await AsyncStorage.setItem(scopedCartKey, JSON.stringify(parsedCart));
//             await AsyncStorage.setItem('user_cart', JSON.stringify(parsedCart));
//           }
//         } catch {}
//       }

//       if (Object.keys(parsedCart).length === 0) {
//         const storedCart = await AsyncStorage.getItem(scopedCartKey).catch(() => null);
//         if (storedCart) {
//           parsedCart = JSON.parse(storedCart);
//         }
//       }

//       setCart(parsedCart);
//       setDrafts(parsedDrafts);

//       setDraftExpanded((prev) => (params?.isDraft === 'true' || Object.keys(parsedCart).length === 0 ? true : prev));
//     } catch {
//       setCart({});
//       setDrafts({});
//     } finally {
//       setLoadingCart(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadUserDataAndStorage();
//     }, [token])
//   );

//   const updateQuantity = useCallback(async (key, delta) => {
//     setCart((prevCart) => {
//       const updated = { ...prevCart };
//       if (!updated[key]) return prevCart;

//       const nextQty = (updated[key].quantity || 0) + delta;

//       if (nextQty <= 0) {
//         delete updated[key];
//       } else {
//         updated[key] = {
//           ...updated[key],
//           quantity: nextQty,
//         };
//       }

//       AsyncStorage.setItem(`user_cart_${currentUserId}`, JSON.stringify(updated)).catch(() => {});
//       return updated;
//     });
//   }, [currentUserId]);

//   const removeItem = useCallback(async (key) => {
//     setCart((prevCart) => {
//       const updated = { ...prevCart };
//       delete updated[key];
//       AsyncStorage.setItem(`user_cart_${currentUserId}`, JSON.stringify(updated)).catch(() => {});
//       return updated;
//     });
//   }, [currentUserId]);

//   const toggleDraftItemSelection = useCallback((key) => {
//     setSelectedDraftKeys((prev) => ({ ...prev, [key]: !prev[key] }));
//   }, []);

//   const handleToggleAllDrafts = useCallback(() => {
//     setSelectedDraftKeys((prev) => {
//       const allSelected = Object.keys(drafts).every((k) => prev[k]);
//       const nextState = {};
//       Object.keys(drafts).forEach((k) => {
//         nextState[k] = !allSelected;
//       });
//       return nextState;
//     });
//   }, [drafts]);

//   const selectedDraftCount = useMemo(() => {
//     return Object.keys(drafts).filter((k) => selectedDraftKeys[k]).length;
//   }, [drafts, selectedDraftKeys]);

//   const handleMoveSelectedToActiveOrder = useCallback(async () => {
//     const keysToMove = Object.keys(drafts).filter((k) => selectedDraftKeys[k]);

//     if (keysToMove.length === 0) {
//       setAlertConfig({
//         visible: true,
//         title: 'እቃ አልተመረጠም',
//         message: 'እባክዎ ወደ ትእዛዝ ዝርዝር የሚዛወሩትን እቃዎች በሳጥኑ (checkbox) ላይ ይምረጡ',
//         type: 'error',
//       });
//       return;
//     }

//     const mergedCart = { ...cart };
//     const remainingDrafts = { ...drafts };

//     keysToMove.forEach((k) => {
//       const draftItem = drafts[k];
//       if (mergedCart[k]) {
//         mergedCart[k] = {
//           ...mergedCart[k],
//           quantity: (mergedCart[k].quantity || 0) + (draftItem.quantity || 1),
//         };
//       } else {
//         mergedCart[k] = { ...draftItem };
//       }
//       delete remainingDrafts[k];
//     });

//     setCart(mergedCart);
//     setDrafts(remainingDrafts);
//     setSelectedDraftKeys({});

//     AsyncStorage.setItem(`user_cart_${currentUserId}`, JSON.stringify(mergedCart)).catch(() => {});
//     AsyncStorage.setItem(`user_draft_cart_${currentUserId}`, JSON.stringify(remainingDrafts)).catch(() => {});

//     setAlertConfig({
//       visible: true,
//       title: 'እቃዎች ተዛውረዋል',
//       message: `የተመረጡት ${keysToMove.length} እቃዎች ወደ ትእዛዝ ዝርዝር ገብተዋል።`,
//       type: 'success',
//     });
//   }, [cart, drafts, selectedDraftKeys, currentUserId]);

//   const handleDeleteSelectedDrafts = useCallback(async () => {
//     const keysToDelete = Object.keys(drafts).filter((k) => selectedDraftKeys[k]);

//     if (keysToDelete.length === 0) {
//       setAlertConfig({
//         visible: true,
//         title: 'እቃ አልተመረጠም',
//         message: 'እባክዎ የሚሰረዙትን የረቂቅ እቃዎች ይምረጡ',
//         type: 'error',
//       });
//       return;
//     }

//     const remainingDrafts = { ...drafts };
//     keysToDelete.forEach((k) => {
//       delete remainingDrafts[k];
//     });

//     setDrafts(remainingDrafts);
//     setSelectedDraftKeys({});
//     await AsyncStorage.setItem(`user_draft_cart_${currentUserId}`, JSON.stringify(remainingDrafts)).catch(() => {});

//     setAlertConfig({
//       visible: true,
//       title: 'ተሰርዟል',
//       message: `${keysToDelete.length} እቃዎች ከረቂቅ ተሰርዘዋል`,
//       type: 'success',
//     });
//   }, [drafts, selectedDraftKeys, currentUserId]);

//   const handleSafeBack = () => {
//     if (router.canGoBack()) {
//       router.back();
//     } else {
//       router.replace('/(tabs)');
//     }
//   };

//   const cartEntries = Object.entries(cart);
//   const draftEntries = Object.entries(drafts);

//   const totalPrice = cartEntries.reduce(
//     (sum, [_, item]) =>
//       sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
//     0
//   );

//   // Delivery Fee Calculation: 89 Birr for first 2 km, 25 Birr per extra km
//   const numericKm = Math.max(0, parseFloat(distanceKm) || 0);
//   const deliveryFee = useMemo(() => {
//     if (numericKm <= 0) return 0;
//     if (numericKm <= 2) return 89;
//     return 89 + (Math.ceil(numericKm) - 2) * 25;
//   }, [numericKm]);

//   const finalTotalWithDelivery = totalPrice + deliveryFee;

//   const draftTotalPrice = draftEntries.reduce(
//     (sum, [_, item]) =>
//       sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
//     0
//   );

//   const generateSmsOrderText = (loc) => {
//     if (cartEntries.length === 0) return '';

//     const itemsListAmharic = cartEntries.map(([_, it], index) => {
//       const name = it.name || 'እቃ';
//       const qty = Math.max(1, Math.round(Number(it.quantity) || 1));
//       const unit = it.unit || 'ካርቶን';
//       const subTotal = ((Number(it.price) || 0) * qty).toLocaleString();
//       return `${index + 1}. ${name} ብዛት: ${qty} ${unit} (ዋጋ: ${subTotal} ብር)`;
//     }).join('\n');

//     const slotTimeText = slot === 'BATCH_6AM' ? 'ጠዋት 6:00 ሰዓት' : 'ቀትር 12:00 ሰዓት';
//     const creditStatusText = isCredit && canOrderOnCredit ? 'በብድር (Credit Order)' : 'ጥሬ ገንዘብ (Cash)';
//     const locPart = loc?.latitude ? `\nመገኛ (GPS): ${loc.latitude},${loc.longitude}` : '';

//     return `ሰላም! አዲስ የትእዛዝ ጥያቄ ከቅናሽ ገበያ መተግበሪያ:\n\nየተመረጡ እቃዎች:\n${itemsListAmharic}\n\nየእቃዎች ድምር: ${totalPrice.toLocaleString()} ብር\nየመላኪያ ርቀት: ${numericKm} ኪ.ሜ (ዋጋ: ${deliveryFee} ብር)\nጠቅላላ ድምር: ${finalTotalWithDelivery.toLocaleString()} ብር\nየመላኪያ ሰዓት: ${slotTimeText}\nየክፍያ ሁኔታ: ${creditStatusText}${locPart}`;
//   };

//   const checkIsDeviceOnline = async () => {
//     if (Platform.OS === 'web') {
//       return typeof navigator !== 'undefined' ? navigator.onLine : true;
//     }
//     try {
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 3500);
//       await fetch('https://clients3.google.com/generate_204', {
//         method: 'HEAD',
//         signal: controller.signal,
//       });
//       clearTimeout(timeoutId);
//       return true;
//     } catch {
//       return false;
//     }
//   };

//   const openSmsApplicationWithPayload = async (payload) => {
//     setOfflinePromptVisible(false);
//     const separator = Platform.OS === 'ios' ? '&' : '?';
//     const smsUrl = `sms:${ADMIN_DESTINATION_PHONE}${separator}body=${encodeURIComponent(payload)}`;

//     try {
//       const supported = await Linking.canOpenURL(smsUrl);
//       if (supported) {
//         await Linking.openURL(smsUrl);
//       } else {
//         await Linking.openURL(`sms:${ADMIN_DESTINATION_PHONE}`);
//       }
//     } catch {
//       setAlertConfig({
//         visible: true,
//         title: 'መልእክት ስህተት',
//         message: 'የ SMS መተግበሪያውን በስልኮ ላይ መክፈት አልተቻለም',
//         type: 'error',
//       });
//     }
//   };

//   const handleOpenMobileDataSettings = async () => {
//     setOfflinePromptVisible(false);
//     try {
//       if (Platform.OS === 'android') {
//         await Linking.sendIntent('android.settings.DATA_ROAMING_SETTINGS').catch(async () => {
//           await Linking.openSettings();
//         });
//       } else if (Platform.OS === 'ios') {
//         await Linking.openURL('App-Prefs:root=MOBILE_DATA_SETTINGS_ID').catch(async () => {
//           await Linking.openSettings();
//         });
//       } else {
//         await Linking.openSettings();
//       }
//     } catch {
//       await Linking.openSettings();
//     }
//   };

//   const handleSubmitOrder = async () => {
//     if (cartEntries.length === 0) {
//       setAlertConfig({
//         visible: true,
//         title: 'ቅርጫት ባዶ ነው',
//         message: 'እባክዎ መጀመሪያ እቃ ይምረጡ ወይም ከረቂቅ ወደ ትእዛዝ ያዛውሩ',
//         type: 'error',
//       });
//       return;
//     }

//     setSubmitting(true);

//     const isOnline = await checkIsDeviceOnline();

//     const gpsLocation = await Promise.race([
//       acquireAccurateGps(),
//       new Promise((resolve) =>
//         setTimeout(() => resolve({ latitude: null, longitude: null }), 7000)
//       ),
//     ]);

//     if (!isOnline) {
//       setSubmitting(false);
//       const offlineSmsString = generateSmsOrderText(gpsLocation);
//       setPendingSmsPayload(offlineSmsString);
//       setOfflinePromptVisible(true);
//       return;
//     }

//     try {
//       const payload = cartEntries.map(([_, item]) => ({
//         productId: item.productId,
//         quantity: Math.max(1, Math.round(Number(item.quantity))),
//         selectedUnit: UNIT_MAP[item.unit] || 'CARTON',
//         unitPrice: Number(item.price),
//       }));

//       const res = await apiRequest('/orders', {
//         method: 'POST',
//         token,
//         body: {
//           deliverySlot: slot,
//           isCreditOrder: Boolean(isCredit && canOrderOnCredit),
//           latitude: gpsLocation.latitude,
//           longitude: gpsLocation.longitude,
//           items: payload,
//         },
//       });

//       const orderData = res?.order || res;
//       const orderId = orderData?.id || `${Math.floor(1000 + Math.random() * 9000)}`;
//       const orderNumber = String(orderId).slice(-4).toUpperCase();

//       const slotTimeText =
//         slot === 'BATCH_6AM'
//           ? 'ጠዋት 6:00 ሰዓት'
//           : 'ቀትር 12:00 ሰዓት';

//       await AsyncStorage.removeItem(`user_cart_${currentUserId}`);
//       setCart({});

//       if (isCredit && canOrderOnCredit) {
//         router.replace('/(tabs)/ledger');
//       } else {
//         const orderItemsSummary = cartEntries.map(([_, item]) => ({
//           name: item.name || 'እቃ',
//           quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
//           unit: item.unit || 'ካርቶን',
//           price: Number(item.price) || 0,
//         }));

//         router.replace({
//           pathname: '/confirmation',
//           params: {
//             orderNumber,
//             deliveryTime: slotTimeText,
//             orderLang: lang || 'am',
//             distanceKm: String(numericKm),
//             deliveryFee: String(deliveryFee),
//             totalPrice: String(totalPrice),
//             finalTotal: String(finalTotalWithDelivery),
//             orderItemsData: JSON.stringify(orderItemsSummary),
//           },
//         });
//       }
//     } catch (err) {
//       setAlertConfig({
//         visible: true,
//         title: 'ስህተት',
//         message: err.message || 'ትእዛዝ ማስተላለፍ አልተቻለም',
//         type: 'error',
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loadingCart) {
//     return (
//       <SafeAreaView style={styles.safe}>
//         <View style={styles.center}>
//           <View style={styles.loaderCard}>
//             <ActivityIndicator size="large" color="#0F7B4A" />
//           </View>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const draftSection =
//     draftEntries.length > 0 ? (
//       <View style={styles.draftCardMaster}>
//         <View style={styles.draftToggleHeader}>
//           <TouchableOpacity
//             style={styles.draftLeftTitle}
//             activeOpacity={0.8}
//             onPress={() => setDraftExpanded(!draftExpanded)}
//           >
//             <View style={styles.draftIconTag}>
//               <Text style={styles.draftIconEmoji}>📁</Text>
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.draftHeadText}>የተቀመጡ ረቂቆች ({draftEntries.length} እቃዎች)</Text>
//               <Text style={styles.draftSubText}>ጠቅላላ ዋጋ: {draftTotalPrice.toLocaleString()} ብር</Text>
//             </View>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.draftToggleArrow}
//             activeOpacity={0.8}
//             onPress={() => setDraftExpanded(!draftExpanded)}
//             hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//           >
//             <Text style={styles.draftArrowSymbol}>{draftExpanded ? '▲ ዝጋ' : '▼ ክፈት'}</Text>
//           </TouchableOpacity>
//         </View>

//         {draftExpanded && (
//           <View style={styles.draftExpandedBody}>
//             <View style={styles.draftItemsDivider} />

//             <View style={styles.draftSelectAllRow}>
//               <TouchableOpacity
//                 onPress={handleToggleAllDrafts}
//                 style={styles.selectAllBtn}
//                 activeOpacity={0.7}
//                 hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//               >
//                 <Text style={styles.selectAllBtnText}>
//                   {selectedDraftCount === draftEntries.length ? 'ምርጫ ሰርዝ ✕' : 'ሁሉንም ምረጥ ✓'}
//                 </Text>
//               </TouchableOpacity>
//               <Text style={styles.draftCountSelectedText}>
//                 የተመረጡ: {selectedDraftCount}/{draftEntries.length}
//               </Text>
//             </View>

//             {draftEntries.map(([dKey, dItem]) => {
//               const isSelected = Boolean(selectedDraftKeys[dKey]);

//               return (
//                 <TouchableOpacity
//                   key={dKey}
//                   style={[styles.draftRowSingle, isSelected && styles.draftRowSelected]}
//                   activeOpacity={0.7}
//                   onPress={() => toggleDraftItemSelection(dKey)}
//                   accessibilityRole="checkbox"
//                   accessibilityState={{ checked: isSelected }}
//                 >
//                   <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
//                     <View
//                       pointerEvents="none"
//                       style={[styles.draftCheckbox, isSelected && styles.draftCheckboxActive]}
//                     >
//                       {isSelected && <Text style={styles.draftCheckmark}>✓</Text>}
//                     </View>

//                     <View pointerEvents="none" style={styles.draftItemDetails}>
//                       <Text style={styles.draftItemName} numberOfLines={1}>{dItem.name}</Text>
//                       <Text style={styles.draftItemSpec}>
//                         {dItem.quantity} {dItem.unit} · {(Number(dItem.price) * Number(dItem.quantity)).toLocaleString()} ብር
//                       </Text>
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               );
//             })}

//             <View style={styles.draftControlButtons}>
//               <TouchableOpacity
//                 style={[styles.draftDiscardBtn, selectedDraftCount === 0 && { opacity: 0.5 }]}
//                 onPress={handleDeleteSelectedDrafts}
//                 activeOpacity={0.75}
//                 disabled={selectedDraftCount === 0}
//               >
//                 <Text style={styles.draftDiscardBtnText}>የተመረጡትን ሰርዝ 🗑️</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.draftApplyBtn, selectedDraftCount === 0 && { opacity: 0.5 }]}
//                 onPress={handleMoveSelectedToActiveOrder}
//                 activeOpacity={0.8}
//                 disabled={selectedDraftCount === 0}
//               >
//                 <Text style={styles.draftApplyBtnText}>
//                   ወደ ትእዛዝ ላክ ({selectedDraftCount}) ›
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       </View>
//     ) : null;

//   return (
//     <SafeAreaView style={styles.safe}>
//       <View pointerEvents="none" style={styles.glowOrbA} />
//       <View pointerEvents="none" style={styles.glowOrbB} />

//       <View style={[styles.container, dyn.container]}>
//         <View style={[styles.contentWrap, dyn.contentWrap]}>
//           <View style={styles.headerRow}>
//             <TouchableOpacity
//               style={[styles.backLink, dyn.backChip]}
//               onPress={handleSafeBack}
//               activeOpacity={0.7}
//               hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//             >
//               <Text style={[styles.backText, dyn.backText]}>‹ ተመለስ</Text>
//             </TouchableOpacity>
//           </View>

//           <Text style={[styles.pageTitle, dyn.pageTitle]}>ትእዛዙን ላክ</Text>

//           {cartEntries.length === 0 ? (
//             <ScrollView
//               style={styles.scroll}
//               contentContainerStyle={styles.emptyScrollContent}
//               showsVerticalScrollIndicator={false}
//               keyboardShouldPersistTaps="handled"
//             >
//               {draftSection}

//               <View style={styles.emptyContainer}>
//                 <View style={[styles.emptyIconWrap, dyn.emptyIconWrap]}>
//                   <Text style={[styles.emptyIcon, dyn.emptyIcon]}>🛒</Text>
//                 </View>

//                 <Text style={[styles.emptyTitle, dyn.emptyTitle]}>
//                   {draftEntries.length > 0
//                     ? 'እቃዎች በረቂቅ ውስጥ ተቀምጠዋል። ወደ ትእዛዝ ለማዛወር ከላይ ያለውን ረቂቅ ይክፈቱ።'
//                     : 'ቅርጫትዎ ውስጥ ምንም እቃ የለም'}
//                 </Text>

//                 <TouchableOpacity
//                   style={[styles.goShopBtn, dyn.goShopBtn]}
//                   onPress={() => router.replace('/(tabs)')}
//                   activeOpacity={0.8}
//                 >
//                   <View pointerEvents="none" style={styles.btnShine} />
//                   <Text style={[styles.goShopBtnText, dyn.goShopBtnText]}>
//                     ወደ ገበያ ተመለስ
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </ScrollView>
//           ) : (
//             <ScrollView
//               style={styles.scroll}
//               contentContainerStyle={[styles.scrollContent, dyn.scrollContent]}
//               showsVerticalScrollIndicator={false}
//               keyboardShouldPersistTaps="handled"
//             >
//               {draftSection}

//               {cartEntries.map(([key, item]) => {
//                 const isImageFile =
//                   item.imageUrl &&
//                   (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/'));

//                 return (
//                   <View style={[styles.itemCard, dyn.itemCard]} key={key}>
//                     <View pointerEvents="none" style={styles.itemAccent} />

//                     <View style={styles.itemLeft}>
//                       <View style={[styles.itemEmojiBox, dyn.itemEmojiBox]}>
//                         {isImageFile ? (
//                           <Image
//                             source={{ uri: item.imageUrl }}
//                             style={styles.itemImage}
//                             resizeMode="cover"
//                           />
//                         ) : (
//                           <Text style={[styles.itemEmoji, dyn.itemEmoji]}>
//                             {item.imageUrl || '📦'}
//                           </Text>
//                         )}
//                       </View>

//                       <View style={styles.itemTextWrap}>
//                         <Text style={[styles.itemName, dyn.itemName]} numberOfLines={1}>
//                           {item.name}
//                         </Text>

//                         <Text style={[styles.itemUnitSub, dyn.itemUnitSub]} numberOfLines={1}>
//                           {item.unit} · {(Number(item.price) || 0).toLocaleString()} ብር
//                         </Text>
//                       </View>
//                     </View>

//                     <View style={styles.actionGroupRight}>
//                       <View style={[styles.stepperContainer, dyn.stepperContainer]}>
//                         <TouchableOpacity
//                           style={[styles.stepBtn, dyn.stepBtn]}
//                           onPress={() => updateQuantity(key, -1)}
//                           activeOpacity={0.6}
//                         >
//                           <Text style={[styles.stepBtnText, dyn.stepBtnText]}>−</Text>
//                         </TouchableOpacity>

//                         <View pointerEvents="none" style={[styles.stepQtyBox, dyn.stepQtyBox]}>
//                           <Text style={[styles.stepQtyText, dyn.stepQtyText]}>
//                             {item.quantity}
//                           </Text>
//                         </View>

//                         <TouchableOpacity
//                           style={[styles.stepBtnPlus, dyn.stepBtn]}
//                           onPress={() => updateQuantity(key, 1)}
//                           activeOpacity={0.6}
//                         >
//                           <Text style={[styles.stepBtnTextPlus, dyn.stepBtnText]}>+</Text>
//                         </TouchableOpacity>
//                       </View>

//                       <TouchableOpacity
//                         style={styles.deleteItemBtn}
//                         onPress={() => removeItem(key)}
//                         activeOpacity={0.75}
//                         hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//                       >
//                         <Text style={styles.deleteItemText}>✕</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 );
//               })}

//               {/* --- AUTOMATIC GPS & MANUAL WAREHOUSE DISTANCE CALCULATOR (ADAMA) --- */}
//               {/* <View style={[styles.sectionHeaderRow, styles.sectionHeaderRowSpaced]}>
//                 <View style={styles.sectionAccent} />
//                 <Text style={[styles.sectionHeader, dyn.sectionHeader]}>
//                   የመላኪያ ርቀት ማስያ (ከመብራት ሃይል አራዳ - አዳማ)
//                 </Text>
//               </View>

//               <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: LINE, padding: 14, marginBottom: 12, ...CARD_SHADOW }}>
//                 <Text style={{ fontSize: 12, fontWeight: '700', color: MUTED, marginBottom: 4 }}>
//                   📍 መነሻ መጋዝን: <Text style={{ fontWeight: '900', color: INK }}>መብራት ሃይል አራዳ (አዳማ)</Text>
//                 </Text>
//                 <Text style={{ fontSize: 11, fontWeight: '600', color: GREEN, marginBottom: 8 }}>
//                   ✓ በጂፒኤስ (GPS) በራስ-ሰር ተሰልቷል፤ አስፈላጊ ከሆነ ማስተካከል ይችላሉ።
//                 </Text>

//                 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
//                   <TextInput
//                     style={{
//                       flex: 1,
//                       backgroundColor: '#F9FBF8',
//                       borderWidth: 1,
//                       borderColor: '#DDE4DD',
//                       borderRadius: 12,
//                       paddingHorizontal: 12,
//                       paddingVertical: 10,
//                       fontSize: 14,
//                       fontWeight: '900',
//                       color: INK,
//                     }}
//                     keyboardType="numeric"
//                     value={distanceKm}
//                     onChangeText={setDistanceKm}
//                     placeholder="ርቀት በኪ.ሜ"
//                   />
//                   <Text style={{ fontSize: 13, fontWeight: '900', color: GREEN }}>ኪ.ሜ (KM)</Text>
//                 </View>

//                 <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#EEF2EE', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
//                   <Text style={{ fontSize: 11.5, fontWeight: '700', color: MUTED }}>የመላኪያ ዋጋ (Delivery Fee):</Text>
//                   <Text style={{ fontSize: 13, fontWeight: '900', color: GREEN }}>{deliveryFee.toLocaleString()} ብር</Text>
//                 </View>
//               </View> */}
// {/* --- INTERACTIVE LOCATION & DISTANCE CALCULATOR --- */}
//               <View style={[styles.sectionHeaderRow, styles.sectionHeaderRowSpaced]}>
//                 <View style={styles.sectionAccent} />
//                 <Text style={[styles.sectionHeader, dyn.sectionHeader]}>
//                   የመላኪያ ርቀት እና ዋጋ ማስያ
//                 </Text>
//               </View>

//               <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: LINE, padding: 14, marginBottom: 12, ...CARD_SHADOW }}>
//                 <Text style={{ fontSize: 12, fontWeight: '700', color: MUTED, marginBottom: 6 }}>
//                   📍 መነሻ መጋዝን: <Text style={{ fontWeight: '900', color: INK }}>መብራት ሃይል አራዳ (አዳማ)</Text>
//                 </Text>
//                 <Text style={{ fontSize: 11.5, fontWeight: '600', color: MUTED, marginBottom: 12 }}>
//                   ሱቅዎ ከመጋዝኑ ስንት ኪ.ሜ እንደሚርቅ ለማወቅ ከታች ያለውን ቁልፍ ይጫኑ ወይም እራስዎ ያስገቡ:
//                 </Text>

//                 {/* Interactive Location Button */}
//                 <TouchableOpacity
//                   style={{
//                     backgroundColor: '#E4F2EA',
//                     borderWidth: 1.5,
//                     borderColor: '#0F7B4A',
//                     borderRadius: 12,
//                     paddingVertical: 12,
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     marginBottom: 12,
//                     flexDirection: 'row',
//                     gap: 8,
//                   }}
//                   onPress={handleFetchPreciseLocation}
//                   activeOpacity={0.8}
//                   disabled={locatingUser}
//                 >
//                   {locatingUser ? (
//                     <ActivityIndicator size="small" color="#0F7B4A" />
//                   ) : (
//                     <>
//                       <Text style={{ fontSize: 15 }}>📌</Text>
//                       <Text style={{ fontSize: 13, fontWeight: '900', color: '#0F7B4A' }}>
//                         የሱቄን መገኛ ፈልግ (አሁን ያለበትን ርቀት አስላ)
//                       </Text>
//                     </>
//                   )}
//                 </TouchableOpacity>

//                 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
//                   <TextInput
//                     style={{
//                       flex: 1,
//                       backgroundColor: '#F9FBF8',
//                       borderWidth: 1,
//                       borderColor: '#DDE4DD',
//                       borderRadius: 12,
//                       paddingHorizontal: 12,
//                       paddingVertical: 10,
//                       fontSize: 14,
//                       fontWeight: '900',
//                       color: INK,
//                     }}
//                     keyboardType="numeric"
//                     value={distanceKm}
//                     onChangeText={setDistanceKm}
//                     placeholder="ርቀት በኪ.ሜ"
//                   />
//                   <Text style={{ fontSize: 13, fontWeight: '900', color: GREEN }}>ኪ.ሜ (KM)</Text>
//                 </View>

//                 <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#EEF2EE', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
//                   <Text style={{ fontSize: 11.5, fontWeight: '700', color: MUTED }}>የመላኪያ ዋጋ (Delivery Fee):</Text>
//                   <Text style={{ fontSize: 13, fontWeight: '900', color: GREEN }}>{deliveryFee.toLocaleString()} ብር</Text>
//                 </View>
//               </View>
//               <View style={[styles.sectionHeaderRow, styles.sectionHeaderRowSpaced]}>
//                 <View style={styles.sectionAccent} />
//                 <Text style={[styles.sectionHeader, dyn.sectionHeader]}>
//                   የመላኪያ ሰዓት ይምረጡ
//                 </Text>
//               </View>

//               <View style={[styles.slotRow, dyn.slotRow]}>
//                 <TouchableOpacity
//                   style={[
//                     styles.slotPill,
//                     dyn.slotPill,
//                     slot === 'BATCH_12PM' && styles.slotPillActive,
//                   ]}
//                   onPress={() => setSlot('BATCH_12PM')}
//                   activeOpacity={0.8}
//                 >
//                   <Text
//                     style={[
//                       styles.slotPillText,
//                       dyn.slotPillText,
//                       slot === 'BATCH_12PM' && styles.slotPillTextActive,
//                     ]}
//                     numberOfLines={1}
//                   >
//                     🌅 6:00 ሰዓት (ቀትር)
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[
//                     styles.slotPill,
//                     dyn.slotPill,
//                     slot === 'BATCH_6AM' && styles.slotPillActive,
//                   ]}
//                   onPress={() => setSlot('BATCH_6AM')}
//                   activeOpacity={0.8}
//                 >
//                   <Text
//                     style={[
//                       styles.slotPillText,
//                       dyn.slotPillText,
//                       slot === 'BATCH_6AM' && styles.slotPillTextActive,
//                     ]}
//                     numberOfLines={1}
//                   >
//                     ☀️ 12:00 ሰዓት (ተዋት)
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               {canOrderOnCredit && (
//                 <>
//                   <View style={[styles.sectionHeaderRow, styles.sectionHeaderRowSpaced]}>
//                     <View style={styles.sectionAccent} />
//                     <Text style={[styles.sectionHeader, dyn.sectionHeader]}>
//                       የክፍያ አማራጭ
//                     </Text>
//                   </View>

//                   <TouchableOpacity
//                     style={[
//                       styles.creditOptionBox,
//                       dyn.creditOptionBox,
//                       isCredit && styles.creditOptionBoxActive,
//                     ]}
//                     onPress={() => setIsCredit(!isCredit)}
//                     activeOpacity={0.85}
//                   >
//                     <View
//                       pointerEvents="none"
//                       style={[
//                         styles.checkbox,
//                         dyn.checkbox,
//                         isCredit && styles.checkboxActive,
//                       ]}
//                     >
//                       {isCredit && <Text style={[styles.checkMark, dyn.checkMark]}>✓</Text>}
//                     </View>

//                     <View pointerEvents="none" style={styles.creditTextWrap}>
//                       <Text style={[styles.creditTitle, dyn.creditTitle]}>
//                         በብድር ይሁን (Request on Credit)
//                       </Text>
//                       <Text style={[styles.creditSubtitle, dyn.creditSubtitle]}>
//                         ይህ ትእዛዝ በቀጥታ ወደ ሂሳብ መዝገብ ይላካል፤ ከአስተዳዳሪው ፈቃድ እስኪሰጥ ድረስ ይጠብቃል።
//                       </Text>
//                     </View>

//                     {isCredit && <View pointerEvents="none" style={styles.creditGlow} />}
//                   </TouchableOpacity>
//                 </>
//               )}

//               <View style={styles.scrollTailSpacer} />
//             </ScrollView>
//           )}
//         </View>

//         {cartEntries.length > 0 && (
//           <View style={[styles.footer, dyn.footer]}>
//             <View pointerEvents="none" style={styles.footerTopLine} />

//             <View style={[styles.footerInner, dyn.contentWrap]}>
//               <View style={[styles.totalRow, dyn.totalRow]}>
//                 <View style={styles.totalLabelWrap}>
//                   <Text style={[styles.totalLabel, dyn.totalLabel]}>
//                     ጠቅላላ ክፍያ ድምር (ከመላኪያ ጋር)
//                   </Text>
//                 </View>

//                 <Text style={[styles.totalDigits, dyn.totalDigits]} numberOfLines={1}>
//                   {finalTotalWithDelivery.toLocaleString()} ብር
//                 </Text>
//               </View>

//               <TouchableOpacity
//                 style={[
//                   styles.submitOrderBtn,
//                   dyn.submitOrderBtn,
//                   isCredit && canOrderOnCredit && styles.submitOrderBtnCredit,
//                   submitting && styles.submitOrderBtnBusy,
//                 ]}
//                 onPress={handleSubmitOrder}
//                 activeOpacity={0.85}
//                 disabled={submitting}
//               >
//                 <View pointerEvents="none" style={styles.btnShine} />

//                 {submitting ? (
//                   <ActivityIndicator size="small" color="#FFFFFF" />
//                 ) : (
//                   <Text
//                     style={[styles.submitOrderBtnText, dyn.submitOrderBtnText]}
//                     numberOfLines={1}
//                   >
//                     {isCredit && canOrderOnCredit
//                       ? `የብድር ጥያቄ ላክ (${finalTotalWithDelivery.toLocaleString()} ብር)`
//                       : `ትእዛዙን ላክ (${finalTotalWithDelivery.toLocaleString()} ብር)`}
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       </View>

//       {offlinePromptVisible && (
//         <View style={styles.modalOverlay}>
//           <View style={styles.offlineModalCard}>
//             <View style={styles.offlineIconBox}>
//               <Text style={styles.offlineModalEmoji}>📡</Text>
//             </View>

//             <Text style={styles.offlineModalTitle}>የኢንተርኔት ግንኙነት አልተገኘም</Text>
//             <Text style={styles.offlineModalMessage}>
//               ስልክዎ ከኢንተርኔት ውጭ ነው። ትእዛዝዎን ለማጠናቀቅ ከታች ካሉት አማራጮች አንዱን ይምረጡ፡
//             </Text>

//             <View style={styles.offlineActionRow}>
//               <TouchableOpacity
//                 style={styles.mobileDataBtn}
//                 onPress={handleOpenMobileDataSettings}
//                 activeOpacity={0.85}
//               >
//                 <Text style={styles.mobileDataBtnText}>📶 ዳታ ክፈት (Mobile Data)</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.smsDirectBtn}
//                 onPress={() => openSmsApplicationWithPayload(pendingSmsPayload)}
//                 activeOpacity={0.85}
//               >
//                 <Text style={styles.smsDirectBtnText}>✉️ በ SMS ላክ</Text>
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity
//               style={styles.cancelOfflineBtn}
//               onPress={() => setOfflinePromptVisible(false)}
//               hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//             >
//               <Text style={styles.cancelOfflineBtnText}>ተመለስ</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       <CustomAlert
//         visible={alertConfig.visible}
//         title={alertConfig.title}
//         message={alertConfig.message}
//         type={alertConfig.type}
//         onClose={() =>
//           setAlertConfig((prev) => ({
//             ...prev,
//             visible: false,
//           }))
//         }
//       />
//     </SafeAreaView>
//   );
// }

// const GREEN = '#0F7B4A';
// const INK = '#12241A';
// const MUTED = '#62726A';
// const LINE = '#E6ECE7';
// const SOFT = '#E4F2EA';

// const CARD_SHADOW = {
//   shadowColor: '#0B2A1B',
//   shadowOffset: { width: 0, height: 4 },
//   shadowOpacity: 0.06,
//   shadowRadius: 10,
//   elevation: 2,
// };

// const buildDynamic = (s, isTablet) =>
//   StyleSheet.create({
//     container: {
//       paddingHorizontal: isTablet ? 26 : 13 * s,
//       paddingTop: 10 * s,
//     },
//     contentWrap: {
//       width: '100%',
//       maxWidth: isTablet ? 620 : '100%',
//       alignSelf: 'center',
//     },
//     scrollContent: {
//       paddingTop: 2,
//       paddingBottom: 25,
//     },
//     backChip: {
//       paddingHorizontal: 11 * s,
//       paddingVertical: 7 * s,
//       borderRadius: 11 * s,
//     },
//     backText: { fontSize: 12.5 * s },
//     pageTitle: {
//       fontSize: 21 * s,
//       marginTop: 11 * s,
//       marginBottom: 6 * s,
//     },
//     emptyIconWrap: {
//       width: 62 * s,
//       height: 62 * s,
//       borderRadius: 22 * s,
//       marginBottom: 14 * s,
//     },
//     emptyIcon: { fontSize: 28 * s },
//     emptyTitle: { fontSize: 15 * s, marginBottom: 18 * s },
//     goShopBtn: {
//       paddingHorizontal: 24 * s,
//       paddingVertical: 12 * s,
//       borderRadius: 13 * s,
//     },
//     goShopBtnText: { fontSize: 13.5 * s },
//     sectionHeader: { fontSize: 13 * s },
//     itemCard: {
//       borderRadius: 16 * s,
//       padding: 11 * s,
//       paddingLeft: 13 * s,
//       marginBottom: 9 * s,
//     },
//     itemEmojiBox: {
//       width: 44 * s,
//       height: 44 * s,
//       borderRadius: 13 * s,
//       marginRight: 10 * s,
//     },
//     itemEmoji: { fontSize: 21 * s },
//     itemName: { fontSize: 13.5 * s },
//     itemUnitSub: { fontSize: 11.5 * s, marginTop: 3 * s },
//     stepperContainer: { borderRadius: 11 * s },
//     stepBtn: { width: 36 * s, height: 36 * s },
//     stepBtnText: { fontSize: 17 * s },
//     stepQtyBox: { minWidth: 28 * s },
//     stepQtyText: { fontSize: 13 * s },
//     slotRow: { gap: 9 * s, marginBottom: 4 },
//     slotPill: {
//       paddingVertical: 12 * s,
//       borderRadius: 13 * s,
//     },
//     slotPillText: { fontSize: 12.5 * s },
//     creditOptionBox: {
//       borderRadius: 15 * s,
//       padding: 13 * s,
//     },
//     checkbox: {
//       width: 23 * s,
//       height: 23 * s,
//       borderRadius: 7 * s,
//       marginRight: 11 * s,
//     },
//     checkMark: { fontSize: 14 * s, lineHeight: 17 * s },
//     creditTitle: { fontSize: 13.5 * s },
//     creditSubtitle: { fontSize: 11 * s, lineHeight: 15.5 * s, marginTop: 3 * s },
//     footer: {
//       paddingTop: 11 * s,
//       paddingBottom: Platform.OS === 'ios' ? 12 * s : 13 * s,
//       paddingHorizontal: isTablet ? 26 : 13 * s,
//     },
//     totalRow: {
//       borderRadius: 15 * s,
//       paddingVertical: 11 * s,
//       paddingHorizontal: 13 * s,
//       marginBottom: 10 * s,
//     },
//     totalLabel: { fontSize: 13 * s },
//     totalDigits: { fontSize: 19 * s },
//     submitOrderBtn: {
//       height: 52 * s,
//       borderRadius: 15 * s,
//     },
//     submitOrderBtnText: { fontSize: 14.5 * s },
//   });

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: '#F5F7F3',
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loaderCard: {
//     width: 68,
//     height: 68,
//     borderRadius: 22,
//     backgroundColor: '#FFFFFF',
//     borderWidth: 1,
//     borderColor: LINE,
//     justifyContent: 'center',
//     alignItems: 'center',
//     ...CARD_SHADOW,
//   },
//   glowOrbA: {
//     position: 'absolute',
//     top: -80,
//     right: -60,
//     width: 230,
//     height: 230,
//     borderRadius: 115,
//     backgroundColor: 'rgba(15, 123, 74, 0.10)',
//   },
//   glowOrbB: {
//     position: 'absolute',
//     bottom: -90,
//     left: -70,
//     width: 240,
//     height: 240,
//     borderRadius: 120,
//     backgroundColor: 'rgba(242, 183, 5, 0.09)',
//   },
//   container: {
//     flex: 1,
//   },
//   contentWrap: {
//     flex: 1,
//   },
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   backLink: {
//     alignSelf: 'flex-start',
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#EEF6F0',
//     borderWidth: 1,
//     borderColor: '#DCEAE1',
//   },
//   backText: {
//     color: GREEN,
//     fontWeight: '800',
//   },
//   pageTitle: {
//     fontWeight: '900',
//     color: INK,
//     letterSpacing: 0.2,
//   },
//   scroll: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingTop: 2,
//   },
//   emptyScrollContent: {
//     flexGrow: 1,
//     paddingTop: 2,
//     paddingBottom: 25,
//   },
//   scrollTailSpacer: {
//     height: 12,
//   },
//   draftCardMaster: {
//     backgroundColor: '#FFFBEB',
//     borderRadius: 16,
//     borderWidth: 1.2,
//     borderColor: '#FDE68A',
//     marginBottom: 12,
//     overflow: 'hidden',
//     ...CARD_SHADOW,
//   },
//   draftToggleHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 13,
//     paddingVertical: 10,
//   },
//   draftLeftTitle: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 9,
//     flex: 1,
//   },
//   draftIconTag: {
//     width: 32,
//     height: 32,
//     borderRadius: 10,
//     backgroundColor: '#FEF3C7',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   draftIconEmoji: {
//     fontSize: 16,
//   },
//   draftHeadText: {
//     fontSize: 12.5,
//     fontWeight: '900',
//     color: '#92400E',
//   },
//   draftSubText: {
//     fontSize: 10.5,
//     fontWeight: '700',
//     color: '#B45309',
//   },
//   draftToggleArrow: {
//     backgroundColor: '#FEF3C7',
//     paddingHorizontal: 9,
//     paddingVertical: 4.5,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#FDE68A',
//   },
//   draftArrowSymbol: {
//     fontSize: 10.5,
//     fontWeight: '900',
//     color: '#92400E',
//   },
//   draftExpandedBody: {
//     paddingHorizontal: 13,
//     paddingBottom: 11,
//   },
//   draftItemsDivider: {
//     height: 1,
//     backgroundColor: '#FDE68A',
//     marginBottom: 8,
//   },
//   draftSelectAllRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   selectAllBtn: {
//     paddingVertical: 3,
//     paddingHorizontal: 8,
//     backgroundColor: '#FEF3C7',
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: '#FDE68A',
//   },
//   selectAllBtnText: {
//     fontSize: 10.5,
//     fontWeight: '800',
//     color: '#92400E',
//   },
//   draftCountSelectedText: {
//     fontSize: 10.5,
//     fontWeight: '800',
//     color: '#B45309',
//   },
//   draftRowSingle: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 8,
//     borderRadius: 10,
//     marginBottom: 4,
//     backgroundColor: 'rgba(255, 255, 255, 0.6)',
//     borderWidth: 1,
//     borderColor: 'transparent',
//   },
//   draftRowSelected: {
//     backgroundColor: '#FFFFFF',
//     borderColor: '#F59E0B',
//   },
//   draftCheckbox: {
//     width: 20,
//     height: 20,
//     borderRadius: 5,
//     borderWidth: 1.8,
//     borderColor: '#D97706',
//     backgroundColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 9,
//   },
//   draftCheckboxActive: {
//     backgroundColor: '#D97706',
//     borderColor: '#D97706',
//   },
//   draftCheckmark: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     fontWeight: '900',
//     lineHeight: 14,
//   },
//   draftItemDetails: {
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   draftItemName: {
//     fontSize: 11.5,
//     fontWeight: '800',
//     color: '#78350F',
//     flex: 1,
//   },
//   draftItemSpec: {
//     fontSize: 11,
//     fontWeight: '800',
//     color: '#92400E',
//     marginLeft: 6,
//   },
//   draftControlButtons: {
//     flexDirection: 'row',
//     gap: 8,
//     marginTop: 10,
//   },
//   draftDiscardBtn: {
//     paddingHorizontal: 12,
//     paddingVertical: 9,
//     borderRadius: 9,
//     backgroundColor: '#FEE2E2',
//     borderWidth: 1,
//     borderColor: '#FCA5A5',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   draftDiscardBtnText: {
//     color: '#DC2626',
//     fontSize: 11,
//     fontWeight: '900',
//   },
//   draftApplyBtn: {
//     flex: 1,
//     paddingVertical: 9,
//     borderRadius: 9,
//     backgroundColor: '#D97706',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   draftApplyBtnText: {
//     color: '#FFFFFF',
//     fontSize: 11.5,
//     fontWeight: '900',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingBottom: 70,
//     paddingHorizontal: 20,
//   },
//   emptyIconWrap: {
//     backgroundColor: SOFT,
//     borderWidth: 1,
//     borderColor: '#CFE7D9',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyTitle: {
//     fontWeight: '800',
//     color: MUTED,
//     textAlign: 'center',
//     lineHeight: 21,
//   },
//   goShopBtn: {
//     backgroundColor: GREEN,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: '#3FD08A',
//     shadowColor: GREEN,
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   goShopBtnText: {
//     color: '#FFFFFF',
//     fontWeight: '800',
//   },
//   btnShine: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: '50%',
//     backgroundColor: 'rgba(255, 255, 255, 0.14)',
//   },
//   sectionHeaderRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     marginBottom: 9,
//   },
//   sectionHeaderRowSpaced: {
//     marginTop: 16,
//   },
//   sectionAccent: {
//     width: 3,
//     height: 14,
//     borderRadius: 2,
//     backgroundColor: GREEN,
//   },
//   sectionHeader: {
//     fontWeight: '900',
//     color: INK,
//     letterSpacing: 0.2,
//     flexShrink: 1,
//   },
//   itemCard: {
//     backgroundColor: '#FFFFFF',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     borderWidth: 1,
//     borderColor: LINE,
//     overflow: 'hidden',
//     gap: 8,
//     ...CARD_SHADOW,
//   },
//   itemAccent: {
//     position: 'absolute',
//     left: 0,
//     top: 10,
//     bottom: 10,
//     width: 3,
//     borderRadius: 2,
//     backgroundColor: 'rgba(15, 123, 74, 0.35)',
//   },
//   itemLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//     minWidth: 0,
//   },
//   itemEmojiBox: {
//     backgroundColor: SOFT,
//     borderWidth: 1,
//     borderColor: '#D6EBE0',
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//   },
//   itemImage: {
//     width: '100%',
//     height: '100%',
//   },
//   itemTextWrap: {
//     flex: 1,
//     minWidth: 0,
//   },
//   itemName: {
//     fontWeight: '800',
//     color: INK,
//   },
//   itemUnitSub: {
//     color: MUTED,
//     fontWeight: '600',
//   },
//   actionGroupRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 7,
//   },
//   stepperContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#DDE4DD',
//     backgroundColor: '#FBFCFB',
//     overflow: 'hidden',
//     flexShrink: 0,
//   },
//   stepBtn: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//   },
//   stepBtnPlus: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: SOFT,
//   },
//   stepBtnText: {
//     fontWeight: '800',
//     color: INK,
//     marginTop: -1,
//   },
//   stepBtnTextPlus: {
//     fontWeight: '900',
//     color: GREEN,
//     marginTop: -1,
//   },
//   stepQtyBox: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderLeftWidth: 1,
//     borderRightWidth: 1,
//     borderLeftColor: '#EDF2EE',
//     borderRightColor: '#EDF2EE',
//     paddingVertical: 4,
//   },
//   stepQtyText: {
//     fontWeight: '900',
//     color: INK,
//   },
//   deleteItemBtn: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: '#FEE2E2',
//     borderWidth: 1,
//     borderColor: '#FCA5A5',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   deleteItemText: {
//     color: '#EF4444',
//     fontSize: 12,
//     fontWeight: '900',
//   },
//   slotRow: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },
//   slotPill: {
//     flex: 1,
//     minWidth: 130,
//     borderWidth: 1.2,
//     borderColor: '#DDE4DD',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: 6,
//   },
//   slotPillActive: {
//     borderColor: GREEN,
//     backgroundColor: SOFT,
//     borderWidth: 1.6,
//     shadowColor: GREEN,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   slotPillText: {
//     fontWeight: '800',
//     color: MUTED,
//     textAlign: 'center',
//   },
//   slotPillTextActive: {
//     color: GREEN,
//     fontWeight: '900',
//   },
//   creditOptionBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     borderWidth: 1.2,
//     borderColor: '#DDE4DD',
//     overflow: 'hidden',
//     ...CARD_SHADOW,
//   },
//   creditOptionBoxActive: {
//     borderColor: GREEN,
//     backgroundColor: '#F2FAF5',
//     borderWidth: 1.6,
//     shadowColor: GREEN,
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.22,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   creditGlow: {
//     position: 'absolute',
//     top: -40,
//     right: -30,
//     width: 110,
//     height: 110,
//     borderRadius: 55,
//     backgroundColor: 'rgba(15, 123, 74, 0.10)',
//   },
//   checkbox: {
//     borderWidth: 2,
//     borderColor: '#8DA396',
//     backgroundColor: '#FFFFFF',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   checkboxActive: {
//     borderColor: GREEN,
//     backgroundColor: GREEN,
//   },
//   checkMark: {
//     color: '#FFFFFF',
//     fontWeight: '900',
//   },
//   creditTextWrap: {
//     flex: 1,
//     minWidth: 0,
//   },
//   creditTitle: {
//     fontWeight: '900',
//     color: INK,
//   },
//   creditSubtitle: {
//     color: MUTED,
//     fontWeight: '600',
//   },
//   footer: {
//     backgroundColor: 'rgba(255, 255, 255, 0.96)',
//     borderTopWidth: 1,
//     borderTopColor: LINE,
//     shadowColor: '#0B2A1B',
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.07,
//     shadowRadius: 12,
//     elevation: 10,
//   },
//   footerTopLine: {
//     position: 'absolute',
//     top: 0,
//     left: 24,
//     right: 24,
//     height: 1.5,
//     backgroundColor: 'rgba(63, 208, 138, 0.45)',
//   },
//   footerInner: {
//     width: '100%',
//     alignSelf: 'center',
//   },
//   totalRow: {
//     backgroundColor: '#FFFFFF',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: LINE,
//     gap: 10,
//     ...CARD_SHADOW,
//   },
//   totalLabelWrap: {
//     flexShrink: 1,
//   },
//   totalLabel: {
//     fontWeight: '800',
//     color: INK,
//   },
//   totalDigits: {
//     fontWeight: '900',
//     color: GREEN,
//     letterSpacing: 0.2,
//     flexShrink: 1,
//   },
//   submitOrderBtn: {
//     backgroundColor: GREEN,
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: '#3FD08A',
//     paddingHorizontal: 12,
//     shadowColor: GREEN,
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.3,
//     shadowRadius: 12,
//     elevation: 6,
//   },
//   submitOrderBtnCredit: {
//     backgroundColor: '#1B4D3E',
//     borderColor: '#3E7A66',
//     shadowColor: '#1B4D3E',
//   },
//   submitOrderBtnBusy: {
//     opacity: 0.85,
//   },
//   submitOrderBtnText: {
//     color: '#FFFFFF',
//     fontWeight: '900',
//     letterSpacing: 0.2,
//     textAlign: 'center',
//   },
//   modalOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(11, 31, 20, 0.55)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 99999,
//     elevation: 100,
//     paddingHorizontal: 20,
//   },
//   offlineModalCard: {
//     width: '100%',
//     maxWidth: 360,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 24,
//     padding: 22,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.25,
//     shadowRadius: 16,
//     elevation: 12,
//   },
//   offlineIconBox: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: '#FEF3C7',
//     borderWidth: 1,
//     borderColor: '#FDE68A',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   offlineModalEmoji: {
//     fontSize: 28,
//   },
//   offlineModalTitle: {
//     fontSize: 16,
//     fontWeight: '900',
//     color: '#12241A',
//     textAlign: 'center',
//     marginBottom: 6,
//   },
//   offlineModalMessage: {
//     fontSize: 12.5,
//     fontWeight: '600',
//     color: '#62726A',
//     textAlign: 'center',
//     lineHeight: 18,
//     marginBottom: 18,
//   },
//   offlineActionRow: {
//     width: '100%',
//     gap: 9,
//   },
//   mobileDataBtn: {
//     backgroundColor: GREEN,
//     paddingVertical: 12,
//     borderRadius: 13,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: GREEN,
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.25,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   mobileDataBtnText: {
//     color: '#FFFFFF',
//     fontSize: 13,
//     fontWeight: '900',
//   },
//   smsDirectBtn: {
//     backgroundColor: '#F59E0B',
//     paddingVertical: 12,
//     borderRadius: 13,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   smsDirectBtnText: {
//     color: '#FFFFFF',
//     fontSize: 13,
//     fontWeight: '900',
//   },
//   cancelOfflineBtn: {
//     marginTop: 12,
//     paddingVertical: 6,
//     paddingHorizontal: 16,
//   },
//   cancelOfflineBtnText: {
//     color: '#94A3B8',
//     fontSize: 12,
//     fontWeight: '700',
//   },
// });
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { apiRequest } from '../lib/api';
import { useSession } from '../context/SessionContext';
import CustomAlert from '../components/CustomAlert';

const ADMIN_DESTINATION_PHONE = '0968821059';

// Exact Warehouse coordinates for Mebrat Hail Arada in Adama
const WAREHOUSE_LAT = 8.5414; 
const WAREHOUSE_LNG = 39.2705; 

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

const UNIT_MAP = {
  'ካርቶን': 'CARTON',
  'ግማሽ': 'HALF_CARTON',
  'ግማሽ ካርቶን': 'HALF_CARTON',
  'ግማሽ ደርዘን': 'HALF_DOZEN',
  'ፓኬት': 'PACK',
  'ደርዘን': 'DOZEN',
  'ኪሎ': 'KG',
  'ኩንታል': 'QUINTAL',
  'ቁራጭ': 'PIECE',
  'መረብ': 'MEREB',
  CARTON: 'CARTON',
  HALF_CARTON: 'HALF_CARTON',
  HALF_DOZEN: 'HALF_DOZEN',
  PACK: 'PACK',
  DOZEN: 'DOZEN',
  KG: 'KG',
  QUINTAL: 'QUINTAL',
  PIECE: 'PIECE',
  MEREB: 'MEREB',
};

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token, lang } = useSession();
  const { width: SCREEN_W } = useWindowDimensions();

  const [cart, setCart] = useState({});
  const [drafts, setDrafts] = useState({});
  const [selectedDraftKeys, setSelectedDraftKeys] = useState({});
  const [draftExpanded, setDraftExpanded] = useState(false);
  const [canOrderOnCredit, setCanOrderOnCredit] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('guest');

  const [slot, setSlot] = useState('BATCH_12PM');
  const [isCredit, setIsCredit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCart, setLoadingCart] = useState(true);
  const [locatingUser, setLocatingUser] = useState(false);

  // Distance input state (defaults to 6km or loads from saved profile coords)
  const [distanceKm, setDistanceKm] = useState('');

  const [offlinePromptVisible, setOfflinePromptVisible] = useState(false);
  const [pendingSmsPayload, setPendingSmsPayload] = useState('');

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  const isSmall = SCREEN_W < 350;
  const isTablet = SCREEN_W >= 680;
  const S = isSmall ? 0.9 : isTablet ? 1.12 : SCREEN_W >= 420 ? 1.06 : 1;
  const dyn = useMemo(() => buildDynamic(S, isTablet), [S, isTablet]);

  const acquireFastGps = async () => {
    try {
      // 1. Check AsyncStorage first (matches your working profile logic)
      const savedCoordsJson = await AsyncStorage.getItem('shopCoords').catch(() => null);
      if (savedCoordsJson) {
        const parsed = JSON.parse(savedCoordsJson);
        if (parsed?.lat && parsed?.lng) {
          return {
            latitude: parsed.lat,
            longitude: parsed.lng,
          };
        }
      }

      if (Platform.OS === 'web') {
        return new Promise((resolve) => {
          if (typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
              () => resolve({ latitude: null, longitude: null }),
              { timeout: 5000, maximumAge: 10000 }
            );
          } else {
            resolve({ latitude: null, longitude: null });
          }
        });
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return { latitude: null, longitude: null };

      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 5000));
      const location = await Promise.race([locationPromise, timeoutPromise]);

      if (location && location.coords) {
        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }
      return { latitude: null, longitude: null };
    } catch (e) {
      return { latitude: null, longitude: null };
    }
  };

  // Auto-calculate distance on load if profile coords exist
  // useEffect(() => {
  //   const initGpsDistance = async () => {
  //     const gps = await acquireFastGps();
  //     if (gps.latitude && gps.longitude) {
  //       const dist = getDistanceFromLatLonInKm(
  //         WAREHOUSE_LAT,
  //         WAREHOUSE_LNG,
  //         gps.latitude,
  //         gps.longitude
  //       );
  //       if (dist > 0 && dist < 200) {
  //         setDistanceKm(dist.toFixed(1));
  //       }
  //     }
  //   };
  //   initGpsDistance();
  // }, []);

  const handleFetchPreciseLocation = async () => {
    setLocatingUser(true);
    try {
      const gps = await acquireFastGps();
      if (gps.latitude && gps.longitude) {
        const exactDist = getDistanceFromLatLonInKm(
          WAREHOUSE_LAT,
          WAREHOUSE_LNG,
          gps.latitude,
          gps.longitude
        );

        if (exactDist > 0) {
          const formattedDist = exactDist.toFixed(1);
          setDistanceKm(formattedDist);
          setAlertConfig({
            visible: true,
            title: 'ተሳክቷል! ✅',
            message: `የሱቅዎ ርቀት ከመጋዝኑ: ${formattedDist} ኪ.ሜ ሆኖ ተሰልቷል።`,
            type: 'success',
          });
          return;
        }
      }

      const savedCoordsJson = await AsyncStorage.getItem('shopCoords').catch(() => null);
      if (!savedCoordsJson) {
        setAlertConfig({
          visible: true,
          title: 'መገኛ ማግኘት አልተቻለም',
          message: 'እባክዎ መጀመሪያ መገኛዎን በፕሮፋይል ገጽ (Profile) ያስቀምጡ ወይም ርቀቱን በእጅ ያስገቡ።',
          type: 'error',
        });
      }
    } catch (err) {
      setAlertConfig({
        visible: true,
        title: 'ስህተት',
        message: 'ርቀት በሚሰላበት ጊዜ ችግር ተፈጥሯል',
        type: 'error',
      });
    } finally {
      setLocatingUser(false);
    }
  };

  const loadUserDataAndStorage = async () => {
    try {
      let resolvedUserId = 'guest';

      if (token) {
        const res = await apiRequest('/auth/me', { token }).catch(() => null);
        const userData = res?.user || res?.data;
        if (userData) {
          resolvedUserId = String(userData.id || userData._id || 'guest');
          const eligible = Boolean(userData.canOrderOnCredit);
          setCanOrderOnCredit(eligible);
          await AsyncStorage.setItem('user_credit_eligible', eligible ? '1' : '0');
        }
      }

      if (resolvedUserId === 'guest') {
        const storedUser = await AsyncStorage.getItem('user_data').catch(() => null);
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          resolvedUserId = String(parsed?.id || parsed?._id || 'guest');
          setCanOrderOnCredit(Boolean(parsed?.canOrderOnCredit));
        }
      }

      setCurrentUserId(resolvedUserId);

      const scopedCartKey = `user_cart_${resolvedUserId}`;
      const scopedDraftKey = `user_draft_cart_${resolvedUserId}`;

      let parsedCart = {};
      let parsedDrafts = {};

      const storedDraftsJson = await AsyncStorage.getItem(scopedDraftKey).catch(() => null);
      parsedDrafts = storedDraftsJson ? JSON.parse(storedDraftsJson) : {};

      if (params?.cartData) {
        try {
          const incomingData = JSON.parse(params.cartData);
          if (params?.isDraft === 'true') {
            Object.entries(incomingData).forEach(([k, item]) => {
              parsedDrafts[k] = { ...item };
            });
            await AsyncStorage.setItem(scopedDraftKey, JSON.stringify(parsedDrafts));
            await AsyncStorage.setItem('user_draft_cart', JSON.stringify(parsedDrafts));
          } else {
            parsedCart = incomingData;
            await AsyncStorage.setItem(scopedCartKey, JSON.stringify(parsedCart));
            await AsyncStorage.setItem('user_cart', JSON.stringify(parsedCart));
          }
        } catch {}
      }

      if (Object.keys(parsedCart).length === 0) {
        const storedCart = await AsyncStorage.getItem(scopedCartKey).catch(() => null);
        if (storedCart) {
          parsedCart = JSON.parse(storedCart);
        }
      }

      setCart(parsedCart);
      setDrafts(parsedDrafts);
      setDraftExpanded((prev) => (params?.isDraft === 'true' || Object.keys(parsedCart).length === 0 ? true : prev));
    } catch {
      setCart({});
      setDrafts({});
    } finally {
      setLoadingCart(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserDataAndStorage();
    }, [token])
  );

  const updateQuantity = useCallback(async (key, delta) => {
    setCart((prevCart) => {
      const updated = { ...prevCart };
      if (!updated[key]) return prevCart;

      const nextQty = (updated[key].quantity || 0) + delta;

      if (nextQty <= 0) {
        delete updated[key];
      } else {
        updated[key] = {
          ...updated[key],
          quantity: nextQty,
        };
      }

      AsyncStorage.setItem(`user_cart_${currentUserId}`, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, [currentUserId]);

  const removeItem = useCallback(async (key) => {
    setCart((prevCart) => {
      const updated = { ...prevCart };
      delete updated[key];
      AsyncStorage.setItem(`user_cart_${currentUserId}`, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, [currentUserId]);

  const toggleDraftItemSelection = useCallback((key) => {
    setSelectedDraftKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleToggleAllDrafts = useCallback(() => {
    setSelectedDraftKeys((prev) => {
      const allSelected = Object.keys(drafts).every((k) => prev[k]);
      const nextState = {};
      Object.keys(drafts).forEach((k) => {
        nextState[k] = !allSelected;
      });
      return nextState;
    });
  }, [drafts]);

  const selectedDraftCount = useMemo(() => {
    return Object.keys(drafts).filter((k) => selectedDraftKeys[k]).length;
  }, [drafts, selectedDraftKeys]);

  const handleMoveSelectedToActiveOrder = useCallback(async () => {
    const keysToMove = Object.keys(drafts).filter((k) => selectedDraftKeys[k]);

    if (keysToMove.length === 0) {
      setAlertConfig({
        visible: true,
        title: 'እቃ አልተመረጠም',
        message: 'እባክዎ ወደ ትእዛዝ ዝርዝር የሚዛወሩትን እቃዎች በሳጥኑ ላይ ይምረጡ',
        type: 'error',
      });
      return;
    }

    const mergedCart = { ...cart };
    const remainingDrafts = { ...drafts };

    keysToMove.forEach((k) => {
      const draftItem = drafts[k];
      if (mergedCart[k]) {
        mergedCart[k] = {
          ...mergedCart[k],
          quantity: (mergedCart[k].quantity || 0) + (draftItem.quantity || 1),
        };
      } else {
        mergedCart[k] = { ...draftItem };
      }
      delete remainingDrafts[k];
    });

    setCart(mergedCart);
    setDrafts(remainingDrafts);
    setSelectedDraftKeys({});

    AsyncStorage.setItem(`user_cart_${currentUserId}`, JSON.stringify(mergedCart)).catch(() => {});
    AsyncStorage.setItem(`user_draft_cart_${currentUserId}`, JSON.stringify(remainingDrafts)).catch(() => {});

    setAlertConfig({
      visible: true,
      title: 'እቃዎች ተዛውረዋል',
      message: `የተመረጡት ${keysToMove.length} እቃዎች ወደ ትእዛዝ ዝርዝር ገብተዋል።`,
      type: 'success',
    });
  }, [cart, drafts, selectedDraftKeys, currentUserId]);

  const handleDeleteSelectedDrafts = useCallback(async () => {
    const keysToDelete = Object.keys(drafts).filter((k) => selectedDraftKeys[k]);

    if (keysToDelete.length === 0) {
      setAlertConfig({
        visible: true,
        title: 'እቃ አልተመረጠም',
        message: 'እባክዎ የሚሰረዙትን የረቂቅ እቃዎች ይምረጡ',
        type: 'error',
      });
      return;
    }

    const remainingDrafts = { ...drafts };
    keysToDelete.forEach((k) => {
      delete remainingDrafts[k];
    });

    setDrafts(remainingDrafts);
    setSelectedDraftKeys({});
    await AsyncStorage.setItem(`user_draft_cart_${currentUserId}`, JSON.stringify(remainingDrafts)).catch(() => {});

    setAlertConfig({
      visible: true,
      title: 'ተሰርዟል',
      message: `${keysToDelete.length} እቃዎች ከረቂቅ ተሰርዘዋል`,
      type: 'success',
    });
  }, [drafts, selectedDraftKeys, currentUserId]);

  const handleSafeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const cartEntries = Object.entries(cart);
  const draftEntries = Object.entries(drafts);

  const totalPrice = cartEntries.reduce(
    (sum, [_, item]) =>
      sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );

  // Delivery Fee Calculation: 89 Birr for first 2 km, 25 Birr per extra km
  // const numericKm = Math.max(0, parseFloat(distanceKm) || 0);
  // const deliveryFee = useMemo(() => {
  //   if (numericKm <= 0) return 0;
  //   if (numericKm <= 2) return 89;
  //   return 89 + (Math.ceil(numericKm) - 2) * 25;
  // }, [numericKm]);
// Delivery Fee: 89 Birr fixed for up to 3 km, then 25 Birr per extra km
  const numericKm = Math.max(0, parseFloat(distanceKm) || 0);
  const deliveryFee = useMemo(() => {
    if (numericKm <= 0) return 0;
    if (numericKm <= 3) return 89;
    return 89 + (numericKm - 3) * 25;
  }, [numericKm]);
  const finalTotalWithDelivery = totalPrice + deliveryFee;

  const draftTotalPrice = draftEntries.reduce(
    (sum, [_, item]) =>
      sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );

  const generateSmsOrderText = (loc) => {
    if (cartEntries.length === 0) return '';

    const itemsListAmharic = cartEntries.map(([_, it], index) => {
      const name = it.name || 'እቃ';
      const qty = Math.max(1, Math.round(Number(it.quantity) || 1));
      const unit = it.unit || 'ካርቶን';
      const subTotal = ((Number(it.price) || 0) * qty).toLocaleString();
      return `${index + 1}. ${name} ብዛት: ${qty} ${unit} (ዋጋ: ${subTotal} ብር)`;
    }).join('\n');

    const slotTimeText = slot === 'BATCH_6AM' ? 'ጠዋት 6:00 ሰዓት' : 'ቀትር 12:00 ሰዓት';
    const creditStatusText = isCredit && canOrderOnCredit ? 'በብድር (Credit Order)' : 'ጥሬ ገንዘብ (Cash)';
    const locPart = loc?.latitude ? `\nመገኛ (GPS): ${loc.latitude},${loc.longitude}` : '';

    return `ሰላም! አዲስ የትእዛዝ ጥያቄ ከቅናሽ ገበያ መተግበሪያ:\n\nየተመረጡ እቃዎች:\n${itemsListAmharic}\n\nየእቃዎች ድምር: ${totalPrice.toLocaleString()} ብር\nየመላኪያ ርቀት: ${numericKm} ኪ.ሜ (ዋጋ: ${deliveryFee} ብር)\nጠቅላላ ድምር: ${finalTotalWithDelivery.toLocaleString()} ብር\nየመላኪያ ሰዓት: ${slotTimeText}\nየክፍያ ሁኔታ: ${creditStatusText}${locPart}`;
  };

  const checkIsDeviceOnline = async () => {
    if (Platform.OS === 'web') {
      return typeof navigator !== 'undefined' ? navigator.onLine : true;
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      await fetch('https://clients3.google.com/generate_204', {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return true;
    } catch {
      return false;
    }
  };

  const openSmsApplicationWithPayload = async (payload) => {
    setOfflinePromptVisible(false);
    const separator = Platform.OS === 'ios' ? '&' : '?';
    const smsUrl = `sms:${ADMIN_DESTINATION_PHONE}${separator}body=${encodeURIComponent(payload)}`;

    try {
      const supported = await Linking.canOpenURL(smsUrl);
      if (supported) {
        await Linking.openURL(smsUrl);
      } else {
        await Linking.openURL(`sms:${ADMIN_DESTINATION_PHONE}`);
      }
    } catch {
      setAlertConfig({
        visible: true,
        title: 'መልእክት ስህተት',
        message: 'የ SMS መተግበሪያውን በስልኮ ላይ መክፈት አልተቻለም',
        type: 'error',
      });
    }
  };

  const handleOpenMobileDataSettings = async () => {
    setOfflinePromptVisible(false);
    try {
      if (Platform.OS === 'android') {
        await Linking.sendIntent('android.settings.DATA_ROAMING_SETTINGS').catch(async () => {
          await Linking.openSettings();
        });
      } else if (Platform.OS === 'ios') {
        await Linking.openURL('App-Prefs:root=MOBILE_DATA_SETTINGS_ID').catch(async () => {
          await Linking.openSettings();
        });
      } else {
        await Linking.openSettings();
      }
    } catch {
      await Linking.openSettings();
    }
  };

  const handleSubmitOrder = async () => {
    if (cartEntries.length === 0) {
      setAlertConfig({
        visible: true,
        title: 'ቅርጫት ባዶ ነው',
        message: 'እባክዎ መጀመሪያ እቃ ይምረጡ ወይም ከረቂቅ ወደ ትእዛዝ ያዛውሩ',
        type: 'error',
      });
      return;
    }

    setSubmitting(true);
    const isOnline = await checkIsDeviceOnline();

    const gpsLocation = await Promise.race([
      acquireFastGps(),
      new Promise((resolve) =>
        setTimeout(() => resolve({ latitude: null, longitude: null }), 7000)
      ),
    ]);

    if (!isOnline) {
      setSubmitting(false);
      const offlineSmsString = generateSmsOrderText(gpsLocation);
      setPendingSmsPayload(offlineSmsString);
      setOfflinePromptVisible(true);
      return;
    }

    try {
      const payload = cartEntries.map(([_, item]) => ({
        productId: item.productId,
        quantity: Math.max(1, Math.round(Number(item.quantity))),
        selectedUnit: UNIT_MAP[item.unit] || 'CARTON',
        unitPrice: Number(item.price),
      }));

      const res = await apiRequest('/orders', {
        method: 'POST',
        token,
        body: {
          deliverySlot: slot,
          isCreditOrder: Boolean(isCredit && canOrderOnCredit),
          latitude: gpsLocation.latitude,
          longitude: gpsLocation.longitude,
          deliveryFee: Number(deliveryFee),
          distanceKm: Number(numericKm),
          items: payload,
        },
      });

      const orderData = res?.order || res;
      const orderId = orderData?.id || `${Math.floor(1000 + Math.random() * 9000)}`;
      const orderNumber = String(orderId).slice(-4).toUpperCase();

      const slotTimeText =
        slot === 'BATCH_6AM'
          ? 'ጠዋት 6:00 ሰዓት'
          : 'ቀትር 12:00 ሰዓት';

      await AsyncStorage.removeItem(`user_cart_${currentUserId}`);
      setCart({});

      if (isCredit && canOrderOnCredit) {
        router.replace('/(tabs)/ledger');
      } else {
        const orderItemsSummary = cartEntries.map(([_, item]) => ({
          name: item.name || 'እቃ',
          quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
          unit: item.unit || 'ካርቶን',
          price: Number(item.price) || 0,
        }));

        router.replace({
          pathname: '/confirmation',
          params: {
            orderNumber,
            deliveryTime: slotTimeText,
            orderLang: lang || 'am',
            distanceKm: String(numericKm),
            deliveryFee: String(deliveryFee),
            totalPrice: String(totalPrice),
            finalTotal: String(finalTotalWithDelivery),
            orderItemsData: JSON.stringify(orderItemsSummary),
          },
        });
      }
    } catch (err) {
      setAlertConfig({
        visible: true,
        title: 'ስህተት',
        message: err.message || 'ትእዛዝ ማስተላለፍ አልተቻለም',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCart) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.loaderCard}>
            <ActivityIndicator size="large" color="#0F7B4A" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const draftSection =
    draftEntries.length > 0 ? (
      <View style={styles.draftCardMaster}>
        <View style={styles.draftToggleHeader}>
          <TouchableOpacity
            style={styles.draftLeftTitle}
            activeOpacity={0.8}
            onPress={() => setDraftExpanded(!draftExpanded)}
          >
            <View style={styles.draftIconTag}>
              <Text style={styles.draftIconEmoji}>📁</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.draftHeadText}>የተቀመጡ ረቂቆች ({draftEntries.length} እቃዎች)</Text>
              <Text style={styles.draftSubText}>ጠቅላላ ዋጋ: {draftTotalPrice.toLocaleString()} ብር</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.draftToggleArrow}
            activeOpacity={0.8}
            onPress={() => setDraftExpanded(!draftExpanded)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.draftArrowSymbol}>{draftExpanded ? '▲ ዝጋ' : '▼ ክፈት'}</Text>
          </TouchableOpacity>
        </View>

        {draftExpanded && (
          <View style={styles.draftExpandedBody}>
            <View style={styles.draftItemsDivider} />

            <View style={styles.draftSelectAllRow}>
              <TouchableOpacity
                onPress={handleToggleAllDrafts}
                style={styles.selectAllBtn}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.selectAllBtnText}>
                  {selectedDraftCount === draftEntries.length ? 'ምርጫ ሰርዝ ✕' : 'ሁሉንም ምረጥ ✓'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.draftCountSelectedText}>
                የተመረጡ: {selectedDraftCount}/{draftEntries.length}
              </Text>
            </View>

            {draftEntries.map(([dKey, dItem]) => {
              const isSelected = Boolean(selectedDraftKeys[dKey]);

              return (
                <TouchableOpacity
                  key={dKey}
                  style={[styles.draftRowSingle, isSelected && styles.draftRowSelected]}
                  activeOpacity={0.7}
                  onPress={() => toggleDraftItemSelection(dKey)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View
                      pointerEvents="none"
                      style={[styles.draftCheckbox, isSelected && styles.draftCheckboxActive]}
                    >
                      {isSelected && <Text style={styles.draftCheckmark}>✓</Text>}
                    </View>

                    <View pointerEvents="none" style={styles.draftItemDetails}>
                      <Text style={styles.draftItemName} numberOfLines={1}>{dItem.name}</Text>
                      <Text style={styles.draftItemSpec}>
                        {dItem.quantity} {dItem.unit} · {(Number(dItem.price) * Number(dItem.quantity)).toLocaleString()} ብር
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            <View style={styles.draftControlButtons}>
              <TouchableOpacity
                style={[styles.draftDiscardBtn, selectedDraftCount === 0 && { opacity: 0.5 }]}
                onPress={handleDeleteSelectedDrafts}
                activeOpacity={0.75}
                disabled={selectedDraftCount === 0}
              >
                <Text style={styles.draftDiscardBtnText}>የተመረጡትን ሰርዝ 🗑️</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.draftApplyBtn, selectedDraftCount === 0 && { opacity: 0.5 }]}
                onPress={handleMoveSelectedToActiveOrder}
                activeOpacity={0.8}
                disabled={selectedDraftCount === 0}
              >
                <Text style={styles.draftApplyBtnText}>
                  ወደ ትእዛዝ ላክ ({selectedDraftCount}) ›
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.safe}>
      <View pointerEvents="none" style={styles.glowOrbA} />
      <View pointerEvents="none" style={styles.glowOrbB} />

      <View style={[styles.container, dyn.container]}>
        <View style={[styles.contentWrap, dyn.contentWrap]}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={[styles.backLink, dyn.backChip]}
              onPress={handleSafeBack}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.backText, dyn.backText]}>‹ ተመለስ</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.pageTitle, dyn.pageTitle]}>ትእዛዙን ላክ</Text>

          {cartEntries.length === 0 ? (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.emptyScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {draftSection}

              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconWrap, dyn.emptyIconWrap]}>
                  <Text style={[styles.emptyIcon, dyn.emptyIcon]}>🛒</Text>
                </View>

                <Text style={[styles.emptyTitle, dyn.emptyTitle]}>
                  {draftEntries.length > 0
                    ? 'እቃዎች በረቂቅ ውስጥ ተቀምጠዋል። ወደ ትእዛዝ ለማዛወር ከላይ ያለውን ረቂቅ ይክፈቱ።'
                    : 'ቅርጫትዎ ውስጥ ምንም እቃ የለም'}
                </Text>

                <TouchableOpacity
                  style={[styles.goShopBtn, dyn.goShopBtn]}
                  onPress={() => router.replace('/(tabs)')}
                  activeOpacity={0.8}
                >
                  <View pointerEvents="none" style={styles.btnShine} />
                  <Text style={[styles.goShopBtnText, dyn.goShopBtnText]}>
                    ወደ ገበያ ተመለስ
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={[styles.scrollContent, dyn.scrollContent]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {draftSection}

              {cartEntries.map(([key, item]) => {
                const isImageFile =
                  item.imageUrl &&
                  (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/'));

                return (
                  <View style={[styles.itemCard, dyn.itemCard]} key={key}>
                    <View pointerEvents="none" style={styles.itemAccent} />

                    <View style={styles.itemLeft}>
                      <View style={[styles.itemEmojiBox, dyn.itemEmojiBox]}>
                        {isImageFile ? (
                          <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.itemImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Text style={[styles.itemEmoji, dyn.itemEmoji]}>
                            {item.imageUrl || '📦'}
                          </Text>
                        )}
                      </View>

                      <View style={styles.itemTextWrap}>
                        <Text style={[styles.itemName, dyn.itemName]} numberOfLines={1}>
                          {item.name}
                        </Text>

                        <Text style={[styles.itemUnitSub, dyn.itemUnitSub]} numberOfLines={1}>
                          {item.unit} · {(Number(item.price) || 0).toLocaleString()} ብር
                        </Text>
                      </View>
                    </View>

                    <View style={styles.actionGroupRight}>
                      <View style={[styles.stepperContainer, dyn.stepperContainer]}>
                        <TouchableOpacity
                          style={[styles.stepBtn, dyn.stepBtn]}
                          onPress={() => updateQuantity(key, -1)}
                          activeOpacity={0.6}
                        >
                          <Text style={[styles.stepBtnText, dyn.stepBtnText]}>−</Text>
                        </TouchableOpacity>

                        <View pointerEvents="none" style={[styles.stepQtyBox, dyn.stepQtyBox]}>
                          <Text style={[styles.stepQtyText, dyn.stepQtyText]}>
                            {item.quantity}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={[styles.stepBtnPlus, dyn.stepBtn]}
                          onPress={() => updateQuantity(key, 1)}
                          activeOpacity={0.6}
                        >
                          <Text style={[styles.stepBtnTextPlus, dyn.stepBtnText]}>+</Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={styles.deleteItemBtn}
                        onPress={() => removeItem(key)}
                        activeOpacity={0.75}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.deleteItemText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

             <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: LINE, padding: 14, marginBottom: 12, ...CARD_SHADOW }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: MUTED, marginBottom: 4 }}>
                  📍 መነሻ መጋዝን: <Text style={{ fontWeight: '900', color: INK }}>መብራት ሃይል አራዳ (አዳማ)</Text>
                </Text>
                <Text style={{ fontSize: 11.5, fontWeight: '600', color: MUTED, marginBottom: 12 }}>
                  እባክዎ የመላኪያ ርቀትዎን በትክክል ለማስላት ከታች ያለውን ቁልፍ በመጫን መገኛዎን ይስጡ:
                </Text>

                <TouchableOpacity
                  style={{
                    backgroundColor: '#E4F2EA',
                    borderWidth: 1.5,
                    borderColor: '#0F7B4A',
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                    flexDirection: 'row',
                    gap: 8,
                  }}
                  onPress={handleFetchPreciseLocation}
                  activeOpacity={0.8}
                  disabled={locatingUser}
                >
                  {locatingUser ? (
                    <ActivityIndicator size="small" color="#0F7B4A" />
                  ) : (
                    <>
                      <Text style={{ fontSize: 15 }}>📌</Text>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: '#0F7B4A' }}>
                        የሱቄን መገኛ ፈልግ (ርቀት አስላ)
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <TextInput
                    style={{
                      flex: 1,
                      backgroundColor: '#F3F6F4',
                      borderWidth: 1,
                      borderColor: '#DDE4DD',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      fontSize: 14,
                      fontWeight: '900',
                      color: INK,
                    }}
                    editable={false} // <--- LOCKED: Users cannot type manually anymore! Must use GPS button.
                    value={distanceKm}
                    placeholder="ርቀት በኪ.ሜ (እባክዎ መገኛ ይፈልጉ)"
                  />
                  <Text style={{ fontSize: 13, fontWeight: '900', color: GREEN }}>ኪ.ሜ (KM)</Text>
                </View>

                <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#EEF2EE', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: MUTED }}>የመላኪያ ዋጋ (Delivery Fee):</Text>
                  <Text style={{ fontSize: 13, fontWeight: '900', color: GREEN }}>{deliveryFee.toLocaleString()} ብር</Text>
                </View>
              </View>

              <View style={[styles.sectionHeaderRow, styles.sectionHeaderRowSpaced]}>
                <View style={styles.sectionAccent} />
                <Text style={[styles.sectionHeader, dyn.sectionHeader]}>
                  የመላኪያ ሰዓት ይምረጡ
                </Text>
              </View>

              <View style={[styles.slotRow, dyn.slotRow]}>
                <TouchableOpacity
                  style={[
                    styles.slotPill,
                    dyn.slotPill,
                    slot === 'BATCH_12PM' && styles.slotPillActive,
                  ]}
                  onPress={() => setSlot('BATCH_12PM')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.slotPillText,
                      dyn.slotPillText,
                      slot === 'BATCH_12PM' && styles.slotPillTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    🌅 6:00 ሰዓት (ቀትር)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.slotPill,
                    dyn.slotPill,
                    slot === 'BATCH_6AM' && styles.slotPillActive,
                  ]}
                  onPress={() => setSlot('BATCH_6AM')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.slotPillText,
                      dyn.slotPillText,
                      slot === 'BATCH_6AM' && styles.slotPillTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    ☀️ 12:00 ሰዓት (ተዋት)
                  </Text>
                </TouchableOpacity>
              </View>

              {canOrderOnCredit && (
                <>
                  <View style={[styles.sectionHeaderRow, styles.sectionHeaderRowSpaced]}>
                    <View style={styles.sectionAccent} />
                    <Text style={[styles.sectionHeader, dyn.sectionHeader]}>
                      የክፍያ አማራጭ
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.creditOptionBox,
                      dyn.creditOptionBox,
                      isCredit && styles.creditOptionBoxActive,
                    ]}
                    onPress={() => setIsCredit(!isCredit)}
                    activeOpacity={0.85}
                  >
                    <View
                      pointerEvents="none"
                      style={[
                        styles.checkbox,
                        dyn.checkbox,
                        isCredit && styles.checkboxActive,
                      ]}
                    >
                      {isCredit && <Text style={[styles.checkMark, dyn.checkMark]}>✓</Text>}
                    </View>

                    <View pointerEvents="none" style={styles.creditTextWrap}>
                      <Text style={[styles.creditTitle, dyn.creditTitle]}>
                        በብድር ይሁን (Request on Credit)
                      </Text>
                      <Text style={[styles.creditSubtitle, dyn.creditSubtitle]}>
                        ይህ ትእዛዝ በቀጥታ ወደ ሂሳብ መዝገብ ይላካል፤ ከአስተዳዳሪው ፈቃድ እስኪሰጥ ድረስ ይጠብቃል።
                      </Text>
                    </View>

                    {isCredit && <View pointerEvents="none" style={styles.creditGlow} />}
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.scrollTailSpacer} />
            </ScrollView>
          )}
        </View>

        {cartEntries.length > 0 && (
          <View style={[styles.footer, dyn.footer]}>
            <View pointerEvents="none" style={styles.footerTopLine} />

            <View style={[styles.footerInner, dyn.contentWrap]}>
              <View style={[styles.totalRow, dyn.totalRow]}>
                <View style={styles.totalLabelWrap}>
                  <Text style={[styles.totalLabel, dyn.totalLabel]}>
                    ጠቅላላ ክፍያ ድምር (ከመላኪያ ጋር)
                  </Text>
                </View>

                <Text style={[styles.totalDigits, dyn.totalDigits]} numberOfLines={1}>
                  {finalTotalWithDelivery.toLocaleString()} ብር
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitOrderBtn,
                  dyn.submitOrderBtn,
                  isCredit && canOrderOnCredit && styles.submitOrderBtnCredit,
                  submitting && styles.submitOrderBtnBusy,
                ]}
                onPress={handleSubmitOrder}
                activeOpacity={0.85}
                disabled={submitting}
              >
                <View pointerEvents="none" style={styles.btnShine} />

                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text
                    style={[styles.submitOrderBtnText, dyn.submitOrderBtnText]}
                    numberOfLines={1}
                  >
                    {isCredit && canOrderOnCredit
                      ? `የብድር ጥያቄ ላክ (${finalTotalWithDelivery.toLocaleString()} ብር)`
                      : `ትእዛዙን ላክ (${finalTotalWithDelivery.toLocaleString()} ብር)`}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {offlinePromptVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.offlineModalCard}>
            <View style={styles.offlineIconBox}>
              <Text style={styles.offlineModalEmoji}>📡</Text>
            </View>

            <Text style={styles.offlineModalTitle}>የኢንተርኔት ግንኙነት አልተገኘም</Text>
            <Text style={styles.offlineModalMessage}>
              ስልክዎ ከኢንተርኔት ውጭ ነው። ትእዛዝዎን ለማጠናቀቅ ከታች ካሉት አማራጮች አንዱን ይምረጡ፡
            </Text>

            <View style={styles.offlineActionRow}>
              <TouchableOpacity
                style={styles.mobileDataBtn}
                onPress={handleOpenMobileDataSettings}
                activeOpacity={0.85}
              >
                <Text style={styles.mobileDataBtnText}>📶 ዳታ ክፈት (Mobile Data)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.smsDirectBtn}
                onPress={() => openSmsApplicationWithPayload(pendingSmsPayload)}
                activeOpacity={0.85}
              >
                <Text style={styles.smsDirectBtnText}>✉️ በ SMS ላክ</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelOfflineBtn}
              onPress={() => setOfflinePromptVisible(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.cancelOfflineBtnText}>ተመለስ</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() =>
          setAlertConfig((prev) => ({
            ...prev,
            visible: false,
          }))
        }
      />
    </SafeAreaView>
  );
}

const GREEN = '#0F7B4A';
const INK = '#12241A';
const MUTED = '#62726A';
const LINE = '#E6ECE7';
const SOFT = '#E4F2EA';

const CARD_SHADOW = {
  shadowColor: '#0B2A1B',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 10,
  elevation: 2,
};

const buildDynamic = (s, isTablet) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: isTablet ? 26 : 13 * s,
      paddingTop: 10 * s,
    },
    contentWrap: {
      width: '100%',
      maxWidth: isTablet ? 620 : '100%',
      alignSelf: 'center',
    },
    scrollContent: {
      paddingTop: 2,
      paddingBottom: 25,
    },
    backChip: {
      paddingHorizontal: 11 * s,
      paddingVertical: 7 * s,
      borderRadius: 11 * s,
    },
    backText: { fontSize: 12.5 * s },
    pageTitle: {
      fontSize: 21 * s,
      marginTop: 11 * s,
      marginBottom: 6 * s,
    },
    emptyIconWrap: {
      width: 62 * s,
      height: 62 * s,
      borderRadius: 22 * s,
      marginBottom: 14 * s,
    },
    emptyIcon: { fontSize: 28 * s },
    emptyTitle: { fontSize: 15 * s, marginBottom: 18 * s },
    goShopBtn: {
      paddingHorizontal: 24 * s,
      paddingVertical: 12 * s,
      borderRadius: 13 * s,
    },
    goShopBtnText: { fontSize: 13.5 * s },
    sectionHeader: { fontSize: 13 * s },
    itemCard: {
      borderRadius: 16 * s,
      padding: 11 * s,
      paddingLeft: 13 * s,
      marginBottom: 9 * s,
    },
    itemEmojiBox: {
      width: 44 * s,
      height: 44 * s,
      borderRadius: 13 * s,
      marginRight: 10 * s,
    },
    itemEmoji: { fontSize: 21 * s },
    itemName: { fontSize: 13.5 * s },
    itemUnitSub: { fontSize: 11.5 * s, marginTop: 3 * s },
    stepperContainer: { borderRadius: 11 * s },
    stepBtn: { width: 36 * s, height: 36 * s },
    stepBtnText: { fontSize: 17 * s },
    stepQtyBox: { minWidth: 28 * s },
    stepQtyText: { fontSize: 13 * s },
    slotRow: { gap: 9 * s, marginBottom: 4 },
    slotPill: {
      paddingVertical: 12 * s,
      borderRadius: 13 * s,
    },
    slotPillText: { fontSize: 12.5 * s },
    creditOptionBox: {
      borderRadius: 15 * s,
      padding: 13 * s,
    },
    checkbox: {
      width: 23 * s,
      height: 23 * s,
      borderRadius: 7 * s,
      marginRight: 11 * s,
    },
    checkMark: { fontSize: 14 * s, lineHeight: 17 * s },
    creditTitle: { fontSize: 13.5 * s },
    creditSubtitle: { fontSize: 11 * s, lineHeight: 15.5 * s, marginTop: 3 * s },
    footer: {
      paddingTop: 11 * s,
      paddingBottom: Platform.OS === 'ios' ? 12 * s : 13 * s,
      paddingHorizontal: isTablet ? 26 : 13 * s,
    },
    totalRow: {
      borderRadius: 15 * s,
      paddingVertical: 11 * s,
      paddingHorizontal: 13 * s,
      marginBottom: 10 * s,
    },
    totalLabel: { fontSize: 13 * s },
    totalDigits: { fontSize: 19 * s },
    submitOrderBtn: {
      height: 52 * s,
      borderRadius: 15 * s,
    },
    submitOrderBtnText: { fontSize: 14.5 * s },
  });

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7F3',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderCard: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LINE,
    justifyContent: 'center',
    alignItems: 'center',
    ...CARD_SHADOW,
  },
  glowOrbA: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(15, 123, 74, 0.10)',
  },
  glowOrbB: {
    position: 'absolute',
    bottom: -90,
    left: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(242, 183, 5, 0.09)',
  },
  container: {
    flex: 1,
  },
  contentWrap: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backLink: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF6F0',
    borderWidth: 1,
    borderColor: '#DCEAE1',
  },
  backText: {
    color: GREEN,
    fontWeight: '800',
  },
  pageTitle: {
    fontWeight: '900',
    color: INK,
    letterSpacing: 0.2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 2,
  },
  emptyScrollContent: {
    flexGrow: 1,
    paddingTop: 2,
    paddingBottom: 25,
  },
  scrollTailSpacer: {
    height: 12,
  },
  draftCardMaster: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#FDE68A',
    marginBottom: 12,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  draftToggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  draftLeftTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },
  draftIconTag: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  draftIconEmoji: {
    fontSize: 16,
  },
  draftHeadText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#92400E',
  },
  draftSubText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#B45309',
  },
  draftToggleArrow: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  draftArrowSymbol: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#92400E',
  },
  draftExpandedBody: {
    paddingHorizontal: 13,
    paddingBottom: 11,
  },
  draftItemsDivider: {
    height: 1,
    backgroundColor: '#FDE68A',
    marginBottom: 8,
  },
  draftSelectAllRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectAllBtn: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  selectAllBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#92400E',
  },
  draftCountSelectedText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#B45309',
  },
  draftRowSingle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  draftRowSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F59E0B',
  },
  draftCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.8,
    borderColor: '#D97706',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },
  draftCheckboxActive: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  draftCheckmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 14,
  },
  draftItemDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  draftItemName: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#78350F',
    flex: 1,
  },
  draftItemSpec: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    marginLeft: 6,
  },
  draftControlButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  draftDiscardBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  draftDiscardBtnText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '900',
  },
  draftApplyBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: '#D97706',
    justifyContent: 'center',
    alignItems: 'center',
  },
  draftApplyBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '900',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 70,
    paddingHorizontal: 20,
  },
  emptyIconWrap: {
    backgroundColor: SOFT,
    borderWidth: 1,
    borderColor: '#CFE7D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontWeight: '800',
    color: MUTED,
    textAlign: 'center',
    lineHeight: 21,
  },
  goShopBtn: {
    backgroundColor: GREEN,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3FD08A',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  goShopBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  btnShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 9,
  },
  sectionHeaderRowSpaced: {
    marginTop: 16,
  },
  sectionAccent: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: GREEN,
  },
  sectionHeader: {
    fontWeight: '900',
    color: INK,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: LINE,
    overflow: 'hidden',
    gap: 8,
    ...CARD_SHADOW,
  },
  itemAccent: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(15, 123, 74, 0.35)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  itemEmojiBox: {
    backgroundColor: SOFT,
    borderWidth: 1,
    borderColor: '#D6EBE0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontWeight: '800',
    color: INK,
  },
  itemUnitSub: {
    color: MUTED,
    fontWeight: '600',
  },
  actionGroupRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDE4DD',
    backgroundColor: '#FBFCFB',
    overflow: 'hidden',
    flexShrink: 0,
  },
  stepBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  stepBtnPlus: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SOFT,
  },
  stepBtnText: {
    fontWeight: '800',
    color: INK,
    marginTop: -1,
  },
  stepBtnTextPlus: {
    fontWeight: '900',
    color: GREEN,
    marginTop: -1,
  },
  stepQtyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: '#EDF2EE',
    borderRightColor: '#EDF2EE',
    paddingVertical: 4,
  },
  stepQtyText: {
    fontWeight: '900',
    color: INK,
  },
  deleteItemBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteItemText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '900',
  },
  slotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  slotPill: {
    flex: 1,
    minWidth: 130,
    borderWidth: 1.2,
    borderColor: '#DDE4DD',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
  },
  slotPillActive: {
    borderColor: GREEN,
    backgroundColor: SOFT,
    borderWidth: 1.6,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  slotPillText: {
    fontWeight: '800',
    color: MUTED,
    textAlign: 'center',
  },
  slotPillTextActive: {
    color: GREEN,
    fontWeight: '900',
  },
  creditOptionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#DDE4DD',
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  creditOptionBoxActive: {
    borderColor: GREEN,
    backgroundColor: '#F2FAF5',
    borderWidth: 1.6,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },
  creditGlow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(15, 123, 74, 0.10)',
  },
  checkbox: {
    borderWidth: 2,
    borderColor: '#8DA396',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: GREEN,
    backgroundColor: GREEN,
  },
  checkMark: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  creditTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  creditTitle: {
    fontWeight: '900',
    color: INK,
  },
  creditSubtitle: {
    color: MUTED,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopWidth: 1,
    borderTopColor: LINE,
    shadowColor: '#0B2A1B',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 10,
  },
  footerTopLine: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1.5,
    backgroundColor: 'rgba(63, 208, 138, 0.45)',
  },
  footerInner: {
    width: '100%',
    alignSelf: 'center',
  },
  totalRow: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LINE,
    gap: 10,
    ...CARD_SHADOW,
  },
  totalLabelWrap: {
    flexShrink: 1,
  },
  totalLabel: {
    fontWeight: '800',
    color: INK,
  },
  totalDigits: {
    fontWeight: '900',
    color: GREEN,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  submitOrderBtn: {
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3FD08A',
    paddingHorizontal: 12,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitOrderBtnCredit: {
    backgroundColor: '#1B4D3E',
    borderColor: '#3E7A66',
    shadowColor: '#1B4D3E',
  },
  submitOrderBtnBusy: {
    opacity: 0.85,
  },
  submitOrderBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 31, 20, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    elevation: 100,
    paddingHorizontal: 20,
  },
  offlineModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  offlineIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  offlineModalEmoji: {
    fontSize: 28,
  },
  offlineModalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#12241A',
    textAlign: 'center',
    marginBottom: 6,
  },
  offlineModalMessage: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#62726A',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  offlineActionRow: {
    width: '100%',
    gap: 9,
  },
  mobileDataBtn: {
    backgroundColor: GREEN,
    paddingVertical: 12,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  mobileDataBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  smsDirectBtn: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smsDirectBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  cancelOfflineBtn: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  cancelOfflineBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
});