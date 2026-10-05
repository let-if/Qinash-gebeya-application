
// import { Redirect, Tabs } from 'expo-router';
// import { Text, View } from 'react-native';
// import { useSession } from '../../context/SessionContext';
// import { t } from '../../i18n';

// function TabLabel({ icon, label, focused }) {
//   return (
//     <View
//       style={{
//         alignItems: 'center',
//         justifyContent: 'center',
//         width: 72,
//         height: 58,
//         paddingHorizontal: 7,
//         paddingVertical: 5,
//         borderRadius: 19,

//         backgroundColor: focused
//           ? 'rgba(15, 123, 74, 0.09)'
//           : 'transparent',
//       }}
//     >
//       {/* Icon */}
//       <View
//         style={{
//           alignItems: 'center',
//           justifyContent: 'center',

//           width: 34,
//           height: 31,

//           marginBottom: 2,

//           borderRadius: 12,

//           backgroundColor: focused
//             ? 'rgba(15, 123, 74, 0.12)'
//             : 'transparent',
//         }}
//       >
//         <Text
//           style={{
//             fontSize: focused ? 20 : 19,
//             lineHeight: 23,

//             opacity: focused ? 1 : 0.65,

//             transform: [
//               {
//                 scale: focused ? 1.04 : 1,
//               },
//             ],
//           }}
//         >
//           {icon}
//         </Text>
//       </View>

//       {/* Label */}
//       <Text
//         style={{
//           textAlign: 'center',

//           color: focused ? '#0F7B4A' : '#7B8580',

//           fontSize: 10.5,

//           fontWeight: focused ? '700' : '500',

//           letterSpacing: 0.15,

//           lineHeight: 14,
//         }}
//         numberOfLines={1}
//       >
//         {label}
//       </Text>

//       {/* Active indicator */}
//       {focused && (
//         <View
//           style={{
//             position: 'absolute',

//             bottom: 1,

//             width: 18,
//             height: 3,

//             borderRadius: 3,

//             backgroundColor: '#0F7B4A',
//           }}
//         />
//       )}
//     </View>
//   );
// }

// export default function TabsLayout() {
//   const { ready, token, lang } = useSession();

//   if (ready && !token) return <Redirect href="/(auth)/phone" />;

//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,

//         tabBarShowLabel: false,

//         tabBarHideOnKeyboard: true,

//         tabBarStyle: {
//           position: 'absolute',

//   left: 0,
//   right: 0,
//   bottom: 0,

//   height: 78,

//           paddingTop: 7,
//           paddingBottom: 7,
//           paddingHorizontal: 8,

//           backgroundColor: '#FFFFFF',

//           borderWidth: 1,
//           borderColor: '#E8EFEB',

//           borderRadius: 27,

//           shadowColor: '#153B2C',

//           shadowOffset: {
//             width: 0,
//             height: 6,
//           },

//           shadowOpacity: 0.11,

//           shadowRadius: 18,

//           elevation: 12,
//         },

//         tabBarItemStyle: {
//           flex: 1,

//           height: 64,

//           alignItems: 'center',
//           justifyContent: 'center',

//           borderRadius: 20,

//           marginHorizontal: 2,
//         },

//         tabBarActiveTintColor: '#0F7B4A',

//         tabBarInactiveTintColor: '#7B8580',
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <TabLabel
//               icon="🛒"
//               label={t(lang, 'tabShop')}
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
//               icon="📝"
//               label={t(lang, 'tabLedger')}
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
//               icon="🚚"
//               label={t(lang, 'tabOrders')}
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
//               icon="👤"
//               label={t(lang, 'tabProfile')}
//               focused={focused}
//             />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }
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