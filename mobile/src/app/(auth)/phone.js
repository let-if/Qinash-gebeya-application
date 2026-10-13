
// // import React, { useState, useRef } from 'react';
// // import {
// //   ActivityIndicator,
// //   KeyboardAvoidingView,
// //   Platform,
// //   ScrollView,
// //   StatusBar,
// //   StyleSheet,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   View,
// //   useWindowDimensions,
// // } from 'react-native';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import { useRouter } from 'expo-router';
// // import { apiRequest } from '../../lib/api';
// // import { useSession } from '../../context/SessionContext';
// // import CustomAlert from '../../components/CustomAlert';

// // // Page texts in both languages
// // const TEXTS = {
// //   am: {
// //     toggleLabel: 'English',
// //     brandTitle: 'ቅናሽ ገበያ',
// //     brandSubtitle: 'Q I N A S H   G E B E Y A',
// //     tagline: 'ዋጋ ይቀንሳል፣ ትርፍ ይጨምራል',
// //     cardTitle: 'እንኳን ደህና መጡ',
// //     cardSubtitle: 'ለመጀመር የስልክ ቁጥርዎን ያስገቡ',
// //     inputLabel: 'የስልክ ቁጥር',
// //     helper: 'የሚጠቀሙበትን ስልክ ቁጥር ብቻ ያስገቡ',
// //     loading: 'እየተላከ ነው...',
// //     next: 'ቀጥል',
// //     trust: 'ደህንነቱ የተጠበቀ የንግድ ማዘዣ',
// //     footer: 'የአዳማ ኪዮስክ ቸርቻሪዎች የጅምላ መተግበሪያ',
// //     warnTitle: 'ማስጠንቀቂያ',
// //     warnMessage: 'እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ',
// //     errorTitle: 'ስህተት',
// //     errorFallback: 'ግንኙነት አልተሳካም፤ እባክዎ ደግመው ይሞክሩ',
// //   },
// //   en: {
// //     toggleLabel: 'አማርኛ',
// //     brandTitle: 'Qinash Gebeya',
// //     brandSubtitle: 'W H O L E S A L E   A P P',
// //     tagline: 'Lower prices, higher profit',
// //     cardTitle: 'Welcome',
// //     cardSubtitle: 'Enter your phone number to get started',
// //     inputLabel: 'Phone number',
// //     helper: 'Enter only the phone number you use',
// //     loading: 'Sending...',
// //     next: 'Continue',
// //     trust: 'Secure business ordering',
// //     footer: 'Wholesale app for Adama kiosk retailers',
// //     warnTitle: 'Warning',
// //     warnMessage: 'Please enter a valid phone number',
// //     errorTitle: 'Error',
// //     errorFallback: 'Connection failed. Please try again',
// //   },
// // };

// // function QinashLogo({ size = 52 }) {
// //   const stripeW = (size * 0.62) / 4;

// //   return (
// //     <View
// //       style={{
// //         width: size,
// //         height: size,
// //         borderRadius: size * 0.3,
// //         backgroundColor: '#0F7B4A',
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         overflow: 'hidden',
// //       }}
// //     >
// //       <View
// //         style={{
// //           position: 'absolute',
// //           top: -size * 0.35,
// //           right: -size * 0.25,
// //           width: size * 0.8,
// //           height: size * 0.8,
// //           borderRadius: size * 0.4,
// //           backgroundColor: 'rgba(255,255,255,0.10)',
// //         }}
// //       />
// //       <View
// //         pointerEvents="none"
// //         style={{
// //           position: 'absolute',
// //           width: size - 6,
// //           height: size - 6,
// //           borderRadius: (size - 6) * 0.3,
// //           borderWidth: 1,
// //           borderColor: 'rgba(255,255,255,0.18)',
// //         }}
// //       />
// //       <View style={{ width: size * 0.62, alignItems: 'center' }}>
// //         <View
// //           style={{
// //             width: '100%',
// //             height: size * 0.17,
// //             flexDirection: 'row',
// //             borderTopLeftRadius: size * 0.09,
// //             borderTopRightRadius: size * 0.09,
// //             overflow: 'hidden',
// //           }}
// //         >
// //           {[0, 1, 2, 3].map((i) => (
// //             <View
// //               key={i}
// //               style={{
// //                 width: stripeW,
// //                 height: '100%',
// //                 backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#CFE9DA',
// //               }}
// //             />
// //           ))}
// //         </View>
// //         <View style={{ flexDirection: 'row', marginTop: -1 }}>
// //           {[0, 1, 2, 3].map((i) => (
// //             <View
// //               key={i}
// //               style={{
// //                 width: stripeW,
// //                 height: stripeW / 2,
// //                 borderBottomLeftRadius: stripeW / 2,
// //                 borderBottomRightRadius: stripeW / 2,
// //                 backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#CFE9DA',
// //               }}
// //             />
// //           ))}
// //         </View>
// //       </View>
// //       <View style={{ alignItems: 'center', marginTop: size * 0.05 }}>
// //         <View
// //           style={{
// //             width: size * 0.11,
// //             height: size * 0.1,
// //             backgroundColor: '#F2B705',
// //             borderTopLeftRadius: size * 0.03,
// //             borderTopRightRadius: size * 0.03,
// //           }}
// //         />
// //         <View
// //           style={{
// //             width: 0,
// //             height: 0,
// //             backgroundColor: 'transparent',
// //             borderStyle: 'solid',
// //             borderLeftWidth: size * 0.14,
// //             borderRightWidth: size * 0.14,
// //             borderTopWidth: size * 0.14,
// //             borderLeftColor: 'transparent',
// //             borderRightColor: 'transparent',
// //             borderTopColor: '#F2B705',
// //           }}
// //         />
// //       </View>
// //     </View>
// //   );
// // }

// // export default function PhoneScreen() {
// //   const router = useRouter();
// //   const session = useSession();
// //   const { width } = useWindowDimensions();
// //   const inputRef = useRef(null);

// //   // Width only: height changes when the keyboard opens and must not re-layout the page
// //   const isSmall = width < 350;
// //   const logoSize = isSmall ? 46 : 54;

// //   const [lang, setLang] = useState('am');
// //   const t = TEXTS[lang];

// //   const [phone, setPhone] = useState('');
// //   const [loading, setLoading] = useState(false);
// //   const [focused, setFocused] = useState(false);

// //   const [alertConfig, setAlertConfig] = useState({
// //     visible: false,
// //     title: '',
// //     message: '',
// //     type: 'error',
// //   });

// //   const triggerAlert = (title, message, type = 'error') => {
// //     setAlertConfig({
// //       visible: true,
// //       title,
// //       message,
// //       type,
// //     });
// //   };

// //   const toggleLanguage = () => {
// //     setLang((prev) => (prev === 'am' ? 'en' : 'am'));
// //   };

// //   const handleNext = async () => {
// //     const cleanedPhone = phone.trim();

// //     if (!cleanedPhone || cleanedPhone.length < 9) {
// //       triggerAlert(
// //         t.warnTitle,
// //         t.warnMessage,
// //         'error',
// //       );
// //       return;
// //     }

// //     setLoading(true);

// //     try {
// //       const res = await apiRequest('/auth/send-otp', {
// //         method: 'POST',
// //         body: {
// //           phoneNumber: cleanedPhone,
// //         },
// //       });

// //       if (res.isRegistered && res.token) {
// //         if (session?.signIn) {
// //           await session.signIn(res.token, res.user);
// //         }

// //         router.replace('/(tabs)');
// //         return;
// //       }

// //       router.push({
// //         pathname: '/(auth)/verify',
// //         params: {
// //           phone: cleanedPhone,
// //         },
// //       });
// //     } catch (err) {
// //       triggerAlert(
// //         t.errorTitle,
// //         err?.message ||
// //           t.errorFallback,
// //         'error',
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
// //       <StatusBar barStyle="light-content" backgroundColor="#0F7B4A" />

// //       <KeyboardAvoidingView
// //         style={styles.container}
// //         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
// //       >
// //         <ScrollView
// //           contentContainerStyle={styles.scrollContent}
// //           keyboardShouldPersistTaps="handled"
// //           showsVerticalScrollIndicator={false}
// //           bounces={false}
// //         >
// //           {/* Compact Hero */}
// //           <View style={styles.hero}>
// //             <View pointerEvents="none" style={styles.heroCircleA} />
// //             <View pointerEvents="none" style={styles.heroCircleB} />
// //             <View pointerEvents="none" style={styles.heroRing} />

// //             {/* Language switch */}
// //             <View style={styles.langRow}>
// //               <TouchableOpacity
// //                 style={styles.langButton}
// //                 onPress={toggleLanguage}
// //                 activeOpacity={0.8}
// //                 hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
// //                 accessibilityRole="button"
// //                 accessibilityLabel="Change language"
// //               >
// //                 <Text style={styles.langGlobe}>🌐</Text>
// //                 <Text style={styles.langButtonText}>{t.toggleLabel}</Text>
// //               </TouchableOpacity>
// //             </View>

// //             <View style={styles.brandRow}>
// //               <View style={styles.logoHalo}>
// //                 <QinashLogo size={logoSize} />
// //               </View>

// //               <View style={styles.brandInfo}>
// //                 <Text
// //                   style={[styles.brandTitle, isSmall && styles.brandTitleSmall]}
// //                   numberOfLines={1}
// //                 >
// //                   {t.brandTitle}
// //                 </Text>

// //                 <Text style={styles.brandSubtitleLatin} numberOfLines={1}>
// //                   {t.brandSubtitle}
// //                 </Text>

// //                 <View style={styles.taglinePill}>
// //                   <Text style={styles.brandTagline}>
// //                     {t.tagline}
// //                   </Text>
// //                 </View>
// //               </View>
// //             </View>
// //           </View>

// //           {/* Login Card Area */}
// //           <View style={styles.mainWrapper}>
// //             <View style={[styles.card, isSmall && styles.cardSmall]}>
// //               <View style={styles.cardHeader}>
// //                 <View style={styles.stepBadge}>
// //                   <Text style={styles.stepBadgeText}>1</Text>
// //                 </View>

// //                 <View style={styles.headingGroup}>
// //                   <Text style={styles.cardTitle}>
// //                     {t.cardTitle}
// //                   </Text>

// //                   <Text style={styles.cardSubtitle}>
// //                     {t.cardSubtitle}
// //                   </Text>
// //                 </View>
// //               </View>

// //               <View style={styles.divider} />

// //               {/* Input Section */}
// //               <View style={styles.inputSection}>
// //                 <Text style={styles.inputLabel}>
// //                   {t.inputLabel}
// //                 </Text>

// //                 {/* Single input box: tapping anywhere on it opens the keyboard */}
// //                 <TouchableOpacity
// //                   activeOpacity={1}
// //                   onPress={() => inputRef.current?.focus()}
// //                   style={[
// //                     styles.inputBox,
// //                     focused && styles.inputBoxFocused,
// //                   ]}
// //                 >
// //                   <View
// //                     style={[
// //                       styles.inputPrefix,
// //                       focused && styles.inputPrefixFocused,
// //                     ]}
// //                   >
// //                     <Text style={styles.flagEmoji}>🇪🇹</Text>
// //                     <Text style={styles.prefixCode}>
// //                       +251
// //                     </Text>
// //                   </View>

// //                   <TextInput
// //                     ref={inputRef}
// //                     style={styles.input}
// //                     value={phone}
// //                     onChangeText={setPhone}
// //                     placeholder="9XXXXXXXX"
// //                     placeholderTextColor="#9CAEA4"
// //                     keyboardType="phone-pad"
// //                     autoFocus={false}
// //                     showSoftInputOnFocus={true}
// //                     onFocus={() => setFocused(true)}
// //                     onBlur={() => setFocused(false)}
// //                     selectionColor="#0F7B4A"
// //                     underlineColorAndroid="transparent"
// //                     autoCorrect={false}
// //                     autoCapitalize="none"
// //                   />
// //                 </TouchableOpacity>

// //                 <Text style={styles.helperText}>
// //                   {t.helper}
// //                 </Text>
// //               </View>

// //               {/* Primary Action Button */}
// //               <TouchableOpacity
// //                 style={[
// //                   styles.actionButton,
// //                   loading && styles.actionButtonDisabled,
// //                 ]}
// //                 onPress={handleNext}
// //                 disabled={loading}
// //                 activeOpacity={0.85}
// //               >
// //                 {loading ? (
// //                   <View style={styles.buttonContent}>
// //                     <ActivityIndicator size="small" color="#FFFFFF" />
// //                     <Text style={styles.buttonLabel}>
// //                       {t.loading}
// //                     </Text>
// //                   </View>
// //                 ) : (
// //                   <View style={styles.buttonContent}>
// //                     <Text style={styles.buttonLabel}>
// //                       {t.next}
// //                     </Text>
// //                     <View style={styles.arrowIconBubble}>
// //                       <Text style={styles.arrowSymbol}>›</Text>
// //                     </View>
// //                   </View>
// //                 )}
// //               </TouchableOpacity>

// //               {/* Trust Badge */}
// //               <View style={styles.trustBadge}>
// //                 <View style={styles.checkIcon}>
// //                   <Text style={styles.checkChar}>✓</Text>
// //                 </View>
// //                 <Text style={styles.trustText}>
// //                   {t.trust}
// //                 </Text>
// //               </View>
// //             </View>

// //             {/* Footer */}
// //             <View style={styles.footerSection}>
// //               <View style={styles.footerDot} />
// //               <Text style={styles.footerNote}>
// //                 {t.footer}
// //               </Text>
// //               <View style={styles.footerDot} />
// //             </View>
// //           </View>
// //         </ScrollView>
// //       </KeyboardAvoidingView>

// //       {/* Alert */}
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

// // const styles = StyleSheet.create({
// //   safe: {
// //     flex: 1,
// //     backgroundColor: '#F4F7F4',
// //   },
// //   container: {
// //     flex: 1,
// //   },
// //   scrollContent: {
// //     flexGrow: 1,
// //   },
// //   mainWrapper: {
// //     flexGrow: 1,
// //     width: '100%',
// //     maxWidth: 480,
// //     alignSelf: 'center',
// //     justifyContent: 'center',
// //     paddingHorizontal: 20,
// //     paddingVertical: 24,
// //   },
// //   hero: {
// //     backgroundColor: '#0F7B4A',
// //     paddingHorizontal: 22,
// //     paddingTop:
// //       Platform.OS === 'android'
// //         ? (StatusBar.currentHeight || 24) + 8
// //         : 14,
// //     paddingBottom: 22,
// //     borderBottomLeftRadius: 32,
// //     borderBottomRightRadius: 32,
// //     overflow: 'hidden',
// //   },
// //   heroCircleA: {
// //     position: 'absolute',
// //     top: -70,
// //     right: -50,
// //     width: 200,
// //     height: 200,
// //     borderRadius: 100,
// //     backgroundColor: 'rgba(255, 255, 255, 0.08)',
// //   },
// //   heroCircleB: {
// //     position: 'absolute',
// //     bottom: -70,
// //     left: -40,
// //     width: 150,
// //     height: 150,
// //     borderRadius: 75,
// //     backgroundColor: 'rgba(242, 183, 5, 0.16)',
// //   },
// //   heroRing: {
// //     position: 'absolute',
// //     top: 24,
// //     right: 60,
// //     width: 56,
// //     height: 56,
// //     borderRadius: 28,
// //     borderWidth: 1.5,
// //     borderColor: 'rgba(255, 255, 255, 0.15)',
// //   },

// //   /* Language switch */
// //   langRow: {
// //     width: '100%',
// //     maxWidth: 480,
// //     alignSelf: 'center',
// //     flexDirection: 'row',
// //     justifyContent: 'flex-end',
// //     marginBottom: 10,
// //   },
// //   langButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 6,
// //     backgroundColor: 'rgba(255, 255, 255, 0.18)',
// //     borderWidth: 1,
// //     borderColor: 'rgba(255, 255, 255, 0.35)',
// //     paddingHorizontal: 12,
// //     paddingVertical: 6,
// //     borderRadius: 20,
// //   },
// //   langGlobe: {
// //     fontSize: 13,
// //   },
// //   langButtonText: {
// //     color: '#FFFFFF',
// //     fontSize: 12.5,
// //     fontWeight: '800',
// //     letterSpacing: 0.2,
// //   },

// //   brandRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     width: '100%',
// //     maxWidth: 480,
// //     alignSelf: 'center',
// //   },
// //   logoHalo: {
// //     padding: 5,
// //     borderRadius: 22,
// //     backgroundColor: '#FFFFFF',
// //     shadowColor: '#06331F',
// //     shadowOffset: { width: 0, height: 6 },
// //     shadowOpacity: 0.25,
// //     shadowRadius: 10,
// //     elevation: 6,
// //     marginRight: 14,
// //   },
// //   brandInfo: {
// //     flex: 1,
// //   },
// //   brandTitle: {
// //     fontSize: 24,
// //     fontWeight: '900',
// //     color: '#FFFFFF',
// //     letterSpacing: -0.3,
// //     lineHeight: 30,
// //   },
// //   brandTitleSmall: {
// //     fontSize: 21,
// //     lineHeight: 26,
// //   },
// //   brandSubtitleLatin: {
// //     fontSize: 9,
// //     fontWeight: '800',
// //     color: 'rgba(255, 255, 255, 0.75)',
// //     letterSpacing: 2,
// //     marginTop: 1,
// //   },
// //   taglinePill: {
// //     alignSelf: 'flex-start',
// //     backgroundColor: '#F2B705',
// //     paddingHorizontal: 10,
// //     paddingVertical: 3,
// //     borderRadius: 10,
// //     marginTop: 7,
// //   },
// //   brandTagline: {
// //     fontSize: 11,
// //     fontWeight: '800',
// //     color: '#12241A',
// //   },
// //   card: {
// //     backgroundColor: '#FFFFFF',
// //     borderRadius: 28,
// //     paddingHorizontal: 20,
// //     paddingVertical: 22,
// //     borderWidth: 1,
// //     borderColor: '#E6EEE9',
// //     shadowColor: '#0B2A1B',
// //     shadowOffset: { width: 0, height: 14 },
// //     shadowOpacity: 0.12,
// //     shadowRadius: 26,
// //     elevation: 10,
// //   },
// //   cardSmall: {
// //     paddingHorizontal: 16,
// //     paddingVertical: 18,
// //     borderRadius: 24,
// //   },
// //   cardHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   stepBadge: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 14,
// //     backgroundColor: '#E4F2EA',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginRight: 12,
// //   },
// //   stepBadgeText: {
// //     fontSize: 16,
// //     fontWeight: '900',
// //     color: '#0F7B4A',
// //   },
// //   headingGroup: {
// //     flex: 1,
// //   },
// //   cardTitle: {
// //     fontSize: 19,
// //     fontWeight: '900',
// //     color: '#12241A',
// //     letterSpacing: -0.2,
// //   },
// //   cardSubtitle: {
// //     fontSize: 12.5,
// //     color: '#65786D',
// //     marginTop: 2,
// //   },
// //   divider: {
// //     height: 1,
// //     backgroundColor: '#EDF3EF',
// //     marginVertical: 18,
// //   },
// //   inputSection: {
// //     marginBottom: 18,
// //   },
// //   inputLabel: {
// //     fontSize: 12.5,
// //     fontWeight: '800',
// //     color: '#12241A',
// //     marginBottom: 8,
// //     letterSpacing: 0.2,
// //   },
// //   inputBox: {
// //     width: '100%',
// //     height: 58,
// //     borderWidth: 1.5,
// //     borderColor: '#DCE6E0',
// //     borderRadius: 18,
// //     backgroundColor: '#F8FBF9',
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     paddingHorizontal: 8,
// //   },
// //   inputBoxFocused: {
// //     borderColor: '#0F7B4A',
// //     backgroundColor: '#FFFFFF',
// //     shadowColor: '#0F7B4A',
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.18,
// //     shadowRadius: 10,
// //     elevation: 3,
// //   },
// //   inputPrefix: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     paddingHorizontal: 10,
// //     height: 42,
// //     backgroundColor: '#E4F2EA',
// //     borderRadius: 13,
// //     marginRight: 10,
// //   },
// //   inputPrefixFocused: {
// //     backgroundColor: '#D3EADB',
// //   },
// //   flagEmoji: {
// //     fontSize: 15,
// //     marginRight: 6,
// //   },
// //   prefixCode: {
// //     fontSize: 14,
// //     fontWeight: '800',
// //     color: '#0F7B4A',
// //   },
// //   input: {
// //     flex: 1,
// //     minWidth: 0,
// //     height: '100%',
// //     fontSize: 18,
// //     fontWeight: '700',
// //     color: '#12241A',
// //     letterSpacing: 0.8,
// //     paddingVertical: 0,
// //     paddingHorizontal: 2,
// //     backgroundColor: 'transparent',
// //     ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
// //   },
// //   helperText: {
// //     fontSize: 11.5,
// //     color: '#76877E',
// //     marginTop: 8,
// //     marginLeft: 4,
// //   },
// //   actionButton: {
// //     height: 58,
// //     borderRadius: 18,
// //     backgroundColor: '#0F7B4A',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     shadowColor: '#0F7B4A',
// //     shadowOffset: { width: 0, height: 8 },
// //     shadowOpacity: 0.35,
// //     shadowRadius: 14,
// //     elevation: 8,
// //   },
// //   actionButtonDisabled: {
// //     backgroundColor: '#0A5A36',
// //     opacity: 0.85,
// //   },
// //   buttonContent: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     gap: 10,
// //   },
// //   buttonLabel: {
// //     color: '#FFFFFF',
// //     fontWeight: '900',
// //     fontSize: 17,
// //     letterSpacing: 0.3,
// //   },
// //   arrowIconBubble: {
// //     width: 28,
// //     height: 28,
// //     borderRadius: 14,
// //     backgroundColor: '#F2B705',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   arrowSymbol: {
// //     color: '#12241A',
// //     fontSize: 20,
// //     lineHeight: 22,
// //     fontWeight: '800',
// //     marginTop: -1,
// //   },
// //   trustBadge: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     alignSelf: 'center',
// //     marginTop: 16,
// //     paddingHorizontal: 12,
// //     paddingVertical: 7,
// //     borderRadius: 14,
// //     backgroundColor: '#F1F8F4',
// //   },
// //   checkIcon: {
// //     width: 17,
// //     height: 17,
// //     borderRadius: 8.5,
// //     backgroundColor: '#F2B705',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginRight: 7,
// //   },
// //   checkChar: {
// //     color: '#12241A',
// //     fontSize: 9.5,
// //     fontWeight: '900',
// //   },
// //   trustText: {
// //     fontSize: 11.5,
// //     color: '#3F5A4A',
// //     fontWeight: '700',
// //   },
// //   footerSection: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginTop: 20,
// //     gap: 8,
// //   },
// //   footerDot: {
// //     width: 4,
// //     height: 4,
// //     borderRadius: 2,
// //     backgroundColor: '#C3D3C9',
// //   },
// //   footerNote: {
// //     fontSize: 11,
// //     color: '#76887F',
// //     fontWeight: '600',
// //     flexShrink: 1,
// //     textAlign: 'center',
// //   },
// // });

import React, { useState, useRef } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { apiRequest } from '../../lib/api';
import { useSession } from '../../context/SessionContext';
import CustomAlert from '../../components/CustomAlert';

// Page texts in both languages

const TEXTS = {
  am: {
    toggleLabel: 'English',
    brandTitle: 'ቅናሽ ገበያ',
    brandSubtitle: 'Q I N A S H   G E B E Y A',
    tagline: 'ዋጋ ይቀንሳል፣ ትርፍ ይጨምራል',
    cardTitle: 'እንኳን ደህና መጡ',
    cardSubtitle: 'ለመጀመር የስልክ ቁጥርዎን ያስገቡ',
    inputLabel: 'የስልክ ቁጥር',
    helper: 'በ 9 ወይም 7 የሚጀምር ትክክለኛ ስልክ ቁጥር ያስገቡ',
    loading: 'እየተላከ ነው...',
    next: 'ቀጥል',
    trust: 'ደህንነቱ የተጠበቀ የንግድ ማዘዣ',
    footer: 'የአዳማ ኪዮስክ ቸርቻሪዎች የጅምላ መተግበሪያ',
    warnTitle: 'ማስጠንቀቂያ',
    warnMessage: 'እባክዎ ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (በ 9 ወይም 7 የሚጀምር)',
    errorTitle: 'ስህተት',
    errorFallback: 'ግንኙነት አልተሳካም፤ እባክዎ ደግመው ይሞክሩ',
  },
  en: {
    toggleLabel: 'አማርኛ',
    brandTitle: 'Qinash Gebeya',
    brandSubtitle: 'W H O L E S A L E   A P P',
    tagline: 'Lower prices, higher profit',
    cardTitle: 'Welcome',
    cardSubtitle: 'Enter your phone number to get started',
    inputLabel: 'Phone number',
    helper: 'Enter a valid phone number starting with 9 or 7',
    loading: 'Sending...',
    next: 'Continue',
    trust: 'Secure business ordering',
    footer: 'Wholesale app for Adama kiosk retailers',
    warnTitle: 'Warning',
    warnMessage: 'Please enter a valid Ethiopian phone number starting with 9 or 7',
    errorTitle: 'Error',
    errorFallback: 'Connection failed. Please try again',
  },
};

function QinashLogo({ size = 52 }) {
  const stripeW = (size * 0.62) / 4;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: '#0F7B4A',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: -size * 0.35,
          right: -size * 0.25,
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: size * 0.4,
          backgroundColor: 'rgba(255,255,255,0.10)',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: size - 6,
          height: size - 6,
          borderRadius: (size - 6) * 0.3,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.18)',
        }}
      />
      <View style={{ width: size * 0.62, alignItems: 'center' }}>
        <View
          style={{
            width: '100%',
            height: size * 0.17,
            flexDirection: 'row',
            borderTopLeftRadius: size * 0.09,
            borderTopRightRadius: size * 0.09,
            overflow: 'hidden',
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                width: stripeW,
                height: '100%',
                backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#CFE9DA',
              }}
            />
          ))}
        </View>
        <View style={{ flexDirection: 'row', marginTop: -1 }}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                width: stripeW,
                height: stripeW / 2,
                borderBottomLeftRadius: stripeW / 2,
                borderBottomRightRadius: stripeW / 2,
                backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#CFE9DA',
              }}
            />
          ))}
        </View>
      </View>
      <View style={{ alignItems: 'center', marginTop: size * 0.05 }}>
        <View
          style={{
            width: size * 0.11,
            height: size * 0.1,
            backgroundColor: '#F2B705',
            borderTopLeftRadius: size * 0.03,
            borderTopRightRadius: size * 0.03,
          }}
        />
        <View
          style={{
            width: 0,
            height: 0,
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderLeftWidth: size * 0.14,
            borderRightWidth: size * 0.14,
            borderTopWidth: size * 0.14,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: '#F2B705',
          }}
        />
      </View>
    </View>
  );
}

export default function PhoneScreen() {
  const router = useRouter();
  const session = useSession();
  const { width } = useWindowDimensions();
  const inputRef = useRef(null);

  // Width only: height changes when the keyboard opens and must not re-layout the page
  const isSmall = width < 350;
  const logoSize = isSmall ? 46 : 54;

  const [lang, setLang] = useState('am');
  const t = TEXTS[lang];

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  const triggerAlert = (title, message, type = 'error') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
    });
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'am' ? 'en' : 'am'));
  };

  const handleNext = async () => {
    const cleanedPhone = phone.trim();

    // Strict validation: must be exactly 9 digits and start with 9 or 7
    const mobileRegex = /^[79][0-9]{8}$/;

    if (!cleanedPhone || !mobileRegex.test(cleanedPhone)) {
      triggerAlert(
        t.warnTitle,
        t.warnMessage,
        'error',
      );
      return;
    }

    setLoading(true);

    try {
      const res = await apiRequest('/auth/send-otp', {
        method: 'POST',
        body: {
          phoneNumber: cleanedPhone,
        },
      });

      if (res.isRegistered && res.token) {
        if (session?.signIn) {
          await session.signIn(res.token, res.user);
        }

        router.replace('/(tabs)');
        return;
      }

      router.push({
        pathname: '/(auth)/verify',
        params: {
          phone: cleanedPhone,
          devOtp: res?.devOtp || '',
        },
      });
    } catch (err) {
      triggerAlert(
        t.errorTitle,
        err?.message ||
          t.errorFallback,
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0F7B4A" />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Compact Hero */}
          <View style={styles.hero}>
            <View pointerEvents="none" style={styles.heroCircleA} />
            <View pointerEvents="none" style={styles.heroCircleB} />
            <View pointerEvents="none" style={styles.heroRing} />

            {/* Language switch */}
            <View style={styles.langRow}>
              <TouchableOpacity
                style={styles.langButton}
                onPress={toggleLanguage}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Change language"
              >
                <Text style={styles.langGlobe}>🌐</Text>
                <Text style={styles.langButtonText}>{t.toggleLabel}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.brandRow}>
              <View style={styles.logoHalo}>
                <QinashLogo size={logoSize} />
              </View>

              <View style={styles.brandInfo}>
                <Text
                  style={[styles.brandTitle, isSmall && styles.brandTitleSmall]}
                  numberOfLines={1}
                >
                  {t.brandTitle}
                </Text>

                <Text style={styles.brandSubtitleLatin} numberOfLines={1}>
                  {t.brandSubtitle}
                </Text>

                <View style={styles.taglinePill}>
                  <Text style={styles.brandTagline}>
                    {t.tagline}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Login Card Area */}
          <View style={styles.mainWrapper}>
            <View style={[styles.card, isSmall && styles.cardSmall]}>
              <View style={styles.cardHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>1</Text>
                </View>

                <View style={styles.headingGroup}>
                  <Text style={styles.cardTitle}>
                    {t.cardTitle}
                  </Text>

                  <Text style={styles.cardSubtitle}>
                    {t.cardSubtitle}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Input Section */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>
                  {t.inputLabel}
                </Text>

                {/* Single input box: tapping anywhere on it opens the keyboard */}
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => inputRef.current?.focus()}
                  style={[
                    styles.inputBox,
                    focused && styles.inputBoxFocused,
                  ]}
                >
                  <View
                    style={[
                      styles.inputPrefix,
                      focused && styles.inputPrefixFocused,
                    ]}
                  >
                    <Text style={styles.flagEmoji}>🇪🇹</Text>
                    <Text style={styles.prefixCode}>
                      +251
                    </Text>
                  </View>

                  <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="9XXXXXXXX"
                    placeholderTextColor="#9CAEA4"
                    keyboardType="phone-pad"
                    autoFocus={false}
                    showSoftInputOnFocus={true}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    selectionColor="#0F7B4A"
                    underlineColorAndroid="transparent"
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                </TouchableOpacity>

                <Text style={styles.helperText}>
                  {t.helper}
                </Text>
              </View>

              {/* Primary Action Button */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  loading && styles.actionButtonDisabled,
                ]}
                onPress={handleNext}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.buttonLabel}>
                      {t.loading}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonLabel}>
                      {t.next}
                    </Text>
                    <View style={styles.arrowIconBubble}>
                      <Text style={styles.arrowSymbol}>›</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>

              {/* Trust Badge */}
              <View style={styles.trustBadge}>
                <View style={styles.checkIcon}>
                  <Text style={styles.checkChar}>✓</Text>
                </View>
                <Text style={styles.trustText}>
                  {t.trust}
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footerSection}>
              <View style={styles.footerDot} />
              <Text style={styles.footerNote}>
                {t.footer}
              </Text>
              <View style={styles.footerDot} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Alert */}
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F7F4',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainWrapper: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  hero: {
    backgroundColor: '#0F7B4A',
    paddingHorizontal: 22,
    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight || 24) + 8
        : 14,
    paddingBottom: 22,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroCircleA: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroCircleB: {
    position: 'absolute',
    bottom: -70,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(242, 183, 5, 0.16)',
  },
  heroRing: {
    position: 'absolute',
    top: 24,
    right: 60,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  /* Language switch */
  langRow: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  langGlobe: {
    fontSize: 13,
  },
  langButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  logoHalo: {
    padding: 5,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: '#06331F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    marginRight: 14,
  },
  brandInfo: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  brandTitleSmall: {
    fontSize: 21,
    lineHeight: 26,
  },
  brandSubtitleLatin: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 2,
    marginTop: 1,
  },
  taglinePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2B705',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 7,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: '800',
    color: '#12241A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: '#E6EEE9',
    shadowColor: '#0B2A1B',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 26,
    elevation: 10,
  },
  cardSmall: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#E4F2EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepBadgeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F7B4A',
  },
  headingGroup: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#12241A',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: '#65786D',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF3EF',
    marginVertical: 18,
  },
  inputSection: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#12241A',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputBox: {
    width: '100%',
    height: 58,
    borderWidth: 1.5,
    borderColor: '#DCE6E0',
    borderRadius: 18,
    backgroundColor: '#F8FBF9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  inputBoxFocused: {
    borderColor: '#0F7B4A',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F7B4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  inputPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 42,
    backgroundColor: '#E4F2EA',
    borderRadius: 13,
    marginRight: 10,
  },
  inputPrefixFocused: {
    backgroundColor: '#D3EADB',
  },
  flagEmoji: {
    fontSize: 15,
    marginRight: 6,
  },
  prefixCode: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F7B4A',
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    fontSize: 18,
    fontWeight: '700',
    color: '#12241A',
    letterSpacing: 0.8,
    paddingVertical: 0,
    paddingHorizontal: 2,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  helperText: {
    fontSize: 11.5,
    color: '#76877E',
    marginTop: 8,
    marginLeft: 4,
  },
  actionButton: {
    height: 58,
    borderRadius: 18,
    backgroundColor: '#0F7B4A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F7B4A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  actionButtonDisabled: {
    backgroundColor: '#0A5A36',
    opacity: 0.85,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 17,
    letterSpacing: 0.3,
  },
  arrowIconBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F2B705',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowSymbol: {
    color: '#12241A',
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '800',
    marginTop: -1,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#F1F8F4',
  },
  checkIcon: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#F2B705',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 7,
  },
  checkChar: {
    color: '#12241A',
    fontSize: 9.5,
    fontWeight: '900',
  },
  trustText: {
    fontSize: 11.5,
    color: '#3F5A4A',
    fontWeight: '700',
  },
  footerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C3D3C9',
  },
  footerNote: {
    fontSize: 11,
    color: '#76887F',
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'center',
  },
});