
// import { Router, Response } from 'express';
// import { z } from 'zod';
// import { AuthService } from './auth.service';
// import { requireAuth, AuthenticatedRequest } from '../../middlewares/auth.middleware';
// import prisma from '../../config/db';

// const router = Router();

// // ----------------------------------------------------
// // 1. ADMIN & WEB PORTAL LOGIN (WITH DYNAMIC RBAC)
// // ----------------------------------------------------
// const adminLoginSchema = z.object({
//   phone: z.string().min(9).optional(),
//   phoneNumber: z.string().min(9).optional(),
//   password: z.string().min(1, 'የይለፍ ቃል ያስገቡ'),
// }).refine((data) => data.phone || data.phoneNumber, {
//   message: 'ትክክለኛ ስልክ ቁጥር ያስገቡ',
// });

// router.post('/login', async (req, res: Response): Promise => {
//   try {
//     const parsed = adminLoginSchema.parse(req.body);
//     const targetPhone = (parsed.phone || parsed.phoneNumber)!;
//     const result = await AuthService.adminLogin(targetPhone, parsed.password);
//     return res.status(200).json(result);
//   } catch (err: any) {
//     return res.status(401).json({ error: err.message || 'መግባት አልተቻለም' });
//   }
// });

// // ----------------------------------------------------
// // 2. MOBILE APP OTP & PROFILE ROUTES
// // ----------------------------------------------------
// const sendOtpSchema = z.object({
//   phoneNumber: z.string().min(9, 'ትክክለኛ ስልክ ቁጥር ያስገቡ'),
// });

// const verifyOtpSchema = z.object({
//   phoneNumber: z.string().min(9),
//   code: z.string().length(4, 'ኮዱ 4 አሃዝ መሆን አለበት'),
//   shopName: z.string().optional(),
//   preferredLanguage: z.enum(['am', 'om']).optional(),
//   gpsLatitude: z.number().optional(),
//   gpsLongitude: z.number().optional(),
// });

// router.post('/send-otp', async (req, res: Response): Promise => {
//   try {
//     const body = sendOtpSchema.parse(req.body);
//     const result = await AuthService.sendOtp(body);
//     return res.status(200).json(result);
//   } catch (err: any) {
//     return res.status(400).json({ error: err.message || 'OTP መላክ አልተቻለም' });
//   }
// });

// router.post('/verify-otp', async (req, res: Response): Promise => {
//   try {
//     const body = verifyOtpSchema.parse(req.body);
//     const result: any = await AuthService.verifyOtp(body);

//     // Ensure the response delivers live credit permissions to mobile storage
//     const userId = result?.user?.id || result?.userId;
//     if (userId) {
//       const dbUser = await prisma.user.findUnique({
//         where: { id: userId },
//         select: {
//           id: true,
//           phoneNumber: true,
//           shopName: true,
//           role: true,
//           canOrderOnCredit: true,
//           creditLimit: true,
//           usedCredit: true,
//         },
//       });

//       if (dbUser) {
//         result.user = {
//           ...result.user,
//           ...dbUser,
//         };
//       }
//     }

//     return res.status(200).json(result);
//   } catch (err: any) {
//     return res.status(400).json({ error: err.message || 'ማረጋገጥ አልተቻለም' });
//   }
// });

// const updateProfileSchema = z.object({
//   shopName: z.string().min(1).optional(),
//   preferredLanguage: z.enum(['am', 'om']).optional(),
// });

// // ----------------------------------------------------
// // 3. GET /me (Delivers live credit permissions)
// // ----------------------------------------------------
// router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise => {
//   try {
//     const userId = req.user!.userId;

//     // Fetch the database record directly to ensure real-time credit status
//     const dbUser = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         id: true,
//         phoneNumber: true,
//         shopName: true,
//         role: true,
//         approvalStatus: true,
//         preferredLanguage: true,
//         canOrderOnCredit: true, // <-- Supplies credit permission
//         creditLimit: true,      // <-- Supplies dynamic credit limit
//         usedCredit: true,
//         gpsLatitude: true,
//         gpsLongitude: true,
//         createdAt: true,
//       },
//     });

//     if (!dbUser) {
//       return res.status(404).json({ error: 'ተጠቃሚው አልተገኘም' });
//     }

//     // Return both formats for frontend compatibility
//     return res.status(200).json({
//       ...dbUser,
//       user: dbUser,
//     });
//   } catch (err: any) {
//     return res.status(404).json({ error: err.message });
//   }
// });

// router.patch('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise => {
//   try {
//     const body = updateProfileSchema.parse(req.body);
//     const profile = await AuthService.updateProfile(req.user!.userId, body);
//     return res.status(200).json(profile);
//   } catch (err: any) {
//     return res.status(400).json({ error: err.message || 'መረጃ ማስተካከል አልተቻለም' });
//   }
// });

// export default router;
import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { requireAuth, AuthenticatedRequest } from '../../middlewares/auth.middleware';
import prisma from '../../config/db';

const router = Router();

// ----------------------------------------------------
// 1. ADMIN & WEB PORTAL LOGIN (WITH DYNAMIC RBAC)
// ----------------------------------------------------
const adminLoginSchema = z.object({
  phone: z.string().min(9).optional(),
  phoneNumber: z.string().min(9).optional(),
  password: z.string().min(1, 'የይለፍ ቃል ያስገቡ'),
}).refine((data) => data.phone || data.phoneNumber, {
  message: 'ትክክለኛ ስልክ ቁጥር ያስገቡ',
});

router.post('/login', async (req, res: Response) => {
  try {
    const parsed = adminLoginSchema.parse(req.body);
    const targetPhone = (parsed.phone || parsed.phoneNumber)!;
    const result = await AuthService.adminLogin(targetPhone, parsed.password);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(401).json({ error: err.message || 'መግባት አልተቻለም' });
  }
});

// ----------------------------------------------------
// 2. MOBILE APP OTP & PROFILE ROUTES
// ----------------------------------------------------
const sendOtpSchema = z.object({
  phoneNumber: z.string().min(9, 'ትክክለኛ ስልክ ቁጥር ያስገቡ'),
});

const verifyOtpSchema = z.object({
  phoneNumber: z.string().min(9),
  code: z.string().length(4, 'ኮዱ 4 አሃዝ መሆን አለበት'),
  shopName: z.string().optional(),
  preferredLanguage: z.enum(['am', 'om']).optional(),
  gpsLatitude: z.number().optional(),
  gpsLongitude: z.number().optional(),
});

router.post('/send-otp', async (req, res: Response) => {
  try {
    const body = sendOtpSchema.parse(req.body);
    const result = await AuthService.sendOtp(body);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'OTP መላክ አልተቻለም' });
  }
});

router.post('/verify-otp', async (req, res: Response) => {
  try {
    const body = verifyOtpSchema.parse(req.body);
    const result: any = await AuthService.verifyOtp(body);

    // Ensure the response delivers live credit permissions to mobile storage
    const userId = result?.user?.id || result?.userId;
    if (userId) {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          phoneNumber: true,
          shopName: true,
          role: true,
          canOrderOnCredit: true,
          creditLimit: true,
          usedCredit: true,
        },
      });

      if (dbUser) {
        result.user = {
          ...result.user,
          ...dbUser,
        };
      }
    }

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'ማረጋገጥ አልተቻለም' });
  }
});

const updateProfileSchema = z.object({
  shopName: z.string().min(1).optional(),
  preferredLanguage: z.enum(['am', 'om']).optional(),
});

// ----------------------------------------------------
// 3. GET /me (Delivers live credit permissions)
// ----------------------------------------------------
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Fetch the database record directly to ensure real-time credit status
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phoneNumber: true,
        shopName: true,
        role: true,
        approvalStatus: true,
        preferredLanguage: true,
        canOrderOnCredit: true, // <-- Supplies credit permission
        creditLimit: true,      // <-- Supplies dynamic credit limit
        usedCredit: true,
        gpsLatitude: true,
        gpsLongitude: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'ተጠቃሚው አልተገኘም' });
    }

    // Return both formats for frontend compatibility
    return res.status(200).json({
      ...dbUser,
      user: dbUser,
    });
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
});

router.patch('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = updateProfileSchema.parse(req.body);
    const profile = await AuthService.updateProfile(req.user!.userId, body);
    return res.status(200).json(profile);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'መረጃ ማስተካከል አልተቻለም' });
  }
});

export default router;