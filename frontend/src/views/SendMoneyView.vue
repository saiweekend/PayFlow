<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import AmountInput from '@/components/AmountInput.vue';
import ConfirmTransferModal from '@/components/ConfirmTransferModal.vue';
import QrScannerModal from '@/components/QrScannerModal.vue';
import { useAuthStore } from '@/stores/auth';
import { useWalletStore } from '@/stores/wallet';
import { useTransactionsStore } from '@/stores/transactions';
import { validateTransfer } from '@/utils/validation';

const auth = useAuthStore();
const wallet = useWalletStore();
const { balanceMinor } = storeToRefs(wallet);
const transactions = useTransactionsStore();
const router = useRouter();

const form = reactive({
  recipientId: '',
  amountMinor: null as number | null,
  memo: '',
});

const showQr = ref(false);
const showConfirm = ref(false);

const validation = computed(() =>
  validateTransfer({
    recipientId: form.recipientId,
    amountMinor: form.amountMinor,
    senderBalanceMinor: balanceMinor.value,
    senderId: auth.email ?? '',
    memo: form.memo,
  }),
);

function openConfirm(): void {
  if (!validation.value.valid) return;
  transactions.beginTransferAttempt(); // mints the idempotency key for this attempt
  showConfirm.value = true;
}

async function confirmSend(): Promise<void> {
  if (form.amountMinor === null) return;
  try {
    await transactions.submitTransfer({
      recipientId: form.recipientId,
      amountMinor: form.amountMinor,
      currency: 'JPY',
      memo: form.memo || undefined,
    });
    showConfirm.value = false;
    router.push('/history');
  } catch {
    // Modal stays open and shows transactions.sendError; the same
    // idempotency key is reused if the user clicks "Retry".
  }
}

function onScanned(recipientId: string): void {
  form.recipientId = recipientId;
  showQr.value = false;
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-slate-900">
      Send money
    </h1>

    <div class="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <div>
        <label
          class="block text-sm font-medium text-slate-700 mb-1"
          for="recipient"
        >Recipient</label>
        <div class="flex gap-2">
          <input
            id="recipient"
            v-model="form.recipientId"
            placeholder="usr_2"
            class="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
          >
          <button
            type="button"
            class="px-4 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50"
            @click="showQr = true"
          >
            Scan QR
          </button>
        </div>
        <p
          v-if="validation.errors.recipientId"
          class="mt-1 text-sm text-red-600"
        >
          {{ validation.errors.recipientId }}
        </p>
      </div>

      <AmountInput
        v-model="form.amountMinor"
        :error="validation.errors.amountMinor"
      />

      <div>
        <label
          class="block text-sm font-medium text-slate-700 mb-1"
          for="memo"
        >Memo (optional)</label>
        <input
          id="memo"
          v-model="form.memo"
          maxlength="140"
          class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
        >
      </div>

      <button
        type="button"
        class="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-40"
        :disabled="!validation.valid"
        @click="openConfirm"
      >
        Review transfer
      </button>
    </div>

    <ConfirmTransferModal
      :open="showConfirm"
      :recipient-id="form.recipientId"
      :amount-minor="form.amountMinor ?? 0"
      :memo="form.memo"
      :submitting="transactions.sendState === 'sending'"
      :error-message="transactions.sendError"
      @confirm="confirmSend"
      @cancel="showConfirm = false"
    />

    <QrScannerModal
      :open="showQr"
      @scanned="onScanned"
      @cancel="showQr = false"
    />
  </div>
</template>
