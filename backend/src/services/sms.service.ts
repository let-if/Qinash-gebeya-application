import axios from 'axios';

export function formatEthiopianPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '251' + cleaned.substring(1);
  } else if (!cleaned.startsWith('251')) {
    cleaned = '251' + cleaned;
  }
  return cleaned;
}

export async function sendRealSmsOtp(phoneNumber: string, otpCode: string): Promise<boolean> {
  const formattedPhone = formatEthiopianPhone(phoneNumber);
  const token = process.env.AFROMESSAGE_API_KEY;

  if (!token) {
    console.log(`[SIMULATOR ONLY] To: +${formattedPhone} | Code: ${otpCode}`);
    return true;
  }

  const messageText = `የገበያ ማረጋገጫ ኮድዎ ${otpCode} ነው። ይህን ኮድ ለማንም አያጋሩ።`;

  try {
    const res = await axios.post(
      'https://api.afromessage.com/api/send',
      {
        to: formattedPhone,
        message: messageText,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (res.data?.acknowledge === 'success') {
      console.log(`[SMS DELIVERED] to +${formattedPhone}`);
      return true;
    }

    console.warn('[SMS API WARNING]', res.data);
    return false;
  } catch (err: any) {
    console.error('[SMS ERROR]', err.response?.data || err.message);
    return false;
  }
}
