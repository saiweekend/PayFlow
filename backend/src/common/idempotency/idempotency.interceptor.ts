import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of, tap } from 'rxjs';
import { Request, Response } from 'express';
import { IdempotencyStore } from './idempotency.store';

/**
 * Applies idempotency-key semantics to whatever route it decorates
 * (`@UseInterceptors(IdempotencyInterceptor)` — see transactions.controller.ts).
 *
 * Flow:
 *  1. Require an `Idempotency-Key` header on money-moving requests.
 *  2. If we've already completed a request with this key, replay the saved
 *     response instead of re-running the handler (this is what makes
 *     retries safe).
 *  3. If another request with the same key is *currently* being processed,
 *     reject with 409 rather than letting two transfers race each other.
 *  4. Otherwise run the handler and cache its result for next time.
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly store: IdempotencyStore) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const key = request.header('Idempotency-Key');
    if (!key) {
      throw new BadRequestException(
        'Idempotency-Key header is required for this operation.',
      );
    }

    const cached = this.store.get(key);
    if (cached) {
      response.setHeader('Idempotency-Replayed', 'true');
      response.status(cached.status);
      return of(cached.body);
    }

    if (!this.store.tryLock(key)) {
      throw new ConflictException(
        'A request with this Idempotency-Key is already in progress.',
      );
    }

    return next.handle().pipe(
      tap({
        next: (body) => {
          this.store.save(key, response.statusCode, body);
          this.store.releaseLock(key);
        },
        error: () => this.store.releaseLock(key),
      }),
    );
  }
}
