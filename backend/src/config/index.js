"use strict";

import { ACCESS_JWT_SECRET, REFRESH_JWT_SECRET, PORT, HOST, DB_URL } from "./configEnv.js";

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
      socketTimeoutMS: 45000,
    }
  },
  
  jwt: {
    accessSecret: ACCESS_JWT_SECRET,
    refreshSecret: REFRESH_JWT_SECRET,
    accessExpiresIn: '1d',
    refreshExpiresIn: '7d'
  },
  
  minio: {
    endpoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    buckets: {
      private: process.env.MINIO_BUCKET || 'materiales',
      public: process.env.MINIO_PUBLIC_BUCKET || 'imagenes-publicas'
    }
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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
};

export default config;
