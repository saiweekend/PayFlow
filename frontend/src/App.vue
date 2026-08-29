<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const auth = useAuthStore();
const showNav = computed(() => !route.meta.public);
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header
      v-if="showNav"
      class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between"
    >
      <RouterLink
        to="/"
        class="text-lg font-semibold text-brand-600"
      >
        PayFlow
      </RouterLink>
      <nav class="flex items-center gap-6 text-sm font-medium text-slate-600">
        <RouterLink
          to="/"
          class="hover:text-brand-600"
        >
          Dashboard
        </RouterLink>
        <RouterLink
          to="/send"
          class="hover:text-brand-600"
        >
          Send
        </RouterLink>
        <RouterLink
          to="/split"
          class="hover:text-brand-600"
        >
          Split Bill
        </RouterLink>
        <RouterLink
          to="/history"
          class="hover:text-brand-600"
        >
          History
        </RouterLink>
        <button
          class="text-slate-400 hover:text-slate-700"
          @click="auth.logout"
        >
          Log out
        </button>
      </nav>
    </header>

    <main class="flex-1 max-w-3xl w-full mx-auto p-6">
      <RouterView />
    </main>
  </div>
</template>
