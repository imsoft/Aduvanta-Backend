import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppConfigService } from '../../config/config.service.js';
import { DOCUMENT_UPLOAD_MIME_TYPES } from '../../common/uploads/file-upload.config.js';

// S3 permite hasta 7 días para URLs firmadas con credenciales IAM de larga
// duración. Cuidado con subir este cap: URLs de mayor TTL tardan más en
// invalidarse si se filtra el enlace. 1 hora es el compromiso que usamos
// en portal/documents/exports.
const MAX_PRESIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour
const MIN_PRESIGNED_URL_TTL_SECONDS = 30;

@Injectable()
export class StorageService {
  private readonly client: S3Client | null;
  private readonly bucket: string | undefined;

  constructor(private readonly config: AppConfigService) {
    const accessKeyId = this.config.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get('AWS_SECRET_ACCESS_KEY');
    const region = this.config.get('S3_REGION');
    const endpoint = this.config.get('S3_ENDPOINT');

    this.bucket = this.config.get('S3_BUCKET');

    if (accessKeyId && secretAccessKey && region) {
      this.client = new S3Client({
        region,
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: !!endpoint, // required for non-AWS S3-compatible services
      });
    } else {
      this.client = null;
    }
  }

  async upload(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<{ key: string; bucket: string }> {
    this.assertConfigured();
    this.assertAllowedContentType(contentType);

    await this.client!.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    return { key, bucket: this.bucket! };
  }

  async getPresignedUrl(
    key: string,
    expiresInSeconds: number,
  ): Promise<string> {
    this.assertConfigured();

    const clamped = Math.min(
      Math.max(expiresInSeconds, MIN_PRESIGNED_URL_TTL_SECONDS),
      MAX_PRESIGNED_URL_TTL_SECONDS,
    );

    return getSignedUrl(
      this.client!,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: clamped },
    );
  }

  async delete(key: string): Promise<void> {
    this.assertConfigured();

    await this.client!.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  isConfigured(): boolean {
    return this.client !== null && !!this.bucket;
  }

  private assertConfigured(): void {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'Storage is not configured. Set S3_BUCKET, S3_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.',
      );
    }
  }

  private assertAllowedContentType(contentType: string): void {
    if (!DOCUMENT_UPLOAD_MIME_TYPES.has(contentType)) {
      throw new BadRequestException(
        `Content type "${contentType}" is not allowed for storage uploads.`,
      );
    }
  }
}
