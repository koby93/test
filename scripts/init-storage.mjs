import {
  S3Client, HeadBucketCommand, CreateBucketCommand, DeleteBucketPolicyCommand,
} from '@aws-sdk/client-s3';

const bucket = process.env.S3_BUCKET;
const region = process.env.S3_REGION || 'us-east-1';
if (!bucket) throw new Error('S3_BUCKET is required.');
const client = new S3Client({
  region,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
});
try {
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch (error) {
    if (error?.$metadata?.httpStatusCode !== 404) throw error;
    await client.send(new CreateBucketCommand({
      Bucket: bucket,
      ...(region === 'us-east-1' ? {} : { CreateBucketConfiguration: { LocationConstraint: region } }),
    }));
  }
  await client.send(new DeleteBucketPolicyCommand({ Bucket: bucket }));
  console.log('Records bucket initialized with private access.');
} finally {
  client.destroy();
}
