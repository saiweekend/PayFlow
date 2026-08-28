import { Injectable } from '@nestjs/common';

interface IdempotencyRecord {
  /** HTTP status + body captured from the first successful execution. */
  status: number;
  body: unknown;
  /** epoch ms after which this record is considered stale and evictable. */
  expiresAt: number;
}

/**
 * In-memory idempotency-key store.
 *
 * Why this exists: a mobile client on a flaky network will retry a POST
 * /transfers request it never saw a response for. Without an idempotency
 * layer, that retry becomes a second, real transfer of money. Every major
 * payments API (Stripe, PayPal, and — per the job posting — PayPay's own
 * transfer endpoints) solves this the same way: the client generates a
 * unique `Idempotency-Key` per *logical* operation and sends it on every
 * attempt; the server remembers the outcome of the first attempt and replays
 * it for any retry with the same key, instead of re-executing the operation.
 *
 * This demo keeps the store in memory with a TTL sweep, which is enough to
 * prove the concept; a production system would back this with Redis (or a
 * unique constraint in the primary DB) so it survives process restarts and
 * works across multiple API instances.
 */
@Injectable()
export class IdempotencyStore {
  private readonly records = new Map<string, IdempotencyRecord>();
  private readonly ttlMs = 24 * 60 * 60 * 1000; // 24h, matches Stripe's default

  /** Returns the previously recorded response for this key, if any and not expired. */
  get(key: string): { status: number; body: unknown } | undefined {
    const record = this.records.get(key);
    if (!record) return undefined;
    if (record.expiresAt < Date.now()) {
      this.records.delete(key);
      return undefined;
    }
    return { status: record.status, body: record.body };
  }

  /** Records the outcome of the first successful attempt for this key. */
  save(key: string, status: number, body: unknown): void {
    this.records.set(key, { status, body, expiresAt: Date.now() + this.ttlMs });
  }

  /** Marks a key as "in flight" to reject concurrent duplicate requests racing each other. */
  private readonly inFlight = new Set<string>();

  tryLock(key: string): boolean {
    if (this.inFlight.has(key)) return false;
    this.inFlight.add(key);
    return true;
  }

  releaseLock(key: string): void {
    this.inFlight.delete(key);
  }

  /** Periodic sweep so the map doesn't grow unbounded; call from a cron/interval in production. */
  sweepExpired(): number {
    const now = Date.now();
    let removed = 0;
    for (const [key, record] of this.records.entries()) {
      if (record.expiresAt < now) {
        this.records.delete(key);
        removed += 1;
      }
    }
    return removed;
  }

  /** Test/debug helper. */
  size(): number {
    return this.records.size;
  }
}
