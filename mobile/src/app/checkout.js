
// import React, { useCallback, useMemo, useState } from 'react';
// import {
//   ActivityIndicator,
//   Image,
//   Linking,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
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

// const ADMIN_DESTINATION_PHONE = '+251911000000';

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

//   const [slot, setSlot] = useState('BATCH_12PM');
//   const [isCredit, setIsCredit] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [loadingCart, setLoadingCart] = useState(true);

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

//   const loadUserData = async () => {
//     try {
//       if (token) {
//         const res = await apiRequest('/auth/me', { token }).catch(() => null);
//         const userData = res?.user || res?.data;
//         if (userData && typeof userData.canOrderOnCredit !== 'undefined') {
//           const eligible = Boolean(userData.canOrderOnCredit);
//           setCanOrderOnCredit(eligible);
//           await AsyncStorage.setItem('user_credit_eligible', eligible ? '1' : '0');
//           return;
//         }
//       }

//       const cachedEligible = await AsyncStorage.getItem('user_credit_eligible').catch(() => null);
//       if (cachedEligible !== null) {
//         setCanOrderOnCredit(cachedEligible === '1');
//         return;
//       }

//       const storedUser = await AsyncStorage.getItem('user_data').catch(() => null);
//       if (storedUser) {
//         const parsed = JSON.parse(storedUser);
//         setCanOrderOnCredit(Boolean(parsed?.canOrderOnCredit));
//       }
//     } catch {
//       setCanOrderOnCredit(false);
//     }
//   };

//   const loadStorageCarts = async () => {
//     try {
//       const [storedCart, storedDrafts] = await Promise.all([
//         AsyncStorage.getItem('user_cart'),
//         AsyncStorage.getItem('user_draft_cart'),
//       ]);

//       const parsedCart = storedCart ? JSON.parse(storedCart) : {};
//       const parsedDrafts = storedDrafts ? JSON.parse(storedDrafts) : {};

//       setCart(parsedCart);
//       setDrafts(parsedDrafts);

//       // Initialize all draft items as unselected by default so user intentionally selects what to send
//       const initialSelected = {};
//       Object.keys(parsedDrafts).forEach((k) => {
//         initialSelected[k] = false;
//       });
//       setSelectedDraftKeys(initialSelected);

//       // Open draft accordion automatically if arriving from "ረቂቅ" action
//       if (params?.isDraft === 'true' || Object.keys(parsedCart).length === 0) {
//         setDraftExpanded(true);
//       }
//     } catch {
//       setCart({});
//       setDrafts({});
//     } finally {
//       setLoadingCart(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadStorageCarts();
//       loadUserData();
//     }, [token])
//   );

//   const updateQuantity = async (key, delta) => {
//     const updated = { ...cart };
//     if (!updated[key]) return;

//     const nextQty = (updated[key].quantity || 0) + delta;

//     if (nextQty <= 0) {
//       delete updated[key];
//     } else {
//       updated[key] = {
//         ...updated[key],
//         quantity: nextQty,
//       };
//     }

//     setCart(updated);
//     await AsyncStorage.setItem('user_cart', JSON.stringify(updated));
//   };

//   const removeItem = async (key) => {
//     const updated = { ...cart };
//     delete updated[key];
//     setCart(updated);
//     await AsyncStorage.setItem('user_cart', JSON.stringify(updated));
//   };

//   // Check / Uncheck draft row
//   const toggleDraftItemSelection = (key) => {
//     setSelectedDraftKeys((prev) => ({
//       ...prev,
//       [key]: !prev[key],
//     }));
//   };

//   // Select all or deselect all drafts
//   const handleToggleAllDrafts = () => {
//     const allSelected = Object.keys(drafts).every((k) => selectedDraftKeys[k]);
//     const nextState = {};
//     Object.keys(drafts).forEach((k) => {
//       nextState[k] = !allSelected;
//     });
//     setSelectedDraftKeys(nextState);
//   };

//   // Move ONLY selected draft items into active order list (Unselected items stay in Draft)
//   const handleMoveSelectedToActiveOrder = async () => {
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

//     await AsyncStorage.setItem('user_cart', JSON.stringify(mergedCart));
//     await AsyncStorage.setItem('user_draft_cart', JSON.stringify(remainingDrafts));

//     // Clear selections for remaining items
//     const nextSelected = {};
//     Object.keys(remainingDrafts).forEach((k) => {
//       nextSelected[k] = false;
//     });
//     setSelectedDraftKeys(nextSelected);

//     setAlertConfig({
//       visible: true,
//       title: 'እቃዎች ተዛውረዋል',
//       message: `የተመረጡት ${keysToMove.length} እቃዎች ወደ ትእዛዝ ዝርዝር ገብተዋል። ያልተመረጡት በረቂቅ ውስጥ ቀርተዋል።`,
//       type: 'success',
//     });
//   };

//   // Permanently delete ONLY selected draft items
//   const handleDeleteSelectedDrafts = async () => {
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
//     await AsyncStorage.setItem('user_draft_cart', JSON.stringify(remainingDrafts));

//     const nextSelected = {};
//     Object.keys(remainingDrafts).forEach((k) => {
//       nextSelected[k] = false;
//     });
//     setSelectedDraftKeys(nextSelected);

//     setAlertConfig({
//       visible: true,
//       title: 'ተሰርዟል',
//       message: `${keysToDelete.length} እቃዎች ከረቂቅ ተሰርዘዋል`,
//       type: 'success',
//     });
//   };

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

//   const draftTotalPrice = draftEntries.reduce(
//     (sum, [_, item]) =>
//       sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
//     0
//   );

//   const selectedDraftCount = Object.keys(drafts).filter((k) => selectedDraftKeys[k]).length;

//   const generateSmsOrderText = (loc) => {
//     if (cartEntries.length === 0) return '';
//     const itemChunks = cartEntries.map(([_, it]) => {
//       const pId = it.productId || 'PROD';
//       const qty = Math.max(1, Math.round(Number(it.quantity) || 1));
//       const u = UNIT_MAP[it.unit] || 'CARTON';
//       return `${pId}:${qty}:${u}`;
//     });
//     const creditFlag = isCredit && canOrderOnCredit ? '1' : '0';
//     const locPart = loc?.latitude ? `#LOC:${loc.latitude},${loc.longitude}` : '';
//     return `ORD#${itemChunks.join('|')}#${slot}#${creditFlag}${locPart}`;
//   };

//   const acquireAccurateGps = async () => {
//     try {
//       if (Platform.OS === 'web') {
//         return new Promise((resolve) => {
//           if (typeof navigator !== 'undefined' && navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//               (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
//               () => resolve({ latitude: null, longitude: null }),
//               { timeout: 5000 }
//             );
//           } else {
//             resolve({ latitude: null, longitude: null });
//           }
//         });
//       }

//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') return { latitude: null, longitude: null };

//       const location = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Balanced,
//       });

//       return {
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//       };
//     } catch {
//       return { latitude: null, longitude: null };
//     }
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
//     const gpsLocation = await acquireAccurateGps();

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

//       // Clear only the submitted cart. Unselected drafts stay untouched!
//       await AsyncStorage.removeItem('user_cart');
//       setCart({});

//       if (isCredit && canOrderOnCredit) {
//         router.replace('/(tabs)/ledger');
//       } else {
//         router.replace({
//           pathname: '/confirmation',
//           params: {
//             orderNumber,
//             deliveryTime: slotTimeText,
//             orderLang: lang || 'am',
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
//             >
//               <Text style={[styles.backText, dyn.backText]}>‹ ተመለስ</Text>
//             </TouchableOpacity>
//           </View>

//           <Text style={[styles.pageTitle, dyn.pageTitle]}>ትእዛዙን ላክ</Text>

//           {/* DRAFT ACCORDION PANEL */}
//           {draftEntries.length > 0 && (
//             <View style={styles.draftCardMaster}>
//               <TouchableOpacity
//                 style={styles.draftToggleHeader}
//                 activeOpacity={0.8}
//                 onPress={() => setDraftExpanded(!draftExpanded)}
//               >
//                 <View style={styles.draftLeftTitle}>
//                   <View style={styles.draftIconTag}>
//                     <Text style={styles.draftIconEmoji}>📁</Text>
//                   </View>
//                   <View>
//                     <Text style={styles.draftHeadText}>የተቀመጡ ረቂቆች ({draftEntries.length} እቃዎች)</Text>
//                     <Text style={styles.draftSubText}>ጠቅላላ ዋጋ: {draftTotalPrice.toLocaleString()} ብር</Text>
//                   </View>
//                 </View>

//                 <View style={styles.draftToggleArrow}>
//                   <Text style={styles.draftArrowSymbol}>{draftExpanded ? '▲ ዝጋ' : '▼ ክፈት'}</Text>
//                 </View>
//               </TouchableOpacity>

//               {draftExpanded && (
//                 <View style={styles.draftExpandedBody}>
//                   <View style={styles.draftItemsDivider} />

//                   <View style={styles.draftSelectAllRow}>
//                     <TouchableOpacity onPress={handleToggleAllDrafts} style={styles.selectAllBtn}>
//                       <Text style={styles.selectAllBtnText}>
//                         {selectedDraftCount === draftEntries.length ? 'ምርጫ ሰርዝ ✕' : 'ሁሉንም ምረጥ ✓'}
//                       </Text>
//                     </TouchableOpacity>
//                     <Text style={styles.draftCountSelectedText}>የተመረጡ: {selectedDraftCount}/{draftEntries.length}</Text>
//                   </View>

//                   {draftEntries.map(([dKey, dItem]) => {
//                     const isSelected = Boolean(selectedDraftKeys[dKey]);

//                     return (
//                       <TouchableOpacity
//                         key={dKey}
//                         style={[styles.draftRowSingle, isSelected && styles.draftRowSelected]}
//                         activeOpacity={0.8}
//                         onPress={() => toggleDraftItemSelection(dKey)}
//                       >
//                         <View style={[styles.draftCheckbox, isSelected && styles.draftCheckboxActive]}>
//                           {isSelected && <Text style={styles.draftCheckmark}>✓</Text>}
//                         </View>

//                         <View style={styles.draftItemDetails}>
//                           <Text style={styles.draftItemName} numberOfLines={1}>{dItem.name}</Text>
//                           <Text style={styles.draftItemSpec}>
//                             {dItem.quantity} {dItem.unit} · {(Number(dItem.price) * Number(dItem.quantity)).toLocaleString()} ብር
//                           </Text>
//                         </View>
//                       </TouchableOpacity>
//                     );
//                   })}

//                   <View style={styles.draftControlButtons}>
//                     <TouchableOpacity
//                       style={[styles.draftDiscardBtn, selectedDraftCount === 0 && { opacity: 0.5 }]}
//                       onPress={handleDeleteSelectedDrafts}
//                       activeOpacity={0.75}
//                       disabled={selectedDraftCount === 0}
//                     >
//                       <Text style={styles.draftDiscardBtnText}>የተመረጡትን ሰርዝ 🗑️</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                       style={[styles.draftApplyBtn, selectedDraftCount === 0 && { opacity: 0.5 }]}
//                       onPress={handleMoveSelectedToActiveOrder}
//                       activeOpacity={0.8}
//                       disabled={selectedDraftCount === 0}
//                     >
//                       <Text style={styles.draftApplyBtnText}>
//                         ወደ ትእዛዝ ላክ ({selectedDraftCount}) ›
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               )}
//             </View>
//           )}

//           {cartEntries.length === 0 ? (
//             <View style={styles.emptyContainer}>
//               <View style={[styles.emptyIconWrap, dyn.emptyIconWrap]}>
//                 <Text style={[styles.emptyIcon, dyn.emptyIcon]}>🛒</Text>
//               </View>

//               <Text style={[styles.emptyTitle, dyn.emptyTitle]}>
//                 {draftEntries.length > 0
//                   ? 'እቃዎች በረቂቅ ውስጥ ተቀምጠዋል። ወደ ትእዛዝ ለማዛወር ከላይ ያለውን ረቂቅ ይክፈቱ።'
//                   : 'ቅርጫትዎ ውስጥ ምንም እቃ የለም'}
//               </Text>

//               <TouchableOpacity
//                 style={[styles.goShopBtn, dyn.goShopBtn]}
//                 onPress={() => router.replace('/(tabs)')}
//                 activeOpacity={0.8}
//               >
//                 <View pointerEvents="none" style={styles.btnShine} />
//                 <Text style={[styles.goShopBtnText, dyn.goShopBtnText]}>
//                   ወደ ገበያ ተመለስ
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <ScrollView
//               style={styles.scroll}
//               contentContainerStyle={[styles.scrollContent, dyn.scrollContent]}
//               showsVerticalScrollIndicator={false}
//             >
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

//                         <View style={[styles.stepQtyBox, dyn.stepQtyBox]}>
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

//               {/* RETAILER CREDIT CHECKBOX */}
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
//                       style={[
//                         styles.checkbox,
//                         dyn.checkbox,
//                         isCredit && styles.checkboxActive,
//                       ]}
//                     >
//                       {isCredit && <Text style={[styles.checkMark, dyn.checkMark]}>✓</Text>}
//                     </View>

//                     <View style={styles.creditTextWrap}>
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
//                     ጠቅላላ ክፍያ ድምር
//                   </Text>
//                 </View>

//                 <Text style={[styles.totalDigits, dyn.totalDigits]} numberOfLines={1}>
//                   {totalPrice.toLocaleString()} ብር
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
//                       ? `የብድር ጥያቄ ላክ (${totalPrice.toLocaleString()} ብር)`
//                       : `ትእዛዙን ላክ (${totalPrice.toLocaleString()} ብር)`}
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       </View>

//       {/* OFFLINE PROMPT MODAL */}
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
//     stepBtn: { width: 31 * s, height: 31 * s },
//     stepBtnText: { fontSize: 16 * s },
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
//   scrollTailSpacer: {
//     height: 12,
//   },

//   /* Draft Stored Master Card */
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
//     paddingVertical: 6,
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
//     paddingVertical: 7,
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
//     paddingVertical: 7,
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
//     width: 27,
//     height: 27,
//     borderRadius: 14,
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
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
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

  const [slot, setSlot] = useState('BATCH_12PM');
  const [isCredit, setIsCredit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCart, setLoadingCart] = useState(true);

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

  const loadUserData = async () => {
    try {
      if (token) {
        const res = await apiRequest('/auth/me', { token }).catch(() => null);
        const userData = res?.user || res?.data;
        if (userData && typeof userData.canOrderOnCredit !== 'undefined') {
          const eligible = Boolean(userData.canOrderOnCredit);
          setCanOrderOnCredit(eligible);
          await AsyncStorage.setItem('user_credit_eligible', eligible ? '1' : '0');
          return;
        }
      }

      const cachedEligible = await AsyncStorage.getItem('user_credit_eligible').catch(() => null);
      if (cachedEligible !== null) {
        setCanOrderOnCredit(cachedEligible === '1');
        return;
      }

      const storedUser = await AsyncStorage.getItem('user_data').catch(() => null);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setCanOrderOnCredit(Boolean(parsed?.canOrderOnCredit));
      }
    } catch {
      setCanOrderOnCredit(false);
    }
  };

  const loadStorageCarts = async () => {
    try {
      const [storedCart, storedDrafts] = await Promise.all([
        AsyncStorage.getItem('user_cart'),
        AsyncStorage.getItem('user_draft_cart'),
      ]);

      const parsedCart = storedCart ? JSON.parse(storedCart) : {};
      const parsedDrafts = storedDrafts ? JSON.parse(storedDrafts) : {};

      setCart(parsedCart);
      setDrafts(parsedDrafts);

      const initialSelected = {};
      Object.keys(parsedDrafts).forEach((k) => {
        initialSelected[k] = false;
      });
      setSelectedDraftKeys(initialSelected);

      if (params?.isDraft === 'true' || Object.keys(parsedCart).length === 0) {
        setDraftExpanded(true);
      }
    } catch {
      setCart({});
      setDrafts({});
    } finally {
      setLoadingCart(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStorageCarts();
      loadUserData();
    }, [token])
  );

  const updateQuantity = async (key, delta) => {
    const updated = { ...cart };
    if (!updated[key]) return;

    const nextQty = (updated[key].quantity || 0) + delta;

    if (nextQty <= 0) {
      delete updated[key];
    } else {
      updated[key] = {
        ...updated[key],
        quantity: nextQty,
      };
    }

    setCart(updated);
    await AsyncStorage.setItem('user_cart', JSON.stringify(updated));
  };

  const removeItem = async (key) => {
    const updated = { ...cart };
    delete updated[key];
    setCart(updated);
    await AsyncStorage.setItem('user_cart', JSON.stringify(updated));
  };

  const toggleDraftItemSelection = (key) => {
    setSelectedDraftKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleAllDrafts = () => {
    const allSelected = Object.keys(drafts).every((k) => selectedDraftKeys[k]);
    const nextState = {};
    Object.keys(drafts).forEach((k) => {
      nextState[k] = !allSelected;
    });
    setSelectedDraftKeys(nextState);
  };

  const handleMoveSelectedToActiveOrder = async () => {
    const keysToMove = Object.keys(drafts).filter((k) => selectedDraftKeys[k]);

    if (keysToMove.length === 0) {
      setAlertConfig({
        visible: true,
        title: 'እቃ አልተመረጠም',
        message: 'እባክዎ ወደ ትእዛዝ ዝርዝር የሚዛወሩትን እቃዎች በሳጥኑ (checkbox) ላይ ይምረጡ',
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

    await AsyncStorage.setItem('user_cart', JSON.stringify(mergedCart));
    await AsyncStorage.setItem('user_draft_cart', JSON.stringify(remainingDrafts));

    const nextSelected = {};
    Object.keys(remainingDrafts).forEach((k) => {
      nextSelected[k] = false;
    });
    setSelectedDraftKeys(nextSelected);

    setAlertConfig({
      visible: true,
      title: 'እቃዎች ተዛውረዋል',
      message: `የተመረጡት ${keysToMove.length} እቃዎች ወደ ትእዛዝ ዝርዝር ገብተዋል። ያልተመረጡት በረቂቅ ውስጥ ቀርተዋል።`,
      type: 'success',
    });
  };

  const handleDeleteSelectedDrafts = async () => {
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
    await AsyncStorage.setItem('user_draft_cart', JSON.stringify(remainingDrafts));

    const nextSelected = {};
    Object.keys(remainingDrafts).forEach((k) => {
      nextSelected[k] = false;
    });
    setSelectedDraftKeys(nextSelected);

    setAlertConfig({
      visible: true,
      title: 'ተሰርዟል',
      message: `${keysToDelete.length} እቃዎች ከረቂቅ ተሰርዘዋል`,
      type: 'success',
    });
  };

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

  const draftTotalPrice = draftEntries.reduce(
    (sum, [_, item]) =>
      sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );

  const selectedDraftCount = Object.keys(drafts).filter((k) => selectedDraftKeys[k]).length;

  // Perfect Amharic descriptive SMS payload format
  const generateSmsOrderText = (loc) => {
    if (cartEntries.length === 0) return '';
    
    const itemsListAmharic = cartEntries.map(([_, it], index) => {
      const name = it.name || 'እቃ';
      const qty = Math.max(1, Math.round(Number(it.quantity) || 1));
      const unit = it.unit || 'ካርቶን';
      const subTotal = ((Number(it.price) || 0) * qty).toLocaleString();
      return `${index + 1}. ${name} - ብዛት: ${qty} ${unit} (ዋጋ: ${subTotal} ብር)`;
    }).join('\n');

    const slotTimeText = slot === 'BATCH_6AM' ? 'ጠዋት 6:00 ሰዓት' : 'ቀትር 12:00 ሰዓት';
    const creditStatusText = isCredit && canOrderOnCredit ? 'በብድር (Credit Order)' : 'ጥሬ ገንዘብ (Cash)';
    const locPart = loc?.latitude ? `\nመገኛ (GPS): ${loc.latitude},${loc.longitude}` : '';

    return `ሰላም! አዲስ የትእዛዝ ጥያቄ ከቅናሽ ገበያ መተግበሪያ:\n\nየተመረጡ እቃዎች:\n${itemsListAmharic}\n\nጠቅላላ ድምር: ${totalPrice.toLocaleString()} ብር\nየመላኪያ ሰዓት: ${slotTimeText}\nየክፍያ ሁኔታ: ${creditStatusText}${locPart}`;
  };

  const acquireAccurateGps = async () => {
    try {
      if (Platform.OS === 'web') {
        return new Promise((resolve) => {
          if (typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
              () => resolve({ latitude: null, longitude: null }),
              { timeout: 5000 }
            );
          } else {
            resolve({ latitude: null, longitude: null });
          }
        });
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return { latitude: null, longitude: null };

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch {
      return { latitude: null, longitude: null };
    }
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
    const gpsLocation = await acquireAccurateGps();

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

      await AsyncStorage.removeItem('user_cart');
      setCart({});

      if (isCredit && canOrderOnCredit) {
        router.replace('/(tabs)/ledger');
      } else {
        router.replace({
          pathname: '/confirmation',
          params: {
            orderNumber,
            deliveryTime: slotTimeText,
            orderLang: lang || 'am',
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
            >
              <Text style={[styles.backText, dyn.backText]}>‹ ተመለስ</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.pageTitle, dyn.pageTitle]}>ትእዛዙን ላክ</Text>

          {draftEntries.length > 0 && (
            <View style={styles.draftCardMaster}>
              <TouchableOpacity
                style={styles.draftToggleHeader}
                activeOpacity={0.8}
                onPress={() => setDraftExpanded(!draftExpanded)}
              >
                <View style={styles.draftLeftTitle}>
                  <View style={styles.draftIconTag}>
                    <Text style={styles.draftIconEmoji}>📁</Text>
                  </View>
                  <View>
                    <Text style={styles.draftHeadText}>የተቀመጡ ረቂቆች ({draftEntries.length} እቃዎች)</Text>
                    <Text style={styles.draftSubText}>ጠቅላላ ዋጋ: {draftTotalPrice.toLocaleString()} ብር</Text>
                  </View>
                </View>

                <View style={styles.draftToggleArrow}>
                  <Text style={styles.draftArrowSymbol}>{draftExpanded ? '▲ ዝጋ' : '▼ ክፈት'}</Text>
                </View>
              </TouchableOpacity>

              {draftExpanded && (
                <View style={styles.draftExpandedBody}>
                  <View style={styles.draftItemsDivider} />

                  <View style={styles.draftSelectAllRow}>
                    <TouchableOpacity onPress={handleToggleAllDrafts} style={styles.selectAllBtn}>
                      <Text style={styles.selectAllBtnText}>
                        {selectedDraftCount === draftEntries.length ? 'ምርጫ ሰርዝ ✕' : 'ሁሉንም ምረጥ ✓'}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.draftCountSelectedText}>የተመረጡ: {selectedDraftCount}/{draftEntries.length}</Text>
                  </View>

                  {draftEntries.map(([dKey, dItem]) => {
                    const isSelected = Boolean(selectedDraftKeys[dKey]);

                    return (
                      <TouchableOpacity
                        key={dKey}
                        style={[styles.draftRowSingle, isSelected && styles.draftRowSelected]}
                        activeOpacity={0.8}
                        onPress={() => toggleDraftItemSelection(dKey)}
                      >
                        <View style={[styles.draftCheckbox, isSelected && styles.draftCheckboxActive]}>
                          {isSelected && <Text style={styles.draftCheckmark}>✓</Text>}
                        </View>

                        <View style={styles.draftItemDetails}>
                          <Text style={styles.draftItemName} numberOfLines={1}>{dItem.name}</Text>
                          <Text style={styles.draftItemSpec}>
                            {dItem.quantity} {dItem.unit} · {(Number(dItem.price) * Number(dItem.quantity)).toLocaleString()} ብር
                          </Text>
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
          )}

          {cartEntries.length === 0 ? (
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
          ) : (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={[styles.scrollContent, dyn.scrollContent]}
              showsVerticalScrollIndicator={false}
            >
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

                        <View style={[styles.stepQtyBox, dyn.stepQtyBox]}>
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
                      style={[
                        styles.checkbox,
                        dyn.checkbox,
                        isCredit && styles.checkboxActive,
                      ]}
                    >
                      {isCredit && <Text style={[styles.checkMark, dyn.checkMark]}>✓</Text>}
                    </View>

                    <View style={styles.creditTextWrap}>
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
                    ጠቅላላ ክፍያ ድምር
                  </Text>
                </View>

                <Text style={[styles.totalDigits, dyn.totalDigits]} numberOfLines={1}>
                  {totalPrice.toLocaleString()} ብር
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
                      ? `የብድር ጥያቄ ላክ (${totalPrice.toLocaleString()} ብር)`
                      : `ትእዛዙን ላክ (${totalPrice.toLocaleString()} ብር)`}
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
    stepBtn: { width: 31 * s, height: 31 * s },
    stepBtnText: { fontSize: 16 * s },
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
    paddingVertical: 6,
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
    paddingVertical: 7,
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
    paddingVertical: 7,
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
    width: 27,
    height: 27,
    borderRadius: 14,
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