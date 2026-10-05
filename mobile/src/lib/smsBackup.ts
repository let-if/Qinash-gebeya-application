
import * as Linking from 'expo-linking';
import NetInfo from '@react-native-community/netinfo';

export const GATEWAY_DISPATCH_PHONE = '0911000000'; // Target warehouse/gateway SIM

export async function checkNetworkStatus(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

// Compact format: ORD#PROD_ID:QTY:UNIT#SLOT#IS_CREDIT
export function generateOrderSmsPayload(
  cartItems: Array<{ id: string; quantity: number; selectedUnit?: string }>,
  deliverySlot: 'BATCH_6AM' | 'BATCH_12PM' = 'BATCH_6AM',
  isCredit: boolean = false
): string {
  const itemStrings = cartItems.map(
    (item) =>
      `${item.id}:${item.quantity}:${item.selectedUnit === 'HALF_CARTON' ? 'HALF' : 'CARTON'}`
  );

  return `ORD#${itemStrings.join(',')}#${deliverySlot}#${isCredit ? '1' : '0'}`;
}

export function openSmsApp(
  payload: string,
  recipient: string = GATEWAY_DISPATCH_PHONE
) {
  const separator = Linking.createURL('').includes('?') ? '&' : '?';
  const url = `sms:${recipient}${separator}body=${encodeURIComponent(payload)}`;

  return Linking.openURL(url);
}
