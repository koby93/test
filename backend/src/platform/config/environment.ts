import { z } from 'zod';

const boolean = z.enum(['true', 'false']).transform(value => value === 'true');
const optionalUrl = z.preprocess(value => value === '' ? undefined : value, z.string().url().optional());
export const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().url().refine(value => /^postgres(ql)?:/.test(value), 'PostgreSQL URL required'),
  REDIS_URL: z.string().url().refine(value => /^rediss?:/.test(value), 'Redis URL required'),
  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().min(1).default('us-east-1'),
  S3_ACCESS_KEY: z.string().min(3),
  S3_SECRET_KEY: z.string().min(8),
  S3_BUCKET: z.string().regex(/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
  OIDC_ENABLED: boolean.default(false),
  OIDC_ISSUER_URL: optionalUrl,
  OIDC_JWKS_URI: optionalUrl,
  OIDC_AUDIENCE: z.preprocess(value => value === '' ? undefined : value, z.string().min(1).optional()),
  OIDC_REQUIRE_MFA: boolean.default(false),
  OIDC_MFA_ACR: z.string().optional(),
}).superRefine((env, ctx) => {
  if (env.OIDC_ENABLED && (!env.OIDC_ISSUER_URL || !env.OIDC_JWKS_URI || !env.OIDC_AUDIENCE)) {
    ctx.addIssue({ code: 'custom', message: 'OIDC enabled requires issuer, JWKS URI and audience' });
  }
  if (env.OIDC_REQUIRE_MFA && !env.OIDC_ENABLED) {
    ctx.addIssue({ code: 'custom', message: 'MFA requires OIDC authentication' });
  }
  if (env.NODE_ENV === 'production' && !env.OIDC_ENABLED) {
    ctx.addIssue({ code: 'custom', message: 'Production requires OIDC authentication' });
  }
});
export type PlatformEnvironment = z.infer<typeof environmentSchema>;
export function validateEnvironment(input: Record<string, unknown>): PlatformEnvironment {
  const result = environmentSchema.safeParse(input);
  if (!result.success) {
    // Do not include provided values: URLs may contain secrets.
    throw new Error('Invalid platform configuration: ' + result.error.issues.map(issue => `${issue.path.join('.') || 'authentication'}: ${issue.message}`).join('; '));
  }
  return result.data;
}
