<script setup lang="ts">
import { formatYen } from '@/utils/currency';

defineProps<{
  open: boolean;
  recipientId: string;
  amountMinor: number;
  memo?: string;
  submitting: boolean;
  errorMessage?: string | null;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      @keydown.esc="emit('cancel')"
    >
      <div class="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <h2 id="confirm-title" class="text-lg font-semibold text-slate-900">Confirm transfer</h2>
        <dl class="mt-4 space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-slate-500">To</dt>
            <dd class="font-medium text-slate-800">{{ recipientId }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500">Amount</dt>
            <dd class="font-semibold text-slate-900">{{ formatYen(amountMinor) }}</dd>
          </div>
          <div v-if="memo" class="flex justify-between gap-4">
            <dt class="text-slate-500 shrink-0">Memo</dt>
            <dd class="text-slate-800 text-right">{{ memo }}</dd>
          </div>
        </dl>

        <p v-if="errorMessage" class="mt-4 text-sm text-red-600" role="alert">
          {{ errorMessage }}
        </p>

        <div class="mt-6 flex gap-3">
          <button
            type="button"
            class="flex-1 rounded-lg border border-slate-300 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            :disabled="submitting"
            @click="emit('cancel')"
          >
            Cancel
          </button>
          <button
            type="button"
            class="flex-1 rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            :disabled="submitting"
            @click="emit('confirm')"
          >
            {{ submitting ? 'Sending…' : errorMessage ? 'Retry' : 'Send' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
