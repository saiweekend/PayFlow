import type {
  ApiErrorBody,
  CreateTransferRequest,
  LoginRequest,
  LoginResponse,
  Transaction,
  Wallet,
} from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly path: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL = '/api/v1';

/** Read from the same in-memory store the auth Pinia store writes to. */
let currentToken: string | null = null;
export function setAuthToken(token: string | null): void {
  currentToken = token;
}

async function request<T>(
  path: string,
  options: RequestInit & { idempotencyKey?: string } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (currentToken) headers.set('Authorization', `Bearer ${currentToken}`);
  if (options.idempotencyKey) headers.set('Idempotency-Key', options.idempotencyKey);

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    let body: ApiErrorBody | undefined;
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      /* non-JSON error body, fall through to generic message */
    }
    const message = Array.isArray(body?.message)
      ? body!.message.join(', ')
      : (body?.message ?? response.statusText);
    throw new ApiError(message, response.status, path);
  }

  // 204 No Content etc.
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  login: (payload: LoginRequest) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getBalance: () => request<Wallet>('/wallet/balance'),

  listTransactions: () => request<Transaction[]>('/transactions'),

  /**
   * `idempotencyKey` must be generated once per *user intent* to send money
   * (e.g. when the confirm modal opens) and reused across retries of that
   * same attempt — see stores/transactions.ts for where it's created. If
   * you generate a new key on every retry you defeat the entire point of
   * the header.
   */
  transfer: (payload: CreateTransferRequest, idempotencyKey: string) =>
    request<Transaction>('/transactions/transfer', {
      method: 'POST',
      body: JSON.stringify(payload),
      idempotencyKey,
    }),
};
