import * as React from 'react';
import { cn } from '@/lib/utils';
export function Card({ className, ...props }: React.ComponentProps<'div'>) { return <div data-slot="card" className={cn('rounded-xl border border-border bg-card text-card-foreground shadow-sm', className)} {...props} />; }
export function CardHeader({ className, ...props }: React.ComponentProps<'div'>) { return <div data-slot="card-header" className={cn('p-5 pb-3', className)} {...props} />; }
export function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) { return <h3 data-slot="card-title" className={cn('text-base font-semibold tracking-tight', className)} {...props} />; }
export function CardContent({ className, ...props }: React.ComponentProps<'div'>) { return <div data-slot="card-content" className={cn('px-5 pb-5', className)} {...props} />; }
