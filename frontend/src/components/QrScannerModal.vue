<script setup lang="ts">
/**
 * Demo-only QR scanner. PayPay's real product is largely a QR-code payments
 * app, so a portfolio piece in this space should at least gesture at that
 * flow. A production version would use the BarcodeDetector API where
 * available (feature-detected, since Safari/Firefox support lags) with a
 * WASM decoder (e.g. zxing-wasm) as the fallback, wired to
 * `navigator.mediaDevices.getUserMedia`. That's a real dependency + camera
 * permission flow that doesn't make sense to fake in a static demo, so this
 * component simulates the "found a code" moment on a timer instead of
 * actually decoding a video stream — the surrounding state machine (open →
 * scanning → found → emit) is the same either way.
 */
import { ref, watch } from 'vue';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{
  scanned: [recipientId: string];
  cancel: [];
}>();

const status = ref<'scanning' | 'found'>('scanning');
let timer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      clearTimeout(timer);
      return;
    }
    status.value = 'scanning';
    timer = setTimeout(() => {
      status.value = 'found';
      setTimeout(() => emit('scanned', 'usr_2'), 500);
    }, 1200);
  },
);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
    >
      <div class="text-center text-white">
        <div
          class="mx-auto h-56 w-56 rounded-2xl border-2 border-dashed flex items-center justify-center"
          :class="status === 'found' ? 'border-emerald-400' : 'border-white/60'"
        >
          <span v-if="status === 'scanning'" class="animate-pulse text-sm">Scanning…</span>
          <span v-else class="text-sm text-emerald-300">Code found ✓</span>
        </div>
        <button class="mt-6 text-sm text-white/70 underline" @click="emit('cancel')">
          Cancel
        </button>
      </div>
    </div>
  </Teleport>
</template>
