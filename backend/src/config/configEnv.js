"use strict";
// Import the 'path' module to get the absolute path of the .env file
import path from "node:path";
import { fileURLToPath } from "url";

// Obtener __filename y __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Get the absolute path of the .env file. */
const envFilePath = path.resolve(__dirname, "../../.env");
// Load environment variables from the .env file
import dotenv from "dotenv";
dotenv.config({ path: envFilePath });

/**
 * Validates that all required environment variables are present
 * @throws {Error} If any required environment variable is missing
 */
function validateEnvironment() {
  const requiredVars = [
    'DB_URL',
    'ACCESS_JWT_SECRET',
    'REFRESH_JWT_SECRET'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  console.log('✅ Environment variables validated successfully');
}

// Validate environment on module load
validateEnvironment();

/** Server port */
export const PORT = process.env.PORT || 3000;
/** Server host */
export const HOST = process.env.HOST || 'localhost';
/** Database URL */
export const DB_URL = process.env.DB_URL;
/** Access token secret */
export const ACCESS_JWT_SECRET = process.env.ACCESS_JWT_SECRET;
/** Refresh token secret */
export const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET;
