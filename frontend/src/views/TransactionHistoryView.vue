<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import VirtualTransactionList from '@/components/VirtualTransactionList.vue';
import { useTransactionsStore } from '@/stores/transactions';
import { useAuthStore } from '@/stores/auth';

const transactions = useTransactionsStore();
const { history, loading } = storeToRefs(transactions);
const auth = useAuthStore();

onMounted(() => {
  transactions.fetchHistory();
});
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-semibold text-slate-900">Transaction history</h1>

    <div v-if="loading" class="text-sm text-slate-400">Loading…</div>
    <div v-else-if="history.length === 0" class="text-sm text-slate-400">
      No transactions yet.
    </div>
    <VirtualTransactionList
      v-else
      :items="history"
      :current-user-id="auth.email ?? ''"
      class="bg-white"
    />
  </div>
</template>
