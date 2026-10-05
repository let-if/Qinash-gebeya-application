

// import React, { useCallback, useState } from 'react';
// import {
//   ActivityIndicator,
//   Image,
//   RefreshControl,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { useFocusEffect, useRouter } from 'expo-router';
// import { apiRequest } from '../../lib/api';
// import { useSession } from '../../context/SessionContext';
// import CustomAlert from '../../components/CustomAlert';

// const UNIT_LABEL_AM = {
//   CARTON: 'ካርቶን',
//   HALF_CARTON: 'ግማሽ ካርቶን',
//   PACK: 'ፓኬት',
//   DOZEN: 'ደርዘን',
//   KG: 'ኪሎ',
//   QUINTAL: 'ኩንታል',
//   MEREB: 'መረብ',
//   PIECE: 'ቁራጭ',
// };

// export default function OrdersScreen() {
//   const router = useRouter();
//   const { token, lang } = useSession();

//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   // Custom Alert State
//   const [alertConfig, setAlertConfig] = useState({
//     visible: false,
//     title: '',
//     message: '',
//     type: 'error',
//     onCloseAction: null,
//   });

//   const triggerAlert = (
//     title,
//     message,
//     type = 'error',
//     onCloseAction = null
//   ) => {
//     setAlertConfig({
//       visible: true,
//       title,
//       message,
//       type,
//       onCloseAction,
//     });
//   };

//   const closeAlert = () => {
//     const action = alertConfig.onCloseAction;
//     setAlertConfig((prev) => ({ ...prev, visible: false }));
//     if (action) action();
//   };

//   const fetchOrders = useCallback(async () => {
//     if (!token) return;

//     try {
//       const data = await apiRequest('/orders', { token });
//       const orderList = Array.isArray(data) ? data : data?.orders || [];
//       setOrders(orderList);
//     } catch (err) {
//       triggerAlert(
//         'ስህተት ተፈጥሯል',
//         err.message || 'ትእዛዞችን ማግኘት አልተቻለም፤ እባክዎ ደግመው ይሞክሩ',
//         'error'
//       );
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [token]);

//   useFocusEffect(
//     useCallback(() => {
//       fetchOrders();
//     }, [fetchOrders])
//   );

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchOrders();
//   };

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case 'PENDING':
//         return {
//           label: '⏳ በማረጋገጥ ላይ (Pending)',
//           color: '#D97706',
//           bg: '#FEF3C7',
//         };
//       case 'APPROVED':
//         return {
//           label: '✅ ጸድቋል (Approved)',
//           color: '#0F7B4A',
//           bg: '#E4F2EA',
//         };
//       case 'DISPATCHED':
//         return {
//           label: '🚚 በመንገድ ላይ (Dispatched)',
//           color: '#2563EB',
//           bg: '#DBEAFE',
//         };
//       case 'DELIVERED':
//         return {
//           label: '📦 የደረሰ (Delivered)',
//           color: '#047857',
//           bg: '#D1FAE5',
//         };
//       case 'CANCELLED':
//         return {
//           label: '❌ የተሰረዘ (Cancelled)',
//           color: '#DC2626',
//           bg: '#FEE2E2',
//         };
//       default:
//         return {
//           label: status || 'በመጠባበቅ ላይ',
//           color: '#4B5563',
//           bg: '#F3F4F6',
//         };
//     }
//   };

//   const getSlotLabel = (slot) => {
//     return slot === 'BATCH_6AM'
//       ? '🌅 ንጋት 12:00 (6:00 AM ዙር)'
//       : '☀️ ቀትር 6:00 (12:00 PM ዙር)';
//   };

//   if (loading && !refreshing) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#0F7B4A" />
//         <Text style={styles.loadingText}>
//           ትእዛዞችን በማዘጋጀት ላይ...
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.screen}>
//       {/* Top Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>
//           የትእዛዞች ሁኔታ እና ደረሰኝ
//         </Text>
//         <Text style={styles.headerSubtitle}>
//           የአዳማ ማዕከላዊ የጅምላ ማከፋፈያ (Qinash Gebeya)
//         </Text>
//       </View>

//       <ScrollView
//         style={styles.container}
//         contentContainerStyle={styles.content}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={['#0F7B4A']}
//             tintColor="#0F7B4A"
//           />
//         }
//         showsVerticalScrollIndicator={false}
//       >
//         {orders.length === 0 ? (
//           <View style={styles.emptyCard}>
//             <Text style={styles.emptyIcon}>📦</Text>
//             <Text style={styles.emptyTitle}>
//               ምንም ንቁ ትእዛዝ አልተገኘም
//             </Text>
//             <Text style={styles.emptySubtitle}>
//               ያዘዟቸው እቃዎች እዚህ በዝርዝር ከነደረሰኛቸውና የማረጋገጫ ሁኔታቸው ይታያሉ።
//             </Text>

//             <TouchableOpacity
//               style={styles.shopNowBtn}
//               onPress={() => router.push('/(tabs)')}
//               activeOpacity={0.85}
//             >
//               <Text style={styles.shopNowBtnText}>
//                 እቃዎችን ማዘዝ ጀምር 🛒
//               </Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           orders.map((order) => {
//             const statusInfo = getStatusBadge(order.status);
//             const total = Number(order.totalAmount || 0);
//             const items = order.items || order.orderItems || [];

//             return (
//               <View style={styles.orderCard} key={order.id}>
//                 {/* Order Top Bar */}
//                 <View style={styles.orderTop}>
//                   <View>
//                     <Text style={styles.orderNumber}>
//                       ትእዛዝ #{order.id.slice(-6).toUpperCase()}
//                     </Text>
//                     <Text style={styles.orderDate}>
//                       {new Date(order.createdAt).toLocaleDateString('en-GB', {
//                         day: 'numeric',
//                         month: 'short',
//                         year: 'numeric',
//                         hour: '2-digit',
//                         minute: '2-digit',
//                       })}
//                     </Text>
//                   </View>

//                   <View
//                     style={[
//                       styles.statusBadge,
//                       { backgroundColor: statusInfo.bg },
//                     ]}
//                   >
//                     <Text
//                       style={[
//                         styles.statusText,
//                         { color: statusInfo.color },
//                       ]}
//                     >
//                       {statusInfo.label}
//                     </Text>
//                   </View>
//                 </View>

//                 {/* Delivery Slot Row */}
//                 <View style={styles.slotRow}>
//                   <Text style={styles.slotLabel}>የማድረሻ ዙር፦</Text>
//                   <Text style={styles.slotValue}>
//                     {getSlotLabel(order.deliverySlot)}
//                   </Text>
//                 </View>

//                 <View style={styles.divider} />

//                 {/* Ordered Items Breakdown */}
//                 <View style={styles.itemsWrap}>
//                   {items.map((item, idx) => {
//                     const itemName =
//                       lang === 'om'
//                         ? item.product?.nameOm || item.product?.nameAm || 'ምርት'
//                         : item.product?.nameAm || item.product?.nameOm || 'ምርት';

//                     const unitPrice = Number(item.unitPrice || 0);
//                     const subtotal = unitPrice * Number(item.quantity || 1);
//                     const isImageUrl =
//                       item.product?.imageUrl &&
//                       (item.product.imageUrl.startsWith('http') ||
//                         item.product.imageUrl.startsWith('/'));

//                     const displayUnit =
//                       UNIT_LABEL_AM[item.selectedUnit] ||
//                       UNIT_LABEL_AM[item.unitType] ||
//                       item.selectedUnit ||
//                       item.unitType ||
//                       'ካርቶን';

//                     return (
//                       <View style={styles.itemRow} key={item.id || idx}>
//                         <View style={styles.itemAvatar}>
//                           {isImageUrl ? (
//                             <Image
//                               source={{ uri: item.product.imageUrl }}
//                               style={styles.itemImg}
//                               resizeMode="cover"
//                             />
//                           ) : (
//                             <Text style={styles.itemEmoji}>
//                               {item.product?.imageUrl || '📦'}
//                             </Text>
//                           )}
//                         </View>

//                         <View style={styles.itemLeft}>
//                           <Text style={styles.itemName} numberOfLines={1}>
//                             {itemName}
//                           </Text>
//                           <Text style={styles.itemUnit}>
//                             {item.quantity} {displayUnit} × {unitPrice.toLocaleString()} ብር
//                           </Text>
//                         </View>

//                         <Text style={styles.itemSubtotal}>
//                           {subtotal.toLocaleString()} ብር
//                         </Text>
//                       </View>
//                     );
//                   })}
//                 </View>

//                 <View style={styles.divider} />

//                 {/* Order Footer Total */}
//                 <View style={styles.orderFooter}>
//                   <Text style={styles.totalLabel}>
//                     ጠቅላላ የተከፈለ (Total)
//                   </Text>
//                   <Text style={styles.totalValue}>
//                     {total.toLocaleString()} ብር
//                   </Text>
//                 </View>
//               </View>
//             );
//           })
//         )}
//       </ScrollView>

//       {/* Pure Amharic Custom Alert Modal */}
//       <CustomAlert
//         visible={alertConfig.visible}
//         title={alertConfig.title}
//         message={alertConfig.message}
//         type={alertConfig.type}
//         onClose={closeAlert}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     backgroundColor: '#F5F7F3',
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5F7F3',
//   },
//   loadingText: {
//     marginTop: 10,
//     color: '#62726A',
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   header: {
//     backgroundColor: '#FFFFFF',
//     paddingTop: 54,
//     paddingBottom: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E6ECE7',
//   },
//   headerTitle: {
//     fontSize: 19,
//     fontWeight: '900',
//     color: '#12241A',
//   },
//   headerSubtitle: {
//     fontSize: 12,
//     color: '#62726A',
//     marginTop: 2,
//     fontWeight: '500',
//   },
//   container: {
//     flex: 1,
//   },
//   content: {
//     padding: 14,
//     paddingBottom: 120, // Clears the bottom navigation tabs comfortably
//   },
//   emptyCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     padding: 36,
//     alignItems: 'center',
//     marginTop: 40,
//     borderWidth: 1,
//     borderColor: '#E6ECE7',
//   },
//   emptyIcon: {
//     fontSize: 48,
//     marginBottom: 12,
//   },
//   emptyTitle: {
//     fontSize: 17,
//     fontWeight: '800',
//     color: '#12241A',
//   },
//   emptySubtitle: {
//     fontSize: 13,
//     color: '#62726A',
//     textAlign: 'center',
//     marginTop: 6,
//     lineHeight: 18,
//   },
//   shopNowBtn: {
//     marginTop: 20,
//     backgroundColor: '#0F7B4A',
//     paddingHorizontal: 22,
//     paddingVertical: 12,
//     borderRadius: 14,
//   },
//   shopNowBtnText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '800',
//   },
//   orderCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 18,
//     padding: 16,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: '#E6ECE7',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//   },
//   orderTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//   },
//   orderNumber: {
//     fontSize: 15,
//     fontWeight: '900',
//     color: '#12241A',
//   },
//   orderDate: {
//     fontSize: 11,
//     color: '#8DA396',
//     marginTop: 3,
//     fontWeight: '600',
//   },
//   statusBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 10,
//   },
//   statusText: {
//     fontSize: 11,
//     fontWeight: '800',
//   },
//   slotRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   slotLabel: {
//     fontSize: 12,
//     color: '#62726A',
//     fontWeight: '600',
//   },
//   slotValue: {
//     fontSize: 12,
//     color: '#12241A',
//     fontWeight: '700',
//     marginLeft: 4,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#F0F4F1',
//     marginVertical: 12,
//   },
//   itemsWrap: {
//     gap: 10,
//   },
//   itemRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   itemAvatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     backgroundColor: '#E4F2EA',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//     overflow: 'hidden',
//   },
//   itemImg: {
//     width: '100%',
//     height: '100%',
//   },
//   itemEmoji: {
//     fontSize: 18,
//   },
//   itemLeft: {
//     flex: 1,
//     paddingRight: 10,
//   },
//   itemName: {
//     fontSize: 13,
//     fontWeight: '800',
//     color: '#12241A',
//   },
//   itemUnit: {
//     fontSize: 11,
//     color: '#62726A',
//     marginTop: 2,
//     fontWeight: '600',
//   },
//   itemSubtotal: {
//     fontSize: 13,
//     fontWeight: '900',
//     color: '#12241A',
//   },
//   orderFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   totalLabel: {
//     fontSize: 14,
//     fontWeight: '800',
//     color: '#12241A',
//   },
//   totalValue: {
//     fontSize: 18,
//     fontWeight: '900',
//     color: '#0F7B4A',
//   },
// });

import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { apiRequest } from '../../lib/api';
import { useSession } from '../../context/SessionContext';
import CustomAlert from '../../components/CustomAlert';

const UNIT_LABEL_AM = {
  CARTON: 'ካርቶን',
  HALF_CARTON: 'ግማሽ ካርቶን',
  PACK: 'ፓኬት',
  DOZEN: 'ደርዘን',
  KG: 'ኪሎ',
  QUINTAL: 'ኩንታል',
  MEREB: 'መረብ',
  PIECE: 'ቁራጭ',
};

export default function OrdersScreen() {
  const router = useRouter();
  const { token, lang } = useSession();
  const { width: SCREEN_W } = useWindowDimensions();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error',
    onCloseAction: null,
  });

  // ---- Adaptive layout metrics (UI only) ----
  const isSmall = SCREEN_W < 350;
  const isTablet = SCREEN_W >= 680;
  const S = isSmall ? 0.9 : isTablet ? 1.12 : SCREEN_W >= 420 ? 1.06 : 1;
  const dyn = useMemo(() => buildDynamic(S, isTablet), [S, isTablet]);

  const triggerAlert = (
    title,
    message,
    type = 'error',
    onCloseAction = null
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      onCloseAction,
    });
  };

  const closeAlert = () => {
    const action = alertConfig.onCloseAction;
    setAlertConfig((prev) => ({ ...prev, visible: false }));
    if (action) action();
  };

  const fetchOrders = useCallback(async () => {
    if (!token) return;

    try {
      const data = await apiRequest('/orders', { token });
      const orderList = Array.isArray(data) ? data : data?.orders || [];
      setOrders(orderList);
    } catch (err) {
      triggerAlert(
        'ስህተት ተፈጥሯል',
        err.message || 'ትእዛዞችን ማግኘት አልተቻለም፤ እባክዎ ደግመው ይሞክሩ',
        'error'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return {
          label: '⏳ በማረጋገጥ ላይ (Pending)',
          color: '#D97706',
          bg: '#FEF3C7',
        };
      case 'APPROVED':
        return {
          label: '✅ ጸድቋል (Approved)',
          color: '#0F7B4A',
          bg: '#E4F2EA',
        };
      case 'DISPATCHED':
        return {
          label: '🚚 በመንገድ ላይ (Dispatched)',
          color: '#2563EB',
          bg: '#DBEAFE',
        };
      case 'DELIVERED':
        return {
          label: '📦 የደረሰ (Delivered)',
          color: '#047857',
          bg: '#D1FAE5',
        };
      case 'CANCELLED':
        return {
          label: '❌ የተሰረዘ (Cancelled)',
          color: '#DC2626',
          bg: '#FEE2E2',
        };
      default:
        return {
          label: status || 'በመጠባበቅ ላይ',
          color: '#4B5563',
          bg: '#F3F4F6',
        };
    }
  };

  const getSlotLabel = (slot) => {
    return slot === 'BATCH_6AM'
      ? '🌅 ንጋት 12:00 (6:00 AM ዙር)'
      : '☀️ ቀትር 6:00 (12:00 PM ዙር)';
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <View style={[styles.loaderCard, dyn.loaderCard]}>
          <ActivityIndicator size="large" color="#0F7B4A" />
        </View>
        <Text style={[styles.loadingText, dyn.loadingText]}>
          ትእዛዞችን በማዘጋጀት ላይ...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.glowOrbA} />
      <View pointerEvents="none" style={styles.glowOrbB} />

      {/* ---------- Top Header ---------- */}
      <View style={[styles.header, dyn.header]}>
        <View pointerEvents="none" style={styles.headerShine} />

        <View style={[styles.headerInner, dyn.contentWrap]}>
          <View style={[styles.headerAccent, dyn.headerAccent]} />

          <View style={styles.headerTextWrap}>
            <Text style={[styles.headerTitle, dyn.headerTitle]} numberOfLines={1}>
              የትእዛዞች ሁኔታ እና ደረሰኝ
            </Text>
            <Text style={[styles.headerSubtitle, dyn.headerSubtitle]} numberOfLines={1}>
              የአዳማ ማዕከላዊ የጅምላ ማከፋፈያ (Qinash Gebeya)
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, dyn.content]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0F7B4A']}
            tintColor="#0F7B4A"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentWrap, dyn.contentWrap]}>
          {orders.length === 0 ? (
            <View style={[styles.emptyCard, dyn.emptyCard]}>
              <View pointerEvents="none" style={styles.emptyGlow} />

              <View style={[styles.emptyIconWrap, dyn.emptyIconWrap]}>
                <Text style={[styles.emptyIcon, dyn.emptyIcon]}>📦</Text>
              </View>

              <Text style={[styles.emptyTitle, dyn.emptyTitle]}>
                ምንም ንቁ ትእዛዝ አልተገኘም
              </Text>
              <Text style={[styles.emptySubtitle, dyn.emptySubtitle]}>
                ያዘዟቸው እቃዎች እዚህ በዝርዝር ከነደረሰኛቸውና የማረጋገጫ ሁኔታቸው ይታያሉ።
              </Text>

              <TouchableOpacity
                style={[styles.shopNowBtn, dyn.shopNowBtn]}
                onPress={() => router.push('/(tabs)')}
                activeOpacity={0.85}
              >
                <View pointerEvents="none" style={styles.btnShine} />
                <Text style={[styles.shopNowBtnText, dyn.shopNowBtnText]}>
                  እቃዎችን ማዘዝ ጀምር 🛒
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            orders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              const total = Number(order.totalAmount || 0);
              const items = order.items || order.orderItems || [];

              return (
                <View style={[styles.orderCard, dyn.orderCard]} key={order.id}>
                  <View
                    pointerEvents="none"
                    style={[
                      styles.orderStripe,
                      { backgroundColor: statusInfo.color },
                    ]}
                  />
                  <View pointerEvents="none" style={styles.cardShine} />

                  {/* Order Top Bar */}
                  <View style={[styles.orderTop, dyn.orderTop]}>
                    <View style={styles.orderIdWrap}>
                      <Text
                        style={[styles.orderNumber, dyn.orderNumber]}
                        numberOfLines={1}
                      >
                        ትእዛዝ #{order.id.slice(-6).toUpperCase()}
                      </Text>
                      <Text style={[styles.orderDate, dyn.orderDate]} numberOfLines={1}>
                        {new Date(order.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        dyn.statusBadge,
                        { backgroundColor: statusInfo.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          dyn.statusText,
                          { color: statusInfo.color },
                        ]}
                        numberOfLines={1}
                      >
                        {statusInfo.label}
                      </Text>
                    </View>
                  </View>

                  {/* Delivery Slot Row */}
                  <View style={[styles.slotRow, dyn.slotRow]}>
                    <Text style={[styles.slotLabel, dyn.slotLabel]}>
                      የማድረሻ ዙር፦
                    </Text>
                    <Text
                      style={[styles.slotValue, dyn.slotValue]}
                      numberOfLines={1}
                    >
                      {getSlotLabel(order.deliverySlot)}
                    </Text>
                  </View>

                  <View style={[styles.divider, dyn.divider]} />

                  {/* Ordered Items Breakdown */}
                  <View style={[styles.itemsWrap, dyn.itemsWrap]}>
                    {items.map((item, idx) => {
                      const itemName =
                        lang === 'om'
                          ? item.product?.nameOm || item.product?.nameAm || 'ምርት'
                          : item.product?.nameAm || item.product?.nameOm || 'ምርት';

                      const unitPrice = Number(item.unitPrice || 0);
                      const subtotal = unitPrice * Number(item.quantity || 1);
                      const isImageUrl =
                        item.product?.imageUrl &&
                        (item.product.imageUrl.startsWith('http') ||
                          item.product.imageUrl.startsWith('/'));

                      const displayUnit =
                        UNIT_LABEL_AM[item.selectedUnit] ||
                        UNIT_LABEL_AM[item.unitType] ||
                        item.selectedUnit ||
                        item.unitType ||
                        'ካርቶን';

                      return (
                        <View style={[styles.itemRow, dyn.itemRow]} key={item.id || idx}>
                          <View style={[styles.itemAvatar, dyn.itemAvatar]}>
                            {isImageUrl ? (
                              <Image
                                source={{ uri: item.product.imageUrl }}
                                style={styles.itemImg}
                                resizeMode="cover"
                              />
                            ) : (
                              <Text style={[styles.itemEmoji, dyn.itemEmoji]}>
                                {item.product?.imageUrl || '📦'}
                              </Text>
                            )}
                          </View>

                          <View style={styles.itemLeft}>
                            <Text style={[styles.itemName, dyn.itemName]} numberOfLines={1}>
                              {itemName}
                            </Text>
                            <Text style={[styles.itemUnit, dyn.itemUnit]} numberOfLines={1}>
                              {item.quantity} {displayUnit} × {unitPrice.toLocaleString()} ብር
                            </Text>
                          </View>

                          <Text style={[styles.itemSubtotal, dyn.itemSubtotal]} numberOfLines={1}>
                            {subtotal.toLocaleString()} ብር
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <View style={[styles.divider, dyn.divider]} />

                  {/* Order Footer Total */}
                  <View style={[styles.orderFooter, dyn.orderFooter]}>
                    <Text style={[styles.totalLabel, dyn.totalLabel]}>
                      ጠቅላላ የተከፈለ (Total)
                    </Text>
                    <Text style={[styles.totalValue, dyn.totalValue]} numberOfLines={1}>
                      {total.toLocaleString()} ብር
                    </Text>
                  </View>
                </View>
              );
            })
          )}

          <View style={styles.scrollTailSpacer} />
        </View>
      </ScrollView>

      {/* Pure Amharic Custom Alert Modal */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={closeAlert}
      />
    </View>
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

/* Adaptive metrics — scales spacing/type with the device width */
const buildDynamic = (s, isTablet) =>
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
    loadingText: { fontSize: 13 * s, marginTop: 12 * s },

    /* Header */
    header: {
      paddingTop: isTablet ? 30 : 54,
      paddingBottom: 13 * s,
      paddingHorizontal: isTablet ? 26 : 14 * s,
    },
    headerAccent: {
      width: 4 * s,
      height: 30 * s,
      borderRadius: 3 * s,
      marginRight: 10 * s,
    },
    headerTitle: { fontSize: 19 * s },
    headerSubtitle: { fontSize: 11.5 * s, marginTop: 3 * s },

    /* Scroll */
    content: {
      padding: isTablet ? 20 : 13 * s,
      paddingTop: isTablet ? 18 : 12 * s,
      paddingBottom: isTablet ? 40 : 120,
    },

    /* Empty state */
    emptyCard: {
      borderRadius: 20 * s,
      padding: isTablet ? 40 : 28 * s,
      paddingTop: isTablet ? 44 : 32 * s,
      marginTop: isTablet ? 24 : 30 * s,
    },
    emptyIconWrap: {
      width: 66 * s,
      height: 66 * s,
      borderRadius: 23 * s,
      marginBottom: 14 * s,
    },
    emptyIcon: { fontSize: 30 * s },
    emptyTitle: { fontSize: 16.5 * s },
    emptySubtitle: { fontSize: 12.5 * s, lineHeight: 18 * s, marginTop: 7 * s },
    shopNowBtn: {
      marginTop: 20 * s,
      paddingHorizontal: 24 * s,
      paddingVertical: 12.5 * s,
      borderRadius: 14 * s,
    },
    shopNowBtnText: { fontSize: 13.5 * s },

    /* Order card */
    orderCard: {
      borderRadius: 17 * s,
      padding: 13 * s,
      paddingLeft: 15 * s,
      marginBottom: 11 * s,
    },
    orderTop: {
      gap: 8 * s,
    },
    orderNumber: { fontSize: 14.5 * s },
    orderDate: { fontSize: 10.5 * s, marginTop: 4 * s },
    statusBadge: {
      paddingHorizontal: 9 * s,
      paddingVertical: 5 * s,
      borderRadius: 10 * s,
    },
    statusText: { fontSize: 10.5 * s },

    /* Slot chip */
    slotRow: {
      borderRadius: 11 * s,
      paddingVertical: 8 * s,
      paddingHorizontal: 10 * s,
      marginTop: 11 * s,
      gap: 4 * s,
    },
    slotLabel: { fontSize: 11.5 * s },
    slotValue: { fontSize: 11.5 * s },

    divider: { marginVertical: 11 * s },

    /* Items */
    itemsWrap: { gap: 10 * s },
    itemRow: { gap: 3 * s },
    itemAvatar: {
      width: 38 * s,
      height: 38 * s,
      borderRadius: 11 * s,
      marginRight: 10 * s,
    },
    itemEmoji: { fontSize: 18 * s },
    itemName: { fontSize: 12.5 * s },
    itemUnit: { fontSize: 10.5 * s, marginTop: 3 * s },
    itemSubtotal: { fontSize: 12.5 * s },

    /* Footer total */
    orderFooter: {
      borderRadius: 12 * s,
      paddingVertical: 10 * s,
      paddingHorizontal: 12 * s,
      gap: 6 * s,
    },
    totalLabel: { fontSize: 12.5 * s },
    totalValue: { fontSize: 17.5 * s },
  });

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7F3',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7F3',
  },
  loaderCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LINE,
    justifyContent: 'center',
    alignItems: 'center',
    ...CARD_SHADOW,
  },
  loadingText: {
    color: MUTED,
    fontWeight: '700',
  },

  /* ---------- Ambient glow ---------- */
  glowOrbA: {
    position: 'absolute',
    top: 90,
    right: -80,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(15, 123, 74, 0.10)',
  },
  glowOrbB: {
    position: 'absolute',
    bottom: -70,
    left: -80,
    width: 235,
    height: 235,
    borderRadius: 120,
    backgroundColor: 'rgba(242, 183, 5, 0.09)',
  },

  /* ---------- Header ---------- */
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
  headerShine: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(15, 123, 74, 0.06)',
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
  headerSubtitle: {
    color: MUTED,
    fontWeight: '600',
  },

  container: {
    flex: 1,
  },
  contentWrap: {
    width: '100%',
  },
  scrollTailSpacer: {
    height: 8,
  },

  /* ---------- Empty state ---------- */
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
    left: -50,
    width: 190,
    height: 190,
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
  emptyTitle: {
    fontWeight: '900',
    color: INK,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: MUTED,
    textAlign: 'center',
    fontWeight: '500',
  },
  shopNowBtn: {
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
  shopNowBtnText: {
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

  /* ---------- Order card ---------- */
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
    opacity: 0.85,
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: HAIRLINE,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderIdWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  orderNumber: {
    fontWeight: '900',
    color: INK,
    letterSpacing: 0.2,
  },
  orderDate: {
    color: '#8DA396',
    fontWeight: '600',
  },
  statusBadge: {
    borderWidth: 1,
    borderColor: 'rgba(18, 36, 26, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    maxWidth: '58%',
  },
  statusText: {
    fontWeight: '800',
  },

  /* Slot chip */
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    backgroundColor: '#F4F9F5',
    borderWidth: 1,
    borderColor: '#E3EFE7',
  },
  slotLabel: {
    color: MUTED,
    fontWeight: '700',
  },
  slotValue: {
    color: INK,
    fontWeight: '800',
    flexShrink: 1,
    minWidth: 0,
  },

  divider: {
    height: 1,
    backgroundColor: HAIRLINE,
  },

  /* Items */
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemAvatar: {
    backgroundColor: SOFT,
    borderWidth: 1,
    borderColor: '#D6EBE0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  itemImg: {
    width: '100%',
    height: '100%',
  },
  itemLeft: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  itemName: {
    fontWeight: '800',
    color: INK,
  },
  itemUnit: {
    color: MUTED,
    fontWeight: '600',
  },
  itemSubtotal: {
    fontWeight: '900',
    color: GREEN,
    flexShrink: 0,
  },

  /* Footer total */
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    backgroundColor: '#F4F9F5',
    borderWidth: 1,
    borderColor: '#E3EFE7',
  },
  totalLabel: {
    fontWeight: '800',
    color: INK,
  },
  totalValue: {
    fontWeight: '900',
    color: GREEN,
    letterSpacing: 0.2,
  },
});