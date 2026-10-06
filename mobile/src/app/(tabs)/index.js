
// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   Platform,
//   RefreshControl,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   useWindowDimensions,
// } from 'react-native';
// import { useFocusEffect, useRouter } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Video, ResizeMode } from 'expo-av';
// import { apiRequest } from '../../lib/api';
// import { useSession } from '../../context/SessionContext';

// const DEFAULT_CATEGORIES = [
//   { id: 'cat_groc', name: 'ግሮሰሪ እና የባልትና ውጤቶች', icon: '🛒', slug: 'grocery' },
//   { id: 'cat_clean', name: 'የጽዳት እና የግል እንክብካቤ እቃዎች', icon: '🧽', slug: 'cleaning' },
//   { id: 'cat_drinks', name: 'መጠጦች', icon: '🥤', slug: 'beverages' },
//   { id: 'cat_sweets', name: 'መክሰስ እና ጣፋጮች', icon: '🍬', slug: 'sweets' },
//   { id: 'cat_stat', name: 'የጽህፈት መሳሪያዎች', icon: '✏️', slug: 'stationery' },
//   { id: 'cat_veg', name: 'የግብርና ምርቶች እና አትክልት', icon: '🥔', slug: 'vegetables' },
//   { id: 'cat_pack', name: 'የማሸጊያ እቃዎች እና ሻማ', icon: '📦', slug: 'packaging' },
//   { id: 'cat_tob', name: 'የትምባሆ ምርቶች', icon: '🚬', slug: 'tobacco' },
// ];

// const AD_HEIGHT = 152;

// const ROW_SHADOW = {
//   shadowColor: '#0B2A1B',
//   shadowOffset: { width: 0, height: 4 },
//   shadowOpacity: 0.07,
//   shadowRadius: 10,
//   elevation: 3,
// };

// const normalize = (value) => String(value ?? '').trim().toLowerCase();

// export default function ShopScreen() {
//   const router = useRouter();
//   const { token, lang } = useSession();
//   const { width: SCREEN_W } = useWindowDimensions();

//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedCatId, setSelectedCatId] = useState(null);
//   const [selectedUnits, setSelectedUnits] = useState({});
//   const [cart, setCart] = useState({});

//   // Search filter
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchFocused, setSearchFocused] = useState(false);

//   // Consecutive Video / Media Playlist State
//   const [adPlaylist, setAdPlaylist] = useState([]);
//   const [currentAdIndex, setCurrentAdIndex] = useState(0);
//   const videoPlayerRef = useRef(null);
//   const webVideoRef = useRef(null);
//   const imageTimerRef = useRef(null);

//   // 1-Tap Repeat Last Order State
//   const [lastOrder, setLastOrder] = useState(null);
//   const [reordering, setReordering] = useState(false);

//   // Adaptive scale
//   const isTiny = SCREEN_W < 330;
//   const isSmall = SCREEN_W < 370;
//   const isTablet = SCREEN_W >= 680;
//   const S = isTiny
//     ? 0.86
//     : isSmall
//     ? 0.93
//     : isTablet
//     ? 1.12
//     : SCREEN_W >= 430
//     ? 1.07
//     : SCREEN_W >= 390
//     ? 1.02
//     : 1;
//   const dynSearch = buildSearchDynamic(S, isTablet);

//   const syncCart = async () => {
//     try {
//       const stored = await AsyncStorage.getItem('user_cart');
//       if (stored) {
//         setCart(JSON.parse(stored) || {});
//       } else {
//         setCart({});
//       }
//     } catch (e) {
//       setCart({});
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       syncCart();
//       fetchLastOrder();
//     }, [token])
//   );

//   const fetchLastOrder = useCallback(async () => {
//     if (!token) return;
//     try {
//       const res = await apiRequest('/orders/my-orders', { token }).catch(() => null);
//       const ordersList = res?.orders || (Array.isArray(res) ? res : []);
//       if (ordersList.length > 0) {
//         setLastOrder(ordersList[0]);
//       } else {
//         setLastOrder(null);
//       }
//     } catch (e) {
//       setLastOrder(null);
//     }
//   }, [token]);

//   const loadCatalog = useCallback(async (silent = false) => {
//     try {
//       const [catRes, prodRes] = await Promise.all([
//         apiRequest('/catalog/categories', { token }).catch(() => null),
//         apiRequest('/catalog/products', { token }).catch(() => null),
//       ]);

//       if (catRes?.categories && catRes.categories.length > 0) {
//         setCategories(
//           catRes.categories.map((c, i) => ({
//             id: c.id,
//             name: lang === 'om' ? c.nameOm || c.nameAm : c.nameAm || c.nameOm,
//             icon: c.iconUrl || DEFAULT_CATEGORIES[i % DEFAULT_CATEGORIES.length].icon,
//             slug: c.id,
//           }))
//         );
//       }

//       if (prodRes?.products) {
//         setProducts(prodRes.products);
//       }
//     } catch (err) {
//       console.log('Catalog load error:', err);
//     } finally {
//       if (!silent) {
//         setLoading(false);
//         setRefreshing(false);
//       }
//     }
//   }, [token, lang]);

//   const loadAds = useCallback(async () => {
//     try {
//       let res = await apiRequest('/catalog/ads', { token }).catch(() => null);
//       if (!res?.ads) {
//         res = await apiRequest('/admin/banners', { token }).catch(() => null);
//       }

//       const adsList = res?.ads || (Array.isArray(res) ? res : []);

//       if (adsList.length > 0) {
//         const latest = adsList[0];

//         let urls = [];
//         if (Array.isArray(latest.mediaUrls) && latest.mediaUrls.length > 0) {
//           urls = latest.mediaUrls.filter((u) => typeof u === 'string' && u.trim().length > 0);
//         } else if (latest.mediaUrl) {
//           urls = [latest.mediaUrl];
//         }

//         const types = Array.isArray(latest.mediaTypes) ? latest.mediaTypes : [];

//         const playlist = urls.slice(0, 3).map((url, idx) => {
//           const typeStr = types[idx] || latest.mediaType || 'VIDEO';
//           const isVideo =
//             typeStr === 'VIDEO' ||
//             /\.(mp4|mov|m4v|webm)(\?.*)?$/i.test(url);

//           return {
//             id: `${latest.id}_slot_${idx}`,
//             title: latest.title || 'ልዩ ማስታወቂያ',
//             subtitle: latest.actionLink ? 'ለመመልከት ይጫኑ' : 'ቅናሽ ገበያ',
//             uri: url,
//             type: isVideo ? 'video' : 'image',
//           };
//         });

//         if (playlist.length > 0) {
//           setAdPlaylist(playlist);
//           return;
//         }
//       }

//       setAdPlaylist([
//         {
//           id: 'default_static',
//           title: 'ፈጣን ማድረስ ወደ በርዎ',
//           subtitle: 'ትእዛዝዎን ዛሬ ይስጡ',
//           uri: null,
//           type: 'text',
//         },
//       ]);
//     } catch (err) {
//       console.log('Ad load error:', err);
//     }
//   }, [token]);

//   const advanceToNextMedia = useCallback(() => {
//     setAdPlaylist((currentList) => {
//       if (currentList.length > 1) {
//         setCurrentAdIndex((prev) => (prev + 1) % currentList.length);
//       }
//       return currentList;
//     });
//   }, []);

//   useEffect(() => {
//     if (imageTimerRef.current) clearTimeout(imageTimerRef.current);

//     const currentMedia = adPlaylist[currentAdIndex];
//     if (currentMedia && currentMedia.type === 'image' && adPlaylist.length > 1) {
//       imageTimerRef.current = setTimeout(() => {
//         advanceToNextMedia();
//       }, 5000);
//     }

//     return () => {
//       if (imageTimerRef.current) clearTimeout(imageTimerRef.current);
//     };
//   }, [currentAdIndex, adPlaylist, advanceToNextMedia]);

//   const handleVideoPlaybackStatus = (status) => {
//     if (status?.isLoaded && status?.didJustFinish) {
//       advanceToNextMedia();
//     }
//   };

//   useEffect(() => {
//     if (Platform.OS === 'web' && webVideoRef.current) {
//       webVideoRef.current.currentTime = 0;
//       webVideoRef.current.play().catch(() => {});
//     }
//   }, [currentAdIndex]);

//   useEffect(() => {
//     setLoading(true);
//     syncCart();
//     Promise.all([loadCatalog(false), loadAds(), fetchLastOrder()]);
//   }, [loadCatalog, loadAds, fetchLastOrder]);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       loadCatalog(true);
//       fetchLastOrder();
//     }, 6000);

//     return () => clearInterval(timer);
//   }, [loadCatalog, fetchLastOrder]);

//   const onRefresh = () => {
//     setRefreshing(true);
//     syncCart();
//     Promise.all([loadCatalog(false), loadAds(), fetchLastOrder()]);
//   };

//   const computeUnitPrice = (product, unit) => {
//     const base = Number(product.pricePerUnit || product.price || 0);
//     switch (unit) {
//       case 'ግማሽ ካርቶን':
//         return product.priceHalfCarton !== null && product.priceHalfCarton !== undefined
//           ? Number(product.priceHalfCarton)
//           : Math.round(base * 0.52);

//       case 'ግማሽ ደርዘን':
//         return product.priceHalfDozen !== null && product.priceHalfDozen !== undefined
//           ? Number(product.priceHalfDozen)
//           : Math.round(base * 0.5);

//       case 'ፓኬት':
//         return product.pricePacket !== null && product.pricePacket !== undefined
//           ? Number(product.pricePacket)
//           : Math.round((base / 12) * 1.08);

//       case 'ደርዘን':
//       case 'ካርቶን':
//       default:
//         return base;
//     }
//   };

//   const getAvailableUnitsForProduct = (product) => {
//     const baseUnit = product.unitType === 'DOZEN' ? 'ደርዘን' : 'ካርቶን';
//     const units = [baseUnit];

//     if (product.allowsHalfCarton) units.push('ግማሽ ካርቶን');
//     if (product.allowsHalfDozen) units.push('ግማሽ ደርዘን');
//     if (product.allowsPacket) units.push('ፓኬት');

//     if (units.length === 1 && !product.allowsHalfCarton && !product.allowsHalfDozen && !product.allowsPacket) {
//       units.push('ግማሽ ካርቶን', 'ፓኬት');
//     }

//     return units;
//   };

//   const handleUnitSelect = (productId, unitName) => {
//     setSelectedUnits((prev) => ({
//       ...prev,
//       [productId]: unitName,
//     }));
//   };

//   const handleAdd = (product) => {
//     const defaultUnit = product.unitType === 'DOZEN' ? 'ደርዘን' : 'ካርቶን';
//     const unit = selectedUnits[product.id] || defaultUnit;
//     const price = computeUnitPrice(product, unit);
//     const key = `${product.id}_${unit}`;

//     setCart((prev) => {
//       const currentQty = prev[key]?.quantity || 0;
//       const updated = {
//         ...prev,
//         [key]: {
//           productId: product.id,
//           name: product.nameAm || product.nameOm || 'ምርት',
//           unit,
//           price: Number(price),
//           quantity: currentQty + 1,
//         },
//       };
//       AsyncStorage.setItem('user_cart', JSON.stringify(updated)).catch(() => {});
//       return updated;
//     });
//   };

//   const handleClearCart = async () => {
//     const confirmMessage = 'በቅርጫቱ ውስጥ ያሉ እቃዎችን በሙሉ መሰረዝ ይፈልጋሉ?';
//     if (Platform.OS === 'web') {
//       if (window.confirm(confirmMessage)) {
//         setCart({});
//         await AsyncStorage.removeItem('user_cart').catch(() => {});
//       }
//       return;
//     }

//     Alert.alert('ቅርጫቱን አጽዳ', confirmMessage, [
//       { text: 'ይቅር', style: 'cancel' },
//       {
//         text: 'አጽዳ',
//         style: 'destructive',
//         onPress: async () => {
//           setCart({});
//           await AsyncStorage.removeItem('user_cart').catch(() => {});
//         },
//       },
//     ]);
//   };

//   // 1. REPEAT LAST ORDER: Populates cart instead of instantly placing order
//   const handleExecuteReorder = async () => {
//     if (!lastOrder || reordering) return;
//     const rawItems = lastOrder.items || lastOrder.orderItems || [];
//     if (rawItems.length === 0) {
//       const msg = 'ያለፈው ትእዛዝ ምንም እቃዎች አልያዘም';
//       Platform.OS === 'web' ? window.alert(msg) : Alert.alert('ማስታወቂያ', msg);
//       return;
//     }

//     setReordering(true);
//     try {
//       const newCart = { ...cart };

//       rawItems.forEach((it) => {
//         const pId = it.productId || it.product?.id;
//         if (!pId) return;

//         // Map backend unit to Amharic UI labels
//         let unit = it.selectedUnit || 'ካርቶን';
//         if (unit === 'HALF_CARTON') unit = 'ግማሽ ካርቶን';
//         if (unit === 'HALF_DOZEN') unit = 'ግማሽ ደርዘን';
//         if (unit === 'PACK' || unit === 'PACKET') unit = 'ፓኬት';
//         if (unit === 'DOZEN') unit = 'ደርዘን';
//         if (unit === 'CARTON') unit = 'ካርቶን';

//         const key = `${pId}_${unit}`;
//         const existingQty = newCart[key]?.quantity || 0;
//         const addQty = Number(it.quantity) || 1;

//         // Derive price from product or previous line item
//         const matchingProduct = products.find((p) => p.id === pId);
//         const resolvedPrice = matchingProduct
//           ? computeUnitPrice(matchingProduct, unit)
//           : Number(it.unitPrice || 0);

//         newCart[key] = {
//           productId: pId,
//           name: it.product?.nameAm || it.product?.nameOm || newCart[key]?.name || 'ምርት',
//           unit,
//           price: Number(resolvedPrice),
//           quantity: existingQty + addQty,
//         };
//       });

//       setCart(newCart);
//       await AsyncStorage.setItem('user_cart', JSON.stringify(newCart));

//       const successMsg = 'ያለፈው ትእዛዝ እቃዎች በቅርጫቱ ውስጥ ተሞልተዋል! ተጨማሪ እቃዎችን ማከል ወይም ማስተካከል ይችላሉ።';
//       if (Platform.OS === 'web') {
//         window.alert(successMsg);
//       } else {
//         Alert.alert('ተሳክቷል', successMsg);
//       }
//     } catch (err) {
//       console.error('Reorder load error:', err);
//       const msg = 'እቃዎችን መጫን አልተቻለም፤ እባክዎ እንደገና ይሞክሩ።';
//       Platform.OS === 'web' ? window.alert(msg) : Alert.alert('ስህተት', msg);
//     } finally {
//       setReordering(false);
//     }
//   };

//   // 2. SAVE DRAFT ACTION: Stores current cart as draft and navigates
//   const handleSaveToDraft = async () => {
//     try {
//       await AsyncStorage.setItem('user_draft_cart', JSON.stringify(cart));
//       router.push({
//         pathname: '/checkout',
//         params: { isDraft: 'true' },
//       });
//     } catch (e) {
//       router.push('/checkout');
//     }
//   };

//   const totalCount = Object.values(cart).reduce(
//     (sum, item) => sum + (Number(item?.quantity) || 0),
//     0
//   );

//   const totalPrice = Object.values(cart).reduce(
//     (sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 0),
//     0
//   );

//   const filteredProducts = selectedCatId
//     ? products.filter(
//         (p) => p.categoryId === selectedCatId || p.category?.id === selectedCatId
//       )
//     : products;

//   const query = normalize(searchQuery);
//   const isSearching = query.length > 0;

//   const visibleProducts = isSearching
//     ? filteredProducts.filter(
//         (p) =>
//           normalize(p.nameAm).includes(query) ||
//           normalize(p.nameOm).includes(query)
//       )
//     : filteredProducts;

//   const clearSearch = () => setSearchQuery('');

//   const activeMedia = adPlaylist[currentAdIndex] || null;

//   return (
//     <View style={styles.screen}>
//       <View pointerEvents="none" style={styles.glowOrbTop} />
//       <View pointerEvents="none" style={styles.glowOrbSide} />

//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="handled"
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={['#0F7B4A']}
//             tintColor="#0F7B4A"
//           />
//         }
//       >
//         {/* ---------- SEARCH BAR ---------- */}
//         <View
//           style={[
//             styles.searchGlow,
//             dynSearch.searchGlow,
//             searchFocused && styles.searchGlowActive,
//           ]}
//         >
//           <View style={[styles.searchBar, dynSearch.searchBar]}>
//             <View pointerEvents="none" style={styles.searchShine} />

//             <View style={[styles.searchIconWrap, dynSearch.searchIconWrap]}>
//               <Text style={[styles.searchIcon, dynSearch.searchIcon]}>🔍</Text>
//             </View>

//             <TextInput
//               style={[
//                 styles.searchInput,
//                 dynSearch.searchInput,
//                 {
//                   borderWidth: 0,
//                   borderColor: 'transparent',
//                   backgroundColor: 'transparent',
//                 },
//               ]}
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//               onFocus={() => setSearchFocused(true)}
//               onBlur={() => setSearchFocused(false)}
//               placeholder="ምርት ይፈልጉ..."
//               placeholderTextColor="#9CAEA4"
//               returnKeyType="search"
//               autoCorrect={false}
//               autoCapitalize="none"
//               clearButtonMode="never"
//               underlineColorAndroid="transparent"
//               numberOfLines={1}
//             />

//             {isSearching && (
//               <TouchableOpacity
//                 style={[styles.searchClearBtn, dynSearch.searchClearBtn]}
//                 onPress={clearSearch}
//                 activeOpacity={0.7}
//                 hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//               >
//                 <Text style={[styles.searchClearText, dynSearch.searchClearText]}>✕</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>

//         {/* ---------- 1-TAP POPULATE CART BANNER ---------- */}
//         {lastOrder && (
//           <TouchableOpacity
//             style={styles.reorderBannerSlim}
//             onPress={handleExecuteReorder}
//             activeOpacity={0.85}
//             disabled={reordering}
//           >
//             <View pointerEvents="none" style={styles.reorderShine} />
//             <View style={styles.reorderLeftSlim}>
//               <View style={styles.reorderBadgeSlim}>
//                 <Text style={styles.reorderBadgeTextSlim}>🔄 1-Tap</Text>
//               </View>
//               <Text style={styles.reorderTitleSlim} numberOfLines={1}>
//                 ያለፈውን ድገም: <Text style={styles.reorderAmountSlim}>{Number(lastOrder.totalAmount).toLocaleString()} ብር</Text> ({((lastOrder.items || []).length)} እቃዎች)
//               </Text>
//             </View>

//             <View style={styles.reorderActionBtnSlim}>
//               {reordering ? (
//                 <ActivityIndicator size="small" color="#0F7B4A" />
//               ) : (
//                 <Text style={styles.reorderActionTextSlim}>ቅርጫት ሙላ ›</Text>
//               )}
//             </View>
//           </TouchableOpacity>
//         )}

//         {/* ---------- ADVERTISEMENT CAROUSEL ---------- */}
//         {activeMedia && (
//           <View style={styles.adGlow}>
//             <View style={styles.adFrame}>
//               <View style={styles.adBase}>
//                 <View style={styles.adOrbBig} />
//                 <View style={styles.adOrbSmall} />
//               </View>

//               {activeMedia.uri && activeMedia.type === 'video' && (
//                 Platform.OS === 'web' ? (
//                   <video
//                     key={`web_vid_${currentAdIndex}_${activeMedia.uri}`}
//                     ref={webVideoRef}
//                     src={activeMedia.uri}
//                     autoPlay
//                     muted
//                     playsInline
//                     onEnded={advanceToNextMedia}
//                     style={{
//                       width: '100%',
//                       height: '100%',
//                       objectFit: 'cover',
//                       position: 'absolute',
//                       top: 0,
//                       left: 0,
//                     }}
//                   />
//                 ) : (
//                   <Video
//                     key={`mobile_vid_${currentAdIndex}_${activeMedia.uri}`}
//                     ref={videoPlayerRef}
//                     style={styles.adMedia}
//                     source={{ uri: activeMedia.uri }}
//                     resizeMode={ResizeMode.COVER}
//                     shouldPlay={true}
//                     isLooping={false}
//                     isMuted={true}
//                     useNativeControls={false}
//                     onPlaybackStatusUpdate={handleVideoPlaybackStatus}
//                   />
//                 )
//               )}

//               {activeMedia.uri && activeMedia.type === 'image' && (
//                 <Image
//                   key={`img_${currentAdIndex}_${activeMedia.uri}`}
//                   style={styles.adMedia}
//                   source={{ uri: activeMedia.uri }}
//                   resizeMode="cover"
//                 />
//               )}

//               {activeMedia.uri ? (
//                 <View style={styles.adShade}>
//                   <Text style={styles.adTitle} numberOfLines={1}>
//                     {activeMedia.title}
//                   </Text>
//                   <Text style={styles.adSubtitle} numberOfLines={1}>
//                     {activeMedia.subtitle}
//                   </Text>
//                 </View>
//               ) : (
//                 <View style={styles.adTextRow}>
//                   <View style={styles.adTextCol}>
//                     <Text style={styles.adTitleBig} numberOfLines={2}>
//                       {activeMedia.title}
//                     </Text>
//                     <Text style={styles.adSubtitle} numberOfLines={2}>
//                       {activeMedia.subtitle}
//                     </Text>
//                   </View>
//                   <View style={styles.adIconBubble}>
//                     <Text style={styles.adIconEmoji}>🚚</Text>
//                   </View>
//                 </View>
//               )}

//               <View pointerEvents="none" style={styles.adBadge}>
//                 <Text style={styles.adBadgeText}>ማስታወቂያ</Text>
//               </View>

//               {adPlaylist.length > 1 && (
//                 <View style={styles.adPaginationDots}>
//                   {adPlaylist.map((_, idx) => (
//                     <View
//                       key={idx}
//                       style={[
//                         styles.dotItem,
//                         currentAdIndex === idx && styles.dotItemActive,
//                       ]}
//                     />
//                   ))}
//                 </View>
//               )}

//               <View pointerEvents="none" style={styles.adShine} />
//             </View>
//           </View>
//         )}

//         {/* ---------- CATEGORIES GRID ---------- */}
//         <View style={styles.categoryGrid}>
//           {categories.map((cat) => {
//             const active = selectedCatId === cat.id;
//             const isUrlIcon = cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('/'));

//             return (
//               <TouchableOpacity
//                 key={cat.id}
//                 style={[styles.categoryTile, active && styles.categoryTileActive]}
//                 onPress={() => setSelectedCatId(active ? null : cat.id)}
//                 activeOpacity={0.7}
//               >
//                 <View
//                   style={[
//                     styles.categoryIconBubble,
//                     active && styles.categoryIconBubbleActive,
//                   ]}
//                 >
//                   {isUrlIcon ? (
//                     <Image source={{ uri: cat.icon }} style={{ width: 22, height: 22 }} resizeMode="contain" />
//                   ) : (
//                     <Text style={styles.categoryIcon}>{cat.icon || '📦'}</Text>
//                   )}
//                 </View>

//                 <Text
//                   style={[styles.categoryLabel, active && styles.categoryLabelActive]}
//                   numberOfLines={2}
//                 >
//                   {cat.name}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>

//         {/* ---------- SECTION HEADER ---------- */}
//         <View style={styles.sectionHeaderRow}>
//           <View style={styles.sectionTitleWrap}>
//             <View style={styles.sectionAccent} />
//             <Text style={styles.allSectionTitle} numberOfLines={1}>
//               {selectedCatId
//                 ? `${categories.find((c) => c.id === selectedCatId)?.name || 'የተመረጠ'} (${visibleProducts.length})`
//                 : `ሁሉም (${visibleProducts.length})`}
//             </Text>
//           </View>

//           {selectedCatId && (
//             <TouchableOpacity onPress={() => setSelectedCatId(null)} style={styles.resetChip}>
//               <Text style={styles.resetCatText}>ሁሉንም አሳይ ✕</Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* ---------- PRODUCT CARDS ---------- */}
//         {loading && products.length === 0 ? (
//           <View style={styles.loaderWrap}>
//             <ActivityIndicator size="large" color="#0F7B4A" />
//           </View>
//         ) : visibleProducts.length === 0 && isSearching ? (
//           <View style={styles.noResultCard}>
//             <View pointerEvents="none" style={styles.noResultGlow} />
//             <View style={styles.noResultIconWrap}>
//               <Text style={styles.noResultIcon}>🔍</Text>
//             </View>
//             <Text style={styles.noResultTitle} numberOfLines={2}>
//               ለፍለጋው ምንም ምርት አልተገኘም
//             </Text>
//             <TouchableOpacity
//               style={styles.noResultBtn}
//               onPress={clearSearch}
//               activeOpacity={0.8}
//             >
//               <View pointerEvents="none" style={styles.addBtnShine} />
//               <Text style={styles.noResultBtnText}>ሁሉንም አሳይ ✕</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <View style={styles.productStack}>
//             {visibleProducts.map((item) => {
//               const defaultUnit = item.unitType === 'DOZEN' ? 'ደርዘን' : 'ካርቶን';
//               const currentUnit = selectedUnits[item.id] || defaultUnit;
//               const dynamicPrice = computeUnitPrice(item, currentUnit);
//               const isImageFile = item.imageUrl && (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/'));
//               const availableUnits = getAvailableUnitsForProduct(item);

//               return (
//                 <View style={styles.productCard} key={item.id}>
//                   <View pointerEvents="none" style={styles.cardShine} />

//                   <TouchableOpacity
//                     style={styles.cardHeaderArea}
//                     activeOpacity={0.75}
//                     onPress={() => {
//                       router.push({
//                         pathname: '/product-detail',
//                         params: { productId: item.id },
//                       });
//                     }}
//                   >
//                     <View style={styles.avatarBox}>
//                       {isImageFile ? (
//                         <Image
//                           source={{ uri: item.imageUrl }}
//                           style={{ width: '100%', height: '100%', borderRadius: 12 }}
//                           resizeMode="cover"
//                         />
//                       ) : (
//                         <Text style={styles.avatarEmoji}>{item.imageUrl || '📦'}</Text>
//                       )}
//                     </View>

//                     <View style={styles.headerInfo}>
//                       <Text style={styles.productName} numberOfLines={1}>
//                         {lang === 'om' ? item.nameOm || item.nameAm : item.nameAm || item.nameOm}
//                       </Text>

//                       <View style={styles.metaRow}>
//                         <Text style={styles.priceAmount}>{dynamicPrice.toLocaleString()}</Text>
//                         <Text style={styles.priceUnitLabel} numberOfLines={1}>
//                           {' '}ብር / {currentUnit}
//                         </Text>

//                         <View style={styles.stockPill}>
//                           <View style={styles.stockDot} />
//                           <Text style={styles.stockText} numberOfLines={1}>
//                             ክምችት: {item.currentStock ?? 50}
//                           </Text>
//                         </View>
//                       </View>
//                     </View>

//                     <View pointerEvents="none" style={styles.chevronWrap}>
//                       <Text style={styles.chevron}>›</Text>
//                     </View>
//                   </TouchableOpacity>

//                   <View style={styles.cardActionRow}>
//                     <View style={styles.unitPillsRow}>
//                       {availableUnits.map((u) => {
//                         const isSel = currentUnit === u;
//                         return (
//                           <TouchableOpacity
//                             key={u}
//                             style={[styles.unitPill, isSel && styles.unitPillActive]}
//                             onPress={() => handleUnitSelect(item.id, u)}
//                             activeOpacity={0.7}
//                           >
//                             <Text
//                               style={[styles.unitPillText, isSel && styles.unitPillTextActive]}
//                               numberOfLines={1}
//                             >
//                               {u}
//                             </Text>
//                           </TouchableOpacity>
//                         );
//                       })}
//                     </View>

//                     <TouchableOpacity
//                       style={styles.addBtn}
//                       onPress={() => handleAdd(item)}
//                       activeOpacity={0.85}
//                     >
//                       <View pointerEvents="none" style={styles.addBtnShine} />
//                       <Text style={styles.addBtnText}>+ ጨምር</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               );
//             })}
//           </View>
//         )}
//       </ScrollView>

//       {/* ---------- FLOATING CART BAR WITH DRAFT & SEND ACTIONS ---------- */}
//       {totalCount > 0 && (
//         <View style={styles.floatingCartContainer} pointerEvents="box-none">
//           <View style={styles.floatingCartBar}>
//             <View pointerEvents="none" style={styles.floatingShine} />

//             <View style={styles.floatingCartLeft}>
//               <TouchableOpacity
//                 style={styles.floatingCancelBtn}
//                 onPress={handleClearCart}
//                 activeOpacity={0.75}
//                 hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//                 title="አጽዳ"
//               >
//                 <Text style={styles.floatingCancelText}>✕</Text>
//               </TouchableOpacity>

//               <View style={styles.floatingCountBadge}>
//                 <Text style={styles.floatingCountText}>{totalCount}</Text>
//               </View>

//               <View style={styles.floatingTotalGroup}>
//                 <Text style={styles.floatingTotalLabel}>ጠቅላላ ዋጋ</Text>
//                 <Text style={styles.floatingTotalText}>
//                   {totalPrice.toLocaleString()} <Text style={styles.floatingBirr}>ብር</Text>
//                 </Text>
//               </View>
//             </View>

//             {/* 2 ACTIONS: SEND TO DRAFT & SEND ORDER */}
//             <View style={styles.floatingActionsGroup}>
//               <TouchableOpacity
//                 style={styles.floatingDraftBtn}
//                 onPress={handleSaveToDraft}
//                 activeOpacity={0.85}
//               >
//                 <Text style={styles.floatingDraftText}>ረቂቅ</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.floatingActionPill}
//                 onPress={() => router.push('/checkout')}
//                 activeOpacity={0.85}
//               >
//                 <Text style={styles.floatingActionText}>ትእዛዝ ላክ ›</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       )}
//     </View>
//   );
// }

// const GREEN = '#0F7B4A';
// const GREEN_SOFT = '#E4F2EA';
// const AMBER = '#F5A623';
// const INK = '#12241A';
// const MUTED = '#62726A';

// const buildSearchDynamic = (s, isTablet) =>
//   StyleSheet.create({
//     searchGlow: {
//       marginBottom: 10 * s,
//       borderRadius: 18 * s,
//       width: '100%',
//       alignSelf: 'center',
//       backgroundColor: 'transparent',
//     },
//     searchBar: {
//       height: 44 * s,
//       borderRadius: 15 * s,
//       paddingHorizontal: 12 * s,
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 9 * s,
//       maxWidth: isTablet ? 620 : '100%',
//       width: '100%',
//       alignSelf: 'center',
//       backgroundColor: '#F8FAFC',
//       borderWidth: 1 * s,
//       borderColor: '#E2E8F0',
//       elevation: 0,
//     },
//     searchIconWrap: {
//       width: 27 * s,
//       height: 27 * s,
//       borderRadius: 9 * s,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: '#EAF2FF',
//     },
//     searchIcon: {
//       fontSize: 13 * s,
//       color: '#64748B',
//     },
//     searchInput: {
//       flex: 1,
//       minWidth: 0,
//       height: 42 * s,
//       paddingHorizontal: 0,
//       paddingVertical: 0,
//       fontSize: 13 * s,
//       fontWeight: '400',
//       color: '#0F172A',
//       backgroundColor: 'transparent',
//       borderWidth: 0,
//     },
//     searchClearBtn: {
//       width: 23 * s,
//       height: 23 * s,
//       borderRadius: 12 * s,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: '#E9EEF5',
//     },
//     searchClearText: {
//       fontSize: 10 * s,
//       lineHeight: 12 * s,
//       fontWeight: '600',
//       color: '#64748B',
//     },
//   });

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     backgroundColor: '#F5F7F3',
//   },
//   glowOrbTop: {
//     position: 'absolute',
//     top: -90,
//     left: -60,
//     width: 250,
//     height: 250,
//     borderRadius: 125,
//     backgroundColor: 'rgba(15, 123, 74, 0.12)',
//   },
//   glowOrbSide: {
//     position: 'absolute',
//     top: 115,
//     right: -110,
//     width: 230,
//     height: 230,
//     borderRadius: 115,
//     backgroundColor: 'rgba(245, 166, 35, 0.10)',
//   },
//   scrollContent: {
//     paddingHorizontal: 12,
//     paddingTop: 13,
//     paddingBottom: 205,
//   },

//   /* Search */
//   searchGlow: {
//     backgroundColor: '#FFFFFF',
//     shadowColor: '#0F7B4A',
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.13,
//     shadowRadius: 12,
//     elevation: 4,
//   },
//   searchGlowActive: {
//     shadowColor: '#14C47A',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.34,
//     shadowRadius: 16,
//     elevation: 9,
//   },
//   searchBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     borderWidth: 1.2,
//     borderColor: '#DCEAE1',
//     overflow: 'hidden',
//   },
//   searchShine: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: '50%',
//     backgroundColor: 'rgba(63, 208, 138, 0.07)',
//   },
//   searchIconWrap: {
//     backgroundColor: GREEN_SOFT,
//     borderWidth: 1,
//     borderColor: 'rgba(15, 123, 74, 0.20)',
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexShrink: 0,
//   },
//   searchInput: {
//     flex: 1,
//     minWidth: 0,
//     color: INK,
//     fontWeight: '700',
//     padding: 0,
//   },
//   searchClearBtn: {
//     backgroundColor: '#F1F6F2',
//     borderWidth: 1,
//     borderColor: '#DDE4DD',
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexShrink: 0,
//   },
//   searchClearText: {
//     color: MUTED,
//     fontWeight: '900',
//   },

//   /* SLIM 1-Tap Reorder Banner */
//   reorderBannerSlim: {
//     backgroundColor: '#0F7B4A',
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     paddingVertical: 7,
//     marginBottom: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     borderWidth: 1,
//     borderColor: '#3FD08A',
//     overflow: 'hidden',
//     shadowColor: '#0F7B4A',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.18,
//     shadowRadius: 5,
//     elevation: 4,
//   },
//   reorderShine: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: '40%',
//     backgroundColor: 'rgba(255, 255, 255, 0.10)',
//   },
//   reorderLeftSlim: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 7,
//     flex: 1,
//   },
//   reorderBadgeSlim: {
//     backgroundColor: '#F2B705',
//     paddingHorizontal: 6,
//     paddingVertical: 2.5,
//     borderRadius: 6,
//   },
//   reorderBadgeTextSlim: {
//     color: '#12241A',
//     fontSize: 9.5,
//     fontWeight: '900',
//   },
//   reorderTitleSlim: {
//     color: '#FFFFFF',
//     fontSize: 11.5,
//     fontWeight: '700',
//     flex: 1,
//   },
//   reorderAmountSlim: {
//     color: '#FDE047',
//     fontWeight: '900',
//   },
//   reorderActionBtnSlim: {
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: 9,
//     paddingVertical: 4.5,
//     borderRadius: 7,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 6,
//     flexShrink: 0,
//   },
//   reorderActionTextSlim: {
//     color: '#0F7B4A',
//     fontSize: 10.5,
//     fontWeight: '900',
//   },

//   /* Ad Banner & Sequential Media */
//   adGlow: {
//     marginBottom: 15,
//     borderRadius: 21,
//     backgroundColor: GREEN,
//     shadowColor: '#14C47A',
//     shadowOffset: { width: 0, height: 7 },
//     shadowOpacity: 0.5,
//     shadowRadius: 17,
//     elevation: 11,
//   },
//   adFrame: {
//     height: AD_HEIGHT,
//     borderRadius: 21,
//     overflow: 'hidden',
//     backgroundColor: GREEN,
//     borderWidth: 1.2,
//     borderColor: 'rgba(63, 208, 138, 0.7)',
//     position: 'relative',
//   },
//   adBase: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: GREEN,
//   },
//   adOrbBig: {
//     position: 'absolute',
//     top: -70,
//     right: -50,
//     width: 200,
//     height: 200,
//     borderRadius: 100,
//     backgroundColor: 'rgba(63, 208, 138, 0.33)',
//   },
//   adOrbSmall: {
//     position: 'absolute',
//     bottom: -60,
//     left: -30,
//     width: 145,
//     height: 145,
//     borderRadius: 73,
//     backgroundColor: 'rgba(242, 183, 5, 0.21)',
//   },
//   adMedia: {
//     ...StyleSheet.absoluteFillObject,
//     width: '100%',
//     height: '100%',
//   },
//   adShade: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     paddingHorizontal: 15,
//     paddingTop: 17,
//     paddingBottom: 13,
//     backgroundColor: 'rgba(6, 46, 28, 0.65)',
//   },
//   adShine: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: '42%',
//     backgroundColor: 'rgba(255, 255, 255, 0.10)',
//   },
//   adTextRow: {
//     ...StyleSheet.absoluteFillObject,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 17,
//   },
//   adTextCol: {
//     flex: 1,
//     paddingRight: 10,
//   },
//   adTitleBig: {
//     color: '#FFFFFF',
//     fontSize: 19,
//     fontWeight: '900',
//     lineHeight: 25,
//     marginBottom: 4,
//   },
//   adTitle: {
//     color: '#FFFFFF',
//     fontSize: 15.5,
//     fontWeight: '900',
//     marginBottom: 2,
//   },
//   adSubtitle: {
//     color: 'rgba(255, 255, 255, 0.88)',
//     fontSize: 12,
//     fontWeight: '700',
//   },
//   adIconBubble: {
//     width: 62,
//     height: 62,
//     borderRadius: 31,
//     backgroundColor: 'rgba(255, 255, 255, 0.18)',
//     borderWidth: 1.3,
//     borderColor: 'rgba(255, 255, 255, 0.43)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   adIconEmoji: {
//     fontSize: 30,
//   },
//   adBadge: {
//     position: 'absolute',
//     top: 10,
//     left: 12,
//     backgroundColor: AMBER,
//     paddingHorizontal: 9,
//     paddingVertical: 3,
//     borderRadius: 10,
//     elevation: 5,
//   },
//   adBadgeText: {
//     color: '#FFFFFF',
//     fontSize: 10,
//     fontWeight: '900',
//   },
//   adPaginationDots: {
//     position: 'absolute',
//     top: 10,
//     right: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     backgroundColor: 'rgba(0, 0, 0, 0.35)',
//     paddingHorizontal: 6,
//     paddingVertical: 3,
//     borderRadius: 8,
//   },
//   dotItem: {
//     width: 5,
//     height: 5,
//     borderRadius: 2.5,
//     backgroundColor: 'rgba(255, 255, 255, 0.4)',
//   },
//   dotItemActive: {
//     width: 12,
//     backgroundColor: '#FFFFFF',
//   },

//   /* Categories */
//   categoryGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     rowGap: 9,
//     marginBottom: 17,
//   },
//   categoryTile: {
//     width: '23.5%',
//     minHeight: 88,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'flex-start',
//     paddingVertical: 8,
//     paddingHorizontal: 4,
//     borderWidth: 1,
//     borderColor: '#E6ECE7',
//     ...ROW_SHADOW,
//   },
//   categoryTileActive: {
//     backgroundColor: GREEN,
//     borderColor: '#3FD08A',
//     shadowColor: '#0F7B4A',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.35,
//     shadowRadius: 12,
//     elevation: 10,
//   },
//   categoryIconBubble: {
//     width: 37,
//     height: 37,
//     borderRadius: 19,
//     backgroundColor: GREEN_SOFT,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 5,
//   },
//   categoryIconBubbleActive: {
//     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//   },
//   categoryIcon: {
//     fontSize: 19,
//   },
//   categoryLabel: {
//     fontSize: 9.5,
//     fontWeight: '700',
//     color: INK,
//     textAlign: 'center',
//     lineHeight: 12,
//   },
//   categoryLabelActive: {
//     color: '#FFFFFF',
//     fontWeight: '800',
//   },

//   /* Section Header */
//   sectionHeaderRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   sectionTitleWrap: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//     paddingRight: 8,
//   },
//   sectionAccent: {
//     width: 4,
//     height: 18,
//     borderRadius: 2,
//     backgroundColor: GREEN,
//     marginRight: 8,
//   },
//   allSectionTitle: {
//     fontSize: 16,
//     fontWeight: '900',
//     color: INK,
//     flexShrink: 1,
//   },
//   resetChip: {
//     backgroundColor: GREEN_SOFT,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 18,
//     borderWidth: 1,
//     borderColor: 'rgba(15, 123, 74, 0.25)',
//   },
//   resetCatText: {
//     fontSize: 11.5,
//     fontWeight: '800',
//     color: GREEN,
//   },
//   loaderWrap: {
//     paddingVertical: 40,
//     alignItems: 'center',
//   },

//   /* Empty Search */
//   noResultCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 18,
//     borderWidth: 1,
//     borderColor: '#E6ECE7',
//     paddingVertical: 26,
//     paddingHorizontal: 18,
//     alignItems: 'center',
//     overflow: 'hidden',
//     ...ROW_SHADOW,
//   },
//   noResultGlow: {
//     position: 'absolute',
//     top: -60,
//     right: -45,
//     width: 170,
//     height: 170,
//     borderRadius: 85,
//     backgroundColor: 'rgba(15, 123, 74, 0.08)',
//   },
//   noResultIconWrap: {
//     width: 56,
//     height: 56,
//     borderRadius: 19,
//     backgroundColor: GREEN_SOFT,
//     borderWidth: 1,
//     borderColor: '#CFE7D9',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 12,
//   },
//   noResultIcon: {
//     fontSize: 24,
//   },
//   noResultTitle: {
//     fontSize: 13.5,
//     fontWeight: '800',
//     color: MUTED,
//     textAlign: 'center',
//     lineHeight: 18,
//     marginBottom: 15,
//   },
//   noResultBtn: {
//     backgroundColor: GREEN,
//     paddingHorizontal: 18,
//     paddingVertical: 10,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#3FD08A',
//     overflow: 'hidden',
//     shadowColor: '#0F7B4A',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 9,
//     elevation: 5,
//   },
//   noResultBtnText: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     fontWeight: '900',
//   },

//   /* Product Cards */
//   productStack: {
//     flexDirection: 'column',
//     gap: 10,
//   },
//   productCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 17,
//     paddingHorizontal: 11,
//     paddingVertical: 10,
//     borderWidth: 1,
//     borderColor: '#E6ECE7',
//     overflow: 'hidden',
//     ...ROW_SHADOW,
//   },
//   cardShine: {
//     position: 'absolute',
//     top: 0,
//     left: 20,
//     right: 20,
//     height: 1.5,
//     borderRadius: 2,
//     backgroundColor: 'rgba(63, 208, 138, 0.5)',
//   },
//   cardHeaderArea: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatarBox: {
//     width: 42,
//     height: 42,
//     borderRadius: 13,
//     backgroundColor: GREEN_SOFT,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//     borderWidth: 1,
//     borderColor: 'rgba(15, 123, 74, 0.2)',
//     overflow: 'hidden',
//   },
//   avatarEmoji: {
//     fontSize: 21,
//   },
//   headerInfo: {
//     flex: 1,
//     minWidth: 0,
//     paddingRight: 4,
//   },
//   productName: {
//     fontSize: 13.5,
//     fontWeight: '900',
//     color: INK,
//     lineHeight: 17,
//     marginBottom: 4,
//   },
//   metaRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   priceAmount: {
//     fontSize: 15.5,
//     fontWeight: '900',
//     color: GREEN,
//   },
//   priceUnitLabel: {
//     fontSize: 9.5,
//     fontWeight: '700',
//     color: MUTED,
//     flexShrink: 1,
//   },
//   stockPill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F1F6F2',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 8,
//     marginLeft: 6,
//     borderWidth: 1,
//     borderColor: '#E6ECE7',
//   },
//   stockDot: {
//     width: 5,
//     height: 5,
//     borderRadius: 2.5,
//     backgroundColor: '#14C47A',
//     marginRight: 4,
//   },
//   stockText: {
//     fontSize: 9,
//     color: MUTED,
//     fontWeight: '700',
//   },
//   chevronWrap: {
//     width: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   chevron: {
//     fontSize: 22,
//     fontWeight: '900',
//     color: '#A9BCB0',
//     lineHeight: 24,
//   },
//   cardActionRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 9,
//     gap: 8,
//   },
//   unitPillsRow: {
//     flex: 1,
//     flexDirection: 'row',
//     gap: 6,
//   },
//   unitPill: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#DDE4DD',
//     borderRadius: 10,
//     paddingVertical: 6,
//     paddingHorizontal: 2,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#F8FAF8',
//   },
//   unitPillActive: {
//     borderColor: '#3FD08A',
//     backgroundColor: GREEN,
//     shadowColor: '#0F7B4A',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   unitPillText: {
//     fontSize: 10,
//     fontWeight: '700',
//     color: MUTED,
//   },
//   unitPillTextActive: {
//     color: '#FFFFFF',
//     fontWeight: '900',
//   },
//   addBtn: {
//     backgroundColor: GREEN,
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 11,
//     borderWidth: 1,
//     borderColor: '#3FD08A',
//     overflow: 'hidden',
//     shadowColor: '#0F7B4A',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.32,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   addBtnShine: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: '48%',
//     backgroundColor: 'rgba(255, 255, 255, 0.18)',
//   },
//   addBtnText: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     fontWeight: '900',
//   },

//   /* Floating Cart Bar */
//   floatingCartContainer: {
//     position: 'absolute',
//     left: 12,
//     right: 12,
//     bottom: Platform.OS === 'ios' ? 100 : 85,
//     zIndex: 9999,
//     elevation: 20,
//   },
//   floatingCartBar: {
//     width: '100%',
//     height: 62,
//     backgroundColor: '#0F7B4A',
//     borderRadius: 18,
//     paddingHorizontal: 12,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderWidth: 1.1,
//     borderColor: '#3FD08A',
//     overflow: 'hidden',
//     shadowColor: '#0B2A1B',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.3,
//     shadowRadius: 12,
//   },
//   floatingShine: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: '45%',
//     backgroundColor: 'rgba(255, 255, 255, 0.12)',
//   },
//   floatingCartLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 7,
//     flexShrink: 1,
//   },
//   floatingCancelBtn: {
//     width: 26,
//     height: 26,
//     borderRadius: 13,
//     backgroundColor: '#EF4444',
//     borderWidth: 1.2,
//     borderColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   floatingCancelText: {
//     color: '#FFFFFF',
//     fontSize: 11,
//     fontWeight: '900',
//   },
//   floatingCountBadge: {
//     backgroundColor: '#F2B705',
//     minWidth: 26,
//     height: 26,
//     paddingHorizontal: 5,
//     borderRadius: 13,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   floatingCountText: {
//     color: '#12241A',
//     fontSize: 12,
//     fontWeight: '900',
//   },
//   floatingTotalGroup: {
//     justifyContent: 'center',
//   },
//   floatingTotalLabel: {
//     color: 'rgba(255, 255, 255, 0.75)',
//     fontSize: 9,
//     fontWeight: '700',
//     lineHeight: 11,
//   },
//   floatingTotalText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '900',
//     lineHeight: 18,
//   },
//   floatingBirr: {
//     fontSize: 10.5,
//     fontWeight: '700',
//   },
//   floatingActionsGroup: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 7,
//     flexShrink: 0,
//   },
//   floatingDraftBtn: {
//     backgroundColor: '#F59E0B',
//     paddingHorizontal: 11,
//     paddingVertical: 7.5,
//     borderRadius: 11,
//     borderWidth: 1,
//     borderColor: '#FDE68A',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#F59E0B',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.35,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   floatingDraftText: {
//     color: '#12241A',
//     fontSize: 11.5,
//     fontWeight: '900',
//   },
//   floatingActionPill: {
//     backgroundColor: 'rgba(255, 255, 255, 0.25)',
//     paddingHorizontal: 12,
//     paddingVertical: 7.5,
//     borderRadius: 11,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.45)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   floatingActionText: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     fontWeight: '900',
//   },
// });
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video, ResizeMode } from 'expo-av';
import { apiRequest } from '../../lib/api';
import { useSession } from '../../context/SessionContext';

const DEFAULT_CATEGORIES = [
  { id: 'cat_groc', name: 'ግሮሰሪ እና የባልትና ውጤቶች', icon: '🛒', slug: 'grocery' },
  { id: 'cat_clean', name: 'የጽዳት እና የግል እንክብካቤ እቃዎች', icon: '🧽', slug: 'cleaning' },
  { id: 'cat_drinks', name: 'መጠጦች', icon: '🥤', slug: 'beverages' },
  { id: 'cat_sweets', name: 'መክሰስ እና ጣፋጮች', icon: '🍬', slug: 'sweets' },
  { id: 'cat_stat', name: 'የጽህፈት መሳሪያዎች', icon: '✏️', slug: 'stationery' },
  { id: 'cat_veg', name: 'የግብርና ምርቶች እና አትክልት', icon: '🥔', slug: 'vegetables' },
  { id: 'cat_pack', name: 'የማሸጊያ እቃዎች እና ሻማ', icon: '📦', slug: 'packaging' },
  { id: 'cat_tob', name: 'የትምባሆ ምርቶች', icon: '🚬', slug: 'tobacco' },
];

const AD_HEIGHT = 152;

const ROW_SHADOW = {
  shadowColor: '#0B2A1B',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.07,
  shadowRadius: 10,
  elevation: 3,
};

const normalize = (value) => String(value ?? '').trim().toLowerCase();

export default function ShopScreen() {
  const router = useRouter();
  const { token, lang } = useSession();
  const { width: SCREEN_W } = useWindowDimensions();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [selectedUnits, setSelectedUnits] = useState({});
  const [cart, setCart] = useState({});

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Consecutive Video / Media Playlist State
  const [adPlaylist, setAdPlaylist] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const videoPlayerRef = useRef(null);
  const webVideoRef = useRef(null);
  const imageTimerRef = useRef(null);

  // 1-Tap Repeat Last Order State
  const [lastOrder, setLastOrder] = useState(null);
  const [reordering, setReordering] = useState(false);

  // Pure In-App Amharic Modal State (No "localhost says..." popups)
  const [clearModalVisible, setClearModalVisible] = useState(false);
  const [notificationModal, setNotificationModal] = useState({
    visible: false,
    title: '',
    message: '',
  });

  // Adaptive scale
  const isTiny = SCREEN_W < 330;
  const isSmall = SCREEN_W < 370;
  const isTablet = SCREEN_W >= 680;
  const S = isTiny
    ? 0.86
    : isSmall
    ? 0.93
    : isTablet
    ? 1.12
    : SCREEN_W >= 430
    ? 1.07
    : SCREEN_W >= 390
    ? 1.02
    : 1;
  const dynSearch = buildSearchDynamic(S, isTablet);

  const syncCart = async () => {
    try {
      const stored = await AsyncStorage.getItem('user_cart');
      if (stored) {
        setCart(JSON.parse(stored) || {});
      } else {
        setCart({});
      }
    } catch {
      setCart({});
    }
  };

  useFocusEffect(
    useCallback(() => {
      syncCart();
      fetchLastOrder();
    }, [token])
  );

  const fetchLastOrder = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiRequest('/orders/my-orders', { token }).catch(() => null);
      const ordersList = res?.orders || (Array.isArray(res) ? res : []);
      if (ordersList.length > 0) {
        setLastOrder(ordersList[0]);
      } else {
        setLastOrder(null);
      }
    } catch {
      setLastOrder(null);
    }
  }, [token]);

  const loadCatalog = useCallback(async (silent = false) => {
    try {
      const [catRes, prodRes] = await Promise.all([
        apiRequest('/catalog/categories', { token }).catch(() => null),
        apiRequest('/catalog/products', { token }).catch(() => null),
      ]);

      if (catRes?.categories && catRes.categories.length > 0) {
        setCategories(
          catRes.categories.map((c, i) => ({
            id: c.id,
            name: lang === 'om' ? c.nameOm || c.nameAm : c.nameAm || c.nameOm,
            icon: c.iconUrl || DEFAULT_CATEGORIES[i % DEFAULT_CATEGORIES.length].icon,
            slug: c.id,
          }))
        );
      }

      if (prodRes?.products) {
        setProducts(prodRes.products);
      }
    } catch {
      // Silent error handling
    } finally {
      if (!silent) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [token, lang]);

  const loadAds = useCallback(async () => {
    try {
      let res = await apiRequest('/catalog/ads', { token }).catch(() => null);
      if (!res?.ads) {
        res = await apiRequest('/admin/banners', { token }).catch(() => null);
      }

      const adsList = res?.ads || (Array.isArray(res) ? res : []);

      if (adsList.length > 0) {
        const latest = adsList[0];

        let urls = [];
        if (Array.isArray(latest.mediaUrls) && latest.mediaUrls.length > 0) {
          urls = latest.mediaUrls.filter((u) => typeof u === 'string' && u.trim().length > 0);
        } else if (latest.mediaUrl) {
          urls = [latest.mediaUrl];
        }

        const types = Array.isArray(latest.mediaTypes) ? latest.mediaTypes : [];

        const playlist = urls.slice(0, 3).map((url, idx) => {
          const typeStr = types[idx] || latest.mediaType || 'VIDEO';
          const isVideo =
            typeStr === 'VIDEO' ||
            /\.(mp4|mov|m4v|webm)(\?.*)?$/i.test(url);

          return {
            id: `${latest.id}_slot_${idx}`,
            title: latest.title || 'ልዩ ማስታወቂያ',
            subtitle: latest.actionLink ? 'ለመመልከት ይጫኑ' : 'ቅናሽ ገበያ',
            uri: url,
            type: isVideo ? 'video' : 'image',
          };
        });

        if (playlist.length > 0) {
          setAdPlaylist(playlist);
          return;
        }
      }

      setAdPlaylist([
        {
          id: 'default_static',
          title: 'ፈጣን ማድረስ ወደ በርዎ',
          subtitle: 'ትእዛዝዎን ዛሬ ይስጡ',
          uri: null,
          type: 'text',
        },
      ]);
    } catch {
      // Silent error handling
    }
  }, [token]);

  const advanceToNextMedia = useCallback(() => {
    setAdPlaylist((currentList) => {
      if (currentList.length > 1) {
        setCurrentAdIndex((prev) => (prev + 1) % currentList.length);
      }
      return currentList;
    });
  }, []);

  useEffect(() => {
    if (imageTimerRef.current) clearTimeout(imageTimerRef.current);

    const currentMedia = adPlaylist[currentAdIndex];
    if (currentMedia && currentMedia.type === 'image' && adPlaylist.length > 1) {
      imageTimerRef.current = setTimeout(() => {
        advanceToNextMedia();
      }, 5000);
    }

    return () => {
      if (imageTimerRef.current) clearTimeout(imageTimerRef.current);
    };
  }, [currentAdIndex, adPlaylist, advanceToNextMedia]);

  const handleVideoPlaybackStatus = (status) => {
    if (status?.isLoaded && status?.didJustFinish) {
      advanceToNextMedia();
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web' && webVideoRef.current) {
      webVideoRef.current.currentTime = 0;
      webVideoRef.current.play().catch(() => {});
    }
  }, [currentAdIndex]);

  useEffect(() => {
    setLoading(true);
    syncCart();
    Promise.all([loadCatalog(false), loadAds(), fetchLastOrder()]);
  }, [loadCatalog, loadAds, fetchLastOrder]);

  useEffect(() => {
    const timer = setInterval(() => {
      loadCatalog(true);
      fetchLastOrder();
    }, 6000);

    return () => clearInterval(timer);
  }, [loadCatalog, fetchLastOrder]);

  const onRefresh = () => {
    setRefreshing(true);
    syncCart();
    Promise.all([loadCatalog(false), loadAds(), fetchLastOrder()]);
  };

  const computeUnitPrice = (product, unit) => {
    const base = Number(product.pricePerUnit || product.price || 0);
    switch (unit) {
      case 'ግማሽ ካርቶን':
        return product.priceHalfCarton !== null && product.priceHalfCarton !== undefined
          ? Number(product.priceHalfCarton)
          : Math.round(base * 0.52);

      case 'ግማሽ ደርዘን':
        return product.priceHalfDozen !== null && product.priceHalfDozen !== undefined
          ? Number(product.priceHalfDozen)
          : Math.round(base * 0.5);

      case 'ፓኬት':
        return product.pricePacket !== null && product.pricePacket !== undefined
          ? Number(product.pricePacket)
          : Math.round((base / 12) * 1.08);

      case 'ደርዘን':
      case 'ካርቶን':
      default:
        return base;
    }
  };

  const getAvailableUnitsForProduct = (product) => {
    const baseUnit = product.unitType === 'DOZEN' ? 'ደርዘን' : 'ካርቶን';
    const units = [baseUnit];

    if (product.allowsHalfCarton) units.push('ግማሽ ካርቶን');
    if (product.allowsHalfDozen) units.push('ግማሽ ደርዘን');
    if (product.allowsPacket) units.push('ፓኬት');

    if (units.length === 1 && !product.allowsHalfCarton && !product.allowsHalfDozen && !product.allowsPacket) {
      units.push('ግማሽ ካርቶን', 'ፓኬት');
    }

    return units;
  };

  const handleUnitSelect = (productId, unitName) => {
    setSelectedUnits((prev) => ({
      ...prev,
      [productId]: unitName,
    }));
  };

  const handleAdd = (product) => {
    const defaultUnit = product.unitType === 'DOZEN' ? 'ደርዘን' : 'ካርቶን';
    const unit = selectedUnits[product.id] || defaultUnit;
    const price = computeUnitPrice(product, unit);
    const key = `${product.id}_${unit}`;

    setCart((prev) => {
      const currentQty = prev[key]?.quantity || 0;
      const updated = {
        ...prev,
        [key]: {
          productId: product.id,
          name: product.nameAm || product.nameOm || 'ምርት',
          unit,
          price: Number(price),
          quantity: currentQty + 1,
        },
      };
      AsyncStorage.setItem('user_cart', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  // Triggers the custom in-app Amharic clear modal
  const handleTriggerClearCart = () => {
    setClearModalVisible(true);
  };

  // Confirms and clears immediately
  const handleConfirmClearCart = async () => {
    setClearModalVisible(false);
    setCart({});
    await AsyncStorage.removeItem('user_cart').catch(() => {});
  };

  const handleCancelClearCart = () => {
    setClearModalVisible(false);
  };

  // 1. REPEAT LAST ORDER: Populates cart instead of instantly placing order
  const handleExecuteReorder = async () => {
    if (!lastOrder || reordering) return;
    const rawItems = lastOrder.items || lastOrder.orderItems || [];
    if (rawItems.length === 0) {
      setNotificationModal({
        visible: true,
        title: 'ማስታወቂያ',
        message: 'ያለፈው ትእዛዝ ምንም እቃዎች አልያዘም',
      });
      return;
    }

    setReordering(true);
    try {
      const newCart = { ...cart };

      rawItems.forEach((it) => {
        const pId = it.productId || it.product?.id;
        if (!pId) return;

        let unit = it.selectedUnit || 'ካርቶን';
        if (unit === 'HALF_CARTON') unit = 'ግማሽ ካርቶን';
        if (unit === 'HALF_DOZEN') unit = 'ግማሽ ደርዘን';
        if (unit === 'PACK' || unit === 'PACKET') unit = 'ፓኬት';
        if (unit === 'DOZEN') unit = 'ደርዘን';
        if (unit === 'CARTON') unit = 'ካርቶን';

        const key = `${pId}_${unit}`;
        const existingQty = newCart[key]?.quantity || 0;
        const addQty = Number(it.quantity) || 1;

        const matchingProduct = products.find((p) => p.id === pId);
        const resolvedPrice = matchingProduct
          ? computeUnitPrice(matchingProduct, unit)
          : Number(it.unitPrice || 0);

        newCart[key] = {
          productId: pId,
          name: it.product?.nameAm || it.product?.nameOm || newCart[key]?.name || 'ምርት',
          unit,
          price: Number(resolvedPrice),
          quantity: existingQty + addQty,
        };
      });

      setCart(newCart);
      await AsyncStorage.setItem('user_cart', JSON.stringify(newCart));

      setNotificationModal({
        visible: true,
        title: 'ተሳክቷል',
        message: 'ያለፈው ትእዛዝ እቃዎች በቅርጫቱ ውስጥ ተሞልተዋል! ተጨማሪ እቃዎችን ማከል ወይም ማስተካከል ይችላሉ።',
      });
    } catch {
      setNotificationModal({
        visible: true,
        title: 'ስህተት',
        message: 'እቃዎችን መጫን አልተቻለም፤ እባክዎ እንደገና ይሞክሩ።',
      });
    } finally {
      setReordering(false);
    }
  };

  // 2. SAVE DRAFT ACTION: Stores current cart as draft and navigates
  const handleSaveToDraft = async () => {
    try {
      await AsyncStorage.setItem('user_draft_cart', JSON.stringify(cart));
      router.push({
        pathname: '/checkout',
        params: { isDraft: 'true' },
      });
    } catch {
      router.push('/checkout');
    }
  };

  const totalCount = Object.values(cart).reduce(
    (sum, item) => sum + (Number(item?.quantity) || 0),
    0
  );

  const totalPrice = Object.values(cart).reduce(
    (sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 0),
    0
  );

  const filteredProducts = selectedCatId
    ? products.filter(
        (p) => p.categoryId === selectedCatId || p.category?.id === selectedCatId
      )
    : products;

  const query = normalize(searchQuery);
  const isSearching = query.length > 0;

  const visibleProducts = isSearching
    ? filteredProducts.filter(
        (p) =>
          normalize(p.nameAm).includes(query) ||
          normalize(p.nameOm).includes(query)
      )
    : filteredProducts;

  const clearSearch = () => setSearchQuery('');

  const activeMedia = adPlaylist[currentAdIndex] || null;

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.glowOrbTop} />
      <View pointerEvents="none" style={styles.glowOrbSide} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0F7B4A']}
            tintColor="#0F7B4A"
          />
        }
      >
        {/* ---------- SEARCH BAR ---------- */}
        <View
          style={[
            styles.searchGlow,
            dynSearch.searchGlow,
            searchFocused && styles.searchGlowActive,
          ]}
        >
          <View style={[styles.searchBar, dynSearch.searchBar]}>
            <View pointerEvents="none" style={styles.searchShine} />

            <View style={[styles.searchIconWrap, dynSearch.searchIconWrap]}>
              <Text style={[styles.searchIcon, dynSearch.searchIcon]}>🔍</Text>
            </View>

            <TextInput
              style={[
                styles.searchInput,
                dynSearch.searchInput,
                {
                  borderWidth: 0,
                  borderColor: 'transparent',
                  backgroundColor: 'transparent',
                },
              ]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="ምርት ይፈልጉ..."
              placeholderTextColor="#9CAEA4"
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="never"
              underlineColorAndroid="transparent"
              numberOfLines={1}
            />

            {isSearching && (
              <TouchableOpacity
                style={[styles.searchClearBtn, dynSearch.searchClearBtn]}
                onPress={clearSearch}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.searchClearText, dynSearch.searchClearText]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ---------- 1-TAP POPULATE CART BANNER ---------- */}
        {lastOrder && (
          <TouchableOpacity
            style={styles.reorderBannerSlim}
            onPress={handleExecuteReorder}
            activeOpacity={0.85}
            disabled={reordering}
          >
            <View pointerEvents="none" style={styles.reorderShine} />
            <View style={styles.reorderLeftSlim}>
              <View style={styles.reorderBadgeSlim}>
                <Text style={styles.reorderBadgeTextSlim}>🔄 1-Tap</Text>
              </View>
              <Text style={styles.reorderTitleSlim} numberOfLines={1}>
                ያለፈውን ድገም: <Text style={styles.reorderAmountSlim}>{Number(lastOrder.totalAmount).toLocaleString()} ብር</Text> ({((lastOrder.items || []).length)} እቃዎች)
              </Text>
            </View>

            <View style={styles.reorderActionBtnSlim}>
              {reordering ? (
                <ActivityIndicator size="small" color="#0F7B4A" />
              ) : (
                <Text style={styles.reorderActionTextSlim}>ቅርጫት ሙላ ›</Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* ---------- ADVERTISEMENT CAROUSEL ---------- */}
        {activeMedia && (
          <View style={styles.adGlow}>
            <View style={styles.adFrame}>
              <View style={styles.adBase}>
                <View style={styles.adOrbBig} />
                <View style={styles.adOrbSmall} />
              </View>

              {activeMedia.uri && activeMedia.type === 'video' && (
                Platform.OS === 'web' ? (
                  <video
                    key={`web_vid_${currentAdIndex}_${activeMedia.uri}`}
                    ref={webVideoRef}
                    src={activeMedia.uri}
                    autoPlay
                    muted
                    playsInline
                    onEnded={advanceToNextMedia}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                  />
                ) : (
                  <Video
                    key={`mobile_vid_${currentAdIndex}_${activeMedia.uri}`}
                    ref={videoPlayerRef}
                    style={styles.adMedia}
                    source={{ uri: activeMedia.uri }}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={true}
                    isLooping={false}
                    isMuted={true}
                    useNativeControls={false}
                    onPlaybackStatusUpdate={handleVideoPlaybackStatus}
                  />
                )
              )}

              {activeMedia.uri && activeMedia.type === 'image' && (
                <Image
                  key={`img_${currentAdIndex}_${activeMedia.uri}`}
                  style={styles.adMedia}
                  source={{ uri: activeMedia.uri }}
                  resizeMode="cover"
                />
              )}

              {activeMedia.uri ? (
                <View style={styles.adShade}>
                  <Text style={styles.adTitle} numberOfLines={1}>
                    {activeMedia.title}
                  </Text>
                  <Text style={styles.adSubtitle} numberOfLines={1}>
                    {activeMedia.subtitle}
                  </Text>
                </View>
              ) : (
                <View style={styles.adTextRow}>
                  <View style={styles.adTextCol}>
                    <Text style={styles.adTitleBig} numberOfLines={2}>
                      {activeMedia.title}
                    </Text>
                    <Text style={styles.adSubtitle} numberOfLines={2}>
                      {activeMedia.subtitle}
                    </Text>
                  </View>
                  <View style={styles.adIconBubble}>
                    <Text style={styles.adIconEmoji}>🚚</Text>
                  </View>
                </View>
              )}

              <View pointerEvents="none" style={styles.adBadge}>
                <Text style={styles.adBadgeText}>ማስታወቂያ</Text>
              </View>

              {adPlaylist.length > 1 && (
                <View style={styles.adPaginationDots}>
                  {adPlaylist.map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.dotItem,
                        currentAdIndex === idx && styles.dotItemActive,
                      ]}
                    />
                  ))}
                </View>
              )}

              <View pointerEvents="none" style={styles.adShine} />
            </View>
          </View>
        )}

        {/* ---------- CATEGORIES GRID ---------- */}
        <View style={styles.categoryGrid}>
          {categories.map((cat) => {
            const active = selectedCatId === cat.id;
            const isUrlIcon = cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('/'));

            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryTile, active && styles.categoryTileActive]}
                onPress={() => setSelectedCatId(active ? null : cat.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.categoryIconBubble,
                    active && styles.categoryIconBubbleActive,
                  ]}
                >
                  {isUrlIcon ? (
                    <Image source={{ uri: cat.icon }} style={{ width: 22, height: 22 }} resizeMode="contain" />
                  ) : (
                    <Text style={styles.categoryIcon}>{cat.icon || '📦'}</Text>
                  )}
                </View>

                <Text
                  style={[styles.categoryLabel, active && styles.categoryLabelActive]}
                  numberOfLines={2}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ---------- SECTION HEADER ---------- */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleWrap}>
            <View style={styles.sectionAccent} />
            <Text style={styles.allSectionTitle} numberOfLines={1}>
              {selectedCatId
                ? `${categories.find((c) => c.id === selectedCatId)?.name || 'የተመረጠ'} (${visibleProducts.length})`
                : `ሁሉም (${visibleProducts.length})`}
            </Text>
          </View>

          {selectedCatId && (
            <TouchableOpacity onPress={() => setSelectedCatId(null)} style={styles.resetChip}>
              <Text style={styles.resetCatText}>ሁሉንም አሳይ ✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ---------- PRODUCT CARDS ---------- */}
        {loading && products.length === 0 ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#0F7B4A" />
          </View>
        ) : visibleProducts.length === 0 && isSearching ? (
          <View style={styles.noResultCard}>
            <View pointerEvents="none" style={styles.noResultGlow} />
            <View style={styles.noResultIconWrap}>
              <Text style={styles.noResultIcon}>🔍</Text>
            </View>
            <Text style={styles.noResultTitle} numberOfLines={2}>
              ለፍለጋው ምንም ምርት አልተገኘም
            </Text>
            <TouchableOpacity
              style={styles.noResultBtn}
              onPress={clearSearch}
              activeOpacity={0.8}
            >
              <View pointerEvents="none" style={styles.addBtnShine} />
              <Text style={styles.noResultBtnText}>ሁሉንም አሳይ ✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productStack}>
            {visibleProducts.map((item) => {
              const defaultUnit = item.unitType === 'DOZEN' ? 'ደርዘን' : 'ካርቶን';
              const currentUnit = selectedUnits[item.id] || defaultUnit;
              const dynamicPrice = computeUnitPrice(item, currentUnit);
              const isImageFile = item.imageUrl && (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/'));
              const availableUnits = getAvailableUnitsForProduct(item);

              return (
                <View style={styles.productCard} key={item.id}>
                  <View pointerEvents="none" style={styles.cardShine} />

                  <TouchableOpacity
                    style={styles.cardHeaderArea}
                    activeOpacity={0.75}
                    onPress={() => {
                      router.push({
                        pathname: '/product-detail',
                        params: { productId: item.id },
                      });
                    }}
                  >
                    <View style={styles.avatarBox}>
                      {isImageFile ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={{ width: '100%', height: '100%', borderRadius: 12 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={styles.avatarEmoji}>{item.imageUrl || '📦'}</Text>
                      )}
                    </View>

                    <View style={styles.headerInfo}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {lang === 'om' ? item.nameOm || item.nameAm : item.nameAm || item.nameOm}
                      </Text>

                      <View style={styles.metaRow}>
                        <Text style={styles.priceAmount}>{dynamicPrice.toLocaleString()}</Text>
                        <Text style={styles.priceUnitLabel} numberOfLines={1}>
                          {' '}ብር / {currentUnit}
                        </Text>

                        <View style={styles.stockPill}>
                          <View style={styles.stockDot} />
                          <Text style={styles.stockText} numberOfLines={1}>
                            ክምችት: {item.currentStock ?? 50}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View pointerEvents="none" style={styles.chevronWrap}>
                      <Text style={styles.chevron}>›</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.cardActionRow}>
                    <View style={styles.unitPillsRow}>
                      {availableUnits.map((u) => {
                        const isSel = currentUnit === u;
                        return (
                          <TouchableOpacity
                            key={u}
                            style={[styles.unitPill, isSel && styles.unitPillActive]}
                            onPress={() => handleUnitSelect(item.id, u)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[styles.unitPillText, isSel && styles.unitPillTextActive]}
                              numberOfLines={1}
                            >
                              {u}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => handleAdd(item)}
                      activeOpacity={0.85}
                    >
                      <View pointerEvents="none" style={styles.addBtnShine} />
                      <Text style={styles.addBtnText}>+ ጨምር</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ---------- FLOATING CART BAR WITH DRAFT & SEND ACTIONS ---------- */}
      {totalCount > 0 && (
        <View style={styles.floatingCartContainer} pointerEvents="box-none">
          <View style={styles.floatingCartBar}>
            <View pointerEvents="none" style={styles.floatingShine} />

            <View style={styles.floatingCartLeft}>
              {/* Red Circular ✕ Button triggering in-app Amharic dialog */}
              <TouchableOpacity
                style={styles.floatingCancelBtn}
                onPress={handleTriggerClearCart}
                activeOpacity={0.75}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                title="አጽዳ"
              >
                <Text style={styles.floatingCancelText}>✕</Text>
              </TouchableOpacity>

              <View style={styles.floatingCountBadge}>
                <Text style={styles.floatingCountText}>{totalCount}</Text>
              </View>

              <View style={styles.floatingTotalGroup}>
                <Text style={styles.floatingTotalLabel}>ጠቅላላ ዋጋ</Text>
                <Text style={styles.floatingTotalText}>
                  {totalPrice.toLocaleString()} <Text style={styles.floatingBirr}>ብር</Text>
                </Text>
              </View>
            </View>

            {/* 2 ACTIONS: SEND TO DRAFT & SEND ORDER */}
            <View style={styles.floatingActionsGroup}>
              <TouchableOpacity
                style={styles.floatingDraftBtn}
                onPress={handleSaveToDraft}
                activeOpacity={0.85}
              >
                <Text style={styles.floatingDraftText}>ረቂቅ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.floatingActionPill}
                onPress={() => router.push('/checkout')}
                activeOpacity={0.85}
              >
                <Text style={styles.floatingActionText}>ትእዛዝ ላክ ›</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* ---------- PURE IN-APP AMHARIC CONFIRMATION MODAL ---------- */}
      <Modal
        visible={clearModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelClearCart}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <Text style={styles.modalIconEmoji}>🗑️</Text>
            </View>

            <Text style={styles.modalTitle}>ቅርጫቱን ማጽዳት</Text>
            <Text style={styles.modalMessage}>
              በቅርጫቱ ውስጥ ያሉ እቃዎችን በሙሉ መሰረዝ ይፈልጋሉ?
            </Text>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={handleCancelClearCart}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelBtnText}>ይቅር</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmClearCart}
                activeOpacity={0.85}
              >
                <Text style={styles.modalConfirmBtnText}>አጽዳ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ---------- PURE IN-APP AMHARIC NOTIFICATION MODAL ---------- */}
      <Modal
        visible={notificationModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNotificationModal((prev) => ({ ...prev, visible: false }))}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIconBox, { backgroundColor: '#E4F2EA', borderColor: '#CFE7D9' }]}>
              <Text style={styles.modalIconEmoji}>ℹ️</Text>
            </View>

            <Text style={styles.modalTitle}>{notificationModal.title}</Text>
            <Text style={styles.modalMessage}>{notificationModal.message}</Text>

            <TouchableOpacity
              style={[styles.modalConfirmBtn, { width: '100%', backgroundColor: GREEN }]}
              onPress={() => setNotificationModal((prev) => ({ ...prev, visible: false }))}
              activeOpacity={0.85}
            >
              <Text style={styles.modalConfirmBtnText}>እሺ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const GREEN = '#0F7B4A';
const GREEN_SOFT = '#E4F2EA';
const AMBER = '#F5A623';
const INK = '#12241A';
const MUTED = '#62726A';

const buildSearchDynamic = (s, isTablet) =>
  StyleSheet.create({
    searchGlow: {
      marginBottom: 10 * s,
      borderRadius: 18 * s,
      width: '100%',
      alignSelf: 'center',
      backgroundColor: 'transparent',
    },
    searchBar: {
      height: 44 * s,
      borderRadius: 15 * s,
      paddingHorizontal: 12 * s,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9 * s,
      maxWidth: isTablet ? 620 : '100%',
      width: '100%',
      alignSelf: 'center',
      backgroundColor: '#F8FAFC',
      borderWidth: 1 * s,
      borderColor: '#E2E8F0',
      elevation: 0,
    },
    searchIconWrap: {
      width: 27 * s,
      height: 27 * s,
      borderRadius: 9 * s,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#EAF2FF',
    },
    searchIcon: {
      fontSize: 13 * s,
      color: '#64748B',
    },
    searchInput: {
      flex: 1,
      minWidth: 0,
      height: 42 * s,
      paddingHorizontal: 0,
      paddingVertical: 0,
      fontSize: 13 * s,
      fontWeight: '400',
      color: '#0F172A',
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    searchClearBtn: {
      width: 23 * s,
      height: 23 * s,
      borderRadius: 12 * s,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#E9EEF5',
    },
    searchClearText: {
      fontSize: 10 * s,
      lineHeight: 12 * s,
      fontWeight: '600',
      color: '#64748B',
    },
  });

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7F3',
  },
  glowOrbTop: {
    position: 'absolute',
    top: -90,
    left: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(15, 123, 74, 0.12)',
  },
  glowOrbSide: {
    position: 'absolute',
    top: 115,
    right: -110,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(245, 166, 35, 0.10)',
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 13,
    paddingBottom: 205,
  },

  /* Search */
  searchGlow: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F7B4A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 4,
  },
  searchGlowActive: {
    shadowColor: '#14C47A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.34,
    shadowRadius: 16,
    elevation: 9,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#DCEAE1',
    overflow: 'hidden',
  },
  searchShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(63, 208, 138, 0.07)',
  },
  searchIconWrap: {
    backgroundColor: GREEN_SOFT,
    borderWidth: 1,
    borderColor: 'rgba(15, 123, 74, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: INK,
    fontWeight: '700',
    padding: 0,
  },
  searchClearBtn: {
    backgroundColor: '#F1F6F2',
    borderWidth: 1,
    borderColor: '#DDE4DD',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  searchClearText: {
    color: MUTED,
    fontWeight: '900',
  },

  /* SLIM 1-Tap Reorder Banner */
  reorderBannerSlim: {
    backgroundColor: '#0F7B4A',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#3FD08A',
    overflow: 'hidden',
    shadowColor: '#0F7B4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  reorderShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  reorderLeftSlim: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },
  reorderBadgeSlim: {
    backgroundColor: '#F2B705',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  reorderBadgeTextSlim: {
    color: '#12241A',
    fontSize: 9.5,
    fontWeight: '900',
  },
  reorderTitleSlim: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
    flex: 1,
  },
  reorderAmountSlim: {
    color: '#FDE047',
    fontWeight: '900',
  },
  reorderActionBtnSlim: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    flexShrink: 0,
  },
  reorderActionTextSlim: {
    color: '#0F7B4A',
    fontSize: 10.5,
    fontWeight: '900',
  },

  /* Ad Banner & Sequential Media */
  adGlow: {
    marginBottom: 15,
    borderRadius: 21,
    backgroundColor: GREEN,
    shadowColor: '#14C47A',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.5,
    shadowRadius: 17,
    elevation: 11,
  },
  adFrame: {
    height: AD_HEIGHT,
    borderRadius: 21,
    overflow: 'hidden',
    backgroundColor: GREEN,
    borderWidth: 1.2,
    borderColor: 'rgba(63, 208, 138, 0.7)',
    position: 'relative',
  },
  adBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: GREEN,
  },
  adOrbBig: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(63, 208, 138, 0.33)',
  },
  adOrbSmall: {
    position: 'absolute',
    bottom: -60,
    left: -30,
    width: 145,
    height: 145,
    borderRadius: 73,
    backgroundColor: 'rgba(242, 183, 5, 0.21)',
  },
  adMedia: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  adShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 15,
    paddingTop: 17,
    paddingBottom: 13,
    backgroundColor: 'rgba(6, 46, 28, 0.65)',
  },
  adShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  adTextRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 17,
  },
  adTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  adTitleBig: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 25,
    marginBottom: 4,
  },
  adTitle: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '900',
    marginBottom: 2,
  },
  adSubtitle: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 12,
    fontWeight: '700',
  },
  adIconBubble: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.3,
    borderColor: 'rgba(255, 255, 255, 0.43)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adIconEmoji: {
    fontSize: 30,
  },
  adBadge: {
    position: 'absolute',
    top: 10,
    left: 12,
    backgroundColor: AMBER,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    elevation: 5,
  },
  adBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  adPaginationDots: {
    position: 'absolute',
    top: 10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dotItem: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotItemActive: {
    width: 12,
    backgroundColor: '#FFFFFF',
  },

  /* Categories */
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 9,
    marginBottom: 17,
  },
  categoryTile: {
    width: '23.5%',
    minHeight: 88,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E6ECE7',
    ...ROW_SHADOW,
  },
  categoryTileActive: {
    backgroundColor: GREEN,
    borderColor: '#3FD08A',
    shadowColor: '#0F7B4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  categoryIconBubble: {
    width: 37,
    height: 37,
    borderRadius: 19,
    backgroundColor: GREEN_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  categoryIconBubbleActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  categoryIcon: {
    fontSize: 19,
  },
  categoryLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: INK,
    textAlign: 'center',
    lineHeight: 12,
  },
  categoryLabelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  /* Section Header */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  sectionAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: GREEN,
    marginRight: 8,
  },
  allSectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: INK,
    flexShrink: 1,
  },
  resetChip: {
    backgroundColor: GREEN_SOFT,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(15, 123, 74, 0.25)',
  },
  resetCatText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: GREEN,
  },
  loaderWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  /* Empty Search */
  noResultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6ECE7',
    paddingVertical: 26,
    paddingHorizontal: 18,
    alignItems: 'center',
    overflow: 'hidden',
    ...ROW_SHADOW,
  },
  noResultGlow: {
    position: 'absolute',
    top: -60,
    right: -45,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(15, 123, 74, 0.08)',
  },
  noResultIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 19,
    backgroundColor: GREEN_SOFT,
    borderWidth: 1,
    borderColor: '#CFE7D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  noResultIcon: {
    fontSize: 24,
  },
  noResultTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: MUTED,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 15,
  },
  noResultBtn: {
    backgroundColor: GREEN,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3FD08A',
    overflow: 'hidden',
    shadowColor: '#0F7B4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 9,
    elevation: 5,
  },
  noResultBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  /* Product Cards */
  productStack: {
    flexDirection: 'column',
    gap: 10,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E6ECE7',
    overflow: 'hidden',
    ...ROW_SHADOW,
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1.5,
    borderRadius: 2,
    backgroundColor: 'rgba(63, 208, 138, 0.5)',
  },
  cardHeaderArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: GREEN_SOFT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(15, 123, 74, 0.2)',
    overflow: 'hidden',
  },
  avatarEmoji: {
    fontSize: 21,
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  productName: {
    fontSize: 13.5,
    fontWeight: '900',
    color: INK,
    lineHeight: 17,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceAmount: {
    fontSize: 15.5,
    fontWeight: '900',
    color: GREEN,
  },
  priceUnitLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: MUTED,
    flexShrink: 1,
  },
  stockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F6F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#E6ECE7',
  },
  stockDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#14C47A',
    marginRight: 4,
  },
  stockText: {
    fontSize: 9,
    color: MUTED,
    fontWeight: '700',
  },
  chevronWrap: {
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 22,
    fontWeight: '900',
    color: '#A9BCB0',
    lineHeight: 24,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
    gap: 8,
  },
  unitPillsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  unitPill: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDE4DD',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAF8',
  },
  unitPillActive: {
    borderColor: '#3FD08A',
    backgroundColor: GREEN,
    shadowColor: '#0F7B4A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  unitPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: MUTED,
  },
  unitPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  addBtn: {
    backgroundColor: GREEN,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#3FD08A',
    overflow: 'hidden',
    shadowColor: '#0F7B4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 6,
  },
  addBtnShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  /* Floating Cart Bar */
  floatingCartContainer: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: Platform.OS === 'ios' ? 100 : 85,
    zIndex: 9999,
    elevation: 20,
  },
  floatingCartBar: {
    width: '100%',
    height: 62,
    backgroundColor: '#0F7B4A',
    borderRadius: 18,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.1,
    borderColor: '#3FD08A',
    overflow: 'hidden',
    shadowColor: '#0B2A1B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  floatingShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexShrink: 1,
  },
  floatingCancelBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EF4444',
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  floatingCancelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  floatingCountBadge: {
    backgroundColor: '#F2B705',
    minWidth: 26,
    height: 26,
    paddingHorizontal: 5,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingCountText: {
    color: '#12241A',
    fontSize: 12,
    fontWeight: '900',
  },
  floatingTotalGroup: {
    justifyContent: 'center',
  },
  floatingTotalLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
  },
  floatingTotalText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  floatingBirr: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  floatingActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexShrink: 0,
  },
  floatingDraftBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 11,
    paddingVertical: 7.5,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingDraftText: {
    color: '#12241A',
    fontSize: 11.5,
    fontWeight: '900',
  },
  floatingActionPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 7.5,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  /* PURE IN-APP AMHARIC MODALS */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 31, 20, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 99999,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6ECE7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 15,
  },
  modalIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  modalIconEmoji: {
    fontSize: 24,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: INK,
    marginBottom: 6,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 13,
    color: MUTED,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#F1F5F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '800',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});