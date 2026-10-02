'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <Button variant="outline" size="sm" disabled={pending} onClick={() => startTransition(() => router.refresh())}><RefreshCw className={pending ? 'size-3.5 animate-spin' : 'size-3.5'} />{pending ? 'Checking…' : 'Refresh status'}</Button>;
}
