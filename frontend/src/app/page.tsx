import { getPlatformHealth } from '@/lib/health';
import { PlatformOverview } from '@/components/platform-overview';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const health = await getPlatformHealth();
  const docsUrl = `${process.env.API_PUBLIC_URL || 'http://localhost:4000'}/api/v1/docs`;
  return <PlatformOverview health={health} docsUrl={docsUrl} />;
}
