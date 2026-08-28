import { IdempotencyStore } from '../src/common/idempotency/idempotency.store';

describe('IdempotencyStore', () => {
  let store: IdempotencyStore;

  beforeEach(() => {
    store = new IdempotencyStore();
  });

  it('returns undefined for an unseen key', () => {
    expect(store.get('unseen-key')).toBeUndefined();
  });

  it('replays a saved response for a repeated key', () => {
    store.save('key-1', 201, { id: 'tx_1', amountMinor: 500 });

    const replayed = store.get('key-1');
    expect(replayed).toEqual({ status: 201, body: { id: 'tx_1', amountMinor: 500 } });
  });

  it('prevents a second concurrent request from acquiring the same key', () => {
    expect(store.tryLock('key-2')).toBe(true);
    expect(store.tryLock('key-2')).toBe(false); // already locked

    store.releaseLock('key-2');
    expect(store.tryLock('key-2')).toBe(true); // free again after release
  });

  it('expires records after the TTL and sweeps them', () => {
    const realNow = Date.now;
    let now = 1_000_000_000_000;
    Date.now = () => now;

    store.save('key-3', 200, { ok: true });
    expect(store.get('key-3')).toBeDefined();

    now += 25 * 60 * 60 * 1000; // fast-forward 25 hours, past the 24h TTL
    expect(store.get('key-3')).toBeUndefined();

    Date.now = realNow;
  });
});
