<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import BalanceCard from '@/components/BalanceCard.vue';
import { useWalletStore } from '@/stores/wallet';
import { useAuthStore } from '@/stores/auth';

const wallet = useWalletStore();
const { wallet: walletData, loading } = storeToRefs(wallet);
const auth = useAuthStore();

onMounted(() => {
  wallet.fetchBalance();
});
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="text-sm text-slate-500">Welcome back</p>
      <h1 class="text-xl font-semibold text-slate-900">{{ auth.email }}</h1>
    </div>

    <BalanceCard :balance-minor="walletData?.balanceMinor ?? 0" :loading="loading" />

    <div class="grid grid-cols-3 gap-3">
      <RouterLink
        to="/send"
        class="rounded-xl bg-white border border-slate-200 p-4 text-center text-sm font-medium text-slate-700 hover:border-brand-300"
      >
        Send money
      </RouterLink>
      <RouterLink
        to="/split"
        class="rounded-xl bg-white border border-slate-200 p-4 text-center text-sm font-medium text-slate-700 hover:border-brand-300"
      >
        Split a bill
      </RouterLink>
      <RouterLink
        to="/history"
        class="rounded-xl bg-white border border-slate-200 p-4 text-center text-sm font-medium text-slate-700 hover:border-brand-300"
      >
        History
      </RouterLink>
    </div>
  </div>
</template>
