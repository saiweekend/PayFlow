export interface TransferValidationInput {
  recipientId: string;
  amountMinor: number | null;
  senderBalanceMinor: number;
  senderId: string;
  memo?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<'recipientId' | 'amountMinor' | 'memo', string>>;
}

const MAX_TRANSFER_MINOR = 1_000_000;
const MAX_MEMO_LENGTH = 140;

/**
 * Client-side mirror of the backend's CreateTransferDto rules. This is
 * intentionally duplicated (not "the source of truth") — its only job is to
 * give the user instant feedback before a network round trip. The backend
 * DTO validation in transactions/dto/create-transfer.dto.ts is what actually
 * enforces the rule; a client check can always be bypassed by a modified
 * client or a direct API call, so it's never trusted for the security
 * decision, only for UX.
 */
export function validateTransfer(input: TransferValidationInput): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  if (!input.recipientId.trim()) {
    errors.recipientId = 'Choose a recipient.';
  } else if (input.recipientId === input.senderId) {
    errors.recipientId = "You can't send money to yourself.";
  }

  if (input.amountMinor === null) {
    errors.amountMinor = 'Enter a valid amount.';
  } else if (input.amountMinor <= 0) {
    errors.amountMinor = 'Amount must be greater than zero.';
  } else if (input.amountMinor > MAX_TRANSFER_MINOR) {
    errors.amountMinor = 'Amount exceeds the per-transfer limit.';
  } else if (input.amountMinor > input.senderBalanceMinor) {
    errors.amountMinor = 'Insufficient balance.';
  }

  if (input.memo && input.memo.length > MAX_MEMO_LENGTH) {
    errors.memo = `Memo must be ${MAX_MEMO_LENGTH} characters or fewer.`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
