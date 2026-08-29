<script setup lang="ts">
/**
 * A minimal fixed-height virtual scroller, written from scratch rather than
 * pulled in as a dependency, specifically so it's easy to explain line by
 * line in an interview.
 *
 * The idea: a transaction history can grow to thousands of rows. Rendering
 * every <li> means thousands of live DOM nodes, most of which are scrolled
 * out of view — that's wasted layout/paint work and it's the first thing
 * that makes a "just render the list" implementation janky once real data
 * volume shows up. Instead we render only the rows that fall within (or
 * just outside) the visible viewport, and use top/bottom spacer divs whose
 * height accounts for the rows we *didn't* render, so the scrollbar still
 * reflects the full list length.
 */
import { computed, ref } from 'vue';
import type { Transaction } from '@/api/types';
import TransactionListItem from './TransactionListItem.vue';

const props = withDefaults(
  defineProps<{
    items: Transaction[];
    currentUserId: string;
    rowHeight?: number;
    viewportHeight?: number;
    overscan?: number;
  }>(),
  {
    rowHeight: 64,
    viewportHeight: 420,
    overscan: 4,
  },
);

const scrollTop = ref(0);

function onScroll(event: Event): void {
  scrollTop.value = (event.target as HTMLElement).scrollTop;
}

const visibleCount = computed(() => Math.ceil(props.viewportHeight / props.rowHeight));

const startIndex = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / props.rowHeight) - props.overscan),
);

const endIndex = computed(() =>
  Math.min(props.items.length, startIndex.value + visibleCount.value + props.overscan * 2),
);

const visibleItems = computed(() => props.items.slice(startIndex.value, endIndex.value));

const topSpacerHeight = computed(() => startIndex.value * props.rowHeight);
const bottomSpacerHeight = computed(
  () => (props.items.length - endIndex.value) * props.rowHeight,
);
</script>

<template>
  <div
    class="overflow-y-auto rounded-xl border border-slate-100"
    :style="{ height: `${viewportHeight}px` }"
    @scroll="onScroll"
  >
    <div
      :style="{ height: `${topSpacerHeight}px` }"
      aria-hidden="true"
    />
    <ul class="px-4">
      <TransactionListItem
        v-for="tx in visibleItems"
        :key="tx.id"
        :transaction="tx"
        :current-user-id="currentUserId"
      />
    </ul>
    <div
      :style="{ height: `${bottomSpacerHeight}px` }"
      aria-hidden="true"
    />
  </div>
</template>
