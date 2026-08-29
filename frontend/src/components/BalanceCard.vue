<script setup lang="ts">
import { formatYen } from '@/utils/currency';

defineProps<{
  balanceMinor: number;
  loading?: boolean;
}>();
</script>

<template>
  <div class="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-white p-6 shadow-sm">
    <p class="text-sm text-brand-100">
      Available balance
    </p>
    <p
      v-if="loading"
      class="mt-2 h-9 w-40 rounded bg-white/20 animate-pulse"
      aria-hidden="true"
    />
    <p
      v-else
      class="mt-2 text-3xl font-semibold tabular-nums"
    >
      {{ formatYen(balanceMinor) }}
    </p>
  </div>
</template>
