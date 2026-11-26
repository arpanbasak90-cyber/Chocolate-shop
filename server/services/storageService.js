import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Validates, uploads, and persists chocolate product image
 *
 * @param {Object} params
 * @param {string} params.image - Base64 Data URI (e.g. data:image/jpeg;base64,...)
 * @param {string} [params.filename] - Original filename for sanitization
 * @returns {Promise<{ url: string, provider: string, bytes: number }>}
 */
export async function uploadProductImage({ image, filename = 'chocolate' }) {
  if (!image || typeof image !== 'string') {
    const error = new Error('Invalid image payload: Base64 image data is required.');
    error.statusCode = 400;
    throw error;
  }

  // Parse Data URI: data:<mimeType>;base64,<data>
  const match = image.match(/^data:([^;]+);base64,(.+)$/i);
  if (!match) {
    const error = new Error('Invalid image format: Must be a base64 Data URI (e.g. data:image/jpeg;base64,...).');
    error.statusCode = 400;
    throw error;
  }

  const mimeType = match[1].toLowerCase().trim();
  const base64Data = match[2];

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    const error = new Error('Unsupported image format. Allowed formats: JPG, JPEG, PNG, WEBP.');
    error.statusCode = 400;
    throw error;
  }

  const buffer = Buffer.from(base64Data, 'base64');
  if (buffer.length > MAX_FILE_SIZE) {
    const error = new Error(`Image size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds 5MB limit. Please upload a smaller image.`);
    error.statusCode = 400;
    throw error;
  }

  // 1. Cloudinary Persistent Cloud Storage
  const cloudName = config.cloudinary?.cloudName?.trim();
  const apiKey = config.cloudinary?.apiKey?.trim();
  const apiSecret = config.cloudinary?.apiSecret?.trim();
  const folder = config.cloudinary?.folder?.trim() || 'zora-shop/products';

  if (cloudName && apiKey && apiSecret) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
      const signature = crypto
        .createHash('sha1')
        .update(paramsToSign + apiSecret)
        .digest('hex');

      const formData = new URLSearchParams();
      formData.append('file', image);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('folder', folder);
      formData.append('signature', signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.secure_url) {
        const reason = data.error?.message || res.statusText || 'Cloudinary upload rejected';
        const error = new Error(`Cloud image upload failed: ${reason}`);
        error.statusCode = res.status >= 400 && res.status < 500 ? 400 : 502;
        throw error;
      }

      console.log(`☁️ Chocolate photo successfully uploaded to Cloudinary: ${data.secure_url}`);
      return {
        url: data.secure_url,
        provider: 'Cloudinary',
        publicId: data.public_id,
        bytes: data.bytes || buffer.length
      };
    } catch (err) {
      if (err.statusCode) throw err;
      console.error('❌ Cloudinary network dispatch error:', err.message);
      const error = new Error('Network error communicating with cloud image storage.');
      error.statusCode = 502;
      throw error;
    }
  }

  // 2. Production Environment Guard
  const isProd = config.nodeEnv === 'production' || Boolean(process.env.VERCEL);
  if (isProd) {
    const error = new Error(
      'Persistent cloud image storage is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in environment variables.'
    );
    error.statusCode = 503;
    throw error;
  }

  // 3. Local Development Fallback Storage
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const cleanBase = (filename || 'chocolate')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30);
  const uniqueFilename = `${cleanBase}-${Date.now()}.${ext}`;

  const uploadsDir = path.resolve(__dirname, '../../public/uploads/products');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const targetPath = path.join(uploadsDir, uniqueFilename);
  fs.writeFileSync(targetPath, buffer);

  const localUrl = `/uploads/products/${uniqueFilename}`;
  console.log(`📁 [Dev Storage] Chocolate photo saved locally: ${localUrl}`);

  return {
    url: localUrl,
    provider: 'Local Development Storage',
    bytes: buffer.length
  };
}
