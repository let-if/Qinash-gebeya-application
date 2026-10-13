
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import prisma from '../../config/db';
// import { getJwtSecret } from '../../config/jwt';
// import { SendOtpInput, VerifyOtpInput } from '../../types/auth';
// import { sendRealSmsOtp } from '../../services/sms.service';

// export function normalizeEthiopianPhone(phone: string): string {
//   let cleaned = phone.replace(/[\s\-]/g, '');
//   if (cleaned.startsWith('0')) {
//     cleaned = '+251' + cleaned.slice(1);
//   } else if (!cleaned.startsWith('+')) {
//     cleaned = '+' + cleaned;
//   }
//   return cleaned;
// }

// export class AuthService {
//   // ==========================================
//   // ADMIN & WEB PORTAL LOGIN (WITH DYNAMIC RBAC)
//   // ==========================================
//   static async adminLogin(phone: string, password: string) {
//     const normalized = normalizeEthiopianPhone(phone);

//     // Search for admin by normalized phone (+251...) or raw input
//     const user = await prisma.user.findFirst({
//       where: {
//         OR: [
//           { phoneNumber: normalized },
//           { phoneNumber: phone },
//         ],
//       },
//       select: {
//         id: true,
//         phoneNumber: true,
//         password: true,
//         shopName: true,
//         role: true,
//         approvalStatus: true,
//         allowedTabs: true,
//       },
//     });

//     if (!user) {
//       throw new Error('ስልክ ቁጥር ወይም የይለፍ ቃል የተሳሳተ ነው');
//     }

//     // Block rejected/suspended accounts
//     if (user.approvalStatus === 'REJECTED' || user.approvalStatus === 'SUSPENDED') {
//       throw new Error('ይህ አካውንት በአስተዳዳሪው ታግዷል (Account has been suspended/rejected)');
//     }

//     if (!user.password) {
//       throw new Error('ይህ አካውንት በይለፍ ቃል መግባት አይችልም');
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       throw new Error('ስልክ ቁጥር ወይም የይለፍ ቃል የተሳሳተ ነው');
//     }

//     // Role verification
//     if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
//       throw new Error('የአስተዳዳሪ ፈቃድ የለዎትም (Access Denied)');
//     }

//     // Determine exact tabs allowed for this user
//     const ALL_TABS = ['orders', 'credit', 'products', 'categories', 'ads', 'users'];
//     const allowedTabs = user.role === 'SUPERADMIN'
//       ? ALL_TABS
//       : (Array.isArray(user.allowedTabs) && user.allowedTabs.length > 0
//           ? user.allowedTabs
//           : ['orders']);

//     const token = jwt.sign(
//       {
//         userId: user.id,
//         phoneNumber: user.phoneNumber,
//         shopName: user.shopName,
//         role: user.role,
//         allowedTabs,
//       },
//       getJwtSecret(),
//       { expiresIn: '7d' }
//     );

//     return {
//       success: true,
//       message: 'Login successful',
//       token,
//       admin: {
//         id: user.id,
//         phone: user.phoneNumber,
//         shopName: user.shopName,
//         role: user.role,
//         allowedTabs,
//       },
//       user: {
//         id: user.id,
//         phone: user.phoneNumber,
//         shopName: user.shopName,
//         role: user.role,
//         allowedTabs,
//       },
//     };
//   }

//   // ==========================================
//   // MOBILE APP OTP & PROFILE
//   // ==========================================
//   static async sendOtp({ phoneNumber }: SendOtpInput) {
//     const normalized = normalizeEthiopianPhone(phoneNumber);

//     // 1. Check if user is already registered
//     const existingUser = await prisma.user.findUnique({
//       where: { phoneNumber: normalized },
//     });

//     if (existingUser) {
//       // Prevent login if admin has rejected/suspended the account
//       if (existingUser.approvalStatus === 'REJECTED' || existingUser.approvalStatus === 'SUSPENDED') {
//         throw new Error('ይህ አካውንት በአስተዳዳሪው ታግዷል (Account is rejected/suspended by Admin)');
//       }

//       // Direct login for returning authorized users: generate 365d JWT
//       const token = jwt.sign(
//         { userId: existingUser.id, phoneNumber: existingUser.phoneNumber, shopName: existingUser.shopName },
//         getJwtSecret(),
//         { expiresIn: '365d' }
//       );

//       return {
//         success: true,
//         isRegistered: true,
//         token,
//         user: {
//           id: existingUser.id,
//           phoneNumber: existingUser.phoneNumber,
//           shopName: existingUser.shopName,
//           preferredLanguage: existingUser.preferredLanguage,
//           approvalStatus: existingUser.approvalStatus,
//           gpsLatitude: existingUser.gpsLatitude,
//           gpsLongitude: existingUser.gpsLongitude,
//         },
//         message: 'እንኳን ደህና መጡ! በቀጥታ ገብተዋል።',
//       };
//     }

//     // 2. New user: Generate 4-digit code and dispatch via real SMS
//     const rawOtp = Math.floor(1000 + Math.random() * 9000).toString();
//     const codeHash = await bcrypt.hash(rawOtp, 8);
//     const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

//     // Invalidate old pending OTPs for this phone
//     await prisma.otpVerification.deleteMany({
//       where: { phoneNumber: normalized },
//     });

//     // Save hashed OTP
//     await prisma.otpVerification.create({
//       data: {
//         phoneNumber: normalized,
//         codeHash,
//         expiresAt,
//       },
//     });

//     // Send real SMS over AfroMessage API
//     await sendRealSmsOtp(normalized, rawOtp);

//     return {
//       success: true,
//       isRegistered: false,
//       message: 'የማረጋገጫ ኮድ ወደ ስልክ ቁጥርዎ በ SMS ተልኳል',
//     };
//   }

//   static async verifyOtp(data: VerifyOtpInput) {
//     const normalized = normalizeEthiopianPhone(data.phoneNumber);

//     const verification = await prisma.otpVerification.findFirst({
//       where: {
//         phoneNumber: normalized,
//         verified: false,
//         expiresAt: { gt: new Date() },
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     if (!verification) {
//       throw new Error('የማረጋገጫ ኮዱ ጊዜው አልፏል ወይም ትክክል አይደለም። እባክዎ እንደገና ይሞክሩ።');
//     }

//     const isMatch = await bcrypt.compare(data.code, verification.codeHash);
//     if (!isMatch) {
//       throw new Error('ያስገቡት ባለ 4 አሃዝ ኮድ የተሳሳተ ነው');
//     }

//     await prisma.otpVerification.update({
//       where: { id: verification.id },
//       data: { verified: true },
//     });

//     // Check if user already exists
//     let user = await prisma.user.findUnique({
//       where: { phoneNumber: normalized },
//     });

//     if (user) {
//       // Prevent verification/login if admin has rejected/suspended the account
//       if (user.approvalStatus === 'REJECTED' || user.approvalStatus === 'SUSPENDED') {
//         throw new Error('ይህ አካውንት በአስተዳዳሪው ታግዷል (Account is rejected/suspended by Admin)');
//       }
//     } else {
//       // Create newly registered retailer
//       user = await prisma.user.create({
//         data: {
//           phoneNumber: normalized,
//           shopName: data.shopName || 'ሱቅ',
//           preferredLanguage: data.preferredLanguage || 'am',
//           approvalStatus: 'APPROVED',
//           gpsLatitude: data.gpsLatitude ? Number(data.gpsLatitude) : null,
//           gpsLongitude: data.gpsLongitude ? Number(data.gpsLongitude) : null,
//         },
//       });
//     }

//     const token = jwt.sign(
//       { userId: user.id, phoneNumber: user.phoneNumber, shopName: user.shopName },
//       getJwtSecret(),
//       { expiresIn: '365d' }
//     );

//     return {
//       success: true,
//       token,
//       user: {
//         id: user.id,
//         phoneNumber: user.phoneNumber,
//         shopName: user.shopName,
//         preferredLanguage: user.preferredLanguage,
//         approvalStatus: user.approvalStatus,
//         gpsLatitude: user.gpsLatitude,
//         gpsLongitude: user.gpsLongitude,
//       },
//     };
//   }

//   static async getProfile(userId: string) {
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         id: true,
//         phoneNumber: true,
//         shopName: true,
//         role: true,
//         approvalStatus: true,
//         creditLimit: true,
//         usedCredit: true,
//         allowedTabs: true,
//         preferredLanguage: true,
//         gpsLatitude: true,
//         gpsLongitude: true,
//         createdAt: true,
//       },
//     });

//     if (!user) throw new Error('ተጠቃሚው አልተገኘም');

//     // Block profile access if rejected or suspended
//     if (user.approvalStatus === 'REJECTED' || user.approvalStatus === 'SUSPENDED') {
//       throw new Error('ይህ አካውንት በአስተዳዳሪው ታግዷል (Account is rejected/suspended by Admin)');
//     }

//     return user;
//   }

//   static async updateProfile(
//     userId: string,
//     data: { shopName?: string; preferredLanguage?: 'am' | 'om' }
//   ) {
//     const user = await prisma.user.update({
//       where: { id: userId },
//       data: {
//         ...(data.shopName ? { shopName: data.shopName } : {}),
//         ...(data.preferredLanguage ? { preferredLanguage: data.preferredLanguage } : {}),
//       },
//       select: {
//         id: true,
//         phoneNumber: true,
//         shopName: true,
//         preferredLanguage: true,
//         approvalStatus: true,
//         canOrderOnCredit: true,
//         gpsLatitude: true,
//         gpsLongitude: true,
//         createdAt: true,
//       },
//     });
//     return user;
//   }
// }

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db';
import { getJwtSecret } from '../../config/jwt';
import { SendOtpInput, VerifyOtpInput } from '../../types/auth';
import { sendRealSmsOtp } from '../../services/sms.service';

export function normalizeEthiopianPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '251' + cleaned.substring(1);
  } else if (!cleaned.startsWith('251')) {
    cleaned = '251' + cleaned;
  }

  // Strict Ethiopian Mobile Validation (Must be 251 + 9 or 7 + 8 digits)
  const mobileRegex = /^251[79][0-9]{8}$/;
  if (!mobileRegex.test(cleaned)) {
    throw new Error('እባክዎ ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (በ 09 ወይም 07 የሚጀምር)');
  }

  return '+' + cleaned;
}

export class AuthService {
  // ==========================================
  // ADMIN & WEB PORTAL LOGIN (WITH DYNAMIC RBAC)
  // ==========================================
  static async adminLogin(phone: string, password: string) {
    const normalized = normalizeEthiopianPhone(phone);

    // Search for admin by normalized phone (+251...) or raw input
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: normalized },
          { phoneNumber: phone },
        ],
      },
      select: {
        id: true,
        phoneNumber: true,
        password: true,
        shopName: true,
        role: true,
        approvalStatus: true,
        allowedTabs: true,
      },
    });

    if (!user) {
      throw new Error('ስልክ ቁጥር ወይም የይለፍ ቃል የተሳሳተ ነው');
    }

    // Block rejected/suspended accounts
    if (user.approvalStatus === 'REJECTED' || user.approvalStatus === 'SUSPENDED') {
      throw new Error('ይህ አካውንት በአስተዳዳሪው ታግዷል (Account has been suspended/rejected)');
    }

    if (!user.password) {
      throw new Error('ይህ አካውንት በይለፍ ቃል መግባት አይችልም');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('ስልክ ቁጥር ወይም የይለፍ ቃል የተሳሳተ ነው');
    }

    // Role verification
    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      throw new Error('የአስተዳዳሪ ፈቃድ የለዎትም (Access Denied)');
    }

    // Determine exact tabs allowed for this user
    const ALL_TABS = ['orders', 'credit', 'products', 'categories', 'ads', 'users'];
    const allowedTabs = user.role === 'SUPERADMIN'
      ? ALL_TABS
      : (Array.isArray(user.allowedTabs) && user.allowedTabs.length > 0
          ? user.allowedTabs
          : ['orders']);

    const token = jwt.sign(
      {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        shopName: user.shopName,
        role: user.role,
        allowedTabs,
      },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return {
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: user.id,
        phone: user.phoneNumber,
        shopName: user.shopName,
        role: user.role,
        allowedTabs,
      },
      user: {
        id: user.id,
        phone: user.phoneNumber,
        shopName: user.shopName,
        role: user.role,
        allowedTabs,
      },
    };
  }

  // ==========================================
  // MOBILE APP OTP & PROFILE
  // ==========================================
  static async sendOtp({ phoneNumber }: SendOtpInput) {
    const normalized = normalizeEthiopianPhone(phoneNumber);

    // 1. Check if user is already registered
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: normalized },
    });

    if (existingUser) {
      // Prevent login if admin has rejected/suspended the account
      if (existingUser.approvalStatus === 'REJECTED' || existingUser.approvalStatus === 'SUSPENDED') {
        throw new Error('ይህ አካውንት በአስተዳዳሪው ታግዷል (Account is rejected/suspended by Admin)');
      }

      // Direct login for returning authorized users: generate 365d JWT
      const token = jwt.sign(
        { userId: existingUser.id, phoneNumber: existingUser.phoneNumber, shopName: existingUser.shopName },
        getJwtSecret(),
        { expiresIn: '365d' }
      );

      return {
        success: true,
        isRegistered: true,
        token,
        user: {
          id: existingUser.id,
          phoneNumber: existingUser.phoneNumber,
          shopName: existingUser.shopName,
          preferredLanguage: existingUser.preferredLanguage,
          approvalStatus: existingUser.approvalStatus,
          gpsLatitude: existingUser.gpsLatitude,
          gpsLongitude: existingUser.gpsLongitude,
        },
        message: 'እንኳን ደህና መጡ! በቀጥታ ገብተዋል።',
      };
    }

    // 2. New user: Generate 4-digit code and dispatch via email/SMS service
    const rawOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const codeHash = await bcrypt.hash(rawOtp, 8);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Invalidate old pending OTPs for this phone
    await prisma.otpVerification.deleteMany({
      where: { phoneNumber: normalized },
    });

    // Save hashed OTP
    await prisma.otpVerification.create({
      data: {
        phoneNumber: normalized,
        codeHash,
        expiresAt,
      },
    });

    // Send code via email notification service
  //   await sendRealSmsOtp(normalized, rawOtp);

  //   return {
  //     success: true,
  //     isRegistered: false,
  //     devOtp: rawOtp,
  //     message: 'የማረጋገጫ ኮድ ወደ ኢሜይልዎ ተልኳል',
  //   };
  // }
  // Fire email notification asynchronously in the background without blocking the response
sendRealSmsOtp(normalized, rawOtp).catch((err) => {
  console.error('[BACKGROUND EMAIL ERROR]', err);
});

return {
  success: true,
  isRegistered: false,
  devOtp: rawOtp, // You can also read this directly from response during testing if needed!
  message: 'የማረጋገጫ ኮድ ተዘጋጅቷል',
};
  }

  static async verifyOtp(data: VerifyOtpInput) {
    const normalized = normalizeEthiopianPhone(data.phoneNumber);

    const verification = await prisma.otpVerification.findFirst({
      where: {
        phoneNumber: normalized,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      throw new Error('የማረጋገጫ ኮዱ ጊዜው አልፏል ወይም ትክክል አይደለም። እባክዎ እንደገና ይሞክሩ።');
    }

    const isMatch = await bcrypt.compare(data.code, verification.codeHash);
    if (!isMatch) {
      throw new Error('ያስገቡት ባለ 4 አሃዝ ኮድ የተሳሳተ ነው');
    }

    await prisma.otpVerification.update({
      where: { id: verification.id },
      data: { verified: true },
    });

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { phoneNumber: normalized },
    });

    if (user) {
      // Prevent verification/login if admin has rejected/suspended the account
      if (user.approvalStatus === 'REJECTED' || user.approvalStatus === 'SUSPENDED') {
        throw new Error('ይህ አካውንት በአስተዳዳሪው ታግዷል (Account is rejected/suspended by Admin)');
      }
    } else {
      // Create newly registered retailer
      user = await prisma.user.create({
        data: {
          phoneNumber: normalized,
          shopName: data.shopName || 'ሱቅ',
          preferredLanguage: data.preferredLanguage || 'am',
          approvalStatus: 'APPROVED',
          gpsLatitude: data.gpsLatitude ? Number(data.gpsLatitude) : null,
          gpsLongitude: data.gpsLongitude ? Number(data.gpsLongitude) : null,
        },
      });
    }

    const token = jwt.sign(
      { userId: user.id, phoneNumber: user.phoneNumber, shopName: user.shopName },
      getJwtSecret(),
      { expiresIn: '365d' }
    );

    return {
      success: true,
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        shopName: user.shopName,
        preferredLanguage: user.preferredLanguage,
        approvalStatus: user.approvalStatus,
        gpsLatitude: user.gpsLatitude,
        gpsLongitude: user.gpsLongitude,
      },
    };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phoneNumber: true,
        shopName: true,
        role: true,
        approvalStatus: true,
        creditLimit: true,
        usedCredit: true,
        allowedTabs: true,
        preferredLanguage: true,
        gpsLatitude: true,
        gpsLongitude: true,
        createdAt: true,
      },
    });

    if (!user) throw new Error('ተጠቃሚው አልተገኘም');

    // Block profile access if rejected or suspended
    if (user.approvalStatus === 'REJECTED' || user.approvalStatus === 'SUSPENDED') {
      throw new Error('ይህ አካውንት በአስተዳዳሪው ታግዷል (Account is rejected/suspended by Admin)');
    }

    return user;
  }

  static async updateProfile(
    userId: string,
    data: { shopName?: string; preferredLanguage?: 'am' | 'om' }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.shopName ? { shopName: data.shopName } : {}),
        ...(data.preferredLanguage ? { preferredLanguage: data.preferredLanguage } : {}),
      },
      select: {
        id: true,
        phoneNumber: true,
        shopName: true,
        preferredLanguage: true,
        approvalStatus: true,
        canOrderOnCredit: true,
        gpsLatitude: true,
        gpsLongitude: true,
        createdAt: true,
      },
    });
    return user;
  }
}