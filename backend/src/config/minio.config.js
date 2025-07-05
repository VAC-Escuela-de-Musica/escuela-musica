import * as Minio from "minio";
import { 
  MINIO_ENDPOINT, 
  MINIO_PORT, 
  MINIO_USE_SSL, 
  MINIO_ACCESS_KEY, 
  MINIO_SECRET_KEY, 
  MINIO_BUCKET_NAME,
} from "./configEnv.js";
import { handleError } from "../utils/errorHandler.js";

// Crear cliente MinIO
const minioClient = new Minio.Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

/**
 * Inicializa MinIO y crea el bucket si no existe
 */
export async function setupMinIO() {
  try {
    // Verificar si el bucket existe
    const bucketExists = await minioClient.bucketExists(MINIO_BUCKET_NAME);
    
    if (!bucketExists) {
      // Crear el bucket si no existe
      await minioClient.makeBucket(MINIO_BUCKET_NAME, "us-east-1");
      // eslint-disable-next-line no-console
      console.log(`=> Bucket "${MINIO_BUCKET_NAME}" creado exitosamente`);
      
      // Configurar política pública para el bucket (solo lectura)
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${MINIO_BUCKET_NAME}/*`],
          },
        ],
      };
      
      await minioClient.setBucketPolicy(MINIO_BUCKET_NAME, JSON.stringify(policy));
      // eslint-disable-next-line no-console
      console.log(`=> Política pública configurada para el bucket '${MINIO_BUCKET_NAME}'`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`=> Bucket '${MINIO_BUCKET_NAME}' ya existe`);
    }
  } catch (err) {
    handleError(err, "/config/minio.config.js -> setupMinIO");
  }
}

export { MINIO_BUCKET_NAME };
export default minioClient;
