

// import React, { useCallback, useMemo, useState } from 'react';
// import {
//   ActivityIndicator,
//   Image,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   useWindowDimensions,
// } from 'react-native';
// import { useFocusEffect, useRouter } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { apiRequest } from '../lib/api';
// import { useSession } from '../context/SessionContext';
// import CustomAlert from '../components/CustomAlert';

// const UNIT_MAP = {
//   'ካርቶን': 'CARTON',
//   'ግማሽ': 'HALF_CARTON',
//   'ግማሽ ካርቶን': 'HALF_CARTON',
//   'ፓኬት': 'PACK',
//   'ደርዘን': 'DOZEN',
//   'ኪሎ': 'KG',
//   'ኩንታል': 'QUINTAL',
//   'ቁራጭ': 'PIECE',
//   'መረብ': 'MEREB',
//   CARTON: 'CARTON',
//   HALF_CARTON: 'HALF_CARTON',
//   PACK: 'PACK',
//   DOZEN: 'DOZEN',
//   KG: 'KG',
//   QUINTAL: 'QUINTAL',
//   PIECE: 'PIECE',
//   MEREB: 'MEREB',
// };

// export default function CheckoutScreen() {
//   const router = useRouter();
//   const { token, lang } = useSession();
//   const { width: SCREEN_W } = useWindowDimensions();

//   const [cart, setCart] = useState({});
//   const [slot, setSlot] = useState('BATCH_12PM');
//   const [isCredit, setIsCredit] = useState(false); // Credit option state
//   const [submitting, setSubmitting] = useState(false);
//   const [loadingCart, setLoadingCart] = useState(true);

//   const [alertConfig, setAlertConfig] = useState({
//     visible: false,
//     title: '',
//     message: '',
//     type: 'error',
//   });

//   // ---- Adaptive layout metrics (UI only) ----
//   const isSmall = SCREEN_W < 350;
//   const isTablet = SCREEN_W >= 680;
//   const S = isSmall ? 0.9 : isTablet ? 1.12 : SCREEN_W >= 420 ? 1.06 : 1;
//   const dyn = useMemo(() => buildDynamic(S, isTablet), [S, isTablet]);

//   const loadCartFromStorage = async () => {
//     try {
//       const stored = await AsyncStorage.getItem('user_cart');
//       if (stored) {
//         setCart(JSON.parse(stored));
//       } else {
//         setCart({});
//       }
//     } catch (err) {
//       console.log('Checkout loadCart error:', err);
//       setCart({});
//     } finally {
//       setLoadingCart(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadCartFromStorage();
//     }, [])
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

//   const handleSafeBack = () => {
//     if (router.canGoBack()) {
//       router.back();
//     } else {
//       router.replace('/(tabs)');
//     }
//   };

//   const cartEntries = Object.entries(cart);

//   const totalPrice = cartEntries.reduce(
//     (sum, [_, item]) =>
//       sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
//     0
//   );

//   const handleSubmitOrder = async () => {
//     if (cartEntries.length === 0) {
//       setAlertConfig({
//         visible: true,
//         title: 'ቅርጫት ባዶ ነው',
//         message: 'እባክዎ መጀመሪያ እቃ ይምረጡ',
//         type: 'error',
//       });
//       return;
//     }

//     setSubmitting(true);

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
//           isCreditOrder: isCredit,
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

//       // Clear local storage cart
//       await AsyncStorage.removeItem('user_cart');
//       setCart({});

//       // If requested on Credit, route directly to Ledger tab; else go to confirmation
//       if (isCredit) {
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
//           {/* ---------- HEADER ---------- */}
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

//           {cartEntries.length === 0 ? (
//             <View style={styles.emptyContainer}>
//               <View style={[styles.emptyIconWrap, dyn.emptyIconWrap]}>
//                 <Text style={[styles.emptyIcon, dyn.emptyIcon]}>🛒</Text>
//               </View>

//               <Text style={[styles.emptyTitle, dyn.emptyTitle]}>
//                 ቅርጫትዎ ውስጥ ምንም እቃ የለም
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
//               {/* ---------- Cart Items List ---------- */}
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

//                     <View style={[styles.stepperContainer, dyn.stepperContainer]}>
//                       <TouchableOpacity
//                         style={[styles.stepBtn, dyn.stepBtn]}
//                         onPress={() => updateQuantity(key, -1)}
//                         activeOpacity={0.6}
//                       >
//                         <Text style={[styles.stepBtnText, dyn.stepBtnText]}>−</Text>
//                       </TouchableOpacity>

//                       <View style={[styles.stepQtyBox, dyn.stepQtyBox]}>
//                         <Text style={[styles.stepQtyText, dyn.stepQtyText]}>
//                           {item.quantity}
//                         </Text>
//                       </View>

//                       <TouchableOpacity
//                         style={[styles.stepBtnPlus, dyn.stepBtn]}
//                         onPress={() => updateQuantity(key, 1)}
//                         activeOpacity={0.6}
//                       >
//                         <Text style={[styles.stepBtnTextPlus, dyn.stepBtnText]}>+</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 );
//               })}

//               {/* ---------- Delivery Slot Selection ---------- */}
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
//                     🌅 6:00 ሰዓት (ጠዋት)
//                   </Text>
//                 </TouchableOpacity>

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
//                     ☀️ 12:00 ሰዓት (ቀትር)
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               {/* ---------- Credit Request Option ---------- */}
//               <View style={[styles.sectionHeaderRow, styles.sectionHeaderRowSpaced]}>
//                 <View style={styles.sectionAccent} />
//                 <Text style={[styles.sectionHeader, dyn.sectionHeader]}>
//                   የክፍያ አማራጭ
//                 </Text>
//               </View>

//               <TouchableOpacity
//                 style={[
//                   styles.creditOptionBox,
//                   dyn.creditOptionBox,
//                   isCredit && styles.creditOptionBoxActive,
//                 ]}
//                 onPress={() => setIsCredit(!isCredit)}
//                 activeOpacity={0.85}
//               >
//                 <View
//                   style={[
//                     styles.checkbox,
//                     dyn.checkbox,
//                     isCredit && styles.checkboxActive,
//                   ]}
//                 >
//                   {isCredit && <Text style={[styles.checkMark, dyn.checkMark]}>✓</Text>}
//                 </View>

//                 <View style={styles.creditTextWrap}>
//                   <Text style={[styles.creditTitle, dyn.creditTitle]}>
//                     በብድር ይሁን (Request on Credit)
//                   </Text>
//                   <Text style={[styles.creditSubtitle, dyn.creditSubtitle]}>
//                     ይህ ትእዛዝ በቀጥታ ወደ ሂሳብ መዝገብ ይላካል፤ ከአስተዳዳሪው ፈቃድ እስኪሰጥ ድረስ ይጠብቃል።
//                   </Text>
//                 </View>

//                 {isCredit && <View pointerEvents="none" style={styles.creditGlow} />}
//               </TouchableOpacity>

//               <View style={styles.scrollTailSpacer} />
//             </ScrollView>
//           )}
//         </View>

//         {/* ---------- STICKY SUMMARY FOOTER ---------- */}
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
//                   isCredit && styles.submitOrderBtnCredit,
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
//                     {isCredit
//                       ? `የብድር ጥያቄ ላክ (${totalPrice.toLocaleString()} ብር)`
//                       : `ትእዛዙን ላክ (${totalPrice.toLocaleString()} ብር)`}
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       </View>

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

// /* Adaptive metrics — scales spacing/type with the device width */
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
//       paddingBottom: 18,
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

//     /* Empty state */
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

//     /* Section headers */
//     sectionHeader: { fontSize: 13 * s },

//     /* Cart item rows */
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

//     /* Slots */
//     slotRow: { gap: 9 * s, marginBottom: 4 },
//     slotPill: {
//       paddingVertical: 12 * s,
//       borderRadius: 13 * s,
//     },
//     slotPillText: { fontSize: 12.5 * s },

//     /* Credit option */
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

//     /* Footer summary */
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

//   /* ---------- Ambient glow ---------- */
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

//   /* ---------- Header ---------- */
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
//     height: 8,
//   },

//   /* ---------- Empty state ---------- */
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

//   /* ---------- Section headers ---------- */
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

//   /* ---------- Cart item rows ---------- */
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

//   /* ---------- Delivery slots ---------- */
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

//   /* ---------- Credit option ---------- */
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

//   /* ---------- Sticky footer summary ---------- */
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
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../lib/api';
import { useSession } from '../context/SessionContext';
import CustomAlert from '../components/CustomAlert';

// Default central gateway phone for offline SMS orders (Adama Hub)
const OFFLINE_GATEWAY_SMS_NUMBER = '8090'; // Or your dedicated AfroMessage inbound / direct number (e.g., '+251911000000')

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
  const { token, lang } = useSession();
  const { width: SCREEN_W } = useWindowDimensions();

  const [cart, setCart] = useState({});
  const [slot, setSlot] = useState('BATCH_12PM');
  const [isCredit, setIsCredit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCart, setLoadingCart] = useState(true);

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

  const loadCartFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem('user_cart');
      if (stored) {
        setCart(JSON.parse(stored));
      } else {
        setCart({});
      }
    } catch (err) {
      console.log('Checkout loadCart error:', err);
      setCart({});
    } finally {
      setLoadingCart(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCartFromStorage();
    }, [])
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

  // 1-Tap Item Removal
  const removeItem = async (key) => {
    const updated = { ...cart };
    delete updated[key];
    setCart(updated);
    await AsyncStorage.setItem('user_cart', JSON.stringify(updated));
  };

  const handleSafeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const cartEntries = Object.entries(cart);

  const totalPrice = cartEntries.reduce(
    (sum, [_, item]) =>
      sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );

  // Compile the standard offline order protocol payload: ORD#PROD_ID:QTY:UNIT#SLOT#IS_CREDIT
  const generateSmsPayload = () => {
    if (cartEntries.length === 0) return '';
    const itemChunks = cartEntries.map(([_, it]) => {
      const pId = it.productId || 'PROD';
      const qty = Math.max(1, Math.round(Number(it.quantity) || 1));
      const u = UNIT_MAP[it.unit] || 'CARTON';
      return `${pId}:${qty}:${u}`;
    });
    const creditFlag = isCredit ? '1' : '0';
    return `ORD#${itemChunks.join('|')}#${slot}#${creditFlag}`;
  };

  // Direct 1-Tap Native SMS Opener
  const handleTriggerSmsOrder = async () => {
    if (cartEntries.length === 0) {
      setAlertConfig({
        visible: true,
        title: 'ቅርጫት ባዶ ነው',
        message: 'እባክዎ መጀመሪያ እቃ ይምረጡ',
        type: 'error',
      });
      return;
    }

    const payload = generateSmsPayload();
    const separator = Platform.OS === 'ios' ? '&' : '?';
    const smsUrl = `sms:${OFFLINE_GATEWAY_SMS_NUMBER}${separator}body=${encodeURIComponent(payload)}`;

    try {
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
      } else {
        // If native SMS link is unavailable (e.g. web/tablet without SMS), route to profile with prefilled params
        router.push({
          pathname: '/(tabs)/profile',
          params: { smsPayload: payload },
        });
      }
    } catch (e) {
      router.push({
        pathname: '/(tabs)/profile',
        params: { smsPayload: payload },
      });
    }
  };

  const handleSubmitOrder = async () => {
    if (cartEntries.length === 0) {
      setAlertConfig({
        visible: true,
        title: 'ቅርጫት ባዶ ነው',
        message: 'እባክዎ መጀመሪያ እቃ ይምረጡ',
        type: 'error',
      });
      return;
    }

    setSubmitting(true);

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
          isCreditOrder: isCredit,
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

      if (isCredit) {
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
          {/* ---------- HEADER ---------- */}
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

          {cartEntries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconWrap, dyn.emptyIconWrap]}>
                <Text style={[styles.emptyIcon, dyn.emptyIcon]}>🛒</Text>
              </View>

              <Text style={[styles.emptyTitle, dyn.emptyTitle]}>
                ቅርጫትዎ ውስጥ ምንም እቃ የለም
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
              {/* ---------- Cart Items List ---------- */}
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

                    {/* Stepper + Red Cancel (✕) Button */}
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

                      {/* Red ✕ Cancel Button */}
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

              {/* ---------- Delivery Slot Selection ---------- */}
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
                    🌅 6:00 ሰዓት (ጠዋት)
                  </Text>
                </TouchableOpacity>

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
                    ☀️ 12:00 ሰዓት (ቀትር)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ---------- Credit Request Option ---------- */}
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

              {/* ---------- Direct Offline SMS Trigger Panel ---------- */}
              <View style={[styles.sectionHeaderRow, styles.sectionHeaderRowSpaced]}>
                <View style={[styles.sectionAccent, { backgroundColor: '#F59E0B' }]} />
                <Text style={[styles.sectionHeader, dyn.sectionHeader]}>
                  ኢንተርኔት የለም? (Offline Order)
                </Text>
              </View>

              <View style={styles.offlineSmsCard}>
                <View style={styles.offlineSmsHeaderRow}>
                  <Text style={styles.offlineSmsIcon}>📱</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.offlineSmsTitle}>የትእዛዝ መልእክት (SMS Payload):</Text>
                    <Text style={styles.offlineSmsPayloadText} numberOfLines={2}>
                      {generateSmsPayload() || 'ORD#PROD_SAMPLE:2:CARTON#BATCH_6AM#0'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.offlineSmsBtn}
                  onPress={handleTriggerSmsOrder}
                  activeOpacity={0.85}
                >
                  <Text style={styles.offlineSmsBtnText}>በ SMS መተግበሪያ ክፈትና ላክ ✉️</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.scrollTailSpacer} />
            </ScrollView>
          )}
        </View>

        {/* ---------- STICKY SUMMARY FOOTER ---------- */}
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
                  isCredit && styles.submitOrderBtnCredit,
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
                    {isCredit
                      ? `የብድር ጥያቄ ላክ (${totalPrice.toLocaleString()} ብር)`
                      : `ትእዛዙን ላክ (${totalPrice.toLocaleString()} ብር)`}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

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

  /* Red ✕ Cancel Item Button */
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

  /* Direct Offline SMS Panel */
  offlineSmsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#FDE68A',
    padding: 12,
    gap: 10,
    ...CARD_SHADOW,
  },
  offlineSmsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  offlineSmsIcon: {
    fontSize: 24,
  },
  offlineSmsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  offlineSmsPayloadText: {
    fontSize: 11.5,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#B45309',
    marginTop: 2,
  },
  offlineSmsBtn: {
    backgroundColor: '#D97706',
    borderRadius: 11,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineSmsBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
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
});