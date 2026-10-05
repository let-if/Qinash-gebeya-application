
// import React, { useState, useEffect } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   ScrollView,
//   SafeAreaView,
//   Platform,
//   ActivityIndicator,
//   Modal,
// } from 'react-native';
// import * as Location from 'expo-location';
// import * as Linking from 'expo-linking';
// import NetInfo from '@react-native-community/netinfo';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { useSession } from '../../context/SessionContext';

// // Target gateway / Warehouse dispatcher number (Adama Hub)
// const GATEWAY_DISPATCH_PHONE = '0911000000';

// const DICTIONARY = {
//   am: {
//     shopTitle: 'የኔ ሱቅ',
//     shopSub: 'አዳማ፣ ኦሮሚያ፣ ኢትዮጵያ',
//     kioskTag: 'የተረጋገጠ የችርቻሮ ነጋዴ',
//     infoSection: 'የመለያ እና የሱቅ ዝርዝር',
//     phoneLabel: 'ስልክ ቁጥር',
//     shopTypeLabel: 'የንግድ ምድብ',
//     shopTypeValue: 'ኪዮስክ / ሱፐርማርኬት',
//     gpsSection: 'የሱቅ መገኛ (GPS Delivery Location)',
//     gpsBtn: 'አዲስ የሱቅ GPS መዝግብ',
//     gpsPinned: 'ትክክለኛ GPS ተመዝግቧል',
//     gpsEmpty: 'ምንም GPS አልተመዘገበም',
//     gpsAccuracy: 'የቦታ ትክክለኛነት',
//     smsEngineSection: 'የኔትወርክ እና የ SMS መጠባበቂያ (Module 5)',
//     netStatusLabel: 'የኢንተርኔት ግንኙነት (Network Status)',
//     netOnline: 'መስመር ላይ (Online)',
//     netOffline: 'ተቋርጧል (Offline)',
//     smsBackupTitle: 'በ SMS የማዘዣ ሞተር (SMS Fallback)',
//     smsBackupSub: 'ኢንተርኔት በማይኖርበት ጊዜ ትእዛዝዎ በ SMS በቀጥታ ይተላለፋል',
//     smsModalTitle: 'የ SMS ትእዛዝ መላኪያ',
//     smsModalDescOnline: `የኢንተርኔት ግንኙነት ቢኖርም የ SMS ስርዓቱን መሞከር ይችላሉ። መልእክቱ በቀጥታ ወደ ${GATEWAY_DISPATCH_PHONE} ይላካል።`,
//     smsModalDescOffline: `⚠️ የኢንተርኔት ግንኙነት ተቋርጧል! ምንም ጭንቀት አይግባዎ፤ ትእዛዝዎ ወደ ${GATEWAY_DISPATCH_PHONE} በ SMS በቀጥታ ይተላለፋል።`,
//     smsModalTargetLabel: 'የሚላክበት ቁጥር (Receiver)',
//     smsModalPayloadLabel: 'የትእዛዝ መልእክት (Payload)',
//     smsModalSendBtn: 'በ SMS ላክ (Open SMS)',
//     smsCopiedText: 'የትእዛዝ መልእክቱ ተገልብጧል (Copied)!',
//     settingsSection: 'ቅንብሮች እና ድጋፍ',
//     langTitle: 'ቋንቋ ቀይር (Language)',
//     langSelected: 'አማርኛ',
//     supportTitle: 'የደንበኞች ድጋፍ መስመር',
//     supportSub: '8:00 AM - 8:00 PM ይደውሉ',
//     supportModalTitle: 'የደንበኞች አገልግሎት',
//     supportModalBody: 'የደንበኞች እርዳታ መስመር: +251 900 460 680\nየስራ ሰዓት: ከጠዋቱ 2:00 እስከ ማታ 2:00',
//     callBtn: 'ደውል (Call)',
//     logoutBtn: 'ከመለያ ውጣ (Sign Out)',
//     logoutConfirmTitle: 'ከመለያ መውጫ',
//     logoutConfirm: 'ከመለያዎ በእርግጥ መውጣት ይፈልጋሉ?',
//     cancelText: 'ይቅር',
//     closeText: 'ዝጋ',
//     selectLangModal: 'ቋንቋ ይምረጡ / Filadhu',
//     locPermDenied: 'የጂፒኤስ ፍቃድ አልተሰጠም',
//     locSuccess: 'የሱቅ GPS መረጃ በተሳካ ሁኔታ ተሻሽሏል',
//   },
//   om: {
//     shopTitle: 'Suuqii Koo',
//     shopSub: 'Adaamaa, Oromiyaa, Itoophiyaa',
//     kioskTag: 'Daldalaa Mirkanaa’e',
//     infoSection: 'Oodeeffannoo Suuqii fi Eenyummaa',
//     phoneLabel: 'Lakkoofsa Bilbilaa',
//     shopTypeLabel: 'Gosa Daldalaa',
//     shopTypeValue: 'Suuqii / Kiyooskii',
//     gpsSection: 'Bakka Suuqii (GPS)',
//     gpsBtn: 'GPS Haaraa Galmeessi',
//     gpsPinned: 'GPS Suuqii Galmaa’eera',
//     gpsEmpty: 'GPS hin galmoofne',
//     gpsAccuracy: 'Qulqullina Iddoo',
//     smsEngineSection: 'Netwoorkii fi Kuusaa SMS (Module 5)',
//     netStatusLabel: 'Haala Netwoorkii (Network Status)',
//     netOnline: 'Toora Irra (Online)',
//     netOffline: 'Cufameera (Offline)',
//     smsBackupTitle: 'Mootara Ajaja SMS (SMS Fallback)',
//     smsBackupSub: 'Yeroo intarneetiin hin jirretti ajajni keessan SMS dhaan darba',
//     smsModalTitle: 'Mootara Ajaja SMS',
//     smsModalDescOnline: `Intarneetiin jiraatus mootara SMS qoruu dandeessu. Ergaan kallattiin gara ${GATEWAY_DISPATCH_PHONE} ergama.`,
//     smsModalDescOffline: `⚠️ Intarneetiin cufameera! Hin dhiphatinaa; ajajni keessan kallattiin gara ${GATEWAY_DISPATCH_PHONE} tti SMS dhaan darba.`,
//     smsModalTargetLabel: 'Gara Lakkoofsa (Receiver)',
//     smsModalPayloadLabel: 'Ergaa Ajajaa (Payload)',
//     smsModalSendBtn: 'SMS dhaan Ergi (Open SMS)',
//     smsCopiedText: 'Ergaan ajajaa koppii ta’eera!',
//     settingsSection: 'Qindaa’inaa fi Gargaarsa',
//     langTitle: 'Afaan Jijjiiri (Language)',
//     langSelected: 'Afaan Oromoo',
//     supportTitle: 'Gargaarsa Maamiltootaa',
//     supportSub: 'Bilbilaa: 8:00 AM - 8:00 PM',
//     supportModalTitle: 'Tajaajila Maamiltootaa',
//     supportModalBody: 'Bilbila gargaarsaa: +251 900 460 680\nSa’aatii hojii: Ganama 2:00 - Galgala 2:00',
//     callBtn: 'Bilbili (Call)',
//     logoutBtn: 'Ba’i (Sign Out)',
//     logoutConfirmTitle: 'Ba’uu Mirkaneessi',
//     logoutConfirm: 'Miseensa keessaa ba’uu barbaaddaa?',
//     cancelText: 'Dhiisi',
//     closeText: 'Cufi',
//     selectLangModal: 'Afaan Filadhu / ቋንቋ ይምረጡ',
//     locPermDenied: 'Hayyama GPS hin arganne',
//     locSuccess: 'Iddoon GPS suuqii sirriitti galmaa’eera',
//   },
//   en: {
//     shopTitle: 'My Kiosk',
//     shopSub: 'Adama, Oromia, Ethiopia',
//     kioskTag: 'Verified Retailer',
//     infoSection: 'Account & Business Details',
//     phoneLabel: 'Phone Number',
//     shopTypeLabel: 'Business Category',
//     shopTypeValue: 'Fast Moving Retail / Kiosk',
//     gpsSection: 'Delivery GPS Coordinates',
//     gpsBtn: 'Update Shop GPS Location',
//     gpsPinned: 'Precise GPS Pinned',
//     gpsEmpty: 'No GPS Registered Yet',
//     gpsAccuracy: 'Accuracy',
//     smsEngineSection: 'Network & Offline SMS Engine (Module 5)',
//     netStatusLabel: 'Network Connectivity',
//     netOnline: 'Connected (Online)',
//     netOffline: 'Disconnected (Offline)',
//     smsBackupTitle: 'SMS Order Dispatcher (Fallback)',
//     smsBackupSub: 'Orders automatically dispatch via compressed SMS when offline',
//     smsModalTitle: 'Offline SMS Order Engine',
//     smsModalDescOnline: `Even while online, you can test the offline SMS engine. The payload transmits to ${GATEWAY_DISPATCH_PHONE}.`,
//     smsModalDescOffline: `⚠️ Internet connection is offline! Your order will be seamlessly routed via native SMS to ${GATEWAY_DISPATCH_PHONE}.`,
//     smsModalTargetLabel: 'Destination Number',
//     smsModalPayloadLabel: 'Order Payload',
//     smsModalSendBtn: 'Launch SMS App',
//     smsCopiedText: 'Payload copied to clipboard!',
//     settingsSection: 'Preferences & Support',
//     langTitle: 'Language',
//     langSelected: 'English',
//     supportTitle: 'Retailer Helpline Support',
//     supportSub: 'Live agents: 8:00 AM - 8:00 PM',
//     supportModalTitle: 'Customer Care Helpline',
//     supportModalBody: 'Helpline Number: +251 900 460 680\nWorking Hours: 8:00 AM - 8:00 PM',
//     callBtn: 'Call Now',
//     logoutBtn: 'Log Out',
//     logoutConfirmTitle: 'Confirm Sign Out',
//     logoutConfirm: 'Are you sure you want to log out of your account?',
//     cancelText: 'Cancel',
//     closeText: 'Close',
//     selectLangModal: 'Choose Language / ቋንቋ ይምረጡ',
//     locPermDenied: 'GPS Permission Denied',
//     locSuccess: 'Shop GPS pinned successfully',
//   },
// };

// export default function ProfileScreen() {
//   const router = useRouter();
//   const { signOut, user } = useSession?.() || {};
//   const params = useLocalSearchParams();

//   const [lang, setLang] = useState('am');
//   const [langModalVisible, setLangModalVisible] = useState(false);
//   const [gpsLoading, setGpsLoading] = useState(false);
//   const [coords, setCoords] = useState(null);
//   const [isOnline, setIsOnline] = useState(true);

//   // Dynamic payload from CheckoutScreen or standard placeholder
//   const [currentPayload, setCurrentPayload] = useState('ORD#PROD_SAMPLE:2:CARTON#BATCH_6AM#0');

//   // Custom modal states
//   const [smsModalVisible, setSmsModalVisible] = useState(false);
//   const [logoutModalVisible, setLogoutModalVisible] = useState(false);
//   const [supportModalVisible, setSupportModalVisible] = useState(false);
//   const [infoToast, setInfoToast] = useState(null);

//   const t = DICTIONARY[lang] || DICTIONARY.am;

//   // Sync payload when user is redirected from CheckoutScreen
//   useEffect(() => {
//     if (params?.smsPayload) {
//       const incoming = String(params.smsPayload);
//       setCurrentPayload(incoming);
//       setSmsModalVisible(true);
//     }
//   }, [params?.smsPayload]);

//   useEffect(() => {
//     async function loadSavedData() {
//       try {
//         const savedLang = await AsyncStorage.getItem('userLanguage');
//         if (savedLang && DICTIONARY[savedLang]) {
//           setLang(savedLang);
//         }
//         const savedCoords = await AsyncStorage.getItem('shopCoords');
//         if (savedCoords) {
//           setCoords(JSON.parse(savedCoords));
//         }
//       } catch (err) {
//         console.error('Error loading preferences:', err);
//       }
//     }
//     loadSavedData();

//     // Network status listener
//     const unsubscribe = NetInfo.addEventListener((state) => {
//       const onlineStatus = Boolean(state.isConnected && state.isInternetReachable !== false);
//       setIsOnline(onlineStatus);
//     });

//     return () => unsubscribe();
//   }, []);

//   const showToast = (message) => {
//     setInfoToast(message);
//     setTimeout(() => setInfoToast(null), 3000);
//   };

//   const changeLanguage = async (newLang) => {
//     setLang(newLang);
//     setLangModalVisible(false);
//     try {
//       await AsyncStorage.setItem('userLanguage', newLang);
//     } catch (err) {
//       console.error('Error saving language:', err);
//     }
//   };

//   const captureGps = async () => {
//     setGpsLoading(true);
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         showToast(t.locPermDenied);
//         return;
//       }

//       const loc = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Balanced,
//       });

//       const newCoords = {
//         lat: Number(loc.coords.latitude.toFixed(6)),
//         lng: Number(loc.coords.longitude.toFixed(6)),
//         acc: loc.coords.accuracy ? Math.round(loc.coords.accuracy) : null,
//       };

//       setCoords(newCoords);
//       await AsyncStorage.setItem('shopCoords', JSON.stringify(newCoords));
//       showToast(t.locSuccess);
//     } catch {
//       showToast('Error capturing GPS');
//     } finally {
//       setGpsLoading(false);
//     }
//   };

//   // Dispatch Native SMS
//   const executeSmsDispatch = () => {
//     setSmsModalVisible(false);

//     if (Platform.OS === 'web') {
//       showToast(t.smsCopiedText);
//       return;
//     }

//     const separator = Linking.createURL('').includes('?') ? '&' : '?';
//     const smsUrl = `sms:${GATEWAY_DISPATCH_PHONE}${separator}body=${encodeURIComponent(currentPayload)}`;
//     Linking.openURL(smsUrl).catch(() => {
//       showToast('Cannot open SMS app on this device');
//     });
//   };

//   const confirmLogoutAction = async () => {
//     setLogoutModalVisible(false);
//     if (signOut) await signOut();
//     router.replace('/(auth)/phone');
//   };

//   const displayedPhone = user?.phoneNumber || '0900460680';
//   const displayedShopName = user?.shopName || t.shopTitle;

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView
//         contentContainerStyle={styles.scrollContainer}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Top Hero Card */}
//         <View style={styles.heroCard}>
//           <View style={styles.avatarPill}>
//             <Text style={{ fontSize: 32 }}>🏪</Text>
//           </View>
//           <View style={styles.badgePill}>
//             <Text style={styles.badgeText}>✓ {t.kioskTag}</Text>
//           </View>
//           <Text style={styles.heroTitle}>{displayedShopName}</Text>
//           <Text style={styles.heroSub}>{t.shopSub}</Text>
//         </View>

//         {/* Account Details Card */}
//         <View style={styles.card}>
//           <Text style={styles.sectionHeader}>{t.infoSection}</Text>

//           <View style={styles.row}>
//             <Text style={styles.rowLabel}>{t.phoneLabel}</Text>
//             <View style={styles.tagBadge}>
//               <Text style={styles.tagBadgeText}>{displayedPhone}</Text>
//             </View>
//           </View>

//           <View style={styles.row}>
//             <Text style={styles.rowLabel}>{t.shopTypeLabel}</Text>
//             <Text style={styles.rowValue}>{t.shopTypeValue}</Text>
//           </View>
//         </View>

//         {/* GPS Location Card */}
//         <View style={styles.card}>
//           <Text style={styles.sectionHeader}>{t.gpsSection}</Text>

//           {coords ? (
//             <View style={styles.gpsSuccessBox}>
//               <View style={styles.gpsIconCircle}>
//                 <Text style={{ fontSize: 20 }}>📍</Text>
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.gpsSuccessTitle}>{t.gpsPinned}</Text>
//                 <Text style={styles.gpsCoordsText}>
//                   {coords.lat}° N, {coords.lng}° E
//                 </Text>
//                 {coords.acc && (
//                   <Text style={styles.gpsAccText}>
//                     {t.gpsAccuracy}: ±{coords.acc}m
//                   </Text>
//                 )}
//               </View>
//             </View>
//           ) : (
//             <View style={styles.gpsEmptyBox}>
//               <Text style={{ fontSize: 20 }}>⚠️</Text>
//               <Text style={styles.gpsEmptyText}>{t.gpsEmpty}</Text>
//             </View>
//           )}

//           <TouchableOpacity
//             style={styles.gpsButton}
//             onPress={captureGps}
//             disabled={gpsLoading}
//             activeOpacity={0.8}
//           >
//             {gpsLoading ? (
//               <ActivityIndicator color="#FFFFFF" />
//             ) : (
//               <Text style={styles.gpsButtonText}>📍 {t.gpsBtn}</Text>
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* Offline SMS Backup Card */}
//         <View style={styles.card}>
//           <Text style={styles.sectionHeader}>{t.smsEngineSection}</Text>

//           <View style={styles.statusRow}>
//             <View style={styles.statusInfo}>
//               <View
//                 style={[
//                   styles.statusDot,
//                   { backgroundColor: isOnline ? '#10B981' : '#EF4444' },
//                 ]}
//               />
//               <Text style={styles.statusLabel}>{t.netStatusLabel}</Text>
//             </View>
//             <View
//               style={[
//                 styles.networkPill,
//                 { backgroundColor: isOnline ? '#E8F5E9' : '#FFEBEE' },
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.networkPillText,
//                   { color: isOnline ? '#0A5C36' : '#C62828' },
//                 ]}
//               >
//                 {isOnline ? `● ${t.netOnline}` : `● ${t.netOffline}`}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.divider} />

//           <TouchableOpacity
//             style={styles.actionRow}
//             onPress={() => setSmsModalVisible(true)}
//             activeOpacity={0.7}
//           >
//             <View style={styles.actionLeft}>
//               <Text style={styles.actionIcon}>💬</Text>
//               <View style={{ flex: 1, paddingRight: 8 }}>
//                 <Text style={styles.actionTitle}>{t.smsBackupTitle}</Text>
//                 <Text style={styles.actionSub}>{t.smsBackupSub}</Text>
//               </View>
//             </View>
//             <Text style={styles.arrowIcon}>›</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Language & Support Card */}
//         <View style={styles.card}>
//           <Text style={styles.sectionHeader}>{t.settingsSection}</Text>

//           <TouchableOpacity
//             style={styles.actionRow}
//             onPress={() => setLangModalVisible(true)}
//             activeOpacity={0.7}
//           >
//             <View style={styles.actionLeft}>
//               <Text style={styles.actionIcon}>🌐</Text>
//               <View>
//                 <Text style={styles.actionTitle}>{t.langTitle}</Text>
//                 <Text style={styles.actionSub}>{t.langSelected}</Text>
//               </View>
//             </View>
//             <View style={styles.langPill}>
//               <Text style={styles.langPillText}>{t.langSelected}</Text>
//               <Text style={styles.arrowIcon}>›</Text>
//             </View>
//           </TouchableOpacity>

//           <View style={styles.divider} />

//           <TouchableOpacity
//             style={styles.actionRow}
//             onPress={() => setSupportModalVisible(true)}
//             activeOpacity={0.7}
//           >
//             <View style={styles.actionLeft}>
//               <Text style={styles.actionIcon}>📞</Text>
//               <View>
//                 <Text style={styles.actionTitle}>{t.supportTitle}</Text>
//                 <Text style={styles.actionSub}>{t.supportSub}</Text>
//               </View>
//             </View>
//             <Text style={styles.arrowIcon}>›</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Logout Button */}
//         <TouchableOpacity
//           style={styles.logoutBtn}
//           onPress={() => setLogoutModalVisible(true)}
//           activeOpacity={0.8}
//         >
//           <Text style={styles.logoutBtnText}>🚪 {t.logoutBtn}</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* Toast Notification */}
//       {infoToast && (
//         <View style={styles.toastContainer}>
//           <Text style={styles.toastText}>{infoToast}</Text>
//         </View>
//       )}

//       {/* 1. SMS Dispatch Modal */}
//       <Modal
//         visible={smsModalVisible}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setSmsModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeaderRow}>
//               <View style={[styles.modalIconWrap, { backgroundColor: isOnline ? '#E8F5E9' : '#FFEBEE' }]}>
//                 <Text style={{ fontSize: 22 }}>{isOnline ? '📡' : '📶'}</Text>
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.customModalTitle}>{t.smsModalTitle}</Text>
//                 <Text style={[styles.networkStatusSmall, { color: isOnline ? '#0A5C36' : '#C62828' }]}>
//                   {isOnline ? `● ${t.netOnline}` : `● ${t.netOffline}`}
//                 </Text>
//               </View>
//             </View>

//             <Text style={styles.customModalBody}>
//               {isOnline ? t.smsModalDescOnline : t.smsModalDescOffline}
//             </Text>

//             <View style={styles.payloadBox}>
//               <Text style={styles.payloadLabel}>{t.smsModalTargetLabel}:</Text>
//               <Text style={styles.phoneHighlight}>{GATEWAY_DISPATCH_PHONE}</Text>
//             </View>

//             <View style={[styles.payloadBox, { marginTop: 8 }]}>
//               <Text style={styles.payloadLabel}>{t.smsModalPayloadLabel}:</Text>
//               <Text style={styles.payloadCode}>{currentPayload}</Text>
//             </View>

//             <View style={styles.modalActionButtons}>
//               <TouchableOpacity
//                 style={styles.modalCancelButton}
//                 onPress={() => setSmsModalVisible(false)}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.modalCancelButtonText}>{t.cancelText}</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalConfirmButton}
//                 onPress={executeSmsDispatch}
//                 activeOpacity={0.8}
//               >
//                 <Text style={styles.modalConfirmButtonText}>{t.smsModalSendBtn}</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* 2. Support Modal */}
//       <Modal
//         visible={supportModalVisible}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setSupportModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>{t.supportModalTitle}</Text>
//             <Text style={[styles.customModalBody, { textAlign: 'center', marginBottom: 16 }]}>
//               {t.supportModalBody}
//             </Text>
//             <View style={styles.modalActionButtons}>
//               <TouchableOpacity
//                 style={styles.modalCancelButton}
//                 onPress={() => setSupportModalVisible(false)}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.modalCancelButtonText}>{t.closeText}</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalConfirmButton}
//                 onPress={() => {
//                   setSupportModalVisible(false);
//                   Linking.openURL('tel:+251900460680').catch(() => {});
//                 }}
//                 activeOpacity={0.8}
//               >
//                 <Text style={styles.modalConfirmButtonText}>{t.callBtn}</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* 3. Logout Modal */}
//       <Modal
//         visible={logoutModalVisible}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setLogoutModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>{t.logoutConfirmTitle}</Text>
//             <Text style={[styles.customModalBody, { textAlign: 'center', marginBottom: 18 }]}>
//               {t.logoutConfirm}
//             </Text>
//             <View style={styles.modalActionButtons}>
//               <TouchableOpacity
//                 style={styles.modalCancelButton}
//                 onPress={() => setLogoutModalVisible(false)}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.modalCancelButtonText}>{t.cancelText}</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.modalConfirmButton, { backgroundColor: '#D32F2F' }]}
//                 onPress={confirmLogoutAction}
//                 activeOpacity={0.8}
//               >
//                 <Text style={styles.modalConfirmButtonText}>{t.logoutBtn}</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* 4. Language Modal */}
//       <Modal
//         visible={langModalVisible}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setLangModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>{t.selectLangModal}</Text>

//             <TouchableOpacity
//               style={[
//                 styles.modalOption,
//                 lang === 'am' && styles.modalOptionActive,
//               ]}
//               onPress={() => changeLanguage('am')}
//             >
//               <Text
//                 style={[
//                   styles.modalOptionText,
//                   lang === 'am' && styles.modalOptionTextActive,
//                 ]}
//               >
//                 🇪🇹 አማርኛ (Amharic)
//               </Text>
//               {lang === 'am' && <Text style={styles.checkmark}>✓</Text>}
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.modalOption,
//                 lang === 'om' && styles.modalOptionActive,
//               ]}
//               onPress={() => changeLanguage('om')}
//             >
//               <Text
//                 style={[
//                   styles.modalOptionText,
//                   lang === 'om' && styles.modalOptionTextActive,
//                 ]}
//               >
//                 🌳 Afaan Oromoo (Oromo)
//               </Text>
//               {lang === 'om' && <Text style={styles.checkmark}>✓</Text>}
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.modalOption,
//                 lang === 'en' && styles.modalOptionActive,
//               ]}
//               onPress={() => changeLanguage('en')}
//             >
//               <Text
//                 style={[
//                   styles.modalOptionText,
//                   lang === 'en' && styles.modalOptionTextActive,
//                 ]}
//               >
//                 🌐 English
//               </Text>
//               {lang === 'en' && <Text style={styles.checkmark}>✓</Text>}
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.modalCancel}
//               onPress={() => setLangModalVisible(false)}
//             >
//               <Text style={styles.modalCancelText}>{t.cancelText}</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#F3F6F4',
//   },
//   scrollContainer: {
//     padding: 16,
//     paddingBottom: 80,
//     maxWidth: 520,
//     width: '100%',
//     alignSelf: 'center',
//   },
//   heroCard: {
//     backgroundColor: '#0A5C36',
//     borderRadius: 24,
//     padding: 24,
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   avatarPill: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   badgePill: {
//     backgroundColor: 'rgba(255, 255, 255, 0.18)',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 20,
//     marginBottom: 8,
//   },
//   badgeText: {
//     color: '#F2C94C',
//     fontSize: 12,
//     fontWeight: '700',
//   },
//   heroTitle: {
//     fontSize: 24,
//     fontWeight: '800',
//     color: '#FFFFFF',
//   },
//   heroSub: {
//     fontSize: 13,
//     color: '#D2E7DC',
//     marginTop: 4,
//   },
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 18,
//     padding: 16,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: '#E7EDE9',
//   },
//   sectionHeader: {
//     fontSize: 13,
//     fontWeight: '800',
//     color: '#718279',
//     textTransform: 'uppercase',
//     letterSpacing: 0.8,
//     marginBottom: 14,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F5F8F6',
//   },
//   rowLabel: {
//     fontSize: 14,
//     color: '#5C6B63',
//   },
//   rowValue: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#15241C',
//   },
//   tagBadge: {
//     backgroundColor: '#EBF6F0',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 8,
//   },
//   tagBadgeText: {
//     color: '#0A5C36',
//     fontWeight: '700',
//     fontSize: 13,
//   },
//   gpsSuccessBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0F9F4',
//     padding: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#C7E8D6',
//     marginBottom: 12,
//     gap: 12,
//   },
//   gpsIconCircle: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   gpsSuccessTitle: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#0A5C36',
//   },
//   gpsCoordsText: {
//     fontSize: 13,
//     color: '#34453D',
//     marginTop: 2,
//     fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
//   },
//   gpsAccText: {
//     fontSize: 11,
//     color: '#657A70',
//     marginTop: 2,
//   },
//   gpsEmptyBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF8ED',
//     padding: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#FFE0B2',
//     marginBottom: 12,
//     gap: 10,
//   },
//   gpsEmptyText: {
//     fontSize: 13,
//     color: '#B76E00',
//     fontWeight: '600',
//   },
//   gpsButton: {
//     backgroundColor: '#0A5C36',
//     height: 48,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   gpsButtonText: {
//     color: '#FFFFFF',
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   statusRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 6,
//   },
//   statusInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   statusDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//   },
//   statusLabel: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#15241C',
//   },
//   networkPill: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 8,
//   },
//   networkPillText: {
//     fontSize: 12,
//     fontWeight: '800',
//   },
//   actionRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 10,
//   },
//   actionLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     flex: 1,
//   },
//   actionIcon: {
//     fontSize: 22,
//   },
//   actionTitle: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#15241C',
//   },
//   actionSub: {
//     fontSize: 12,
//     color: '#718279',
//     marginTop: 2,
//   },
//   langPill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F3F6F4',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 10,
//     gap: 6,
//   },
//   langPillText: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: '#0A5C36',
//   },
//   arrowIcon: {
//     fontSize: 18,
//     color: '#9CAEA4',
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#F0F4F2',
//     marginVertical: 4,
//   },
//   logoutBtn: {
//     backgroundColor: '#FEECEC',
//     height: 52,
//     borderRadius: 14,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#F8C8C8',
//     marginTop: 8,
//   },
//   logoutBtnText: {
//     color: '#D32F2F',
//     fontSize: 15,
//     fontWeight: '800',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   modalContent: {
//     width: '100%',
//     maxWidth: 390,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 22,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.15,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   modalHeaderRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     marginBottom: 12,
//   },
//   modalIconWrap: {
//     width: 44,
//     height: 44,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   customModalTitle: {
//     fontSize: 16,
//     fontWeight: '900',
//     color: '#15241C',
//   },
//   networkStatusSmall: {
//     fontSize: 11,
//     fontWeight: '800',
//     marginTop: 2,
//   },
//   customModalBody: {
//     fontSize: 13,
//     color: '#4B5E54',
//     lineHeight: 18,
//     marginBottom: 14,
//   },
//   payloadBox: {
//     backgroundColor: '#F4F7F4',
//     padding: 10,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#E2E8E4',
//   },
//   payloadLabel: {
//     fontSize: 11,
//     fontWeight: '700',
//     color: '#657A70',
//     marginBottom: 2,
//   },
//   phoneHighlight: {
//     fontSize: 14,
//     fontWeight: '900',
//     color: '#0A5C36',
//   },
//   payloadCode: {
//     fontSize: 12,
//     color: '#1E293B',
//     fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
//     fontWeight: '700',
//   },
//   modalActionButtons: {
//     flexDirection: 'row',
//     gap: 10,
//     marginTop: 18,
//   },
//   modalCancelButton: {
//     flex: 1,
//     backgroundColor: '#F3F6F4',
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   modalCancelButtonText: {
//     fontSize: 13,
//     fontWeight: '800',
//     color: '#5C6B63',
//   },
//   modalConfirmButton: {
//     flex: 1.3,
//     backgroundColor: '#0A5C36',
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   modalConfirmButtonText: {
//     fontSize: 13,
//     fontWeight: '800',
//     color: '#FFFFFF',
//   },
//   toastContainer: {
//     position: 'absolute',
//     bottom: 30,
//     alignSelf: 'center',
//     backgroundColor: '#15241C',
//     paddingHorizontal: 18,
//     paddingVertical: 10,
//     borderRadius: 999,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 6,
//     elevation: 6,
//   },
//   toastText: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     fontWeight: '800',
//   },
//   modalTitle: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: '#15241C',
//     textAlign: 'center',
//     marginBottom: 16,
//   },
//   modalOption: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 14,
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: '#E7EDE9',
//     marginBottom: 10,
//   },
//   modalOptionActive: {
//     borderColor: '#0A5C36',
//     backgroundColor: '#F0F9F4',
//   },
//   modalOptionText: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#34453D',
//   },
//   modalOptionTextActive: {
//     color: '#0A5C36',
//     fontWeight: '800',
//   },
//   checkmark: {
//     color: '#0A5C36',
//     fontSize: 16,
//     fontWeight: '800',
//   },
//   modalCancel: {
//     paddingVertical: 12,
//     alignItems: 'center',
//     marginTop: 6,
//   },
//   modalCancelText: {
//     fontSize: 14,
//     color: '#718279',
//     fontWeight: '700',
//   },
// });
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSession } from '../../context/SessionContext';

// Target gateway / Warehouse dispatcher number (Adama Hub)
const GATEWAY_DISPATCH_PHONE = '0911000000';

const DICTIONARY = {
  am: {
    shopTitle: 'የኔ ሱቅ',
    shopSub: 'አዳማ፣ ኦሮሚያ፣ ኢትዮጵያ',
    kioskTag: 'የተረጋገጠ የችርቻሮ ነጋዴ',
    infoSection: 'የመለያ እና የሱቅ ዝርዝር',
    phoneLabel: 'ስልክ ቁጥር',
    shopTypeLabel: 'የንግድ ምድብ',
    shopTypeValue: 'ኪዮስክ / ሱፐርማርኬት',
    gpsSection: 'የሱቅ መገኛ (GPS Delivery Location)',
    gpsBtn: 'አዲስ የሱቅ GPS መዝግብ',
    gpsPinned: 'ትክክለኛ GPS ተመዝግቧል',
    gpsEmpty: 'ምንም GPS አልተመዘገበም',
    gpsAccuracy: 'የቦታ ትክክለኛነት',
    smsEngineSection: 'የኔትወርክ እና የ SMS መጠባበቂያ (Module 5)',
    netStatusLabel: 'የኢንተርኔት ግንኙነት (Network Status)',
    netOnline: 'መስመር ላይ (Online)',
    netOffline: 'ተቋርጧል (Offline)',
    smsBackupTitle: 'በ SMS የማዘዣ ሞተር (SMS Fallback)',
    smsBackupSub: 'ኢንተርኔት በማይኖርበት ጊዜ ትእዛዝዎ በ SMS በቀጥታ ይተላለፋል',
    smsModalTitle: 'የ SMS ትእዛዝ መላኪያ',
    smsModalDescOnline: `የኢንተርኔት ግንኙነት ቢኖርም የ SMS ስርዓቱን መሞከር ይችላሉ። መልእክቱ በቀጥታ ወደ ${GATEWAY_DISPATCH_PHONE} ይላካል።`,
    smsModalDescOffline: `⚠️ የኢንተርኔት ግንኙነት ተቋርጧል! ምንም ጭንቀት አይግባዎ፤ ትእዛዝዎ ወደ ${GATEWAY_DISPATCH_PHONE} በ SMS በቀጥታ ይተላለፋል።`,
    smsModalTargetLabel: 'የሚላክበት ቁጥር (Receiver)',
    smsModalPayloadLabel: 'የትእዛዝ መልእክት (Payload)',
    smsModalSendBtn: 'በ SMS ላክ (Open SMS)',
    smsCopiedText: 'የትእዛዝ መልእክቱ ተገልብጧል (Copied)!',
    settingsSection: 'ቅንብሮች እና ድጋፍ',
    langTitle: 'ቋንቋ ቀይር (Language)',
    langSelected: 'አማርኛ',
    supportTitle: 'የደንበኞች ድጋፍ መስመር',
    supportSub: '8:00 AM - 8:00 PM ይደውሉ',
    supportModalTitle: 'የደንበኞች አገልግሎት',
    supportModalBody: 'የደንበኞች እርዳታ መስመር: +251 900 460 680\nየስራ ሰዓት: ከጠዋቱ 2:00 እስከ ማታ 2:00',
    callBtn: 'ደውል (Call)',
    logoutBtn: 'ከመለያ ውጣ (Sign Out)',
    logoutConfirmTitle: 'ከመለያ መውጫ',
    logoutConfirm: 'ከመለያዎ በእርግጥ መውጣት ይፈልጋሉ?',
    cancelText: 'ይቅር',
    closeText: 'ዝጋ',
    selectLangModal: 'ቋንቋ ይምረጡ / Filadhu',
    locPermDenied: 'የጂፒኤስ ፍቃድ አልተሰጠም',
    locSuccess: 'የሱቅ GPS መረጃ በተሳካ ሁኔታ ተሻሽሏል',
  },
  om: {
    shopTitle: 'Suuqii Koo',
    shopSub: 'Adaamaa, Oromiyaa, Itoophiyaa',
    kioskTag: 'Daldalaa Mirkanaa’e',
    infoSection: 'Oodeeffannoo Suuqii fi Eenyummaa',
    phoneLabel: 'Lakkoofsa Bilbilaa',
    shopTypeLabel: 'Gosa Daldalaa',
    shopTypeValue: 'Suuqii / Kiyooskii',
    gpsSection: 'Bakka Suuqii (GPS)',
    gpsBtn: 'GPS Haaraa Galmeessi',
    gpsPinned: 'GPS Suuqii Galmaa’eera',
    gpsEmpty: 'GPS hin galmoofne',
    gpsAccuracy: 'Qulqullina Iddoo',
    smsEngineSection: 'Netwoorkii fi Kuusaa SMS (Module 5)',
    netStatusLabel: 'Haala Netwoorkii (Network Status)',
    netOnline: 'Toora Irra (Online)',
    netOffline: 'Cufameera (Offline)',
    smsBackupTitle: 'Mootara Ajaja SMS (SMS Fallback)',
    smsBackupSub: 'Yeroo intarneetiin hin jirretti ajajni keessan SMS dhaan darba',
    smsModalTitle: 'Mootara Ajaja SMS',
    smsModalDescOnline: `Intarneetiin jiraatus mootara SMS qoruu dandeessu. Ergaan kallattiin gara ${GATEWAY_DISPATCH_PHONE} ergama.`,
    smsModalDescOffline: `⚠️ Intarneetiin cufameera! Hin dhiphatinaa; ajajni keessan kallattiin gara ${GATEWAY_DISPATCH_PHONE} tti SMS dhaan darba.`,
    smsModalTargetLabel: 'Gara Lakkoofsa (Receiver)',
    smsModalPayloadLabel: 'Ergaa Ajajaa (Payload)',
    smsModalSendBtn: 'SMS dhaan Ergi (Open SMS)',
    smsCopiedText: 'Ergaan ajajaa koppii ta’eera!',
    settingsSection: 'Qindaa’inaa fi Gargaarsa',
    langTitle: 'Afaan Jijjiiri (Language)',
    langSelected: 'Afaan Oromoo',
    supportTitle: 'Gargaarsa Maamiltootaa',
    supportSub: 'Bilbilaa: 8:00 AM - 8:00 PM',
    supportModalTitle: 'Tajaajila Maamiltootaa',
    supportModalBody: 'Bilbila gargaarsaa: +251 900 460 680\nSa’aatii hojii: Ganama 2:00 - Galgala 2:00',
    callBtn: 'Bilbili (Call)',
    logoutBtn: 'Ba’i (Sign Out)',
    logoutConfirmTitle: 'Ba’uu Mirkaneessi',
    logoutConfirm: 'Miseensa keessaa ba’uu barbaaddaa?',
    cancelText: 'Dhiisi',
    closeText: 'Cufi',
    selectLangModal: 'Afaan Filadhu / ቋንቋ ይምረጡ',
    locPermDenied: 'Hayyama GPS hin arganne',
    locSuccess: 'Iddoon GPS suuqii sirriitti galmaa’eera',
  },
  en: {
    shopTitle: 'My Kiosk',
    shopSub: 'Adama, Oromia, Ethiopia',
    kioskTag: 'Verified Retailer',
    infoSection: 'Account & Business Details',
    phoneLabel: 'Phone Number',
    shopTypeLabel: 'Business Category',
    shopTypeValue: 'Fast Moving Retail / Kiosk',
    gpsSection: 'Delivery GPS Coordinates',
    gpsBtn: 'Update Shop GPS Location',
    gpsPinned: 'Precise GPS Pinned',
    gpsEmpty: 'No GPS Registered Yet',
    gpsAccuracy: 'Accuracy',
    smsEngineSection: 'Network & Offline SMS Engine (Module 5)',
    netStatusLabel: 'Network Connectivity',
    netOnline: 'Connected (Online)',
    netOffline: 'Disconnected (Offline)',
    smsBackupTitle: 'SMS Order Dispatcher (Fallback)',
    smsBackupSub: 'Orders automatically dispatch via compressed SMS when offline',
    smsModalTitle: 'Offline SMS Order Engine',
    smsModalDescOnline: `Even while online, you can test the offline SMS engine. The payload transmits to ${GATEWAY_DISPATCH_PHONE}.`,
    smsModalDescOffline: `⚠️ Internet connection is offline! Your order will be seamlessly routed via native SMS to ${GATEWAY_DISPATCH_PHONE}.`,
    smsModalTargetLabel: 'Destination Number',
    smsModalPayloadLabel: 'Order Payload',
    smsModalSendBtn: 'Launch SMS App',
    smsCopiedText: 'Payload copied to clipboard!',
    settingsSection: 'Preferences & Support',
    langTitle: 'Language',
    langSelected: 'English',
    supportTitle: 'Retailer Helpline Support',
    supportSub: 'Live agents: 8:00 AM - 8:00 PM',
    supportModalTitle: 'Customer Care Helpline',
    supportModalBody: 'Helpline Number: +251 900 460 680\nWorking Hours: 8:00 AM - 8:00 PM',
    callBtn: 'Call Now',
    logoutBtn: 'Log Out',
    logoutConfirmTitle: 'Confirm Sign Out',
    logoutConfirm: 'Are you sure you want to log out of your account?',
    cancelText: 'Cancel',
    closeText: 'Close',
    selectLangModal: 'Choose Language / ቋንቋ ይምረጡ',
    locPermDenied: 'GPS Permission Denied',
    locSuccess: 'Shop GPS pinned successfully',
  },
};

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, user } = useSession?.() || {};
  const params = useLocalSearchParams();

  const [lang, setLang] = useState('am');
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  // Dynamic payload from CheckoutScreen or standard placeholder
  const [currentPayload, setCurrentPayload] = useState('ORD#PROD_SAMPLE:2:CARTON#BATCH_6AM#0');

  // Custom modal states
  const [smsModalVisible, setSmsModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [infoToast, setInfoToast] = useState(null);

  const t = DICTIONARY[lang] || DICTIONARY.am;

  // Sync payload when user is redirected from CheckoutScreen
  useEffect(() => {
    if (params?.smsPayload) {
      const incoming = String(params.smsPayload);
      setCurrentPayload(incoming);
      setSmsModalVisible(true);
    }
  }, [params?.smsPayload]);

  useEffect(() => {
    async function loadSavedData() {
      try {
        const savedLang = await AsyncStorage.getItem('userLanguage');
        if (savedLang && DICTIONARY[savedLang]) {
          setLang(savedLang);
        }
        const savedCoords = await AsyncStorage.getItem('shopCoords');
        if (savedCoords) {
          setCoords(JSON.parse(savedCoords));
        }
      } catch (err) {
        console.error('Error loading preferences:', err);
      }
    }
    loadSavedData();

    // Network status listener
    const unsubscribe = NetInfo.addEventListener((state) => {
      const onlineStatus = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(onlineStatus);
    });

    return () => unsubscribe();
  }, []);

  const showToast = (message) => {
    setInfoToast(message);
    setTimeout(() => setInfoToast(null), 3000);
  };

  const changeLanguage = async (newLang) => {
    setLang(newLang);
    setLangModalVisible(false);
    try {
      await AsyncStorage.setItem('userLanguage', newLang);
    } catch (err) {
      console.error('Error saving language:', err);
    }
  };

  const captureGps = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast(t.locPermDenied);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newCoords = {
        lat: Number(loc.coords.latitude.toFixed(6)),
        lng: Number(loc.coords.longitude.toFixed(6)),
        acc: loc.coords.accuracy ? Math.round(loc.coords.accuracy) : null,
      };

      setCoords(newCoords);
      await AsyncStorage.setItem('shopCoords', JSON.stringify(newCoords));
      showToast(t.locSuccess);
    } catch {
      showToast('Error capturing GPS');
    } finally {
      setGpsLoading(false);
    }
  };

  // Dispatch Native SMS
  const executeSmsDispatch = () => {
    setSmsModalVisible(false);

    if (Platform.OS === 'web') {
      showToast(t.smsCopiedText);
      return;
    }

    const separator = Linking.createURL('').includes('?') ? '&' : '?';
    const smsUrl = `sms:${GATEWAY_DISPATCH_PHONE}${separator}body=${encodeURIComponent(currentPayload)}`;
    Linking.openURL(smsUrl).catch(() => {
      showToast('Cannot open SMS app on this device');
    });
  };

  const confirmLogoutAction = async () => {
    setLogoutModalVisible(false);
    if (signOut) await signOut();
    router.replace('/(auth)/phone');
  };

  const displayedPhone = user?.phoneNumber || '0900460680';
  const displayedShopName = user?.shopName || t.shopTitle;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.avatarPill}>
            <Text style={{ fontSize: 32 }}>🏪</Text>
          </View>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>✓ {t.kioskTag}</Text>
          </View>
          <Text style={styles.heroTitle}>{displayedShopName}</Text>
          <Text style={styles.heroSub}>{t.shopSub}</Text>
        </View>

        {/* Account Details Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>{t.infoSection}</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t.phoneLabel}</Text>
            <View style={styles.tagBadge}>
              <Text style={styles.tagBadgeText}>{displayedPhone}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t.shopTypeLabel}</Text>
            <Text style={styles.rowValue}>{t.shopTypeValue}</Text>
          </View>
        </View>

        {/* GPS Location Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>{t.gpsSection}</Text>

          {coords ? (
            <View style={styles.gpsSuccessBox}>
              <View style={styles.gpsIconCircle}>
                <Text style={{ fontSize: 20 }}>📍</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.gpsSuccessTitle}>{t.gpsPinned}</Text>
                <Text style={styles.gpsCoordsText}>
                  {coords.lat}° N, {coords.lng}° E
                </Text>
                {coords.acc && (
                  <Text style={styles.gpsAccText}>
                    {t.gpsAccuracy}: ±{coords.acc}m
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.gpsEmptyBox}>
              <Text style={{ fontSize: 20 }}>⚠️</Text>
              <Text style={styles.gpsEmptyText}>{t.gpsEmpty}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.gpsButton}
            onPress={captureGps}
            disabled={gpsLoading}
            activeOpacity={0.8}
          >
            {gpsLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.gpsButtonText}>📍 {t.gpsBtn}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Offline SMS Backup Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>{t.smsEngineSection}</Text>

          <View style={styles.statusRow}>
            <View style={styles.statusInfo}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? '#10B981' : '#EF4444' },
                ]}
              />
              <Text style={styles.statusLabel}>{t.netStatusLabel}</Text>
            </View>
            <View
              style={[
                styles.networkPill,
                { backgroundColor: isOnline ? '#E8F5E9' : '#FFEBEE' },
              ]}
            >
              <Text
                style={[
                  styles.networkPillText,
                  { color: isOnline ? '#0A5C36' : '#C62828' },
                ]}
              >
                {isOnline ? `● ${t.netOnline}` : `● ${t.netOffline}`}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setSmsModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <Text style={styles.actionIcon}>💬</Text>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.actionTitle}>{t.smsBackupTitle}</Text>
                <Text style={styles.actionSub}>{t.smsBackupSub}</Text>
              </View>
            </View>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Language & Support Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>{t.settingsSection}</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setLangModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <Text style={styles.actionIcon}>🌐</Text>
              <View>
                <Text style={styles.actionTitle}>{t.langTitle}</Text>
                <Text style={styles.actionSub}>{t.langSelected}</Text>
              </View>
            </View>
            <View style={styles.langPill}>
              <Text style={styles.langPillText}>{t.langSelected}</Text>
              <Text style={styles.arrowIcon}>›</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setSupportModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <Text style={styles.actionIcon}>📞</Text>
              <View>
                <Text style={styles.actionTitle}>{t.supportTitle}</Text>
                <Text style={styles.actionSub}>{t.supportSub}</Text>
              </View>
            </View>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setLogoutModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutBtnText}>🚪 {t.logoutBtn}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Toast Notification */}
      {infoToast && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{infoToast}</Text>
        </View>
      )}

      {/* 1. SMS Dispatch Modal */}
      <Modal
        visible={smsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSmsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconWrap, { backgroundColor: isOnline ? '#E8F5E9' : '#FFEBEE' }]}>
                <Text style={{ fontSize: 22 }}>{isOnline ? '📡' : '📶'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.customModalTitle}>{t.smsModalTitle}</Text>
                <Text style={[styles.networkStatusSmall, { color: isOnline ? '#0A5C36' : '#C62828' }]}>
                  {isOnline ? `● ${t.netOnline}` : `● ${t.netOffline}`}
                </Text>
              </View>
            </View>

            <Text style={styles.customModalBody}>
              {isOnline ? t.smsModalDescOnline : t.smsModalDescOffline}
            </Text>

            <View style={styles.payloadBox}>
              <Text style={styles.payloadLabel}>{t.smsModalTargetLabel}:</Text>
              <Text style={styles.phoneHighlight}>{GATEWAY_DISPATCH_PHONE}</Text>
            </View>

            <View style={[styles.payloadBox, { marginTop: 8 }]}>
              <Text style={styles.payloadLabel}>{t.smsModalPayloadLabel}:</Text>
              <Text style={styles.payloadCode}>{currentPayload}</Text>
            </View>

            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setSmsModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelButtonText}>{t.cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={executeSmsDispatch}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmButtonText}>{t.smsModalSendBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. Support Modal */}
      <Modal
        visible={supportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSupportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.supportModalTitle}</Text>
            <Text style={[styles.customModalBody, { textAlign: 'center', marginBottom: 16 }]}>
              {t.supportModalBody}
            </Text>
            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setSupportModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelButtonText}>{t.closeText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={() => {
                  setSupportModalVisible(false);
                  Linking.openURL('tel:+251900460680').catch(() => {});
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmButtonText}>{t.callBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. Logout Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.logoutConfirmTitle}</Text>
            <Text style={[styles.customModalBody, { textAlign: 'center', marginBottom: 18 }]}>
              {t.logoutConfirm}
            </Text>
            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setLogoutModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelButtonText}>{t.cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmButton, { backgroundColor: '#D32F2F' }]}
                onPress={confirmLogoutAction}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmButtonText}>{t.logoutBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 4. Language Modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.selectLangModal}</Text>

            <TouchableOpacity
              style={[
                styles.modalOption,
                lang === 'am' && styles.modalOptionActive,
              ]}
              onPress={() => changeLanguage('am')}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  lang === 'am' && styles.modalOptionTextActive,
                ]}
              >
                🇪🇹 አማርኛ (Amharic)
              </Text>
              {lang === 'am' && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalOption,
                lang === 'om' && styles.modalOptionActive,
              ]}
              onPress={() => changeLanguage('om')}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  lang === 'om' && styles.modalOptionTextActive,
                ]}
              >
                🌳 Afaan Oromoo (Oromo)
              </Text>
              {lang === 'om' && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalOption,
                lang === 'en' && styles.modalOptionActive,
              ]}
              onPress={() => changeLanguage('en')}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  lang === 'en' && styles.modalOptionTextActive,
                ]}
              >
                🌐 English
              </Text>
              {lang === 'en' && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setLangModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>{t.cancelText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF3F0',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  heroCard: {
    backgroundColor: '#0A5C36',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 4,
    borderBottomColor: '#F2C94C',
    shadowColor: '#0A5C36',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  avatarPill: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#F2C94C',
  },
  badgePill: {
    backgroundColor: 'rgba(242, 201, 76, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(242, 201, 76, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    color: '#F2C94C',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 13,
    color: '#CFE6D9',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E3EBE6',
    shadowColor: '#0A5C36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A5C36',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F2',
  },
  rowLabel: {
    fontSize: 14,
    color: '#5C6B63',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15241C',
  },
  tagBadge: {
    backgroundColor: '#EBF6F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagBadgeText: {
    color: '#0A5C36',
    fontWeight: '800',
    fontSize: 13,
  },
  gpsSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F4',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7E8D6',
    marginBottom: 12,
    gap: 12,
  },
  gpsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7E8D6',
  },
  gpsSuccessTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A5C36',
  },
  gpsCoordsText: {
    fontSize: 13,
    color: '#34453D',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  gpsAccText: {
    fontSize: 11,
    color: '#657A70',
    marginTop: 2,
  },
  gpsEmptyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8ED',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    marginBottom: 12,
    gap: 10,
  },
  gpsEmptyText: {
    fontSize: 13,
    color: '#B76E00',
    fontWeight: '700',
  },
  gpsButton: {
    backgroundColor: '#0A5C36',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A5C36',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  gpsButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15241C',
  },
  networkPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  networkPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#15241C',
  },
  actionSub: {
    fontSize: 12,
    color: '#718279',
    marginTop: 2,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF6F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  langPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A5C36',
  },
  arrowIcon: {
    fontSize: 18,
    color: '#9CAEA4',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEF3F0',
    marginVertical: 4,
  },
  logoutBtn: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F5C2C2',
    marginTop: 8,
  },
  logoutBtnText: {
    color: '#D32F2F',
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 30, 20, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 20,
    borderTopWidth: 4,
    borderTopColor: '#0A5C36',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  modalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customModalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#15241C',
  },
  networkStatusSmall: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  customModalBody: {
    fontSize: 13,
    color: '#4B5E54',
    lineHeight: 19,
    marginBottom: 14,
  },
  payloadBox: {
    backgroundColor: '#F4F8F5',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E9E3',
  },
  payloadLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#657A70',
    marginBottom: 2,
  },
  phoneHighlight: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0A5C36',
  },
  payloadCode: {
    fontSize: 12,
    color: '#1E293B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F2',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5C6B63',
  },
  modalConfirmButton: {
    flex: 1.3,
    backgroundColor: '#0A5C36',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#15241C',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(242, 201, 76, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#15241C',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E3EBE6',
    marginBottom: 10,
  },
  modalOptionActive: {
    borderColor: '#0A5C36',
    backgroundColor: '#F0F9F4',
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34453D',
  },
  modalOptionTextActive: {
    color: '#0A5C36',
    fontWeight: '800',
  },
  checkmark: {
    color: '#0A5C36',
    fontSize: 16,
    fontWeight: '800',
  },
  modalCancel: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  modalCancelText: {
    fontSize: 14,
    color: '#718279',
    fontWeight: '700',
  },
});