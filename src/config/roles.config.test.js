import { describe, it, expect } from 'vitest';
import { getNavForRole, ROLES } from './roles.config';

describe('config/roles.config.js', () => {
  it('returns permitted nav items for EMPLOYEE', () => {
    const nav = getNavForRole(ROLES.EMPLOYEE);
    expect(nav.map((n) => n.path)).toEqual(['/employee']);
  });

  it('returns permitted nav items for MANAGER', () => {
    const nav = getNavForRole(ROLES.MANAGER);
    expect(nav.map((n) => n.path)).toEqual(['/manager']);
  });

  it('returns permitted nav items for FINANCE', () => {
    const nav = getNavForRole(ROLES.FINANCE);
    const paths = nav.map((n) => n.path);
    expect(paths).toContain('/finance/batch-review');
    expect(paths).toContain('/finance/payout-batches');
  });

  it('returns permitted nav items for ADMIN', () => {
    const nav = getNavForRole(ROLES.ADMIN);
    expect(nav.map((n) => n.path)).toEqual(['/admin']);
  });

  it('returns empty array [] for unknown or empty role', () => {
    expect(getNavForRole('UNKNOWN_ROLE')).toEqual([]);
    expect(getNavForRole(null)).toEqual([]);
    expect(getNavForRole(undefined)).toEqual([]);
  });
});
