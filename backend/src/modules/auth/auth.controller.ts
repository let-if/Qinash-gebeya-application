
// import { Router, Response } from 'express';
// import { z } from 'zod';
// import { AuthService } from './auth.service';
// import { requireAuth, AuthenticatedRequest } from '../../middlewares/auth.middleware';

// const router = Router();

// // ----------------------------------------------------
// // 1. ADMIN & WEB PORTAL LOGIN
// // ----------------------------------------------------
// const adminLoginSchema = z.object({
//   phone: z.string().min(9, 'ትክክለኛ ስልክ ቁጥር ያስገቡ'),
//   password: z.string().min(1, 'የይለፍ ቃል ያስገቡ'),
// });

// router.post('/login', async (req, res: Response): Promise => {
//   try {
//     const { phone, password } = adminLoginSchema.parse(req.body);
//     const result = await AuthService.adminLogin(phone, password);
//     return res.status(200).json(result);
//   } catch (err: any) {
//     return res.status(401).json({ error: err.message || 'መግባት አልተቻለም' });
//   }
// });

// // ----------------------------------------------------
// // 2. MOBILE APP OTP & PROFILE ROUTES (ORIGINAL INTACT)
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

// router.post('/send-otp', async (req, res: Response) => {
//   try {
//     const body = sendOtpSchema.parse(req.body);
//     const result = await AuthService.sendOtp(body);
//     return res.status(200).json(result);
//   } catch (err: any) {
//     return res.status(400).json({ error: err.message || 'OTP መላክ አልተቻለም' });
//   }
// });

// router.post('/verify-otp', async (req, res: Response) => {
//   try {
//     const body = verifyOtpSchema.parse(req.body);
//     const result = await AuthService.verifyOtp(body);
//     return res.status(200).json(result);
//   } catch (err: any) {
//     return res.status(400).json({ error: err.message || 'ማረጋገጥ አልተቻለም' });
//   }
// });

// const updateProfileSchema = z.object({
//   shopName: z.string().min(1).optional(),
//   preferredLanguage: z.enum(['am', 'om']).optional(),
// });

// router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const profile = await AuthService.getProfile(req.user!.userId);
//     return res.status(200).json(profile);
//   } catch (err: any) {
//     return res.status(404).json({ error: err.message });
//   }
// });

// router.patch('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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

const router = Router();

// ----------------------------------------------------
// 1. ADMIN & WEB PORTAL LOGIN (WITH DYNAMIC RBAC)
// ----------------------------------------------------
const adminLoginSchema = z.object({
  phone: z.string().min(9, 'ትክክለኛ ስልክ ቁጥር ያስገቡ'),
  password: z.string().min(1, 'የይለፍ ቃል ያስገቡ'),
});

router.post('/login', async (req, res: Response): Promise<any> => {
  try {
    const { phone, password } = adminLoginSchema.parse(req.body);
    const result = await AuthService.adminLogin(phone, password);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(401).json({ error: err.message || 'መግባት አልተቻለም' });
  }
});

// ----------------------------------------------------
// 2. MOBILE APP OTP & PROFILE ROUTES (ORIGINAL INTACT)
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

router.post('/send-otp', async (req, res: Response): Promise<any> => {
  try {
    const body = sendOtpSchema.parse(req.body);
    const result = await AuthService.sendOtp(body);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'OTP መላክ አልተቻለም' });
  }
});

router.post('/verify-otp', async (req, res: Response): Promise<any> => {
  try {
    const body = verifyOtpSchema.parse(req.body);
    const result = await AuthService.verifyOtp(body);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'ማረጋገጥ አልተቻለም' });
  }
});

const updateProfileSchema = z.object({
  shopName: z.string().min(1).optional(),
  preferredLanguage: z.enum(['am', 'om']).optional(),
});

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const profile = await AuthService.getProfile(req.user!.userId);
    return res.status(200).json(profile);
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
});

router.patch('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const body = updateProfileSchema.parse(req.body);
    const profile = await AuthService.updateProfile(req.user!.userId, body);
    return res.status(200).json(profile);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'መረጃ ማስተካከል አልተቻለም' });
  }
});

export default router;