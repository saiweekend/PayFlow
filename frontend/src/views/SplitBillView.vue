<script setup lang="ts">
/**
 * Splits an integer yen amount evenly across N participants without losing
 * or gaining a single yen to rounding. Naive `total / n` on integer
 * currency either drops fractional yen or (if you round each share up)
 * collects more than the total. The fix: give every participant
 * `floor(total / n)`, then distribute the `total % n` leftover yen one at a
 * time to the first few participants. This is the same technique real
 * split-bill features (and payroll rounding, and ad-auction remainder
 * allocation) use — it's a small algorithm, but it's the kind of "did you
 * actually think about the edge case" detail that's easy to get wrong.
 */
import { computed, ref } from 'vue';
import { formatYen, parseYenInput } from '@/utils/currency';

const totalRaw = ref('');
const participantCount = ref(3);

const totalMinor = computed(() => parseYenInput(totalRaw.value));

const shares = computed<number[]>(() => {
  const total = totalMinor.value;
  const n = participantCount.value;
  if (total === null || n <= 0) return [];

  const base = Math.floor(total / n);
  const remainder = total % n;

  // First `remainder` participants get one extra yen each.
  return Array.from({ length: n }, (_, i) => base + (i < remainder ? 1 : 0));
});

const shareSumCheck = computed(() => shares.value.reduce((sum, s) => sum + s, 0));
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-slate-900">
      Split a bill
    </h1>

    <div class="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <div>
        <label
          class="block text-sm font-medium text-slate-700 mb-1"
          for="total"
        >Total amount (JPY)</label>
        <input
          id="total"
          v-model="totalRaw"
          inputmode="numeric"
          placeholder="3000"
          class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
        >
      </div>

      <div>
        <label
          class="block text-sm font-medium text-slate-700 mb-1"
          for="people"
        >Split between</label>
        <input
          id="people"
          v-model.number="participantCount"
          type="number"
          min="2"
          max="20"
          class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
        >
      </div>
    </div>

    <div
      v-if="shares.length"
      class="bg-white rounded-2xl border border-slate-200 p-6"
    >
      <p class="text-sm text-slate-500 mb-3">
        {{ participantCount }} people · total {{ formatYen(totalMinor ?? 0) }}
      </p>
      <ul class="space-y-2">
        <li
          v-for="(share, i) in shares"
          :key="i"
          class="flex justify-between text-sm border-b border-slate-100 pb-2 last:border-0"
        >
          <span class="text-slate-600">Person {{ i + 1 }}</span>
          <span class="font-medium tabular-nums">{{ formatYen(share) }}</span>
        </li>
      </ul>
      <p class="mt-3 text-xs text-slate-400">
        Sum check: {{ formatYen(shareSumCheck) }} (must equal total — remainder yen go to the
        first {{ (totalMinor ?? 0) % participantCount }} people)
      </p>
    </div>
  </div>
</template>
