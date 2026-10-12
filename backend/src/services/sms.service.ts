// // import axios from 'axios';

// // export function formatEthiopianPhone(phone: string): string {
// //   let cleaned = phone.replace(/[^0-9]/g, '');
// //   if (cleaned.startsWith('0')) {
// //     cleaned = '251' + cleaned.substring(1);
// //   } else if (!cleaned.startsWith('251')) {
// //     cleaned = '251' + cleaned;
// //   }
// //   return cleaned;
// // }

// // export async function sendRealSmsOtp(phoneNumber: string, otpCode: string): Promise<boolean> {
// //   const formattedPhone = formatEthiopianPhone(phoneNumber);
// //   const token = process.env.AFROMESSAGE_API_KEY;

// //   if (!token) {
// //     console.log(`[SIMULATOR ONLY] To: +${formattedPhone} | Code: ${otpCode}`);
// //     return true;
// //   }

// //   const messageText = `የገበያ ማረጋገጫ ኮድዎ ${otpCode} ነው። ይህን ኮድ ለማንም አያጋሩ።`;

// //   try {
// //     const res = await axios.post(
// //       'https://api.afromessage.com/api/send',
// //       {
// //         to: formattedPhone,
// //         message: messageText,
        
// //       },
// //       {
// //         headers: {
// //           Authorization: `Bearer ${token}`,
// //           'Content-Type': 'application/json',
// //         },
// //         timeout: 10000,
// //       }
// //     );

// //     if (res.data?.acknowledge === 'success') {
// //       console.log(`[SMS DELIVERED] to +${formattedPhone}`);
// //       return true;
// //     }

// //     console.warn('[SMS API WARNING]', res.data);
// //     return false;
// //   } catch (err: any) {
// //     console.error('[SMS ERROR]', err.response?.data || err.message);
// //     return false;
// //   }
// // }
// import nodemailer from 'nodemailer';

// export function formatEthiopianPhone(phone: string): string {
//   let cleaned = phone.replace(/[^0-9]/g, '');
//   if (cleaned.startsWith('0')) {
//     cleaned = '251' + cleaned.substring(1);
//   } else if (!cleaned.startsWith('251')) {
//     cleaned = '251' + cleaned;
//   }
//   return cleaned;
// }

// // Configure Nodemailer transporter using your Gmail account
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.TEST_EMAIL_USER || 'letifylkal6@gmail.com',
//     pass: process.env.TEST_EMAIL_PASS, // Your Gmail App Password
//   },
// });

// export async function sendRealSmsOtp(phoneNumber: string, otpCode: string): Promise<boolean> {
//   const formattedPhone = formatEthiopianPhone(phoneNumber);
//   const designatedEmail = process.env.TEST_EMAIL_USER || 'letifylkal6@gmail.com';

//   try {
//     const mailOptions = {
//       from: '"ቅናሽ ገበያ Test System" <no-reply@qnashgebeya.com>',
//       to: designatedEmail,
//       subject: `🔐 OTP Code for Phone: +${formattedPhone}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #F5F7F3; border-radius: 16px; max-width: 500px; margin: auto;">
//           <h2 style="color: #0F7B4A; margin-top: 0;">ቅናሽ ገበያ - OTP Verification</h2>
//           <p style="color: #12241A; font-size: 15px;">An OTP request was triggered for phone number:</p>
//           <div style="background: #E4F2EA; padding: 10px 14px; border-radius: 8px; font-weight: bold; color: #0F7B4A; display: inline-block; margin-bottom: 15px;">
//             +${formattedPhone}
//           </div>
//           <div style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1.5px solid #D6EBE0; text-align: center; margin: 10px 0 20px 0;">
//             <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #0F7B4A;">${otpCode}</span>
//           </div>
//           <p style="color: #62726A; font-size: 13px; line-height: 1.4;">
//             Provide this 4-digit code to the user testing the application. This replaces paid SMS delivery during your evaluation period.
//           </p>
//         </div>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log(`[EMAIL OTP SENT] Code ${otpCode} successfully emailed to ${designatedEmail} for +${formattedPhone}`);
//     return true;
//   } catch (err: any) {
//     console.error('[EMAIL OTP ERROR]', err.message);
//     console.log(`[FALLBACK SIMULATOR] To: +${formattedPhone} | Code: ${otpCode}`);
//     return false;
//   }
// }
import nodemailer from 'nodemailer';

export function formatEthiopianPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');

  // Handle local formats starting with '0'
  if (cleaned.startsWith('0')) {
    cleaned = '251' + cleaned.substring(1);
  } else if (!cleaned.startsWith('251')) {
    cleaned = '251' + cleaned;
  }

  // Strict Ethiopian Mobile Validation:
  // After '251', the next digit MUST be either 9 (standard mobile) or 7 (newer mobile series).
  // Total length must be exactly 12 digits (251 + 9 digits).
  const mobileRegex = /^251[79][0-9]{8}$/;

  if (!mobileRegex.test(cleaned)) {
    throw new Error('እባክዎ ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (በ 09 ወይም 07 የሚጀምር)');
  }

  return cleaned;
}

// Configure Nodemailer transporter using your Gmail account
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.TEST_EMAIL_USER || 'letifylkal6@gmail.com',
    pass: process.env.TEST_EMAIL_PASS, // Your Gmail App Password
  },
});

export async function sendRealSmsOtp(phoneNumber: string, otpCode: string): Promise<boolean> {
  const formattedPhone = formatEthiopianPhone(phoneNumber);
  const designatedEmail = process.env.TEST_EMAIL_USER || 'letifylkal6@gmail.com';

  try {
    const mailOptions = {
      from: '"ቅናሽ ገበያ Test System" <no-reply@qnashgebeya.com>',
      to: designatedEmail,
      subject: `🔐 OTP Code for Phone: +${formattedPhone}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #F5F7F3; border-radius: 16px; max-width: 500px; margin: auto;">
          <h2 style="color: #0F7B4A; margin-top: 0;">ቅናሽ ገበያ - OTP Verification</h2>
          <p style="color: #12241A; font-size: 15px;">An OTP request was triggered for phone number:</p>
          <div style="background: #E4F2EA; padding: 10px 14px; border-radius: 8px; font-weight: bold; color: #0F7B4A; display: inline-block; margin-bottom: 15px;">
            +${formattedPhone}
          </div>
          <div style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1.5px solid #D6EBE0; text-align: center; margin: 10px 0 20px 0;">
            <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #0F7B4A;">${otpCode}</span>
          </div>
          <p style="color: #62726A; font-size: 13px; line-height: 1.4;">
            Provide this 4-digit code to the user testing the application. This replaces paid SMS delivery during your evaluation period.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL OTP SENT] Code ${otpCode} successfully emailed to ${designatedEmail} for +${formattedPhone}`);
    return true;
  } catch (err: any) {
    console.error('[EMAIL OTP ERROR]', err.message);
    console.log(`[FALLBACK SIMULATOR] To: +${formattedPhone} | Code: ${otpCode}`);
    return false;
  }
}