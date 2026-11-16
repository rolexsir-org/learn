import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncWorkerService } from '../services/SyncWorkerService';
import { StorageService } from '../services/StorageService';

// Mock StorageService
vi.mock('../services/StorageService', () => ({
  StorageService: {
    getItemSync: vi.fn(),
    setItem: vi.fn(),
  }
}));

describe('SyncWorkerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct online status', () => {
    const status = SyncWorkerService.getStatus();
    expect(status.isOnline).toBe(true);
    expect(status.isSyncing).toBe(false);
  });

  it('enqueues items correctly', () => {
    const payload = { test: 'data' };
    SyncWorkerService.enqueue('CHECKPOINT_STATE', payload, 'user123');

    const status = SyncWorkerService.getStatus();
    expect(status.pendingCount).toBeGreaterThan(0);
    expect(StorageService.setItem).toHaveBeenCalled();
  });
});
