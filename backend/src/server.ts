// import dotenv from 'dotenv';
// dotenv.config();

// import app from './app';

// const PORT = process.env.PORT || 5000;

// app.listen(Number(PORT), '0.0.0.0', () => {
//   console.log(`Retail Aggregator Backend running on http://0.0.0.0:${PORT}`);
// });
import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import app from './app';

// Ensure Cloudinary is configured with valid credentials on startup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'beahlrqy',
  api_key: process.env.CLOUDINARY_API_KEY || '953418283816441',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'RJVVmv3OHuzQ05Zm_l4L_F6SwZo',
  secure: true,
});

const PORT = process.env.PORT || 5000;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Retail Aggregator Backend running on http://0.0.0.0:${PORT}`);
  console.log(`☁️  Cloudinary Account: ${cloudinary.config().cloud_name}`);
  console.log(`==================================================\n`);
});