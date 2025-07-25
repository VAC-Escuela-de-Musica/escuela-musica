import * as Minio from "minio";
import { 
  MINIO_ENDPOINT, 
  MINIO_PORT, 
  MINIO_USE_SSL, 
  MINIO_ACCESS_KEY, 
  MINIO_SECRET_KEY, 
  MINIO_BUCKET_NAME,
  MINIO_PUBLIC_BUCKET,
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
    // Configurar bucket principal (materiales)
    const bucketExists = await minioClient.bucketExists(MINIO_BUCKET_NAME);
    
    if (!bucketExists) {
      // Crear el bucket si no existe
      await minioClient.makeBucket(MINIO_BUCKET_NAME, "us-east-1");
      // eslint-disable-next-line no-console
      console.log(`=> Bucket "${MINIO_BUCKET_NAME}" creado exitosamente`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`=> Bucket '${MINIO_BUCKET_NAME}' ya existe`);
    }

    // Configurar bucket público (imagenes-publicas)
    const publicBucketExists = await minioClient.bucketExists(MINIO_PUBLIC_BUCKET);
    
    if (!publicBucketExists) {
      // Crear el bucket público si no existe
      await minioClient.makeBucket(MINIO_PUBLIC_BUCKET, "us-east-1");
      // eslint-disable-next-line no-console
      console.log(`=> Bucket público "${MINIO_PUBLIC_BUCKET}" creado exitosamente`);
      
      // Configurar política pública para el bucket (solo lectura)
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${MINIO_PUBLIC_BUCKET}/*`],
          },
        ],
      };
      
      await minioClient.setBucketPolicy(MINIO_PUBLIC_BUCKET, JSON.stringify(policy));
      // eslint-disable-next-line no-console
      console.log(`=> Política pública configurada para el bucket '${MINIO_PUBLIC_BUCKET}'`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`=> Bucket público '${MINIO_PUBLIC_BUCKET}' ya existe`);
      
      // Verificar si ya tiene política pública
      try {
        await minioClient.getBucketPolicy(MINIO_PUBLIC_BUCKET);
        // eslint-disable-next-line no-console
        console.log(`=> Política pública ya configurada para '${MINIO_PUBLIC_BUCKET}'`);
      } catch (policyError) {
        // Si no tiene política, configurarla
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { AWS: ["*"] },
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${MINIO_PUBLIC_BUCKET}/*`],
            },
          ],
        };
        
        await minioClient.setBucketPolicy(MINIO_PUBLIC_BUCKET, JSON.stringify(policy));
        // eslint-disable-next-line no-console
        console.log(`=> Política pública configurada para el bucket '${MINIO_PUBLIC_BUCKET}'`);
      }
    }
  } catch (err) {
    handleError(err, "/config/minio.config.js -> setupMinIO");
  }
}

export { MINIO_BUCKET_NAME, MINIO_PUBLIC_BUCKET };
export default minioClient;
