import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';
@Injectable()
export class StorageService implements OnModuleDestroy {
  readonly client: S3Client;
  readonly bucket: string;
  constructor(config: ConfigService) {
    this.bucket = config.getOrThrow<string>('S3_BUCKET');
    this.client = new S3Client({
      endpoint: config.getOrThrow<string>('S3_ENDPOINT'), region: config.getOrThrow<string>('S3_REGION'), forcePathStyle: true,
      credentials: { accessKeyId: config.getOrThrow<string>('S3_ACCESS_KEY'), secretAccessKey: config.getOrThrow<string>('S3_SECRET_KEY') },
      maxAttempts: 1, requestHandler: new NodeHttpHandler({ connectionTimeout: 2000, requestTimeout: 2500 }),
    });
  }
  async ping() { await this.client.send(new HeadBucketCommand({ Bucket: this.bucket })); }
  onModuleDestroy() { this.client.destroy(); }
}
