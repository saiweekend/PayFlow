<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { formatYen, parseYenInput } from '@/utils/currency';

const props = defineProps<{
  modelValue: number | null;
  error?: string;
  max?: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number | null];
}>();

const raw = ref(props.modelValue ? String(props.modelValue) : '');

// Keep the text field in sync if the parent resets modelValue (e.g. after a
// successful send clears the form).
watch(
  () => props.modelValue,
  (value) => {
    if (value === null) raw.value = '';
  },
);

const parsed = computed(() => parseYenInput(raw.value));

function onInput(event: Event): void {
  raw.value = (event.target as HTMLInputElement).value;
  emit('update:modelValue', parsed.value);
}

const preview = computed(() => (parsed.value !== null ? formatYen(parsed.value) : null));
</script>

<template>
  <div>
    <label
      class="block text-sm font-medium text-slate-700 mb-1"
      for="amount"
    >Amount (JPY)</label>
    <div class="relative">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">¥</span>
      <input
        id="amount"
        :value="raw"
        type="text"
        inputmode="numeric"
        placeholder="0"
        class="w-full pl-8 pr-4 py-3 rounded-lg border text-lg tabular-nums focus:outline-none focus:ring-2"
        :class="
          error
            ? 'border-red-400 focus:ring-red-200'
            : 'border-slate-300 focus:ring-brand-200 focus:border-brand-500'
        "
        :aria-invalid="Boolean(error)"
        aria-describedby="amount-help"
        @input="onInput"
      >
    </div>
    <p
      v-if="error"
      id="amount-help"
      class="mt-1 text-sm text-red-600"
    >
      {{ error }}
    </p>
    <p
      v-else-if="preview"
      id="amount-help"
      class="mt-1 text-sm text-slate-500"
    >
      {{ preview }}
    </p>
  </div>
</template>
