
// import React, { useCallback, useMemo, useState } from 'react';
// import {
//   ActivityIndicator,
//   RefreshControl,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   useWindowDimensions,
// } from 'react-native';
// import { useFocusEffect, useRouter } from 'expo-router';
// import { apiRequest } from '../../lib/api';
// import { useSession } from '../../context/SessionContext';

// export default function LedgerScreen() {
//   const router = useRouter();
//   const { token } = useSession();
//   const { width: SCREEN_W } = useWindowDimensions();

//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [creditOrders, setCreditOrders] = useState([]);
//   const [userProfile, setUserProfile] = useState(null);

//   // ---- Adaptive layout metrics (UI only) ----
//   const isTiny = SCREEN_W < 330;
//   const isSmall = SCREEN_W < 370;
//   const isTablet = SCREEN_W >= 680;
//   const S = isTiny
//     ? 0.85
//     : isSmall
//     ? 0.93
//     : isTablet
//     ? 1.12
//     : SCREEN_W >= 430
//     ? 1.07
//     : SCREEN_W >= 390
//     ? 1.02
//     : 1;
//   const dyn = useMemo(() => buildDynamic(S, isTablet, isSmall), [S, isTablet, isSmall]);

//   const fetchLedgerData = async () => {
//     try {
//       const [profileRes, creditRes] = await Promise.all([
//         apiRequest('/auth/me', { token }).catch(() => null),
//         apiRequest('/orders/credit-requests', { token }).catch(() => ({
//           creditOrders: [],
//         })),
//       ]);

//       if (profileRes) {
//         setUserProfile(profileRes);
//       }

//       const ordersArray =
//         creditRes?.creditOrders ||
//         (Array.isArray(creditRes) ? creditRes : []);

//       setCreditOrders(ordersArray);
//     } catch (err) {
//       console.log('Ledger fetch error:', err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchLedgerData();
//     }, [token])
//   );

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchLedgerData();
//   };

//   // -------------------------------------------------------------------
//   // DYNAMIC CREDIT COMPUTATION
//   // -------------------------------------------------------------------

//   // 1. Total credit limit assigned to this shopkeeper
//   const totalLimit = Number(userProfile?.creditLimit ?? 20000);

//   // 2. Active credit orders that are approved but not yet settled
//   const activeUnsettledTotal = creditOrders.reduce((sum, ord) => {
//     const isPaid =
//       ord.isCreditSettled === true ||
//       String(ord.status).toUpperCase() === 'DELIVERED';

//     const isApproved =
//       (
//         ord.creditApproved === true ||
//         String(ord.status).toUpperCase() === 'CONFIRMED'
//       ) && !isPaid;

//     return isApproved ? sum + Number(ord.totalAmount || 0) : sum;
//   }, 0);

//   // 3. Use database usedCredit or fallback to computed active orders
//   const usedCredit =
//     userProfile?.usedCredit !== undefined &&
//     userProfile?.usedCredit !== null
//       ? Number(userProfile.usedCredit)
//       : activeUnsettledTotal;

//   // 4. Remaining capacity: Total Limit - Used Credit
//   const remainingCredit = Math.max(0, totalLimit - usedCredit);

//   // ---- Visual only: fill ratio of the capacity meter ----
//   const usageRatio =
//     totalLimit > 0 ? Math.min(1, Math.max(0, usedCredit / totalLimit)) : 0;

//   if (loading && !refreshing) {
//     return (
//       <SafeAreaView style={styles.safe}>
//         <View style={styles.center}>
//           <View style={[styles.loaderCard, dyn.loaderCard]}>
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

//       {/* ---------- Page Title ---------- */}
//       <View style={[styles.header, dyn.header]}>
//         <View pointerEvents="none" style={styles.headerBloom} />

//         <View style={[styles.headerInner, dyn.contentWrap]}>
//           <View style={[styles.headerAccent, dyn.headerAccent]} />

//           <View style={styles.headerTextWrap}>
//             <Text style={[styles.headerTitle, dyn.headerTitle]} numberOfLines={1}>
//               የሂሳብ መዝገብ (Ledger)
//             </Text>

//             <Text style={[styles.headerSub, dyn.headerSub]} numberOfLines={2}>
//               የብድር ትእዛዞችና የቀረ የብድር ጣሪያ ዝርዝር
//             </Text>
//           </View>
//         </View>
//       </View>

//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={[styles.scrollContent, dyn.scrollContent]}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={['#0F7B4A']}
//             tintColor="#0F7B4A"
//           />
//         }
//       >
//         <View style={[styles.contentWrap, dyn.contentWrap]}>
//           {/* ---------- SIGNATURE ADAMA HUB BRAND GREEN CARD ---------- */}
//           <View style={[styles.summaryCardGreen, dyn.summaryCardGreen]}>
//             <View pointerEvents="none" style={styles.greenOrbBig} />
//             <View pointerEvents="none" style={styles.greenOrbSmall} />
//             <View pointerEvents="none" style={styles.greenShine} />
//             <View pointerEvents="none" style={styles.greenTopLine} />

//             <View style={[styles.summaryTop, dyn.summaryTop]}>
//               <View style={styles.summaryTopLeft}>
//                 <Text style={[styles.summaryLabel, dyn.summaryLabel]}>
//                   የቀረዎት የብድር ጣሪያ
//                 </Text>

//                 <Text
//                   style={[styles.remainingCreditDigits, dyn.remainingCreditDigits]}
//                   numberOfLines={1}
//                   adjustsFontSizeToFit
//                 >
//                   {remainingCredit.toLocaleString()} ብር
//                 </Text>
//               </View>

//               <View style={[styles.creditChip, dyn.creditChip]}>
//                 <View style={[styles.creditChipDot, dyn.creditChipDot]} />
//                 <Text style={[styles.creditChipText, dyn.creditChipText]} numberOfLines={1}>
//                   ንቁ የብድር አገልግሎት
//                 </Text>
//               </View>
//             </View>

//             {/* Capacity meter — visual mirror of used / total limit */}
//             <View style={[styles.meterTrack, dyn.meterTrack]}>
//               <View
//                 style={[
//                   styles.meterFill,
//                   dyn.meterFill,
//                   { width: `${Math.round(usageRatio * 100)}%` },
//                   usageRatio >= 0.85 && styles.meterFillWarn,
//                 ]}
//               />
//             </View>

//             <View style={[styles.summaryDivider, dyn.summaryDivider]} />

//             <View style={[styles.summaryBottom, dyn.summaryBottom]}>
//               <View style={[styles.metricItem, dyn.metricItem]}>
//                 <Text style={[styles.metricLabel, dyn.metricLabel]} numberOfLines={1}>
//                   ጠቅላላ ጣሪያ
//                 </Text>

//                 <Text style={[styles.metricValue, dyn.metricValue]} numberOfLines={1}>
//                   {totalLimit.toLocaleString()} ብር
//                 </Text>
//               </View>

//               <View style={[styles.metricSplit, dyn.metricSplit]} />

//               <View style={[styles.metricItem, dyn.metricItem]}>
//                 <Text style={[styles.metricLabel, dyn.metricLabel]} numberOfLines={1}>
//                   የተወሰደ ብድር
//                 </Text>

//                 <Text
//                   style={[
//                     styles.metricValue,
//                     dyn.metricValue,
//                     usedCredit > 0
//                       ? { color: '#FECDD3' }
//                       : { color: '#FFFFFF' },
//                   ]}
//                   numberOfLines={1}
//                 >
//                   {usedCredit.toLocaleString()} ብር
//                 </Text>
//               </View>
//             </View>
//           </View>

//           {/* ---------- Section Header ---------- */}
//           <View style={[styles.listHeaderRow, dyn.listHeaderRow]}>
//             <View style={styles.listTitleWrap}>
//               <View style={[styles.listAccent, dyn.listAccent]} />
//               <Text style={[styles.listSectionTitle, dyn.listSectionTitle]} numberOfLines={1}>
//                 የብድር ትእዛዞች ታሪክ
//               </Text>
//             </View>

//             <View style={[styles.listCountChip, dyn.listCountChip]}>
//               <Text style={[styles.listCountText, dyn.listCountText]} numberOfLines={1}>
//                 {creditOrders.length} ትእዛዞች
//               </Text>
//             </View>
//           </View>

//           {/* ---------- Credit Orders List ---------- */}
//           {creditOrders.length === 0 ? (
//             <View style={[styles.emptyCard, dyn.emptyCard]}>
//               <View pointerEvents="none" style={styles.emptyGlow} />

//               <View style={[styles.emptyIconWrap, dyn.emptyIconWrap]}>
//                 <Text style={[styles.emptyEmoji, dyn.emptyEmoji]}>📜</Text>
//               </View>

//               <Text style={[styles.emptyTitle, dyn.emptyTitle]}>
//                 ምንም የተመዘገበ የብድር ትእዛዝ የለም
//               </Text>

//               <Text style={[styles.emptySub, dyn.emptySub]}>
//                 በቼክአውት ወቅት "በብድር ይሁን" የሚለውን በመምረጥ
//                 እቃዎችን በብድር ማዘዝ ይችላሉ።
//               </Text>

//               <TouchableOpacity
//                 style={[styles.orderBtn, dyn.orderBtn]}
//                 onPress={() => router.replace('/(tabs)')}
//                 activeOpacity={0.8}
//               >
//                 <View pointerEvents="none" style={styles.btnShine} />
//                 <Text style={[styles.orderBtnText, dyn.orderBtnText]}>
//                   ወደ ገበያ ሂድ
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             creditOrders.map((ord) => {
//               // Evaluates all 3 stages cleanly
//               const isPaid =
//                 ord.isCreditSettled === true ||
//                 String(ord.status).toUpperCase() === 'DELIVERED';

//               const isApproved =
//                 (
//                   ord.creditApproved === true ||
//                   String(ord.status).toUpperCase() === 'CONFIRMED'
//                 ) && !isPaid;

//               const isRejected =
//                 ord.creditApproved === false ||
//                 String(ord.status).toUpperCase() === 'CANCELLED';

//               const isPending =
//                 !isPaid && !isApproved && !isRejected;

//               const items = ord.items || [];

//               const dateStr = new Date(
//                 ord.createdAt
//               ).toLocaleDateString('am-ET');

//               const stripeColor = isPaid
//                 ? '#0369A1'
//                 : isApproved
//                 ? '#0F7B4A'
//                 : isRejected
//                 ? '#B91C1C'
//                 : '#D97706';

//               return (
//                 <View key={ord.id} style={[styles.orderCard, dyn.orderCard]}>
//                   <View
//                     pointerEvents="none"
//                     style={[styles.orderStripe, { backgroundColor: stripeColor }]}
//                   />
//                   <View pointerEvents="none" style={styles.cardTopLine} />

//                   <View style={[styles.orderCardTop, dyn.orderCardTop]}>
//                     <View style={styles.orderIdWrap}>
//                       <Text style={[styles.orderIdText, dyn.orderIdText]} numberOfLines={1}>
//                         ትእዛዝ #{String(ord.id).slice(-4).toUpperCase()}
//                       </Text>

//                       <Text style={[styles.orderDateText, dyn.orderDateText]} numberOfLines={1}>
//                         {dateStr} ·{' '}
//                         {ord.deliverySlot === 'BATCH_6AM'
//                           ? '🌅 ጠዋት 6:00'
//                           : '☀️ ቀትር 12:00'}
//                       </Text>
//                     </View>

//                     {/* 3-Stage Badges */}
//                     <View
//                       style={[
//                         styles.statusBadge,
//                         dyn.statusBadge,
//                         isPaid
//                           ? styles.badgePaid
//                           : isApproved
//                           ? styles.badgeApproved
//                           : isRejected
//                           ? styles.badgeRejected
//                           : styles.badgePending,
//                       ]}
//                     >
//                       <Text
//                         style={[
//                           styles.statusBadgeText,
//                           dyn.statusBadgeText,
//                           isPaid
//                             ? styles.textPaid
//                             : isApproved
//                             ? styles.textApproved
//                             : isRejected
//                             ? styles.textRejected
//                             : styles.textPending,
//                         ]}
//                         numberOfLines={1}
//                       >
//                         {isPaid
//                           ? '✅ ተከፍሏል (Paid)'
//                           : isApproved
//                           ? '✔ ተፈቅዷል (Confirmed)'
//                           : isRejected
//                           ? '❌ ውድቅ ተደርጓል'
//                           : isPending
//                           ? '⏳ ፈቃድ በመጠባበቅ ላይ'
//                           : ''}
//                       </Text>
//                     </View>
//                   </View>

//                   {/* Items Summary */}
//                   <View style={[styles.itemsWrap, dyn.itemsWrap]}>
//                     {items.map((it, idx) => (
//                       <View
//                         key={it.id || idx}
//                         style={[styles.itemRow, dyn.itemRow]}
//                       >
//                         <Text style={[styles.itemTitle, dyn.itemTitle]} numberOfLines={2}>
//                           • {it.product?.nameAm || 'እቃ'} (
//                           {it.quantity}{' '}
//                           {it.selectedUnit || 'ካርቶን'})
//                         </Text>

//                         <Text style={[styles.itemPriceText, dyn.itemPriceText]} numberOfLines={1}>
//                           {(
//                             Number(it.unitPrice) *
//                             Number(it.quantity)
//                           ).toLocaleString()}{' '}
//                           ብር
//                         </Text>
//                       </View>
//                     ))}
//                   </View>

//                   <View style={[styles.cardFooter, dyn.cardFooter]}>
//                     <Text style={[styles.totalLabel, dyn.totalLabel]}>
//                       የብድር ድምር
//                     </Text>

//                     <Text style={[styles.totalAmountDigits, dyn.totalAmountDigits]} numberOfLines={1}>
//                       {Number(ord.totalAmount).toLocaleString()} ብር
//                     </Text>
//                   </View>
//                 </View>
//               );
//             })
//           )}

//           <View style={styles.scrollTailSpacer} />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const GREEN = '#0F7B4A';
// const INK = '#12241A';
// const MUTED = '#62726A';
// const LINE = '#E6ECE7';
// const HAIRLINE = '#EDF2EE';
// const SOFT = '#E4F2EA';

// const CARD_SHADOW = {
//   shadowColor: '#0B2A1B',
//   shadowOffset: { width: 0, height: 4 },
//   shadowOpacity: 0.07,
//   shadowRadius: 11,
//   elevation: 3,
// };

// /* Adaptive metrics — scales spacing/type with the device width */
// const buildDynamic = (s, isTablet, isSmall) =>
//   StyleSheet.create({
//     contentWrap: {
//       width: '100%',
//       maxWidth: isTablet ? 620 : '100%',
//       alignSelf: 'center',
//     },
//     loaderCard: {
//       width: 68 * s,
//       height: 68 * s,
//       borderRadius: 22 * s,
//     },

//     /* Header */
//     header: {
//       paddingHorizontal: isTablet ? 26 : 14 * s,
//       paddingTop: 12 * s,
//       paddingBottom: 11 * s,
//     },
//     headerAccent: {
//       width: 4 * s,
//       height: 28 * s,
//       borderRadius: 3 * s,
//       marginRight: 10 * s,
//     },
//     headerTitle: { fontSize: 20 * s },
//     headerSub: { fontSize: 11.5 * s, marginTop: 3 * s },

//     /* Scroll */
//     scrollContent: {
//       padding: isTablet ? 20 : 13 * s,
//       paddingBottom: isTablet ? 40 : 46,
//       gap: 12 * s,
//     },

//     /* Signature green card */
//     summaryCardGreen: {
//       borderRadius: 20 * s,
//       padding: isSmall ? 13 * s : 15 * s,
//     },
//     summaryTop: {
//       gap: 9 * s,
//     },
//     summaryLabel: { fontSize: 11.5 * s, marginBottom: 5 * s },
//     remainingCreditDigits: {
//       fontSize: (isSmall ? 23 : 26) * s,
//       letterSpacing: 0.3,
//     },
//     creditChip: {
//       paddingHorizontal: 9 * s,
//       paddingVertical: 5 * s,
//       gap: 5 * s,
//     },
//     creditChipDot: { width: 5 * s, height: 5 * s, borderRadius: 3 * s },
//     creditChipText: { fontSize: 9.5 * s },
//     meterTrack: {
//       height: 6 * s,
//       borderRadius: 4 * s,
//       marginTop: 13 * s,
//     },
//     meterFill: {
//       height: 6 * s,
//       borderRadius: 4 * s,
//     },
//     summaryDivider: { marginVertical: 13 * s },
//     summaryBottom: {
//       gap: 10 * s,
//     },
//     metricItem: { minWidth: 0 },
//     metricSplit: { width: 1, alignSelf: 'stretch', marginVertical: 1 },
//     metricLabel: { fontSize: 11 * s },
//     metricValue: { fontSize: 15 * s, marginTop: 3 * s },

//     /* List header */
//     listHeaderRow: {
//       marginTop: 6 * s,
//       paddingHorizontal: 2 * s,
//       gap: 8 * s,
//     },
//     listAccent: {
//       width: 3.5 * s,
//       height: 15 * s,
//       borderRadius: 3 * s,
//       marginRight: 8 * s,
//     },
//     listSectionTitle: { fontSize: 14 * s },
//     listCountChip: {
//       paddingHorizontal: 9 * s,
//       paddingVertical: 4 * s,
//       borderRadius: 9 * s,
//     },
//     listCountText: { fontSize: 10.5 * s },

//     /* Empty state */
//     emptyCard: {
//       borderRadius: 18 * s,
//       padding: isSmall ? 20 * s : 26 * s,
//       paddingTop: isSmall ? 24 * s : 30 * s,
//       marginTop: 10 * s,
//     },
//     emptyIconWrap: {
//       width: 62 * s,
//       height: 62 * s,
//       borderRadius: 21 * s,
//       marginBottom: 13 * s,
//     },
//     emptyEmoji: { fontSize: 27 * s },
//     emptyTitle: { fontSize: 14 * s, marginBottom: 6 * s },
//     emptySub: { fontSize: 12 * s, lineHeight: 17 * s, marginBottom: 18 * s },
//     orderBtn: {
//       paddingHorizontal: 22 * s,
//       paddingVertical: 11 * s,
//       borderRadius: 13 * s,
//     },
//     orderBtnText: { fontSize: 13 * s },

//     /* Order card */
//     orderCard: {
//       borderRadius: 16 * s,
//       padding: 13 * s,
//       paddingLeft: 15 * s,
//     },
//     orderCardTop: {
//       marginBottom: 11 * s,
//       gap: 8 * s,
//     },
//     orderIdText: { fontSize: 13 * s },
//     orderDateText: { fontSize: 10.5 * s, marginTop: 3 * s },
//     statusBadge: {
//       paddingHorizontal: 9 * s,
//       paddingVertical: 5 * s,
//     },
//     statusBadgeText: { fontSize: 9.5 * s },

//     /* Items */
//     itemsWrap: {
//       borderRadius: 12 * s,
//       padding: 10 * s,
//       gap: 7 * s,
//       marginBottom: 11 * s,
//     },
//     itemRow: { gap: 8 * s },
//     itemTitle: { fontSize: 11.5 * s, marginRight: 8 * s, lineHeight: 16 * s },
//     itemPriceText: { fontSize: 12 * s },

//     /* Footer */
//     cardFooter: {
//       paddingTop: 10 * s,
//       gap: 6 * s,
//     },
//     totalLabel: { fontSize: 11.5 * s },
//     totalAmountDigits: { fontSize: 16 * s },
//   });

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: '#F4F7F4',
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loaderCard: {
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
//     top: 110,
//     left: -90,
//     width: 240,
//     height: 240,
//     borderRadius: 120,
//     backgroundColor: 'rgba(15, 123, 74, 0.10)',
//   },
//   glowOrbB: {
//     position: 'absolute',
//     bottom: -80,
//     right: -80,
//     width: 235,
//     height: 235,
//     borderRadius: 120,
//     backgroundColor: 'rgba(242, 183, 5, 0.09)',
//   },

//   /* ---------- Header ---------- */
//   header: {
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: LINE,
//     overflow: 'hidden',
//     shadowColor: '#0B2A1B',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.05,
//     shadowRadius: 9,
//     elevation: 2,
//     zIndex: 5,
//   },
//   headerBloom: {
//     position: 'absolute',
//     top: -60,
//     right: -40,
//     width: 170,
//     height: 170,
//     borderRadius: 85,
//     backgroundColor: 'rgba(15, 123, 74, 0.07)',
//   },
//   headerInner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerAccent: {
//     backgroundColor: GREEN,
//   },
//   headerTextWrap: {
//     flex: 1,
//     minWidth: 0,
//   },
//   headerTitle: {
//     fontWeight: '900',
//     color: INK,
//     letterSpacing: 0.2,
//   },
//   headerSub: {
//     color: MUTED,
//     fontWeight: '600',
//   },

//   scroll: {
//     flex: 1,
//   },
//   contentWrap: {
//     width: '100%',
//   },
//   scrollTailSpacer: {
//     height: 8,
//   },

//   /* ---------- SIGNATURE EMERALD GREEN BRAND CARD ---------- */
//   summaryCardGreen: {
//     backgroundColor: GREEN,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: 'rgba(63, 208, 138, 0.55)',
//     shadowColor: '#0F7B4A',
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.3,
//     shadowRadius: 14,
//     elevation: 6,
//   },
//   greenOrbBig: {
//     position: 'absolute',
//     top: -80,
//     right: -55,
//     width: 210,
//     height: 210,
//     borderRadius: 105,
//     backgroundColor: 'rgba(63, 208, 138, 0.30)',
//   },
//   greenOrbSmall: {
//     position: 'absolute',
//     bottom: -70,
//     left: -35,
//     width: 165,
//     height: 165,
//     borderRadius: 85,
//     backgroundColor: 'rgba(242, 183, 5, 0.20)',
//   },
//   greenShine: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: '46%',
//     backgroundColor: 'rgba(255, 255, 255, 0.07)',
//   },
//   greenTopLine: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 1,
//     backgroundColor: 'rgba(255, 255, 255, 0.30)',
//   },
//   summaryTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//   },
//   summaryTopLeft: {
//     flex: 1,
//     minWidth: 0,
//     paddingRight: 8,
//   },
//   summaryLabel: {
//     color: '#D4EBE0',
//     fontWeight: '700',
//   },
//   remainingCreditDigits: {
//     color: '#FFFFFF',
//     fontWeight: '900',
//     textShadowColor: 'rgba(0, 0, 0, 0.18)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 4,
//   },
//   creditChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.20)',
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.32)',
//     borderRadius: 999,
//     flexShrink: 0,
//   },
//   creditChipDot: {
//     backgroundColor: '#7CFFC4',
//   },
//   creditChipText: {
//     color: '#FFFFFF',
//     fontWeight: '800',
//   },

//   /* Capacity meter */
//   meterTrack: {
//     backgroundColor: 'rgba(255, 255, 255, 0.22)',
//     overflow: 'hidden',
//   },
//   meterFill: {
//     backgroundColor: '#7CFFC4',
//   },
//   meterFillWarn: {
//     backgroundColor: '#FFD27A',
//   },

//   summaryDivider: {
//     height: 1,
//     backgroundColor: 'rgba(255, 255, 255, 0.18)',
//   },
//   summaryBottom: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   metricItem: {
//     flex: 1,
//   },
//   metricSplit: {
//     backgroundColor: 'rgba(255, 255, 255, 0.20)',
//   },
//   metricLabel: {
//     color: '#D4EBE0',
//     fontWeight: '700',
//   },
//   metricValue: {
//     color: '#FFFFFF',
//     fontWeight: '900',
//   },

//   /* ---------- List header ---------- */
//   listHeaderRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   listTitleWrap: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//     minWidth: 0,
//   },
//   listAccent: {
//     backgroundColor: GREEN,
//   },
//   listSectionTitle: {
//     fontWeight: '900',
//     color: INK,
//     letterSpacing: 0.1,
//   },
//   listCountChip: {
//     backgroundColor: SOFT,
//     borderWidth: 1,
//     borderColor: '#CFE7D9',
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexShrink: 0,
//   },
//   listCountText: {
//     color: GREEN,
//     fontWeight: '800',
//   },

//   /* ---------- Empty state ---------- */
//   emptyCard: {
//     backgroundColor: '#FFFFFF',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: LINE,
//     overflow: 'hidden',
//     ...CARD_SHADOW,
//   },
//   emptyGlow: {
//     position: 'absolute',
//     top: -70,
//     right: -55,
//     width: 185,
//     height: 185,
//     borderRadius: 95,
//     backgroundColor: 'rgba(15, 123, 74, 0.07)',
//   },
//   emptyIconWrap: {
//     backgroundColor: SOFT,
//     borderWidth: 1,
//     borderColor: '#CFE7D9',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyTitle: {
//     fontWeight: '900',
//     color: INK,
//     textAlign: 'center',
//   },
//   emptySub: {
//     color: MUTED,
//     textAlign: 'center',
//     fontWeight: '500',
//   },
//   orderBtn: {
//     backgroundColor: GREEN,
//     alignItems: 'center',
//     justifyContent: 'center',
//     overflow: 'hidden',
//     shadowColor: '#0F7B4A',
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.28,
//     shadowRadius: 10,
//     elevation: 4,
//   },
//   orderBtnText: {
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

//   /* ---------- Order card ---------- */
//   orderCard: {
//     backgroundColor: '#FFFFFF',
//     borderWidth: 1,
//     borderColor: LINE,
//     overflow: 'hidden',
//     ...CARD_SHADOW,
//   },
//   orderStripe: {
//     position: 'absolute',
//     top: 12,
//     bottom: 12,
//     left: 0,
//     width: 3.5,
//     borderTopRightRadius: 4,
//     borderBottomRightRadius: 4,
//     opacity: 0.9,
//   },
//   cardTopLine: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 1,
//     backgroundColor: HAIRLINE,
//   },
//   orderCardTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//   },
//   orderIdWrap: {
//     flex: 1,
//     minWidth: 0,
//     paddingRight: 8,
//   },
//   orderIdText: {
//     fontWeight: '900',
//     color: INK,
//     letterSpacing: 0.2,
//   },
//   orderDateText: {
//     color: MUTED,
//     fontWeight: '600',
//   },

//   /* 3-Stage Badges */
//   statusBadge: {
//     borderRadius: 999,
//     borderWidth: 1,
//     borderColor: 'rgba(18, 36, 26, 0.05)',
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexShrink: 0,
//     maxWidth: '60%',
//   },
//   badgePending: {
//     backgroundColor: '#FEF3C7',
//   },
//   textPending: {
//     color: '#92400E',
//   },
//   badgeApproved: {
//     backgroundColor: '#E4F2EA',
//   },
//   textApproved: {
//     color: '#0F7B4A',
//   },
//   badgePaid: {
//     backgroundColor: '#E0F2FE',
//   },
//   textPaid: {
//     color: '#0369A1',
//   },
//   badgeRejected: {
//     backgroundColor: '#FEE2E2',
//   },
//   textRejected: {
//     color: '#B91C1C',
//   },
//   statusBadgeText: {
//     fontWeight: '900',
//   },

//   /* Items */
//   itemsWrap: {
//     backgroundColor: '#F7FAF7',
//     borderWidth: 1,
//     borderColor: '#EDF3EE',
//     borderRadius: 12,
//   },
//   itemRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   itemTitle: {
//     color: '#334155',
//     fontWeight: '700',
//     flex: 1,
//     minWidth: 0,
//   },
//   itemPriceText: {
//     fontWeight: '800',
//     color: INK,
//     flexShrink: 0,
//   },

//   /* Footer */
//   cardFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//     borderTopWidth: 1,
//     borderTopColor: HAIRLINE,
//   },
//   totalLabel: {
//     fontWeight: '800',
//     color: MUTED,
//   },
//   totalAmountDigits: {
//     fontWeight: '900',
//     color: '#B45309',
//     letterSpacing: 0.2,
//   },
// });
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
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
import { apiRequest } from '../../lib/api';
import { useSession } from '../../context/SessionContext';

export default function LedgerScreen() {
  const router = useRouter();
  const { token } = useSession();
  const { width: SCREEN_W } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creditOrders, setCreditOrders] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // ---- Adaptive layout metrics ----
  const isTiny = SCREEN_W < 330;
  const isSmall = SCREEN_W < 370;
  const isTablet = SCREEN_W >= 680;

  const S = isTiny
    ? 0.85
    : isSmall
    ? 0.93
    : isTablet
    ? 1.12
    : SCREEN_W >= 430
    ? 1.07
    : SCREEN_W >= 390
    ? 1.02
    : 1;

  const dyn = useMemo(
    () => buildDynamic(S, isTablet, isSmall),
    [S, isTablet, isSmall]
  );

  const fetchLedgerData = async () => {
    try {
      const [profileRes, creditRes] = await Promise.all([
        apiRequest('/auth/me', { token }).catch(() => null),
        apiRequest('/orders/credit-requests', { token }).catch(() => ({
          creditOrders: [],
        })),
      ]);

      if (profileRes) {
        const resolvedUser = profileRes.user || profileRes;
        setUserProfile(resolvedUser);

        // Store live credit limit dynamically in cache
        if (resolvedUser.creditLimit !== undefined) {
          await AsyncStorage.setItem(
            'user_credit_limit',
            String(resolvedUser.creditLimit)
          );
        }
      } else {
        // Fallback to cached credit limit
        const cachedLimit = await AsyncStorage.getItem(
          'user_credit_limit'
        ).catch(() => null);

        if (cachedLimit) {
          setUserProfile((prev) => ({
            ...prev,
            creditLimit: Number(cachedLimit),
          }));
        }
      }

      const ordersArray =
        creditRes?.creditOrders ||
        (Array.isArray(creditRes) ? creditRes : []);

      setCreditOrders(ordersArray);
    } catch (err) {
      console.log('Ledger fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLedgerData();
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLedgerData();
  };

  // -------------------------------------------------------------------
  // DYNAMIC CREDIT COMPUTATION (DIRECT FROM ADMIN CONFIGURATION)
  // -------------------------------------------------------------------

  // 1. Dynamic credit limit set by Admin
  const totalLimit = Number(userProfile?.creditLimit ?? 20000);

  // 2. Active credit orders that are approved but not yet settled
  const activeUnsettledTotal = creditOrders.reduce((sum, ord) => {
    const isPaid =
      ord.isCreditSettled === true ||
      String(ord.status).toUpperCase() === 'DELIVERED';

    const isApproved =
      (
        ord.creditApproved === true ||
        String(ord.status).toUpperCase() === 'CONFIRMED'
      ) && !isPaid;

    return isApproved ? sum + Number(ord.totalAmount || 0) : sum;
  }, 0);

  // 3. Dynamic used credit from DB or live computed active orders
  const usedCredit =
    userProfile?.usedCredit !== undefined &&
    userProfile?.usedCredit !== null
      ? Number(userProfile.usedCredit)
      : activeUnsettledTotal;

  // 4. Remaining capacity: Total Dynamic Limit - Used Credit
  const remainingCredit = Math.max(0, totalLimit - usedCredit);

  // 5. Visual ratio for the capacity meter
  const usageRatio =
    totalLimit > 0
      ? Math.min(1, Math.max(0, usedCredit / totalLimit))
      : 0;

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={[styles.loaderCard, dyn.loaderCard]}>
            <ActivityIndicator size="small" color={GREEN} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.glowOrbA} />
      <View style={styles.glowOrbB} />

      {/* ---------- Page Title ---------- */}
      <View style={[styles.header, dyn.header]}>
        <View style={styles.headerBloom} />

        <View style={[styles.headerInner, dyn.headerInner]}>
          <View style={[styles.headerAccent, dyn.headerAccent]} />

          <View style={styles.headerTextWrap}>
            <Text style={[styles.headerTitle, dyn.headerTitle]}>
              የሂሳብ መዝገብ (Ledger)
            </Text>

            <Text style={[styles.headerSub, dyn.headerSub]}>
              የብድር ትእዛዞችና የቀረ የብድር ጣሪያ ዝርዝር
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          dyn.scrollContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={GREEN}
            colors={[GREEN]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentWrap, dyn.contentWrap]}>
          {/* ---------- SIGNATURE DYNAMIC BRAND CARD ---------- */}
          <View style={[styles.summaryCardGreen, dyn.summaryCardGreen]}>
            <View style={styles.greenOrbBig} />
            <View style={styles.greenOrbSmall} />
            <View style={styles.greenShine} />
            <View style={styles.greenTopLine} />

            <View style={[styles.summaryTop, dyn.summaryTop]}>
              <View style={styles.summaryTopLeft}>
                <Text style={[styles.summaryLabel, dyn.summaryLabel]}>
                  የቀረዎት የብድር ጣሪያ
                </Text>

                <Text
                  style={[
                    styles.remainingCreditDigits,
                    dyn.remainingCreditDigits,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {remainingCredit.toLocaleString()} ብር
                </Text>
              </View>

              <View style={[styles.creditChip, dyn.creditChip]}>
                <View
                  style={[
                    styles.creditChipDot,
                    dyn.creditChipDot,
                  ]}
                />

                <Text
                  style={[
                    styles.creditChipText,
                    dyn.creditChipText,
                  ]}
                >
                  ንቁ የብድር አገልግሎት
                </Text>
              </View>
            </View>

            {/* Capacity meter with fixed width interpolation */}
            <View style={[styles.meterTrack, dyn.meterTrack]}>
              <View
                style={[
                  styles.meterFill,
                  dyn.meterFill,
                  usageRatio >= 0.85 && styles.meterFillWarn,
                  {
                    width: `${Math.max(0, Math.min(1, usageRatio)) * 100}%`,
                  },
                ]}
              />
            </View>

            <View style={[styles.summaryDivider, dyn.summaryDivider]} />

            <View style={[styles.summaryBottom, dyn.summaryBottom]}>
              <View style={[styles.metricItem, dyn.metricItem]}>
                <Text style={[styles.metricLabel, dyn.metricLabel]}>
                  ጠቅላላ ጣሪያ (Limit)
                </Text>

                <Text
                  style={[styles.metricValue, dyn.metricValue]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {totalLimit.toLocaleString()} ብር
                </Text>
              </View>

              <View style={[styles.metricSplit, dyn.metricSplit]} />

              <View style={[styles.metricItem, dyn.metricItem]}>
                <Text style={[styles.metricLabel, dyn.metricLabel]}>
                  የተወሰደ ብድር
                </Text>

                <Text
                  style={[
                    styles.metricValue,
                    dyn.metricValue,
                    usedCredit / Math.max(totalLimit, 1) >= 0.85
                      ? { color: '#FECDD3' }
                      : { color: '#FFFFFF' },
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {usedCredit.toLocaleString()} ብር
                </Text>
              </View>
            </View>
          </View>

          {/* ---------- Section Header ---------- */}
          <View style={[styles.listHeaderRow, dyn.listHeaderRow]}>
            <View style={styles.listTitleWrap}>
              <View style={[styles.listAccent, dyn.listAccent]} />

              <Text
                style={[
                  styles.listSectionTitle,
                  dyn.listSectionTitle,
                ]}
              >
                የብድር ትእዛዞች ታሪክ
              </Text>
            </View>

            <View
              style={[
                styles.listCountChip,
                dyn.listCountChip,
              ]}
            >
              <Text
                style={[
                  styles.listCountText,
                  dyn.listCountText,
                ]}
              >
                {creditOrders.length} ትእዛዞች
              </Text>
            </View>
          </View>

          {/* ---------- Credit Orders List ---------- */}
          {creditOrders.length === 0 ? (
            <View style={[styles.emptyCard, dyn.emptyCard]}>
              <View style={styles.emptyGlow} />

              <View
                style={[
                  styles.emptyIconWrap,
                  dyn.emptyIconWrap,
                ]}
              >
                <Text
                  style={[
                    styles.emptyEmoji,
                    dyn.emptyEmoji,
                  ]}
                >
                  📜
                </Text>
              </View>

              <Text
                style={[
                  styles.emptyTitle,
                  dyn.emptyTitle,
                ]}
              >
                ምንም የተመዘገበ የብድር ትእዛዝ የለም
              </Text>

              <Text
                style={[
                  styles.emptySub,
                  dyn.emptySub,
                ]}
              >
                በቼክአውት ወቅት "በብድር ይሁን" የሚለውን በመምረጥ
                {'\n'}
                እቃዎችን በብድር ማዘዝ ይችላሉ።
              </Text>

              <TouchableOpacity
                style={[styles.orderBtn, dyn.orderBtn]}
                onPress={() => router.replace('/(tabs)')}
                activeOpacity={0.8}
              >
                <View style={styles.btnShine} />

                <Text
                  style={[
                    styles.orderBtnText,
                    dyn.orderBtnText,
                  ]}
                >
                  ወደ ገበያ ሂድ
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            creditOrders.map((ord) => {
              const isPaid =
                ord.isCreditSettled === true ||
                String(ord.status).toUpperCase() === 'DELIVERED';

              const isApproved =
                (
                  ord.creditApproved === true ||
                  String(ord.status).toUpperCase() === 'CONFIRMED'
                ) && !isPaid;

              const isRejected =
                ord.creditApproved === false ||
                String(ord.status).toUpperCase() === 'CANCELLED';

              const isPending =
                !isPaid && !isApproved && !isRejected;

              const items = ord.items || [];

              const dateStr = new Date(
                ord.createdAt
              ).toLocaleDateString('am-ET');

              const stripeColor = isPaid
                ? '#0369A1'
                : isApproved
                ? '#0F7B4A'
                : isRejected
                ? '#B91C1C'
                : '#D97706';

              return (
                <View
                  key={String(ord.id)}
                  style={[
                    styles.orderCard,
                    dyn.orderCard,
                  ]}
                >
                  <View
                    style={[
                      styles.orderStripe,
                      { backgroundColor: stripeColor },
                    ]}
                  />

                  <View style={styles.cardTopLine} />

                  <View
                    style={[
                      styles.orderCardTop,
                      dyn.orderCardTop,
                    ]}
                  >
                    <View style={styles.orderIdWrap}>
                      <Text
                        style={[
                          styles.orderIdText,
                          dyn.orderIdText,
                        ]}
                        numberOfLines={1}
                      >
                        ትእዛዝ #
                        {String(ord.id)
                          .slice(-4)
                          .toUpperCase()}
                      </Text>

                      <Text
                        style={[
                          styles.orderDateText,
                          dyn.orderDateText,
                        ]}
                        numberOfLines={1}
                      >
                        {dateStr} ·{' '}
                        {ord.deliverySlot === 'BATCH_6AM'
                          ? '🌅 ጠዋት 6:00'
                          : '☀️ ቀትር 12:00'}
                      </Text>
                    </View>

                    {/* 3-Stage Badges */}
                    <View
                      style={[
                        styles.statusBadge,
                        dyn.statusBadge,
                        isPaid
                          ? styles.badgePaid
                          : isApproved
                          ? styles.badgeApproved
                          : isRejected
                          ? styles.badgeRejected
                          : styles.badgePending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          dyn.statusBadgeText,
                          isPaid
                            ? styles.textPaid
                            : isApproved
                            ? styles.textApproved
                            : isRejected
                            ? styles.textRejected
                            : styles.textPending,
                        ]}
                        numberOfLines={1}
                      >
                        {isPaid
                          ? '✅ ተከፍሏል (Paid)'
                          : isApproved
                          ? '✔ ተፈቅዷል (Confirmed)'
                          : isRejected
                          ? '❌ ውድቅ ተደርጓል'
                          : isPending
                          ? '⏳ ፈቃድ በመጠባበቅ ላይ'
                          : ''}
                      </Text>
                    </View>
                  </View>

                  {/* Items Summary */}
                  <View
                    style={[
                      styles.itemsWrap,
                      dyn.itemsWrap,
                    ]}
                  >
                    {items.map((it, idx) => (
                      <View
                        key={`${String(ord.id)}-${idx}`}
                        style={[
                          styles.itemRow,
                          dyn.itemRow,
                        ]}
                      >
                        <Text
                          style={[
                            styles.itemTitle,
                            dyn.itemTitle,
                          ]}
                          numberOfLines={2}
                        >
                          • {it.product?.nameAm || 'እቃ'} (
                          {it.quantity}{' '}
                          {it.selectedUnit || 'ካርቶን'})
                        </Text>

                        <Text
                          style={[
                            styles.itemPriceText,
                            dyn.itemPriceText,
                          ]}
                          numberOfLines={1}
                        >
                          {(
                            Number(it.unitPrice) *
                            Number(it.quantity)
                          ).toLocaleString()}{' '}
                          ብር
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View
                    style={[
                      styles.cardFooter,
                      dyn.cardFooter,
                    ]}
                  >
                    <Text
                      style={[
                        styles.totalLabel,
                        dyn.totalLabel,
                      ]}
                    >
                      የብድር ድምር
                    </Text>

                    <Text
                      style={[
                        styles.totalAmountDigits,
                        dyn.totalAmountDigits,
                      ]}
                    >
                      {Number(
                        ord.totalAmount
                      ).toLocaleString()}{' '}
                      ብር
                    </Text>
                  </View>
                </View>
              );
            })
          )}

          <View style={styles.scrollTailSpacer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const GREEN = '#0F7B4A';
const INK = '#12241A';
const MUTED = '#62726A';
const LINE = '#E6ECE7';
const HAIRLINE = '#EDF2EE';
const SOFT = '#E4F2EA';

const CARD_SHADOW = {
  shadowColor: '#0B2A1B',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.07,
  shadowRadius: 11,
  elevation: 3,
};

const buildDynamic = (s, isTablet, isSmall) =>
  StyleSheet.create({
    contentWrap: {
      width: '100%',
      maxWidth: isTablet ? 620 : '100%',
      alignSelf: 'center',
    },

    loaderCard: {
      width: 68 * s,
      height: 68 * s,
      borderRadius: 22 * s,
    },

    header: {
      paddingHorizontal: isTablet ? 26 : 14 * s,
      paddingTop: 12 * s,
      paddingBottom: 11 * s,
    },

    headerAccent: {
      width: 4 * s,
      height: 28 * s,
      borderRadius: 3 * s,
      marginRight: 10 * s,
    },

    headerTitle: {
      fontSize: 20 * s,
    },

    headerSub: {
      fontSize: 11.5 * s,
      marginTop: 3 * s,
    },

    scrollContent: {
      padding: isTablet ? 20 : 13 * s,
      paddingBottom: isTablet ? 40 : 46,
      gap: 12 * s,
    },

    summaryCardGreen: {
      borderRadius: 20 * s,
      padding: isSmall ? 13 * s : 15 * s,
    },

    summaryTop: {
      gap: 9 * s,
    },

    summaryLabel: {
      fontSize: 11.5 * s,
      marginBottom: 5 * s,
    },

    remainingCreditDigits: {
      fontSize: (isSmall ? 23 : 26) * s,
      letterSpacing: 0.3,
    },

    creditChip: {
      paddingHorizontal: 9 * s,
      paddingVertical: 5 * s,
      gap: 5 * s,
    },

    creditChipDot: {
      width: 5 * s,
      height: 5 * s,
      borderRadius: 3 * s,
    },

    creditChipText: {
      fontSize: 9.5 * s,
    },

    meterTrack: {
      height: 6 * s,
      borderRadius: 4 * s,
      marginTop: 13 * s,
    },

    meterFill: {
      height: 6 * s,
      borderRadius: 4 * s,
    },

    summaryDivider: {
      marginVertical: 13 * s,
    },

    summaryBottom: {
      gap: 10 * s,
    },

    metricItem: {
      minWidth: 0,
    },

    metricSplit: {
      width: 1,
      alignSelf: 'stretch',
      marginVertical: 1,
    },

    metricLabel: {
      fontSize: 11 * s,
    },

    metricValue: {
      fontSize: 15 * s,
      marginTop: 3 * s,
    },

    listHeaderRow: {
      marginTop: 6 * s,
      paddingHorizontal: 2 * s,
      gap: 8 * s,
    },

    listAccent: {
      width: 3.5 * s,
      height: 15 * s,
      borderRadius: 3 * s,
      marginRight: 8 * s,
    },

    listSectionTitle: {
      fontSize: 14 * s,
    },

    listCountChip: {
      paddingHorizontal: 9 * s,
      paddingVertical: 4 * s,
      borderRadius: 9 * s,
    },

    listCountText: {
      fontSize: 10.5 * s,
    },

    emptyCard: {
      borderRadius: 18 * s,
      padding: isSmall ? 20 * s : 26 * s,
      paddingTop: isSmall ? 24 * s : 30 * s,
      marginTop: 10 * s,
    },

    emptyIconWrap: {
      width: 62 * s,
      height: 62 * s,
      borderRadius: 21 * s,
      marginBottom: 13 * s,
    },

    emptyEmoji: {
      fontSize: 27 * s,
    },

    emptyTitle: {
      fontSize: 14 * s,
      marginBottom: 6 * s,
    },

    emptySub: {
      fontSize: 12 * s,
      lineHeight: 17 * s,
      marginBottom: 18 * s,
    },

    orderBtn: {
      paddingHorizontal: 22 * s,
      paddingVertical: 11 * s,
      borderRadius: 13 * s,
    },

    orderBtnText: {
      fontSize: 13 * s,
    },

    orderCard: {
      borderRadius: 16 * s,
      padding: 13 * s,
      paddingLeft: 15 * s,
    },

    orderCardTop: {
      marginBottom: 11 * s,
      gap: 8 * s,
    },

    orderIdText: {
      fontSize: 13 * s,
    },

    orderDateText: {
      fontSize: 10.5 * s,
      marginTop: 3 * s,
    },

    statusBadge: {
      paddingHorizontal: 9 * s,
      paddingVertical: 5 * s,
    },

    statusBadgeText: {
      fontSize: 9.5 * s,
    },

    itemsWrap: {
      borderRadius: 12 * s,
      padding: 10 * s,
      gap: 7 * s,
      marginBottom: 11 * s,
    },

    itemRow: {
      gap: 8 * s,
    },

    itemTitle: {
      fontSize: 11.5 * s,
      marginRight: 8 * s,
      lineHeight: 16 * s,
    },

    itemPriceText: {
      fontSize: 12 * s,
    },

    cardFooter: {
      paddingTop: 10 * s,
      gap: 6 * s,
    },

    totalLabel: {
      fontSize: 11.5 * s,
    },

    totalAmountDigits: {
      fontSize: 16 * s,
    },
  });

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F7F4',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loaderCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LINE,
    justifyContent: 'center',
    alignItems: 'center',
    ...CARD_SHADOW,
  },

  glowOrbA: {
    position: 'absolute',
    top: 110,
    left: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(15, 123, 74, 0.10)',
  },

  glowOrbB: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 235,
    height: 235,
    borderRadius: 120,
    backgroundColor: 'rgba(242, 183, 5, 0.09)',
  },

  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    overflow: 'hidden',
    shadowColor: '#0B2A1B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 9,
    elevation: 2,
    zIndex: 5,
  },

  headerBloom: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(15, 123, 74, 0.07)',
  },

  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerAccent: {
    backgroundColor: GREEN,
  },

  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  headerTitle: {
    fontWeight: '900',
    color: INK,
    letterSpacing: 0.2,
  },

  headerSub: {
    color: MUTED,
    fontWeight: '600',
  },

  scroll: {
    flex: 1,
  },

  contentWrap: {
    width: '100%',
  },

  scrollContent: {
    flexGrow: 1,
  },

  scrollTailSpacer: {
    height: 8,
  },

  summaryCardGreen: {
    backgroundColor: GREEN,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(63, 208, 138, 0.55)',
    shadowColor: '#0F7B4A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },

  greenOrbBig: {
    position: 'absolute',
    top: -80,
    right: -55,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(63, 208, 138, 0.30)',
  },

  greenOrbSmall: {
    position: 'absolute',
    bottom: -70,
    left: -35,
    width: 165,
    height: 165,
    borderRadius: 85,
    backgroundColor: 'rgba(242, 183, 5, 0.20)',
  },

  greenShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '46%',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },

  greenTopLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.30)',
  },

  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  summaryTopLeft: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },

  summaryLabel: {
    color: '#D4EBE0',
    fontWeight: '700',
  },

  remainingCreditDigits: {
    color: '#FFFFFF',
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  creditChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.32)',
    borderRadius: 999,
    flexShrink: 0,
  },

  creditChipDot: {
    backgroundColor: '#7CFFC4',
  },

  creditChipText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  meterTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    overflow: 'hidden',
  },

  meterFill: {
    backgroundColor: '#7CFFC4',
  },

  meterFillWarn: {
    backgroundColor: '#FFD27A',
  },

  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },

  summaryBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  metricItem: {
    flex: 1,
  },

  metricSplit: {
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
  },

  metricLabel: {
    color: '#D4EBE0',
    fontWeight: '700',
  },

  metricValue: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  listTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },

  listAccent: {
    backgroundColor: GREEN,
  },

  listSectionTitle: {
    fontWeight: '900',
    color: INK,
    letterSpacing: 0.1,
  },

  listCountChip: {
    backgroundColor: SOFT,
    borderWidth: 1,
    borderColor: '#CFE7D9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  listCountText: {
    color: GREEN,
    fontWeight: '800',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LINE,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },

  emptyGlow: {
    position: 'absolute',
    top: -70,
    right: -55,
    width: 185,
    height: 185,
    borderRadius: 95,
    backgroundColor: 'rgba(15, 123, 74, 0.07)',
  },

  emptyIconWrap: {
    backgroundColor: SOFT,
    borderWidth: 1,
    borderColor: '#CFE7D9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyEmoji: {
    fontSize: 27,
  },

  emptyTitle: {
    fontWeight: '900',
    color: INK,
    textAlign: 'center',
  },

  emptySub: {
    color: MUTED,
    textAlign: 'center',
    fontWeight: '500',
  },

  orderBtn: {
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#0F7B4A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },

  orderBtnText: {
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

  orderCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LINE,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },

  orderStripe: {
    position: 'absolute',
    top: 12,
    bottom: 12,
    left: 0,
    width: 3.5,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    opacity: 0.9,
  },

  cardTopLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: HAIRLINE,
  },

  orderCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  orderIdWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },

  orderIdText: {
    fontWeight: '900',
    color: INK,
    letterSpacing: 0.2,
  },

  orderDateText: {
    color: MUTED,
    fontWeight: '600',
  },

  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(18, 36, 26, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    maxWidth: '60%',
  },

  badgePending: {
    backgroundColor: '#FEF3C7',
  },

  textPending: {
    color: '#92400E',
  },

  badgeApproved: {
    backgroundColor: '#E4F2EA',
  },

  textApproved: {
    color: '#0F7B4A',
  },

  badgePaid: {
    backgroundColor: '#E0F2FE',
  },

  textPaid: {
    color: '#0369A1',
  },

  badgeRejected: {
    backgroundColor: '#FEE2E2',
  },

  textRejected: {
    color: '#B91C1C',
  },

  statusBadgeText: {
    fontWeight: '900',
  },

  itemsWrap: {
    backgroundColor: '#F7FAF7',
    borderWidth: 1,
    borderColor: '#EDF3EE',
    borderRadius: 12,
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  itemTitle: {
    color: '#334155',
    fontWeight: '700',
    flex: 1,
    minWidth: 0,
  },

  itemPriceText: {
    fontWeight: '800',
    color: INK,
    flexShrink: 0,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
  },

  totalLabel: {
    fontWeight: '800',
    color: MUTED,
  },

  totalAmountDigits: {
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 0.2,
  },
});