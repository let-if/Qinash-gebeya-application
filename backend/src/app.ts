
// import express from 'express';
// import cors from 'cors';
// import authRoutes from './modules/auth/auth.controller';
// import catalogRoutes from './modules/catalog/catalog.controller';
// import orderRoutes from './modules/orders/orders.controller';

// const app = express();

// // Allowed frontend origins: Admin Web (5173) + Expo Web / Metro (8081, 19006, 8082)
// const allowedOrigins = [
//   'http://localhost:5173',
//   'http://127.0.0.1:5173',
//   'http://localhost:8081',
//   'http://127.0.0.1:8081',
//   'http://localhost:8082',
//   'http://localhost:19006',
// ];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // Allow mobile apps, curl/Postman requests (which have no origin header)
//       if (!origin || allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }
//       return callback(null, true); // Alternatively permits any local dev origin
//     },
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
//   })
// );

// app.use(express.json());

// // Health Check
// app.get('/health', (_req, res) => {
//   res.json({ status: 'ok', service: 'B2B Retail Backend', version: '2.1' });
// });

// // Mount Modules
// app.use('/api/auth', authRoutes);
// app.use('/api/catalog', catalogRoutes);
// app.use('/api/orders', orderRoutes);

// export default app;
import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './modules/auth/auth.controller';
import catalogRoutes from './modules/catalog/catalog.controller';
import orderRoutes from './modules/orders/orders.controller';
import adminOpsRoutes from './modules/admin/admin.controller';
import smsInboundRoutes from './modules/sms/sms-inbound.controller';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:8082',
  'http://localhost:19006',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded videos and images statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health Check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'B2B Retail Backend', version: '2.1' });
});

// Mount Modules
app.use('/api/auth', authRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminOpsRoutes);
app.use('/api/sms', smsInboundRoutes);

export default app;