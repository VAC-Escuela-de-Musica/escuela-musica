'use strict'

import { ACCESS_JWT_SECRET, REFRESH_JWT_SECRET, PORT, HOST, DB_URL } from './configEnv.js'
import { JWT, MINIO_BUCKETS, RATE_LIMIT } from '../constants/index.js'

/**
 * Configuración centralizada de la aplicación
 */
export const config = {
  server: {
    port: PORT || 3000,
    host: HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development'
  },

  database: {
    url: DB_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    }
  },

  jwt: {
    accessSecret: ACCESS_JWT_SECRET,
    refreshSecret: REFRESH_JWT_SECRET,
    accessExpiresIn: JWT.ACCESS_EXPIRES_IN,
    refreshExpiresIn: JWT.REFRESH_EXPIRES_IN
  },

  minio: {
    endpoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    buckets: {
      private: process.env.MINIO_BUCKET_PRIVATE || MINIO_BUCKETS.PRIVATE,
      public: process.env.MINIO_BUCKET_PUBLIC || MINIO_BUCKETS.PUBLIC,
      galery: process.env.MINIO_BUCKET_GALERY || MINIO_BUCKETS.GALERY,
      temp: process.env.MINIO_TEMP_BUCKET || MINIO_BUCKETS.TEMP
    }
  },

  cors: {
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  rateLimit: {
    windowMs: RATE_LIMIT.WINDOW_MS,
    max: RATE_LIMIT.MAX_REQUESTS,
    auth: {
      windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
      max: RATE_LIMIT.AUTH_MAX_REQUESTS
    }
  },

  security: {
    bcryptSaltRounds: 10,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    }
  },

  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  },

  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'audio/mpeg',
      'audio/wav',
      'video/mp4',
      'video/avi'
    ]
  }
}
