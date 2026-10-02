import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PlatformOverview } from '../src/components/platform-overview';
import type { PlatformHealth } from '@nita/contracts';
const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
const health: PlatformHealth = { status: 'ok', timestamp: new Date().toISOString(), checks: { database: 'up', redis: 'up', storage: 'up' } };
describe('Foundation overview', () => {
  it('renders actual dependency results and approved verification boundaries', () => {
    render(<PlatformOverview health={health} docsUrl="http://localhost:4000/api/v1/docs" />);
    expect(screen.getAllByText('Operational')).toHaveLength(3);
    expect(screen.getByText(/PPA verifies Technical Clearance only/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Platform overview' })).toBeInTheDocument();
  });
  it('refreshes live health through server rendering', () => {
    render(<PlatformOverview health={health} docsUrl="http://localhost:4000/api/v1/docs" />);
    fireEvent.click(screen.getByRole('button', { name: 'Refresh status' }));
    expect(refresh).toHaveBeenCalledTimes(1);
  });
  it('shows honest unverified states when the API is unavailable', () => {
    render(<PlatformOverview health={{ ...health, status: 'unavailable', checks: { database: 'down', redis: 'down', storage: 'down' } }} docsUrl="http://localhost:4000/api/v1/docs" />);
    expect(screen.getAllByText('Not verified')).toHaveLength(3);
    expect(screen.queryByText('All dependencies operational')).not.toBeInTheDocument();
  });
});
