import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppConfigService } from '../../config/config.service.js';

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

  async getPresignedUrl(key: string, expiresInSeconds: number): Promise<string> {
    this.assertConfigured();

    return getSignedUrl(
      this.client!,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: expiresInSeconds },
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
}
