<script setup lang="ts">
import { computed } from 'vue';
import { formatYen } from '@/utils/currency';
import type { Transaction } from '@/api/types';

const props = defineProps<{
  transaction: Transaction;
  currentUserId: string;
}>();

const isOutgoing = computed(() => props.transaction.senderId === props.currentUserId);
const formattedDate = computed(() =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(props.transaction.createdAt),
  ),
);
</script>

<template>
  <li class="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
    <div class="flex items-center gap-3 min-w-0">
      <span
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
        :class="isOutgoing ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'"
        aria-hidden="true"
      >
        {{ isOutgoing ? '↑' : '↓' }}
      </span>
      <div class="min-w-0">
        <p class="text-sm font-medium text-slate-800 truncate">
          {{ isOutgoing ? `To ${transaction.recipientId}` : `From ${transaction.senderId}` }}
        </p>
        <p class="text-xs text-slate-400 truncate">
          {{ transaction.memo || 'No memo' }} · {{ formattedDate }}
        </p>
      </div>
    </div>
    <span
      class="shrink-0 tabular-nums font-semibold text-sm"
      :class="isOutgoing ? 'text-red-600' : 'text-emerald-600'"
    >
      {{ isOutgoing ? '-' : '+' }}{{ formatYen(transaction.amountMinor) }}
    </span>
  </li>
</template>
