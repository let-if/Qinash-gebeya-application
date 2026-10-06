
import { Redirect, Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../context/SessionContext';
import { t } from '../../i18n';

const BRAND_GREEN = '#0F7B4A';
const BRAND_GOLD = '#F2C94C';
const INACTIVE = '#8A9690';

function TabLabel({ icon, activeIcon, label, focused }) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: 72,
        height: 58,
        paddingHorizontal: 7,
        paddingVertical: 5,
        borderRadius: 19,
      }}
    >
      {/* Icon pill */}
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          width: 42,
          height: 32,
          marginBottom: 3,
          borderRadius: 14,
          backgroundColor: focused ? BRAND_GREEN : 'transparent',
          shadowColor: BRAND_GREEN,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: focused ? 0.35 : 0,
          shadowRadius: 8,
          elevation: focused ? 6 : 0,
          transform: [{ scale: focused ? 1.04 : 1 }],
        }}
      >
        <Ionicons
          name={focused ? activeIcon : icon}
          size={focused ? 22 : 23}
          color={focused ? '#FFFFFF' : INACTIVE}
        />
      </View>

      {/* Label */}
      <Text
        style={{
          textAlign: 'center',
          color: focused ? BRAND_GREEN : INACTIVE,
          fontSize: 10.5,
          fontWeight: focused ? '800' : '600',
          letterSpacing: 0.2,
          lineHeight: 14,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>

      {/* Active indicator */}
      {focused && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: 5,
            height: 5,
            borderRadius: 3,
            backgroundColor: BRAND_GOLD,
          }}
        />
      )}
    </View>
  );
}

export default function TabsLayout() {
  const { ready, token, lang } = useSession();

  if (ready && !token) return <Redirect href="/(auth)/phone" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarShowLabel: false,

        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          position: 'absolute',

          left: 0,
          right: 0,
          bottom: 0,

          height: 78,

          paddingTop: 7,
          paddingBottom: 7,
          paddingHorizontal: 8,

          backgroundColor: '#FFFFFF',

          borderTopWidth: 1,
          borderColor: '#E3ECE7',

          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,

          shadowColor: '#153B2C',
          shadowOffset: {
            width: 0,
            height: -6,
          },
          shadowOpacity: 0.12,
          shadowRadius: 18,

          elevation: 16,
        },

        tabBarItemStyle: {
          flex: 1,

          height: 64,

          alignItems: 'center',
          justifyContent: 'center',

          borderRadius: 20,

          marginHorizontal: 2,
        },

        tabBarActiveTintColor: BRAND_GREEN,

        tabBarInactiveTintColor: INACTIVE,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabLabel
              icon="storefront-outline"
              activeIcon="storefront"
              label={t(lang, 'tabShop')}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="ledger"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabLabel
              icon="receipt-outline"
              activeIcon="receipt"
              label={t(lang, 'tabLedger')}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabLabel
              icon="cube-outline"
              activeIcon="cube"
              label={t(lang, 'tabOrders')}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabLabel
              icon="person-outline"
              activeIcon="person"
              label={t(lang, 'tabProfile')}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
// import React from 'react';
// import { Redirect, Tabs } from 'expo-router';
// import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useSession } from '../../context/SessionContext';
// import { t } from '../../i18n';

// const BRAND_GREEN = '#0F7B4A';
// const BRAND_GOLD = '#F2C94C';
// const INACTIVE = '#8A9690';

// function TabLabel({ icon, activeIcon, label, focused }) {
//   return (
//     <View style={{ alignItems: 'center', justifyContent: 'center' }}>
//       {/* Icon pill */}
//       <View
//         style={{
//           alignItems: 'center',
//           justifyContent: 'center',
//           width: 46,
//           height: 32,
//           borderRadius: 16,
//           backgroundColor: focused ? '#E7F4ED' : 'transparent',
//         }}
//       >
//         <Ionicons
//           name={focused ? activeIcon : icon}
//           size={22}
//           color={focused ? BRAND_GREEN : INACTIVE}
//         />
//       </View>

//       {/* Label with String Fallback to prevent raw object crashes */}
//       <Text
//         style={{
//           fontSize: 11,
//           fontWeight: focused ? '700' : '500',
//           color: focused ? BRAND_GREEN : INACTIVE,
//           marginTop: 2,
//         }}
//       >
//         {typeof label === 'string' ? label : ''}
//       </Text>

//       {/* Active indicator */}
//       {focused && (
//         <View
//           style={{
//             width: 20,
//             height: 3,
//             borderRadius: 2,
//             backgroundColor: BRAND_GOLD,
//             marginTop: 3,
//           }}
//         />
//       )}
//     </View>
//   );
// }

// export default function TabsLayout() {
//   const { loading, token, lang } = useSession();

//   // 1. Wait for session to finish loading from AsyncStorage
//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color={BRAND_GREEN} />
//       </View>
//     );
//   }

//   // 2. Redirect to auth if user is not logged in
//   if (!token) {
//     return <Redirect href="/(auth)/phone" />;
//   }

//   // 3. Render tabs once authentication state is confirmed
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarShowLabel: false,
//         tabBarStyle: {
//           height: 72,
//           paddingTop: 8,
//           paddingBottom: 8,
//           backgroundColor: '#FFFFFF',
//           borderTopWidth: 1,
//           borderTopColor: '#E8EEE9',
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <TabLabel
//               icon="home-outline"
//               activeIcon="home"
//               label={t('home', lang)}
//               focused={focused}
//             />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="orders"
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <TabLabel
//               icon="receipt-outline"
//               activeIcon="receipt"
//               label={t('orders', lang)}
//               focused={focused}
//             />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="ledger"
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <TabLabel
//               icon="wallet-outline"
//               activeIcon="wallet"
//               label={t('ledger', lang)}
//               focused={focused}
//             />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="profile"
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <TabLabel
//               icon="person-outline"
//               activeIcon="person"
//               label={t('profile', lang)}
//               focused={focused}
//             />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }

// const styles = StyleSheet.create({
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5F7F3',
//   },
// });