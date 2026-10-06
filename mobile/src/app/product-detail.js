
// import React, { useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { apiRequest } from '../lib/api';
// import { useSession } from '../context/SessionContext';

// function isImageUrl(val) {
//   if (!val || typeof val !== 'string') return false;
//   return (
//     val.startsWith('http://') ||
//     val.startsWith('https://') ||
//     val.startsWith('/uploads') ||
//     val.startsWith('file://') ||
//     /\.(jpg|jpeg|png|webp|gif)$/i.test(val)
//   );
// }

// export default function ProductDetailScreen() {
//   const router = useRouter();
//   const { productId, unit } = useLocalSearchParams();
//   const { token, lang } = useSession();

//   const [product, setProduct] = useState(null);
//   const [relatedProducts, setRelatedProducts] = useState([]);
//   const [selectedUnit, setSelectedUnit] = useState(unit || 'ካርቶን');
//   const [relatedUnits, setRelatedUnits] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [cart, setCart] = useState({});

//   useEffect(() => {
//     async function init() {
//       if (!productId || !token) return;

//       setLoading(true);
//       try {
//         const savedCart = await AsyncStorage.getItem('user_cart');
//         if (savedCart) {
//           try {
//             setCart(JSON.parse(savedCart) || {});
//           } catch (e) {}
//         }

//         const allRes = await apiRequest('/catalog/products', { token });
//         const prods = allRes?.products || [];
//         const current = prods.find((p) => p.id === productId);

//         if (current) {
//           setProduct(current);
//           const defaultBase = current.unitType === 'DOZEN' ? 'ደርዘን' : 'ካርቶን';
//           if (!unit) {
//             setSelectedUnit(defaultBase);
//           }

//           const related = prods.filter(
//             (p) =>
//               p.id !== current.id &&
//               (p.categoryId === current.categoryId ||
//                 p.category?.id === current.categoryId)
//           );
//           setRelatedProducts(related);
//         }
//       } catch (err) {
//         console.log('Error fetching product details:', err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     init();
//   }, [productId, token]);

//   const handleSafeBack = () => {
//     if (router.canGoBack()) {
//       router.back();
//     } else {
//       router.replace('/(tabs)');
//     }
//   };

//   const computePrice = (prod, u) => {
//     if (!prod) return 0;
//     const base = Number(prod.pricePerUnit || prod.price || 0);

//     switch (u) {
//       case 'ግማሽ':
//       case 'ግማሽ ካርቶን':
//         return prod.priceHalfCarton !== null && prod.priceHalfCarton !== undefined
//           ? Number(prod.priceHalfCarton)
//           : Math.round(base * 0.52);

//       case 'ግማሽ ደርዘን':
//         return prod.priceHalfDozen !== null && prod.priceHalfDozen !== undefined
//           ? Number(prod.priceHalfDozen)
//           : Math.round(base * 0.5);

//       case 'ፓኬት':
//         return prod.pricePacket !== null && prod.pricePacket !== undefined
//           ? Number(prod.pricePacket)
//           : Math.round((base / 12) * 1.08);

//       case 'ደርዘን':
//       case 'ካርቶን':
//       default:
//         return base;
//     }
//   };

//   const getDynamicTiers = (prod) => {
//     if (!prod) return [];
//     const baseUnit = prod.unitType === 'DOZEN' ? 'ደርዘን' : 'ካርቶን';
//     const tiers = [
//       {
//         unit: baseUnit,
//         price: computePrice(prod, baseUnit),
//       },
//     ];

//     if (prod.allowsHalfCarton) {
//       tiers.push({
//         unit: 'ግማሽ ካርቶን',
//         price: computePrice(prod, 'ግማሽ ካርቶን'),
//       });
//     }

//     if (prod.allowsHalfDozen) {
//       tiers.push({
//         unit: 'ግማሽ ደርዘን',
//         price: computePrice(prod, 'ግማሽ ደርዘን'),
//       });
//     }

//     if (prod.allowsPacket) {
//       tiers.push({
//         unit: 'ፓኬት',
//         price: computePrice(prod, 'ፓኬት'),
//       });
//     }

//     if (tiers.length === 1 && !prod.allowsHalfCarton && !prod.allowsHalfDozen && !prod.allowsPacket) {
//       tiers.push(
//         { unit: 'ግማሽ ካርቶን', price: computePrice(prod, 'ግማሽ ካርቶን') },
//         { unit: 'ፓኬት', price: computePrice(prod, 'ፓኬት') }
//       );
//     }

//     return tiers;
//   };

//   const getAvailableUnitsForRelated = (relItem) => {
//     const baseUnit = relItem.unitType === 'DOZEN' ? 'ደርዘን' : 'ካርቶን';
//     const units = [baseUnit];
//     if (relItem.allowsHalfCarton) units.push('ግማሽ ካርቶን');
//     else if (relItem.allowsHalfDozen) units.push('ግማሽ ደርዘን');
//     else units.push('ግማሽ');
//     return units;
//   };

//   const addItemToCart = async (item, chosenUnit, price) => {
//     if (!item || !item.id) return;

//     const key = `${item.id}_${chosenUnit}`;
//     const curQty = cart[key]?.quantity || 0;

//     const updated = {
//       ...cart,
//       [key]: {
//         productId: item.id,
//         name: item.nameAm || item.nameOm || 'ምርት',
//         imageUrl: item.imageUrl || null,
//         unit: chosenUnit,
//         price: Number(price),
//         quantity: curQty + 1,
//       },
//     };

//     setCart(updated);
//     await AsyncStorage.setItem('user_cart', JSON.stringify(updated));
//   };

//   const handleAddMainProduct = () => {
//     if (!product) return;
//     const price = computePrice(product, selectedUnit);
//     addItemToCart(product, selectedUnit, price);
//   };

//   const handleSelectRelatedUnit = (relId, chosenUnit) => {
//     setRelatedUnits((prev) => ({
//       ...prev,
//       [relId]: chosenUnit,
//     }));
//   };

//   const handleAddRelatedProduct = (relItem) => {
//     const defaultUnit = relItem.unitType === 'DOZEN' ? 'ደርዘን' : 'ካርቶን';
//     const chosenUnit = relatedUnits[relItem.id] || defaultUnit;
//     const price = computePrice(relItem, chosenUnit);
//     addItemToCart(relItem, chosenUnit, price);
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

//   const handleGoToCheckout = async () => {
//     await AsyncStorage.setItem('user_cart', JSON.stringify(cart));
//     router.push({
//       pathname: '/checkout',
//       params: { cartData: JSON.stringify(cart) },
//     });
//   };

//   const totalCount = Object.values(cart).reduce(
//     (sum, item) => sum + (Number(item?.quantity) || 0),
//     0
//   );

//   const totalPrice = Object.values(cart).reduce(
//     (sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 0),
//     0
//   );

//   if (loading) {
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

//   if (!product) {
//     return (
//       <SafeAreaView style={styles.safe}>
//         <View style={styles.center}>
//           <View style={styles.errorCard}>
//             <Text style={styles.errorIcon}>🔍</Text>
//             <Text style={styles.errorText}>ምርቱ አልተገኘም</Text>
//             <TouchableOpacity style={styles.backBtn} onPress={handleSafeBack}>
//               <Text style={styles.backBtnText}>‹ ተመለስ</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const currentPrice = computePrice(product, selectedUnit);
//   const stockCount = product.currentStock ?? product.postedStock ?? product.stock ?? 50;
//   const hasHeroImage = isImageUrl(product.imageUrl);
//   const dynamicTiers = getDynamicTiers(product);

//   return (
//     <SafeAreaView style={styles.safe}>
//       {/* Top Navbar */}
//       <View style={styles.navBar}>
//         <TouchableOpacity style={styles.backAction} onPress={handleSafeBack} activeOpacity={0.7}>
//           <Text style={styles.backActionText}>‹</Text>
//         </TouchableOpacity>
//         <Text style={styles.navTitle}>የምርት ዝርዝር መረጃ</Text>
//         <View style={styles.navSpacer} />
//       </View>

//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Main Product Card */}
//         <View style={styles.heroCard}>
//           <View style={styles.heroGlowA} pointerEvents="none" />

//           {/* Media Box */}
//           <View style={styles.mediaPanel}>
//             {hasHeroImage ? (
//               <Image source={{ uri: product.imageUrl }} style={styles.heroImage} resizeMode="cover" />
//             ) : (
//               <Text style={styles.heroEmoji}>{product.imageUrl || '📦'}</Text>
//             )}

//             <View style={styles.stockBadge}>
//               <View style={styles.stockDot} />
//               <Text style={styles.stockBadgeText}>ክምችት: {stockCount} {selectedUnit}</Text>
//             </View>
//           </View>

//           {/* Title */}
//           <Text style={styles.productTitle} numberOfLines={2}>
//             {lang === 'om' ? product.nameOm || product.nameAm : product.nameAm || product.nameOm}
//           </Text>

//           {/* Chips */}
//           <View style={styles.metaChipsRow}>
//             <View style={styles.metaChip}>
//               <Text style={styles.metaChipIcon}>🏭</Text>
//               <Text style={styles.metaChipText} numberOfLines={1}>
//                 {product.brand || 'ቀጥታ ከአምራች ፋብሪካ'}
//               </Text>
//             </View>
//             <View style={styles.metaChip}>
//               <Text style={styles.metaChipIcon}>📦</Text>
//               <Text style={styles.metaChipText}>የተረጋገጠ ምርት</Text>
//             </View>
//           </View>

//           {/* Live Price Display */}
//           <View style={styles.priceRow}>
//             <Text style={styles.priceValue}>{currentPrice.toLocaleString()}</Text>
//             <Text style={styles.priceCurrency}>ብር / {selectedUnit}</Text>
//           </View>

//           {/* Dynamic 4-Tier Pricing Grid */}
//           <View style={styles.tiersContainer}>
//             <Text style={styles.tiersLabel}>የመለኪያ እና ዋጋ ዝርዝር (ይምረጡ)</Text>
//             <View style={styles.tiersHorizontalRow}>
//               {dynamicTiers.map((t) => {
//                 const isSelected = selectedUnit === t.unit;
//                 return (
//                   <TouchableOpacity
//                     key={t.unit}
//                     style={[styles.tierCard, isSelected && styles.tierCardActive]}
//                     onPress={() => setSelectedUnit(t.unit)}
//                     activeOpacity={0.75}
//                   >
//                     <View style={[styles.tierRadioDot, isSelected && styles.tierRadioDotActive]} />
//                     <Text style={[styles.tierUnitName, isSelected && styles.tierUnitNameActive]} numberOfLines={1}>
//                       {t.unit}
//                     </Text>
//                     <Text style={[styles.tierPriceText, isSelected && styles.tierPriceTextActive]}>
//                       {t.price.toLocaleString()} <Text style={styles.tierCurrency}>ብር</Text>
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>
//           </View>

//           {/* Add Main Product Button */}
//           <TouchableOpacity style={styles.heroAddBtn} onPress={handleAddMainProduct} activeOpacity={0.85}>
//             <Text style={styles.heroAddBtnText}>+ ወደ ቅርጫት ጨምር ({currentPrice.toLocaleString()} ብር)</Text>
//           </TouchableOpacity>
//         </View>

//         {/* 2-Column Side-by-Side Related Products Grid with Add Option */}
//         {relatedProducts.length > 0 && (
//           <View style={styles.relatedSection}>
//             <View style={styles.relatedTitleRow}>
//               <View style={styles.labelAccent} />
//               <Text style={styles.relatedTitle}>ተዛማጅ ምርቶች</Text>
//               <View style={styles.relatedCountChip}>
//                 <Text style={styles.relatedCountText}>{relatedProducts.length}</Text>
//               </View>
//             </View>

//             <View style={styles.sideBySideGrid}>
//               {relatedProducts.map((rel) => {
//                 const defaultUnit = rel.unitType === 'DOZEN' ? 'ደርዘን' : 'ካርቶን';
//                 const currentRelUnit = relatedUnits[rel.id] || defaultUnit;
//                 const relPrice = computePrice(rel, currentRelUnit);
//                 const isRelImage = isImageUrl(rel.imageUrl);
//                 const relUnits = getAvailableUnitsForRelated(rel);

//                 return (
//                   <View key={rel.id} style={styles.gridCard}>
//                     <TouchableOpacity
//                       style={styles.gridTouchArea}
//                       onPress={() => {
//                         router.replace({
//                           pathname: '/product-detail',
//                           params: { productId: rel.id, unit: currentRelUnit },
//                         });
//                       }}
//                       activeOpacity={0.8}
//                     >
//                       <View style={styles.gridAvatarBox}>
//                         {isRelImage ? (
//                           <Image source={{ uri: rel.imageUrl }} style={styles.gridImage} resizeMode="cover" />
//                         ) : (
//                           <Text style={styles.gridEmoji}>{rel.imageUrl || '📦'}</Text>
//                         )}
//                         <View style={styles.gridChevron} pointerEvents="none">
//                           <Text style={styles.gridChevronText}>›</Text>
//                         </View>
//                       </View>

//                       <Text style={styles.gridName} numberOfLines={2}>
//                         {lang === 'om' ? rel.nameOm || rel.nameAm : rel.nameAm || rel.nameOm}
//                       </Text>

//                       <View style={styles.gridStockChip}>
//                         <View style={styles.gridStockDot} />
//                         <Text style={styles.gridStock} numberOfLines={1}>
//                           ክምችት: {rel.currentStock ?? 50}
//                         </Text>
//                       </View>
//                     </TouchableOpacity>

//                     {/* Unit Selector Pills */}
//                     <View style={styles.relUnitRow}>
//                       {relUnits.map((ru) => {
//                         const isSelected = currentRelUnit === ru;
//                         return (
//                           <TouchableOpacity
//                             key={ru}
//                             style={[styles.relUnitPill, isSelected && styles.relUnitPillActive]}
//                             onPress={() => handleSelectRelatedUnit(rel.id, ru)}
//                             activeOpacity={0.7}
//                           >
//                             <Text
//                               style={[styles.relUnitPillText, isSelected && styles.relUnitPillTextActive]}
//                               numberOfLines={1}
//                             >
//                               {ru}
//                             </Text>
//                           </TouchableOpacity>
//                         );
//                       })}
//                     </View>

//                     {/* Price & Add to Cart Button */}
//                     <View style={styles.gridBottomRow}>
//                       <View style={styles.gridPriceGroup}>
//                         <Text style={styles.gridPriceDigits} numberOfLines={1}>
//                           {relPrice.toLocaleString()}
//                         </Text>
//                         <Text style={styles.gridPriceCurrency}>ብር</Text>
//                       </View>

//                       <TouchableOpacity
//                         style={styles.gridAddBtn}
//                         onPress={() => handleAddRelatedProduct(rel)}
//                         activeOpacity={0.75}
//                       >
//                         <Text style={styles.gridAddBtnText}>+ ጨምር</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 );
//               })}
//             </View>
//           </View>
//         )}
//       </ScrollView>

//       {/* Floating Bottom Cart Bar with Red ✕ Quick-Clear Button */}
//       {totalCount > 0 && (
//         <View style={styles.floatingCartContainer} pointerEvents="box-none">
//           <View style={styles.floatingCartBar}>
//             <View style={styles.floatingShine} pointerEvents="none" />

//             <View style={styles.floatingCartLeft}>
//               {/* Red Circular ✕ Cancel Cart Button */}
//               <TouchableOpacity
//                 style={styles.floatingCancelBtn}
//                 onPress={handleClearCart}
//                 activeOpacity={0.75}
//                 hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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

//             <TouchableOpacity
//               style={styles.floatingActionPill}
//               onPress={handleGoToCheckout}
//               activeOpacity={0.85}
//             >
//               <Text style={styles.floatingActionText}>ትእዛዝ ይመልከቱ ›</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// const GREEN = '#0F7B4A';
// const INK = '#12241A';
// const MUTED = '#62726A';
// const HAIRLINE = '#EDF2EE';

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: '#F3F7F2' },

//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//   },
//   loaderCard: {
//     width: 64,
//     height: 64,
//     borderRadius: 20,
//     backgroundColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 3,
//   },
//   errorCard: {
//     width: '100%',
//     maxWidth: 290,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     padding: 20,
//     alignItems: 'center',
//   },
//   errorIcon: { fontSize: 28, marginBottom: 8 },
//   errorText: { fontSize: 14, fontWeight: '800', color: INK },
//   backBtn: {
//     marginTop: 14,
//     backgroundColor: GREEN,
//     paddingHorizontal: 24,
//     paddingVertical: 9,
//     borderRadius: 20,
//   },
//   backBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

//   navBar: {
//     height: 48,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 12,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E6ECE7',
//   },
//   backAction: {
//     width: 32,
//     height: 32,
//     borderRadius: 10,
//     backgroundColor: '#EEF6F0',
//     borderWidth: 1,
//     borderColor: '#DCEAE1',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backActionText: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: GREEN,
//     marginTop: -2,
//   },
//   navTitle: {
//     fontSize: 14.5,
//     fontWeight: '900',
//     color: INK,
//   },
//   navSpacer: { width: 32, height: 32 },

//   scroll: { flex: 1 },
//   scrollContent: {
//     padding: 12,
//     paddingBottom: 110,
//     gap: 12,
//   },

//   heroCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 18,
//     padding: 13,
//     borderWidth: 1,
//     borderColor: HAIRLINE,
//     elevation: 2,
//     overflow: 'hidden',
//   },
//   heroGlowA: {
//     position: 'absolute',
//     top: -50,
//     right: -40,
//     width: 140,
//     height: 140,
//     borderRadius: 70,
//     backgroundColor: 'rgba(15, 123, 74, 0.06)',
//   },
//   mediaPanel: {
//     width: '100%',
//     height: 135,
//     borderRadius: 14,
//     backgroundColor: '#EAF4EE',
//     borderWidth: 1,
//     borderColor: '#D6EBE0',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 10,
//     overflow: 'hidden',
//   },
//   heroImage: { width: '100%', height: '100%' },
//   heroEmoji: { fontSize: 48 },
//   stockBadge: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 5,
//     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//     borderWidth: 1,
//     borderColor: '#CFE7D9',
//     borderRadius: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 3.5,
//   },
//   stockDot: {
//     width: 5,
//     height: 5,
//     borderRadius: 2.5,
//     backgroundColor: '#12B76A',
//   },
//   stockBadgeText: {
//     fontSize: 9.5,
//     fontWeight: '800',
//     color: GREEN,
//   },
//   productTitle: {
//     fontSize: 16,
//     fontWeight: '900',
//     color: INK,
//     lineHeight: 21,
//     marginBottom: 6,
//   },
//   metaChipsRow: {
//     flexDirection: 'row',
//     gap: 8,
//     marginBottom: 8,
//   },
//   metaChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F4F8F5',
//     paddingHorizontal: 8,
//     paddingVertical: 3.5,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#E3EBE5',
//     gap: 4,
//   },
//   metaChipIcon: { fontSize: 11 },
//   metaChipText: { fontSize: 10.5, color: MUTED, fontWeight: '700' },

//   priceRow: {
//     flexDirection: 'row',
//     alignItems: 'baseline',
//     marginTop: 2,
//     marginBottom: 10,
//   },
//   priceValue: {
//     fontSize: 22,
//     fontWeight: '900',
//     color: GREEN,
//   },
//   priceCurrency: {
//     fontSize: 11,
//     fontWeight: '700',
//     color: MUTED,
//     marginLeft: 5,
//   },

//   tiersContainer: {
//     marginBottom: 12,
//   },
//   tiersLabel: {
//     fontSize: 11,
//     fontWeight: '800',
//     color: INK,
//     marginBottom: 7,
//   },
//   tiersHorizontalRow: {
//     flexDirection: 'row',
//     gap: 7,
//   },
//   tierCard: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     borderWidth: 1.5,
//     borderColor: '#D4E5DB',
//     borderRadius: 12,
//     paddingVertical: 8,
//     paddingHorizontal: 5,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   tierCardActive: {
//     borderColor: GREEN,
//     backgroundColor: '#F0F9F4',
//     elevation: 2,
//   },
//   tierRadioDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: '#CBD5E1',
//     marginBottom: 3,
//   },
//   tierRadioDotActive: {
//     backgroundColor: GREEN,
//   },
//   tierUnitName: {
//     fontSize: 10,
//     fontWeight: '800',
//     color: MUTED,
//     marginBottom: 2,
//   },
//   tierUnitNameActive: {
//     color: GREEN,
//     fontWeight: '900',
//   },
//   tierPriceText: {
//     fontSize: 11.5,
//     fontWeight: '900',
//     color: INK,
//   },
//   tierPriceTextActive: {
//     color: GREEN,
//   },
//   tierCurrency: {
//     fontSize: 8.5,
//     fontWeight: '700',
//   },

//   heroAddBtn: {
//     width: '100%',
//     backgroundColor: GREEN,
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 4,
//   },
//   heroAddBtnText: {
//     color: '#FFFFFF',
//     fontWeight: '900',
//     fontSize: 13,
//   },

//   /* 2-Column Balanced Grid for Related Products */
//   relatedSection: { marginTop: 4 },
//   relatedTitleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 7,
//     marginBottom: 10,
//   },
//   labelAccent: {
//     width: 3,
//     height: 14,
//     borderRadius: 2,
//     backgroundColor: GREEN,
//   },
//   relatedTitle: {
//     fontSize: 13.5,
//     fontWeight: '900',
//     color: INK,
//   },
//   relatedCountChip: {
//     minWidth: 20,
//     height: 20,
//     paddingHorizontal: 6,
//     borderRadius: 10,
//     backgroundColor: '#E4F2EA',
//     borderWidth: 1,
//     borderColor: '#CFE7D9',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   relatedCountText: {
//     fontSize: 10,
//     fontWeight: '900',
//     color: GREEN,
//   },
//   sideBySideGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     rowGap: 10,
//   },
//   gridCard: {
//     width: '48.5%',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 15,
//     padding: 9,
//     borderWidth: 1,
//     borderColor: HAIRLINE,
//     justifyContent: 'space-between',
//     elevation: 2,
//   },
//   gridTouchArea: {
//     marginBottom: 7,
//   },
//   gridAvatarBox: {
//     height: 75,
//     backgroundColor: '#EAF4EE',
//     borderWidth: 1,
//     borderColor: '#D6EBE0',
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 7,
//     overflow: 'hidden',
//   },
//   gridImage: { width: '100%', height: '100%' },
//   gridEmoji: { fontSize: 28 },
//   gridChevron: {
//     position: 'absolute',
//     top: 5,
//     right: 5,
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   gridChevronText: {
//     fontSize: 11,
//     fontWeight: '900',
//     color: GREEN,
//     marginTop: -1,
//   },
//   gridName: {
//     fontSize: 11.5,
//     fontWeight: '800',
//     color: INK,
//     lineHeight: 15,
//     marginBottom: 5,
//     minHeight: 30,
//   },
//   gridStockChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     alignSelf: 'flex-start',
//     backgroundColor: '#F4F8F5',
//     borderWidth: 1,
//     borderColor: '#E3EBE5',
//     borderRadius: 999,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//   },
//   gridStockDot: {
//     width: 4,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: '#12B76A',
//     marginRight: 4,
//   },
//   gridStock: {
//     fontSize: 8.5,
//     color: MUTED,
//     fontWeight: '700',
//   },
//   relUnitRow: {
//     flexDirection: 'row',
//     gap: 4,
//     marginBottom: 7,
//   },
//   relUnitPill: {
//     flex: 1,
//     borderRadius: 8,
//     paddingVertical: 4.5,
//     paddingHorizontal: 2,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#F4F8F5',
//     borderWidth: 1,
//     borderColor: '#E3EBE5',
//   },
//   relUnitPillActive: {
//     backgroundColor: GREEN,
//     borderColor: '#3FD08A',
//   },
//   relUnitPillText: {
//     fontSize: 8.5,
//     fontWeight: '700',
//     color: MUTED,
//   },
//   relUnitPillTextActive: {
//     color: '#FFFFFF',
//     fontWeight: '900',
//   },
//   gridBottomRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingTop: 7,
//     borderTopWidth: 1,
//     borderTopColor: '#F1F5F2',
//     gap: 4,
//   },
//   gridPriceGroup: {
//     flexShrink: 1,
//   },
//   gridPriceDigits: {
//     fontSize: 13,
//     fontWeight: '900',
//     color: INK,
//   },
//   gridPriceCurrency: {
//     fontSize: 8.5,
//     color: MUTED,
//     fontWeight: '700',
//   },
//   gridAddBtn: {
//     backgroundColor: GREEN,
//     paddingHorizontal: 9,
//     paddingVertical: 5.5,
//     borderRadius: 8,
//     elevation: 2,
//   },
//   gridAddBtnText: {
//     color: '#FFFFFF',
//     fontWeight: '800',
//     fontSize: 10,
//   },

//   /* Floating Cart Bar with ✕ Clear Button */
//   floatingCartContainer: {
//     position: 'absolute',
//     left: 12,
//     right: 12,
//     bottom: Platform.OS === 'ios' ? 24 : 14,
//     zIndex: 9999,
//     elevation: 20,
//   },
//   floatingCartBar: {
//     width: '100%',
//     height: 56,
//     backgroundColor: '#0F7B4A',
//     borderRadius: 16,
//     paddingHorizontal: 12,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderWidth: 1.1,
//     borderColor: '#3FD08A',
//     overflow: 'hidden',
//     shadowColor: '#0B2A1B',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.28,
//     shadowRadius: 10,
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
//     gap: 8,
//     flexShrink: 1,
//   },
//   floatingCancelBtn: {
//     width: 26,
//     height: 26,
//     borderRadius: 13,
//     backgroundColor: '#EF4444',
//     borderWidth: 1.5,
//     borderColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 2,
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
//   floatingActionPill: {
//     backgroundColor: 'rgba(255, 255, 255, 0.22)',
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.35)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     flexShrink: 0,
//   },
//   floatingActionText: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     fontWeight: '800',
//   },
// });

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../lib/api';
import { useSession } from '../context/SessionContext';

function isImageUrl(val) {
  if (!val || typeof val !== 'string') return false;
  return (
    val.startsWith('http://') ||
    val.startsWith('https://') ||
    val.startsWith('/uploads') ||
    val.startsWith('file://') ||
    /\.(jpg|jpeg|png|webp|gif)$/i.test(val)
  );
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const { productId, unit } = useLocalSearchParams();
  const { token, lang } = useSession();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(unit || 'ካርቶን');
  const [relatedUnits, setRelatedUnits] = useState({});
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});

  // Pure In-App Amharic Modal State (No "localhost says..." popups)
  const [clearModalVisible, setClearModalVisible] = useState(false);

  const syncCartFromStorage = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('user_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart) || {});
      } else {
        setCart({});
      }
    } catch {
      setCart({});
    }
  };

  useFocusEffect(
    useCallback(() => {
      syncCartFromStorage();
    }, [])
  );

  useEffect(() => {
    async function init() {
      if (!productId || !token) return;

      setLoading(true);
      try {
        await syncCartFromStorage();

        const allRes = await apiRequest('/catalog/products', { token });
        const prods = allRes?.products || [];
        const current = prods.find((p) => p.id === productId);

        if (current) {
          setProduct(current);
          const defaultBase = current.unitType === 'DOZEN' ? 'ደርዘን' : 'ካርቶን';
          if (!unit) {
            setSelectedUnit(defaultBase);
          }

          const related = prods.filter(
            (p) =>
              p.id !== current.id &&
              (p.categoryId === current.categoryId ||
                p.category?.id === current.categoryId)
          );
          setRelatedProducts(related);
        }
      } catch {
        // Silent recovery
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [productId, token]);

  const handleSafeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const computePrice = (prod, u) => {
    if (!prod) return 0;
    const base = Number(prod.pricePerUnit || prod.price || 0);

    switch (u) {
      case 'ግማሽ':
      case 'ግማሽ ካርቶን':
        return prod.priceHalfCarton !== null && prod.priceHalfCarton !== undefined
          ? Number(prod.priceHalfCarton)
          : Math.round(base * 0.52);

      case 'ግማሽ ደርዘን':
        return prod.priceHalfDozen !== null && prod.priceHalfDozen !== undefined
          ? Number(prod.priceHalfDozen)
          : Math.round(base * 0.5);

      case 'ፓኬት':
        return prod.pricePacket !== null && prod.pricePacket !== undefined
          ? Number(prod.pricePacket)
          : Math.round((base / 12) * 1.08);

      case 'ደርዘን':
      case 'ካርቶን':
      default:
        return base;
    }
  };

  const getDynamicTiers = (prod) => {
    if (!prod) return [];
    const baseUnit = prod.unitType === 'DOZEN' ? 'ደርዘን' : 'ካርቶን';
    const tiers = [
      {
        unit: baseUnit,
        price: computePrice(prod, baseUnit),
      },
    ];

    if (prod.allowsHalfCarton) {
      tiers.push({
        unit: 'ግማሽ ካርቶን',
        price: computePrice(prod, 'ግማሽ ካርቶን'),
      });
    }

    if (prod.allowsHalfDozen) {
      tiers.push({
        unit: 'ግማሽ ደርዘን',
        price: computePrice(prod, 'ግማሽ ደርዘን'),
      });
    }

    if (prod.allowsPacket) {
      tiers.push({
        unit: 'ፓኬት',
        price: computePrice(prod, 'ፓኬት'),
      });
    }

    if (tiers.length === 1 && !prod.allowsHalfCarton && !prod.allowsHalfDozen && !prod.allowsPacket) {
      tiers.push(
        { unit: 'ግማሽ ካርቶን', price: computePrice(prod, 'ግማሽ ካርቶን') },
        { unit: 'ፓኬት', price: computePrice(prod, 'ፓኬት') }
      );
    }

    return tiers;
  };

  const getAvailableUnitsForRelated = (relItem) => {
    const baseUnit = relItem.unitType === 'DOZEN' ? 'ደርዘን' : 'ካርቶን';
    const units = [baseUnit];
    if (relItem.allowsHalfCarton) units.push('ግማሽ ካርቶን');
    else if (relItem.allowsHalfDozen) units.push('ግማሽ ደርዘን');
    else units.push('ግማሽ');
    return units;
  };

  const addItemToCart = async (item, chosenUnit, price) => {
    if (!item || !item.id) return;

    const key = `${item.id}_${chosenUnit}`;
    const curQty = cart[key]?.quantity || 0;

    const updated = {
      ...cart,
      [key]: {
        productId: item.id,
        name: item.nameAm || item.nameOm || 'ምርት',
        imageUrl: item.imageUrl || null,
        unit: chosenUnit,
        price: Number(price),
        quantity: curQty + 1,
      },
    };

    setCart(updated);
    await AsyncStorage.setItem('user_cart', JSON.stringify(updated));
  };

  const handleAddMainProduct = () => {
    if (!product) return;
    const price = computePrice(product, selectedUnit);
    addItemToCart(product, selectedUnit, price);
  };

  const handleSelectRelatedUnit = (relId, chosenUnit) => {
    setRelatedUnits((prev) => ({
      ...prev,
      [relId]: chosenUnit,
    }));
  };

  const handleAddRelatedProduct = (relItem) => {
    const defaultUnit = relItem.unitType === 'DOZEN' ? 'ደርዘን' : 'ካርቶን';
    const chosenUnit = relatedUnits[relItem.id] || defaultUnit;
    const price = computePrice(relItem, chosenUnit);
    addItemToCart(relItem, chosenUnit, price);
  };

  // Triggers the custom Amharic modal
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

  const handleSaveToDraft = async () => {
    if (Object.keys(cart).length === 0) return;

    try {
      const existingDraftRaw = await AsyncStorage.getItem('user_draft_cart').catch(() => null);
      const existingDrafts = existingDraftRaw ? JSON.parse(existingDraftRaw) : {};

      const mergedDrafts = { ...existingDrafts };
      Object.entries(cart).forEach(([key, item]) => {
        if (mergedDrafts[key]) {
          mergedDrafts[key] = {
            ...mergedDrafts[key],
            quantity: (mergedDrafts[key].quantity || 0) + (item.quantity || 1),
          };
        } else {
          mergedDrafts[key] = { ...item };
        }
      });

      await AsyncStorage.setItem('user_draft_cart', JSON.stringify(mergedDrafts));
      await AsyncStorage.removeItem('user_cart');

      setCart({});

      router.push({
        pathname: '/checkout',
        params: { isDraft: 'true' },
      });
    } catch {
      router.push('/checkout');
    }
  };

  const handleGoToCheckout = async () => {
    await AsyncStorage.setItem('user_cart', JSON.stringify(cart));
    router.push({
      pathname: '/checkout',
      params: { cartData: JSON.stringify(cart) },
    });
  };

  const totalCount = Object.values(cart).reduce(
    (sum, item) => sum + (Number(item?.quantity) || 0),
    0
  );

  const totalPrice = Object.values(cart).reduce(
    (sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 0),
    0
  );

  if (loading) {
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

  if (!product) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>🔍</Text>
            <Text style={styles.errorText}>ምርቱ አልተገኘም</Text>
            <TouchableOpacity style={styles.backBtn} onPress={handleSafeBack}>
              <Text style={styles.backBtnText}>‹ ተመለስ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentPrice = computePrice(product, selectedUnit);
  const stockCount = product.currentStock ?? product.postedStock ?? product.stock ?? 50;
  const hasHeroImage = isImageUrl(product.imageUrl);
  const dynamicTiers = getDynamicTiers(product);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Navbar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backAction} onPress={handleSafeBack} activeOpacity={0.7}>
          <Text style={styles.backActionText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>የምርት ዝርዝር መረጃ</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Product Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlowA} pointerEvents="none" />

          {/* Media Box */}
          <View style={styles.mediaPanel}>
            {hasHeroImage ? (
              <Image source={{ uri: product.imageUrl }} style={styles.heroImage} resizeMode="cover" />
            ) : (
              <Text style={styles.heroEmoji}>{product.imageUrl || '📦'}</Text>
            )}

            <View style={styles.stockBadge}>
              <View style={styles.stockDot} />
              <Text style={styles.stockBadgeText}>ክምችት: {stockCount} {selectedUnit}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.productTitle} numberOfLines={2}>
            {lang === 'om' ? product.nameOm || product.nameAm : product.nameAm || product.nameOm}
          </Text>

          {/* Chips */}
          <View style={styles.metaChipsRow}>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipIcon}>🏭</Text>
              <Text style={styles.metaChipText} numberOfLines={1}>
                {product.brand || 'ቀጥታ ከአምራች ፋብሪካ'}
              </Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipIcon}>📦</Text>
              <Text style={styles.metaChipText}>የተረጋገጠ ምርት</Text>
            </View>
          </View>

          {/* Live Price Display */}
          <View style={styles.priceRow}>
            <Text style={styles.priceValue}>{currentPrice.toLocaleString()}</Text>
            <Text style={styles.priceCurrency}>ብር / {selectedUnit}</Text>
          </View>

          {/* Dynamic 4-Tier Pricing Grid */}
          <View style={styles.tiersContainer}>
            <Text style={styles.tiersLabel}>የመለኪያ እና ዋጋ ዝርዝር (ይምረጡ)</Text>
            <View style={styles.tiersHorizontalRow}>
              {dynamicTiers.map((t) => {
                const isSelected = selectedUnit === t.unit;
                return (
                  <TouchableOpacity
                    key={t.unit}
                    style={[styles.tierCard, isSelected && styles.tierCardActive]}
                    onPress={() => setSelectedUnit(t.unit)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.tierRadioDot, isSelected && styles.tierRadioDotActive]} />
                    <Text style={[styles.tierUnitName, isSelected && styles.tierUnitNameActive]} numberOfLines={1}>
                      {t.unit}
                    </Text>
                    <Text style={[styles.tierPriceText, isSelected && styles.tierPriceTextActive]}>
                      {t.price.toLocaleString()} <Text style={styles.tierCurrency}>ብር</Text>
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Add Main Product Button */}
          <TouchableOpacity style={styles.heroAddBtn} onPress={handleAddMainProduct} activeOpacity={0.85}>
            <Text style={styles.heroAddBtnText}>+ ወደ ቅርጫት ጨምር ({currentPrice.toLocaleString()} ብር)</Text>
          </TouchableOpacity>
        </View>

        {/* 2-Column Side-by-Side Related Products */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <View style={styles.relatedTitleRow}>
              <View style={styles.labelAccent} />
              <Text style={styles.relatedTitle}>ተዛማጅ ምርቶች</Text>
              <View style={styles.relatedCountChip}>
                <Text style={styles.relatedCountText}>{relatedProducts.length}</Text>
              </View>
            </View>

            <View style={styles.sideBySideGrid}>
              {relatedProducts.map((rel) => {
                const defaultUnit = rel.unitType === 'DOZEN' ? 'ደርዘን' : 'ካርቶን';
                const currentRelUnit = relatedUnits[rel.id] || defaultUnit;
                const relPrice = computePrice(rel, currentRelUnit);
                const isRelImage = isImageUrl(rel.imageUrl);
                const relUnits = getAvailableUnitsForRelated(rel);

                return (
                  <View key={rel.id} style={styles.gridCard}>
                    <TouchableOpacity
                      style={styles.gridTouchArea}
                      onPress={() => {
                        router.replace({
                          pathname: '/product-detail',
                          params: { productId: rel.id, unit: currentRelUnit },
                        });
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.gridAvatarBox}>
                        {isRelImage ? (
                          <Image source={{ uri: rel.imageUrl }} style={styles.gridImage} resizeMode="cover" />
                        ) : (
                          <Text style={styles.gridEmoji}>{rel.imageUrl || '📦'}</Text>
                        )}
                        <View style={styles.gridChevron} pointerEvents="none">
                          <Text style={styles.gridChevronText}>›</Text>
                        </View>
                      </View>

                      <Text style={styles.gridName} numberOfLines={2}>
                        {lang === 'om' ? rel.nameOm || rel.nameAm : rel.nameAm || rel.nameOm}
                      </Text>

                      <View style={styles.gridStockChip}>
                        <View style={styles.gridStockDot} />
                        <Text style={styles.gridStock} numberOfLines={1}>
                          ክምችት: {rel.currentStock ?? 50}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Unit Selector Pills */}
                    <View style={styles.relUnitRow}>
                      {relUnits.map((ru) => {
                        const isSelected = currentRelUnit === ru;
                        return (
                          <TouchableOpacity
                            key={ru}
                            style={[styles.relUnitPill, isSelected && styles.relUnitPillActive]}
                            onPress={() => handleSelectRelatedUnit(rel.id, ru)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[styles.relUnitPillText, isSelected && styles.relUnitPillTextActive]}
                              numberOfLines={1}
                            >
                              {ru}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Price & Add to Cart Button */}
                    <View style={styles.gridBottomRow}>
                      <View style={styles.gridPriceGroup}>
                        <Text style={styles.gridPriceDigits} numberOfLines={1}>
                          {relPrice.toLocaleString()}
                        </Text>
                        <Text style={styles.gridPriceCurrency}>ብር</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.gridAddBtn}
                        onPress={() => handleAddRelatedProduct(rel)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.gridAddBtnText}>+ ጨምር</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* FLOATING CART BAR */}
      {totalCount > 0 && (
        <View style={styles.floatingCartContainer} pointerEvents="box-none">
          <View style={styles.floatingCartBar}>
            <View style={styles.floatingShine} pointerEvents="none" />

            <View style={styles.floatingCartLeft}>
              {/* Red Circular ✕ Cancel Cart Button */}
              <TouchableOpacity
                style={styles.floatingCancelBtn}
                onPress={handleTriggerClearCart}
                activeOpacity={0.75}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
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

            {/* DUAL ACTION BUTTONS: DRAFT & SEND ORDER */}
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
                onPress={handleGoToCheckout}
                activeOpacity={0.85}
              >
                <Text style={styles.floatingActionText}>ትእዛዝ ላክ ›</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* PURE AMHARIC IN-APP CONFIRMATION MODAL */}
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
    </SafeAreaView>
  );
}

const GREEN = '#0F7B4A';
const INK = '#12241A';
const MUTED = '#62726A';
const HAIRLINE = '#EDF2EE';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F7F2' },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loaderCard: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  errorCard: {
    width: '100%',
    maxWidth: 290,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  errorIcon: { fontSize: 28, marginBottom: 8 },
  errorText: { fontSize: 14, fontWeight: '800', color: INK },
  backBtn: {
    marginTop: 14,
    backgroundColor: GREEN,
    paddingHorizontal: 24,
    paddingVertical: 9,
    borderRadius: 20,
  },
  backBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  navBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECE7',
  },
  backAction: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EEF6F0',
    borderWidth: 1,
    borderColor: '#DCEAE1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backActionText: {
    fontSize: 20,
    fontWeight: '800',
    color: GREEN,
    marginTop: -2,
  },
  navTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: INK,
  },
  navSpacer: { width: 32, height: 32 },

  scroll: { flex: 1 },
  scrollContent: {
    padding: 12,
    paddingBottom: 110,
    gap: 12,
  },

  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: HAIRLINE,
    elevation: 2,
    overflow: 'hidden',
  },
  heroGlowA: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(15, 123, 74, 0.06)',
  },
  mediaPanel: {
    width: '100%',
    height: 135,
    borderRadius: 14,
    backgroundColor: '#EAF4EE',
    borderWidth: 1,
    borderColor: '#D6EBE0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  heroImage: { width: '100%', height: '100%' },
  heroEmoji: { fontSize: 48 },
  stockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#CFE7D9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
  },
  stockDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#12B76A',
  },
  stockBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: GREEN,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: INK,
    lineHeight: 21,
    marginBottom: 6,
  },
  metaChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F8F5',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E3EBE5',
    gap: 4,
  },
  metaChipIcon: { fontSize: 11 },
  metaChipText: { fontSize: 10.5, color: MUTED, fontWeight: '700' },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
    marginBottom: 10,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: GREEN,
  },
  priceCurrency: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    marginLeft: 5,
  },

  tiersContainer: {
    marginBottom: 12,
  },
  tiersLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: INK,
    marginBottom: 7,
  },
  tiersHorizontalRow: {
    flexDirection: 'row',
    gap: 7,
  },
  tierCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D4E5DB',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierCardActive: {
    borderColor: GREEN,
    backgroundColor: '#F0F9F4',
    elevation: 2,
  },
  tierRadioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    marginBottom: 3,
  },
  tierRadioDotActive: {
    backgroundColor: GREEN,
  },
  tierUnitName: {
    fontSize: 10,
    fontWeight: '800',
    color: MUTED,
    marginBottom: 2,
  },
  tierUnitNameActive: {
    color: GREEN,
    fontWeight: '900',
  },
  tierPriceText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: INK,
  },
  tierPriceTextActive: {
    color: GREEN,
  },
  tierCurrency: {
    fontSize: 8.5,
    fontWeight: '700',
  },

  heroAddBtn: {
    width: '100%',
    backgroundColor: GREEN,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  heroAddBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },

  /* 2-Column Side-by-Side Related Products */
  relatedSection: { marginTop: 4 },
  relatedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
  },
  labelAccent: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: GREEN,
  },
  relatedTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: INK,
  },
  relatedCountChip: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#E4F2EA',
    borderWidth: 1,
    borderColor: '#CFE7D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedCountText: {
    fontSize: 10,
    fontWeight: '900',
    color: GREEN,
  },
  sideBySideGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  gridCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 9,
    borderWidth: 1,
    borderColor: HAIRLINE,
    justifyContent: 'space-between',
    elevation: 2,
  },
  gridTouchArea: {
    marginBottom: 7,
  },
  gridAvatarBox: {
    height: 75,
    backgroundColor: '#EAF4EE',
    borderWidth: 1,
    borderColor: '#D6EBE0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
    overflow: 'hidden',
  },
  gridImage: { width: '100%', height: '100%' },
  gridEmoji: { fontSize: 28 },
  gridChevron: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridChevronText: {
    fontSize: 11,
    fontWeight: '900',
    color: GREEN,
    marginTop: -1,
  },
  gridName: {
    fontSize: 11.5,
    fontWeight: '800',
    color: INK,
    lineHeight: 15,
    marginBottom: 5,
    minHeight: 30,
  },
  gridStockChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F4F8F5',
    borderWidth: 1,
    borderColor: '#E3EBE5',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  gridStockDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#12B76A',
    marginRight: 4,
  },
  gridStock: {
    fontSize: 8.5,
    color: MUTED,
    fontWeight: '700',
  },
  relUnitRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 7,
  },
  relUnitPill: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 4.5,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F8F5',
    borderWidth: 1,
    borderColor: '#E3EBE5',
  },
  relUnitPillActive: {
    backgroundColor: GREEN,
    borderColor: '#3FD08A',
  },
  relUnitPillText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: MUTED,
  },
  relUnitPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  gridBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F2',
    gap: 4,
  },
  gridPriceGroup: {
    flexShrink: 1,
  },
  gridPriceDigits: {
    fontSize: 13,
    fontWeight: '900',
    color: INK,
  },
  gridPriceCurrency: {
    fontSize: 8.5,
    color: MUTED,
    fontWeight: '700',
  },
  gridAddBtn: {
    backgroundColor: GREEN,
    paddingHorizontal: 9,
    paddingVertical: 5.5,
    borderRadius: 8,
    elevation: 2,
  },
  gridAddBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 10,
  },

  /* Floating Cart Bar */
  floatingCartContainer: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: Platform.OS === 'ios' ? 24 : 14,
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

  /* PURE IN-APP AMHARIC MODAL */
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