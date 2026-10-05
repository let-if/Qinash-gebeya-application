// import React, { useState, useEffect } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   ScrollView,
//   SafeAreaView,
//   Platform,
// } from 'react-native';
// import * as Location from 'expo-location';

// // Dynamically adapts based on testing platform
// const getApiUrl = () => {
//   if (Platform.OS === 'android') {
//     // 10.0.2.2 points to host machine from Android Emulator. 
//     // Replace with your LAN IP (e.g. 192.168.1.X) if testing on physical phone via Expo Go.
//     return 'http://10.0.2.2:5000/api';
//   }
//   return 'http://localhost:5000/api';
// };

// const API_URL = getApiUrl();

// const CATEGORIES = [
//   { id: '1', name: 'ግሮሰሪ እና ባልትና', sub: 'የምግብ እህሎችና ዘይት', icon: '🛒' },
//   { id: '2', name: 'የጽዳት እቃዎች', sub: 'ሳሙና እና ዲተርጀንት', icon: '🧽' },
//   { id: '3', name: 'ለስላሳ መጠጦች', sub: 'ውሃ እና ጭማቂዎች', icon: '🥤' },
//   { id: '4', name: 'መክሰስ እና ጣፋጭ', sub: 'ብስኩት እና ከረሜላ', icon: '🍬' },
//   { id: '5', name: 'የትምህርት መሳሪያዎች', sub: 'ደብተር እና እስክሪብቶ', icon: '✏️' },
//   { id: '6', name: 'የግብርና ምርቶች', sub: 'ድንች፣ ሽንኩርት እና ጥራጥሬ', icon: '🥔' },
//   { id: '7', name: 'የማሸጊያ እቃዎች', sub: 'ፌስታል እና ካርቶን', icon: '📦' },
//   { id: '8', name: 'ሲጋራ እና ክብሪት', sub: 'የትምባሆ ውጤቶች', icon: '🚬' },
// ];

// export default function App() {
//   const [screen, setScreen] = useState('LOGIN');
//   const [activeTab, setActiveTab] = useState('SHOP');
//   const [step, setStep] = useState('PHONE');

//   // Input states
//   const [phone, setPhone] = useState('');
//   const [otp, setOtp] = useState('');
//   const [shopName, setShopName] = useState('');
//   const [preferredLanguage, setPreferredLanguage] = useState('am');
//   const [coords, setCoords] = useState(null);

//   // App & Auth states
//   const [token, setToken] = useState(null);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Capture GPS Location
//   const captureLocation = async () => {
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('ማስጠንቀቂያ', 'የሱቅዎን አድራሻ በትክክል ለማድረስ የቦታ ፈቃድ ይስጡ');
//         return;
//       }
//       const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
//       setCoords({
//         lat: Number(loc.coords.latitude),
//         lng: Number(loc.coords.longitude),
//       });
//       Alert.alert('ተሳክቷል', 'የሱቅዎ ጂፒኤስ (GPS) አድራሻ ተመዝግቧል');
//     } catch (e) {
//       Alert.alert('ስህተት', 'የጂፒኤስ መረጃ ማግኘት አልተቻለም');
//     }
//   };

//   // POST /api/auth/send-otp
//   const handleSendOtp = async () => {
//     if (!phone || phone.trim().length < 9) {
//       Alert.alert('ማስጠንቀቂያ', 'እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ');
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch(`${API_URL}/auth/send-otp`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           phoneNumber: phone.trim(),
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         throw new Error(data.error || 'የማረጋገጫ ኮድ መላክ አልተቻለም');
//       }

//       if (data.devOtp) {
//         Alert.alert('የሙከራ ኮድ (Dev OTP)', 'የማረጋገጫ ኮድ: ' + data.devOtp);
//         setOtp(data.devOtp); // Auto-fill for ultra-fast dev testing
//       }

//       setStep('OTP');
//     } catch (err) {
//       Alert.alert('ስህተት', err.message || 'ስህተት ተከስቷል');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // POST /api/auth/verify-otp
//   const handleVerifyOtp = async () => {
//     if (otp.trim().length !== 4) {
//       Alert.alert('ማስጠንቀቂያ', 'እባክዎ ባለ 4 አሃዝ ኮድ ያስገቡ');
//       return;
//     }

//     setLoading(true);
//     try {
//       const payload = {
//         phoneNumber: phone.trim(),
//         code: otp.trim(),
//         shopName: shopName.trim() || undefined,
//         preferredLanguage: preferredLanguage || 'am',
//       };

//       // Match Zod schema z.number().optional()
//       if (coords && coords.lat && coords.lng) {
//         payload.gpsLatitude = coords.lat;
//         payload.gpsLongitude = coords.lng;
//       }

//       const res = await fetch(`${API_URL}/auth/verify-otp`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         throw new Error(data.error || 'የማረጋገጫ ኮዱ ትክክል አይደለም');
//       }

//       // Persist auth response
//       setToken(data.token);
//       setUser(data.user);
//       setScreen('DASHBOARD');
//     } catch (err) {
//       Alert.alert('ስህተት', err.message || 'ስህተት ተከስቷል');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // GET /api/auth/me (Refresh user profile)
//   const refreshProfile = async () => {
//     if (!token) return;
//     try {
//       const res = await fetch(`${API_URL}/auth/me`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setUser(data);
//       }
//     } catch (e) {
//       console.log('Error fetching user profile:', e);
//     }
//   };

//   const handleLogout = () => {
//     setToken(null);
//     setUser(null);
//     setScreen('LOGIN');
//     setStep('PHONE');
//     setOtp('');
//   };

//   // Render Screens
//   const renderPhoneStep = () => (
    
//       ስልክ ቁጥርዎን ያስገቡ
      
      
//         {loading ? (
          
//         ) : (
//           የማረጋገጫ ኮድ ላክ ›
//         )}
      
    
//   );

//   const renderOtpStep = () => (
    
//       የሱቅ ስም (አማራጭ)
      

      
        
//           {coords ? '📍 የሱቅ GPS ተይዟል ✓' : '📍 የሱቅ አድራሻ (GPS) መዝግብ'}
        
      

//       የኤስኤምኤስ (SMS) 4 አሃዝ ኮድ
      

      
//         {loading ? (
          
//         ) : (
//           ግባና ጀምር ⚡
//         )}
      

//        setStep('PHONE')}
//         style={styles.backLink}
//         activeOpacity={0.7}
//       >
//         ← ስልክ ቁጥር ቀይር
      
    
//   );

//   const renderLoginScreen = () => (
    
      
        
//           ገበያ B2B
        
//         ገበያ
//         የአዳማ ኪዮስኮችና ቸርቻሪዎች የጅምላ ማዘዣ
      
//       {step === 'PHONE' ? renderPhoneStep() : renderOtpStep()}
    
//   );

//   const renderDashboardScreen = () => (
    
//       {/* Top Bar with Dynamic Retailer Details */}
      
        
//           ገበያ - አዳማ
          
//             {user?.shopName || 'የእኔ ሱቅ'} • {user?.phoneNumber || ''}
          
        
        
//           ውጣ
        
      

      
//         {activeTab === 'SHOP' ? (
          
            
//               ቀጥታ ከአከፋፋይ
//               የዛሬ ልዩ ቅናሾችና የጅምላ ዋጋዎች
//               በአዳማ ከተማ ፈጣን ነፃ ማድረሻ ጋር
            

//             የምርት ምድቦች
            
//               {CATEGORIES.map((cat) => (
                
//                   {cat.icon}
//                   {cat.name}
//                   {cat.sub}
                
//               ))}
            
          
//         ) : null}

//         {activeTab === 'LEDGER' ? (
          
//             የደንበኞች የብድር መዝገብ (Micro-ERP)
//             ምንም የተመዘገበ የብድር መረጃ የለም
          
//         ) : null}

//         {activeTab === 'ORDERS' ? (
          
//             የትእዛዝ ሁኔታ እና ደረሰኝ
//             ምንም ንቁ ትእዛዝ አልተገኘም
          
//         ) : null}

//         {activeTab === 'PROFILE' ? (
          
//             የሱቅ መረጃ እና ፕሮፋይል
            
//               የሱቅ ስም:
//               {user?.shopName || 'ያልተመዘገበ'}

//               ስልክ ቁጥር:
//               {user?.phoneNumber}

//               ጂፒኤስ (GPS):
              
//                 {user?.gpsLatitude ? `\({user.gpsLatitude.toFixed(4)},\){user.gpsLongitude.toFixed(4)}` : 'አልተመዘገበም'}
              
            
          
//         ) : null}
      

//       {/* Modern Bottom Tabs */}
      
//          setActiveTab('SHOP')} activeOpacity={0.7}>
//           🛒
//           ገበያ
        

//          setActiveTab('LEDGER')} activeOpacity={0.7}>
//           📝
//           ሂሳብ
        

//          setActiveTab('ORDERS')} activeOpacity={0.7}>
//           🚚
//           ትእዛዝ
        

//          setActiveTab('PROFILE')} activeOpacity={0.7}>
//           👤
//           መገለጫ
        
      
    
//   );

//   const isWeb = Platform.OS === 'web';

//   return (
    
//       {isWeb ? (
        
          
//             {screen === 'LOGIN' ? renderLoginScreen() : renderDashboardScreen()}
          
        
//       ) : screen === 'LOGIN' ? (
//         renderLoginScreen()
//       ) : (
//         renderDashboardScreen()
//       )}
    
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: '#F5F7F3' },
//   webWrapper: { flex: 1, backgroundColor: '#0D1712', justifyContent: 'center', alignItems: 'center' },
//   phoneFrame: {
//     width: '100%',
//     maxWidth: 430,
//     height: '100%',
//     maxHeight: 932,
//     backgroundColor: '#F5F7F3',
//     borderRadius: 32,
//     overflow: 'hidden',
//     borderWidth: 8,
//     borderColor: '#1C2E24',
//   },
//   dashboardContainer: { flex: 1 },
//   scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
//   tabContentContainer: { padding: 16, paddingBottom: 24 },
//   headerBox: { alignItems: 'center', marginBottom: 28 },
//   logoBadge: {
//     backgroundColor: '#E4F2EA',
//     paddingHorizontal: 12,
//     paddingVertical: 5,
//     borderRadius: 20,
//     marginBottom: 8,
//   },
//   logoBadgeText: { color: '#0F7B4A', fontSize: 12, fontWeight: '800' },
//   mainTitle: { fontSize: 34, fontWeight: '900', color: '#0F7B4A' },
//   subTitle: { fontSize: 14, color: '#62726A', marginTop: 4, textAlign: 'center', lineHeight: 22 },
//   card: { gap: 12 },
//   inputLabel: { fontSize: 13, fontWeight: '700', color: '#12241A' },
//   textInput: {
//     height: 52,
//     borderWidth: 2,
//     borderColor: '#DDE4DD',
//     borderRadius: 14,
//     paddingHorizontal: 16,
//     fontSize: 16,
//     backgroundColor: '#FFFFFF',
//     color: '#12241A',
//   },
//   otpInput: { fontSize: 24, letterSpacing: 8, textAlign: 'center' },
//   primaryButton: {
//     height: 54,
//     backgroundColor: '#0F7B4A',
//     borderRadius: 14,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 6,
//   },
//   primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
//   locationButton: { height: 48, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
//   locationActive: { borderColor: '#0F7B4A', backgroundColor: '#E4F2EA' },
//   locationInactive: { borderColor: '#DDE4DD', backgroundColor: '#FFFFFF' },
//   locationText: { fontSize: 13, fontWeight: '700' },
//   locationTextActive: { color: '#0F7B4A' },
//   locationTextInactive: { color: '#62726A' },
//   backLink: { alignItems: 'center', marginTop: 8 },
//   backLinkText: { color: '#0F7B4A', fontWeight: '700', fontSize: 14 },
//   centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, minHeight: 250 },
//   emptyText: { fontSize: 14, color: '#62726A', marginTop: 8 },
//   topBar: {
//     height: 62,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E2E8E4',
//     paddingHorizontal: 16,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   topBarTitle: { fontSize: 18, fontWeight: '900', color: '#0F7B4A' },
//   topBarSubtitle: { fontSize: 11, color: '#62726A', fontWeight: '600', marginTop: 1 },
//   logoutBtn: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
//   logoutText: { fontSize: 13, fontWeight: '700', color: '#DC2626' },
//   heroPromo: {
//     backgroundColor: '#0F7B4A',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 20,
//   },
//   promoTag: { color: '#A7F3D0', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
//   promoTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '900', marginTop: 4 },
//   promoSub: { color: '#E4F2EA', fontSize: 12, marginTop: 2 },
//   sectionTitle: { fontSize: 17, fontWeight: '800', color: '#12241A', marginBottom: 12 },
//   categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
//   categoryCard: {
//     width: '48%',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 14,
//     padding: 16,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E2E8E4',
//   },
//   categoryIcon: { fontSize: 32 },
//   categoryName: { fontSize: 13, fontWeight: '800', color: '#12241A', marginTop: 6, textAlign: 'center' },
//   categorySub: { fontSize: 11, color: '#62726A', marginTop: 2, textAlign: 'center' },
//   profileBox: { paddingVertical: 10 },
//   profileCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E2E8E4', gap: 6 },
//   profileLabel: { fontSize: 12, color: '#62726A', fontWeight: '700' },
//   profileVal: { fontSize: 15, color: '#12241A', fontWeight: '800', marginBottom: 6 },
//   bottomBar: {
//     height: 64,
//     backgroundColor: '#FFFFFF',
//     borderTopWidth: 1,
//     borderTopColor: '#E2E8E4',
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//   },
//   tabBtn: { alignItems: 'center', justifyContent: 'center' },
//   tabIcon: { fontSize: 22 },
//   tabLabel: { fontSize: 11, color: '#62726A', marginTop: 2 },
//   activeTab: { color: '#0F7B4A', fontWeight: '800' },
// });
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';

// Dynamically adapts based on testing platform
const getApiUrl = () => {
  if (Platform.OS === 'android') {
    // 10.0.2.2 points to host machine from Android Emulator. 
    // Replace with your LAN IP (e.g. 192.168.1.X) if testing on physical phone via Expo Go.
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const CATEGORIES = [
  { id: '1', name: 'ግሮሰሪ እና ባልትና', sub: 'የምግብ እህሎችና ዘይት', icon: '🛒' },
  { id: '2', name: 'የጽዳት እቃዎች', sub: 'ሳሙና እና ዲተርጀንት', icon: '🧽' },
  { id: '3', name: 'ለስላሳ መጠጦች', sub: 'ውሃ እና ጭማቂዎች', icon: '🥤' },
  { id: '4', name: 'መክሰስ እና ጣፋጭ', sub: 'ብስኩት እና ከረሜላ', icon: '🍬' },
  { id: '5', name: 'የትምህርት መሳሪያዎች', sub: 'ደብተር እና እስክሪብቶ', icon: '✏️' },
  { id: '6', name: 'የግብርና ምርቶች', sub: 'ድንች፣ ሽንኩርት እና ጥራጥሬ', icon: '🥔' },
  { id: '7', name: 'የማሸጊያ እቃዎች', sub: 'ፌስታል እና ካርቶን', icon: '📦' },
  { id: '8', name: 'ሲጋራ እና ክብሪት', sub: 'የትምባሆ ውጤቶች', icon: '🚬' },
];

// Bottom navigation items (UI only)
const TABS = [
  { key: 'SHOP', icon: '🛒', label: 'ገበያ' },
  { key: 'LEDGER', icon: '📝', label: 'ሂሳብ' },
  { key: 'ORDERS', icon: '🚚', label: 'ትእዛዝ' },
  { key: 'PROFILE', icon: '👤', label: 'መገለጫ' },
];

export default function App() {
  const [screen, setScreen] = useState('LOGIN');
  const [activeTab, setActiveTab] = useState('SHOP');
  const [step, setStep] = useState('PHONE');

  // Input states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [shopName, setShopName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('am');
  const [coords, setCoords] = useState(null);

  // App & Auth states
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // UI-only: which input is focused (for glow)
  const [focusedField, setFocusedField] = useState(null);

  // Capture GPS Location
  const captureLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ማስጠንቀቂያ', 'የሱቅዎን አድራሻ በትክክል ለማድረስ የቦታ ፈቃድ ይስጡ');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCoords({
        lat: Number(loc.coords.latitude),
        lng: Number(loc.coords.longitude),
      });
      Alert.alert('ተሳክቷል', 'የሱቅዎ ጂፒኤስ (GPS) አድራሻ ተመዝግቧል');
    } catch (e) {
      Alert.alert('ስህተት', 'የጂፒኤስ መረጃ ማግኘት አልተቻለም');
    }
  };

  // POST /api/auth/send-otp
  const handleSendOtp = async () => {
    if (!phone || phone.trim().length < 9) {
      Alert.alert('ማስጠንቀቂያ', 'እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'የማረጋገጫ ኮድ መላክ አልተቻለም');
      }

      if (data.devOtp) {
        Alert.alert('የሙከራ ኮድ (Dev OTP)', 'የማረጋገጫ ኮድ: ' + data.devOtp);
        setOtp(data.devOtp); // Auto-fill for ultra-fast dev testing
      }

      setStep('OTP');
    } catch (err) {
      Alert.alert('ስህተት', err.message || 'ስህተት ተከስቷል');
    } finally {
      setLoading(false);
    }
  };

  // POST /api/auth/verify-otp
  const handleVerifyOtp = async () => {
    if (otp.trim().length !== 4) {
      Alert.alert('ማስጠንቀቂያ', 'እባክዎ ባለ 4 አሃዝ ኮድ ያስገቡ');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        phoneNumber: phone.trim(),
        code: otp.trim(),
        shopName: shopName.trim() || undefined,
        preferredLanguage: preferredLanguage || 'am',
      };

      // Match Zod schema z.number().optional()
      if (coords && coords.lat && coords.lng) {
        payload.gpsLatitude = coords.lat;
        payload.gpsLongitude = coords.lng;
      }

      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'የማረጋገጫ ኮዱ ትክክል አይደለም');
      }

      // Persist auth response
      setToken(data.token);
      setUser(data.user);
      setScreen('DASHBOARD');
    } catch (err) {
      Alert.alert('ስህተት', err.message || 'ስህተት ተከስቷል');
    } finally {
      setLoading(false);
    }
  };

  // GET /api/auth/me (Refresh user profile)
  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
      }
    } catch (e) {
      console.log('Error fetching user profile:', e);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setScreen('LOGIN');
    setStep('PHONE');
    setOtp('');
  };

  // Render Screens
  const renderPhoneStep = () => (
    <View style={styles.card}>
      <Text style={styles.inputLabel}>ስልክ ቁጥርዎን ያስገቡ</Text>
      <TextInput
        style={[
          styles.textInput,
          focusedField === 'phone' && styles.textInputFocused,
        ]}
        value={phone}
        onChangeText={setPhone}
        onFocus={() => setFocusedField('phone')}
        onBlur={() => setFocusedField(null)}
        placeholder="09XXXXXXXX"
        placeholderTextColor="#9AA9A0"
        keyboardType="phone-pad"
      />

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={handleSendOtp}
        disabled={loading}
        activeOpacity={0.85}
      >
        <View pointerEvents="none" style={styles.buttonGloss} />
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>የማረጋገጫ ኮድ ላክ ›</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderOtpStep = () => (
    <View style={styles.card}>
      <Text style={styles.inputLabel}>የሱቅ ስም (አማራጭ)</Text>
      <TextInput
        style={[
          styles.textInput,
          focusedField === 'shop' && styles.textInputFocused,
        ]}
        value={shopName}
        onChangeText={setShopName}
        onFocus={() => setFocusedField('shop')}
        onBlur={() => setFocusedField(null)}
        placeholder="የሱቅዎ ስም"
        placeholderTextColor="#9AA9A0"
      />

      <TouchableOpacity
        style={[
          styles.locationButton,
          coords ? styles.locationActive : styles.locationInactive,
        ]}
        onPress={captureLocation}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.locationText,
            coords ? styles.locationTextActive : styles.locationTextInactive,
          ]}
        >
          {coords ? '📍 የሱቅ GPS ተይዟል ✓' : '📍 የሱቅ አድራሻ (GPS) መዝግብ'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.inputLabel}>የኤስኤምኤስ (SMS) 4 አሃዝ ኮድ</Text>
      <TextInput
        style={[
          styles.textInput,
          styles.otpInput,
          focusedField === 'otp' && styles.textInputFocused,
        ]}
        value={otp}
        onChangeText={setOtp}
        onFocus={() => setFocusedField('otp')}
        onBlur={() => setFocusedField(null)}
        placeholder="••••"
        placeholderTextColor="#B6C2BA"
        keyboardType="number-pad"
        maxLength={4}
      />

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={handleVerifyOtp}
        disabled={loading}
        activeOpacity={0.85}
      >
        <View pointerEvents="none" style={styles.buttonGloss} />
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>ግባና ጀምር ⚡</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setStep('PHONE')}
        style={styles.backLink}
        activeOpacity={0.7}
      >
        <Text style={styles.backLinkText}>← ስልክ ቁጥር ቀይር</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoginScreen = () => (
    <View style={styles.loginRoot}>
      <View pointerEvents="none" style={styles.glowOrbTop} />
      <View pointerEvents="none" style={styles.glowOrbSide} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBox}>
          <View style={styles.logoRing}>
            <Text style={styles.logoEmoji}>🏪</Text>
          </View>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>ገበያ B2B</Text>
          </View>
          <Text style={styles.mainTitle}>ገበያ</Text>
          <Text style={styles.subTitle}>የአዳማ ኪዮስኮችና ቸርቻሪዎች የጅምላ ማዘዣ</Text>
        </View>

        <View style={styles.formPanel}>
          <View pointerEvents="none" style={styles.panelShine} />
          {step === 'PHONE' ? renderPhoneStep() : renderOtpStep()}
        </View>
      </ScrollView>
    </View>
  );

  const renderDashboardScreen = () => (
    <View style={styles.dashboardContainer}>
      <View pointerEvents="none" style={styles.glowOrbTop} />
      <View pointerEvents="none" style={styles.glowOrbSide} />

      {/* Top Bar with Dynamic Retailer Details */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.topAvatar}>
            <Text style={styles.topAvatarEmoji}>🏪</Text>
          </View>
          <View style={styles.topBarTextWrap}>
            <Text style={styles.topBarTitle}>ገበያ - አዳማ</Text>
            <Text style={styles.topBarSubtitle} numberOfLines={1}>
              {user?.shopName || 'የእኔ ሱቅ'} • {user?.phoneNumber || ''}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>ውጣ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentArea}>
        {activeTab === 'SHOP' ? (
          <ScrollView
            contentContainerStyle={styles.tabContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroPromo}>
              <View pointerEvents="none" style={styles.promoOrbBig} />
              <View pointerEvents="none" style={styles.promoOrbSmall} />
              <View pointerEvents="none" style={styles.promoGloss} />

              <View style={styles.promoTextCol}>
                <View style={styles.promoTagPill}>
                  <Text style={styles.promoTag}>ቀጥታ ከአከፋፋይ</Text>
                </View>
                <Text style={styles.promoTitle}>የዛሬ ልዩ ቅናሾችና የጅምላ ዋጋዎች</Text>
                <Text style={styles.promoSub}>በአዳማ ከተማ ፈጣን ነፃ ማድረሻ ጋር</Text>
              </View>

              <View style={styles.promoIconBubble}>
                <Text style={styles.promoIconEmoji}>🚚</Text>
              </View>
            </View>

            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>የምርት ምድቦች</Text>
            </View>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <View key={cat.id} style={styles.categoryCard}>
                  <View pointerEvents="none" style={styles.cardShine} />
                  <View style={styles.categoryIconBubble}>
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  </View>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <Text style={styles.categorySub}>{cat.sub}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : null}

        {activeTab === 'LEDGER' ? (
          <View style={styles.centerBox}>
            <View style={styles.emptyIconBubble}>
              <Text style={styles.emptyIconEmoji}>📝</Text>
            </View>
            <Text style={styles.sectionTitleCenter}>የደንበኞች የብድር መዝገብ (Micro-ERP)</Text>
            <Text style={styles.emptyText}>ምንም የተመዘገበ የብድር መረጃ የለም</Text>
          </View>
        ) : null}

        {activeTab === 'ORDERS' ? (
          <View style={styles.centerBox}>
            <View style={styles.emptyIconBubble}>
              <Text style={styles.emptyIconEmoji}>🚚</Text>
            </View>
            <Text style={styles.sectionTitleCenter}>የትእዛዝ ሁኔታ እና ደረሰኝ</Text>
            <Text style={styles.emptyText}>ምንም ንቁ ትእዛዝ አልተገኘም</Text>
          </View>
        ) : null}

        {activeTab === 'PROFILE' ? (
          <ScrollView
            contentContainerStyle={styles.tabContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.profileBox}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>የሱቅ መረጃ እና ፕሮፋይል</Text>
              </View>

              <View style={styles.profileCard}>
                <View pointerEvents="none" style={styles.cardShine} />

                <View style={styles.profileRow}>
                  <View style={styles.profileIconBubble}>
                    <Text style={styles.profileIcon}>🏪</Text>
                  </View>
                  <View style={styles.profileTextCol}>
                    <Text style={styles.profileLabel}>የሱቅ ስም:</Text>
                    <Text style={styles.profileVal}>{user?.shopName || 'ያልተመዘገበ'}</Text>
                  </View>
                </View>

                <View style={styles.profileDivider} />

                <View style={styles.profileRow}>
                  <View style={styles.profileIconBubble}>
                    <Text style={styles.profileIcon}>📞</Text>
                  </View>
                  <View style={styles.profileTextCol}>
                    <Text style={styles.profileLabel}>ስልክ ቁጥር:</Text>
                    <Text style={styles.profileVal}>{user?.phoneNumber}</Text>
                  </View>
                </View>

                <View style={styles.profileDivider} />

                <View style={styles.profileRow}>
                  <View style={styles.profileIconBubble}>
                    <Text style={styles.profileIcon}>📍</Text>
                  </View>
                  <View style={styles.profileTextCol}>
                    <Text style={styles.profileLabel}>ጂፒኤስ (GPS):</Text>
                    <Text style={styles.profileVal}>
                      {user?.gpsLatitude
                        ? `${user.gpsLatitude.toFixed(4)}, ${user.gpsLongitude.toFixed(4)}`
                        : 'አልተመዘገበም'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        ) : null}
      </View>

      {/* Modern Floating Bottom Tabs */}
      <View style={styles.bottomBarWrap}>
        <View style={styles.bottomBar}>
          <View pointerEvents="none" style={styles.bottomBarShine} />
          {TABS.map((t) => {
            const active = activeTab === t.key;

            return (
              <TouchableOpacity
                key={t.key}
                style={styles.tabBtn}
                onPress={() => setActiveTab(t.key)}
                activeOpacity={0.7}
              >
                {active && <View pointerEvents="none" style={styles.tabIndicator} />}

                <View
                  style={[
                    styles.tabIconWrap,
                    active && styles.tabIconWrapActive,
                  ]}
                >
                  <Text style={[styles.tabIcon, active && styles.tabIconActive]}>
                    {t.icon}
                  </Text>
                </View>

                <Text style={[styles.tabLabel, active && styles.activeTab]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  const isWeb = Platform.OS === 'web';

  return (
    <SafeAreaView style={styles.safeArea}>
      {isWeb ? (
        <View style={styles.webWrapper}>
          <View style={styles.phoneFrame}>
            {screen === 'LOGIN' ? renderLoginScreen() : renderDashboardScreen()}
          </View>
        </View>
      ) : screen === 'LOGIN' ? (
        renderLoginScreen()
      ) : (
        renderDashboardScreen()
      )}
    </SafeAreaView>
  );
}

const GREEN = '#0F7B4A';
const GREEN_SOFT = '#E4F2EA';
const GLOW = '#14C47A';
const MINT = '#3FD08A';
const AMBER = '#F5A623';
const INK = '#12241A';
const MUTED = '#62726A';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7F3' },
  webWrapper: { flex: 1, backgroundColor: '#0D1712', justifyContent: 'center', alignItems: 'center' },
  phoneFrame: {
    width: '100%',
    maxWidth: 430,
    height: '100%',
    maxHeight: 932,
    backgroundColor: '#F5F7F3',
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 8,
    borderColor: '#1C2E24',
  },

  /* Ambient glow orbs */
  glowOrbTop: {
    position: 'absolute',
    top: -90,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(15, 123, 74, 0.13)',
  },
  glowOrbSide: {
    position: 'absolute',
    top: 160,
    right: -110,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(245, 166, 35, 0.10)',
  },

  /* Login */
  loginRoot: { flex: 1, overflow: 'hidden' },
  dashboardContainer: { flex: 1, overflow: 'hidden' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  contentArea: { flex: 1 },
  tabContentContainer: { padding: 16, paddingBottom: 24 },
  headerBox: { alignItems: 'center', marginBottom: 26 },
  logoRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: GREEN,
    borderWidth: 3,
    borderColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: GLOW,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.65,
    shadowRadius: 20,
    elevation: 14,
  },
  logoEmoji: { fontSize: 40 },
  logoBadge: {
    backgroundColor: GREEN_SOFT,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(15, 123, 74, 0.25)',
  },
  logoBadgeText: { color: GREEN, fontSize: 12, fontWeight: '800' },
  mainTitle: { fontSize: 38, fontWeight: '900', color: GREEN },
  subTitle: { fontSize: 14, color: MUTED, marginTop: 4, textAlign: 'center', lineHeight: 22 },

  formPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E3EBE5',
    overflow: 'hidden',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 8,
  },
  panelShine: {
    position: 'absolute',
    top: 0,
    left: 30,
    right: 30,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(63, 208, 138, 0.6)',
  },
  card: { gap: 12 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: INK },
  textInput: {
    height: 54,
    borderWidth: 2,
    borderColor: '#DDE4DD',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F8FAF8',
    color: INK,
  },
  textInputFocused: {
    borderColor: MINT,
    backgroundColor: '#FFFFFF',
    shadowColor: GLOW,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 4,
  },
  otpInput: { fontSize: 24, letterSpacing: 8, textAlign: 'center' },
  primaryButton: {
    height: 56,
    backgroundColor: GREEN,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: MINT,
    shadowColor: GLOW,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  primaryButtonDisabled: { opacity: 0.75 },
  buttonGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  locationButton: { height: 50, borderRadius: 14, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  locationActive: {
    borderColor: MINT,
    backgroundColor: GREEN_SOFT,
    shadowColor: GLOW,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  locationInactive: { borderColor: '#DDE4DD', backgroundColor: '#FFFFFF' },
  locationText: { fontSize: 13, fontWeight: '700' },
  locationTextActive: { color: GREEN },
  locationTextInactive: { color: MUTED },
  backLink: { alignItems: 'center', marginTop: 8 },
  backLinkText: { color: GREEN, fontWeight: '700', fontSize: 14 },

  /* Empty states */
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, minHeight: 250 },
  emptyIconBubble: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: GREEN_SOFT,
    borderWidth: 2,
    borderColor: 'rgba(15, 123, 74, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: GLOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyIconEmoji: { fontSize: 44 },
  sectionTitleCenter: { fontSize: 17, fontWeight: '800', color: INK, textAlign: 'center' },
  emptyText: { fontSize: 14, color: MUTED, marginTop: 8, textAlign: 'center' },

  /* Top bar */
  topBar: {
    height: 70,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 8,
    zIndex: 5,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
  topAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GREEN,
    borderWidth: 2,
    borderColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: GLOW,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 6,
  },
  topAvatarEmoji: { fontSize: 22 },
  topBarTextWrap: { flex: 1 },
  topBarTitle: { fontSize: 18, fontWeight: '900', color: GREEN },
  topBarSubtitle: { fontSize: 11, color: MUTED, fontWeight: '600', marginTop: 1 },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  logoutText: { fontSize: 13, fontWeight: '700', color: '#DC2626' },

  /* Hero promo */
  heroPromo: {
    backgroundColor: GREEN,
    borderRadius: 24,
    padding: 18,
    marginBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(63, 208, 138, 0.75)',
    shadowColor: GLOW,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 12,
  },
  promoOrbBig: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(63, 208, 138, 0.35)',
  },
  promoOrbSmall: {
    position: 'absolute',
    bottom: -60,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(242, 183, 5, 0.22)',
  },
  promoGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  promoTextCol: { flex: 1, paddingRight: 10 },
  promoTagPill: {
    alignSelf: 'flex-start',
    backgroundColor: AMBER,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: AMBER,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 4,
  },
  promoTag: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  promoTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', lineHeight: 24 },
  promoSub: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 12, marginTop: 4, fontWeight: '600' },
  promoIconBubble: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  promoIconEmoji: { fontSize: 34 },

  /* Section titles */
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: GREEN,
    marginRight: 8,
    shadowColor: GLOW,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: INK },

  /* Categories */
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12, justifyContent: 'space-between' },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3EBE5',
    overflow: 'hidden',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 4,
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(63, 208, 138, 0.55)',
  },
  categoryIconBubble: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: GREEN_SOFT,
    borderWidth: 1.5,
    borderColor: 'rgba(15, 123, 74, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: GLOW,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryIcon: { fontSize: 30 },
  categoryName: { fontSize: 13, fontWeight: '800', color: INK, marginTop: 6, textAlign: 'center' },
  categorySub: { fontSize: 11, color: MUTED, marginTop: 2, textAlign: 'center' },

  /* Profile */
  profileBox: { paddingVertical: 4 },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3EBE5',
    overflow: 'hidden',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 5,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  profileIconBubble: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: GREEN_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(15, 123, 74, 0.2)',
  },
  profileIcon: { fontSize: 22 },
  profileTextCol: { flex: 1 },
  profileLabel: { fontSize: 12, color: MUTED, fontWeight: '700' },
  profileVal: { fontSize: 15, color: INK, fontWeight: '800', marginTop: 2 },
  profileDivider: { height: 1, backgroundColor: '#EDF2EE', marginVertical: 12 },

  /* Floating bottom navigation */
  bottomBarWrap: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 12,
  },
  bottomBar: {
    height: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(63, 208, 138, 0.35)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 6,
    overflow: 'hidden',
    shadowColor: GLOW,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 14,
  },
  bottomBarShine: {
    position: 'absolute',
    top: 0,
    left: 30,
    right: 30,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(63, 208, 138, 0.5)',
  },
  tabBtn: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center' },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    width: 30,
    height: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: GLOW,
    shadowColor: GLOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  tabIconWrap: {
    width: 44,
    height: 36,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabIconWrapActive: {
    backgroundColor: GREEN,
    borderWidth: 1,
    borderColor: MINT,
    shadowColor: GLOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
  },
  tabIcon: { fontSize: 20, opacity: 0.6 },
  tabIconActive: { fontSize: 21, opacity: 1 },
  tabLabel: { fontSize: 11, color: MUTED, marginTop: 3, fontWeight: '600' },
  activeTab: { color: GREEN, fontWeight: '900' },
});