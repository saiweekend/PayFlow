<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ApiError } from '@/api/client';

const email = ref('demo@payflow.dev');
const password = ref('');
const submitting = ref(false);
const error = ref<string | null>(null);

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

async function onSubmit(): Promise<void> {
  submitting.value = true;
  error.value = null;
  try {
    await auth.login(email.value, password.value);
    const redirect = (route.query.redirect as string) || '/';
    router.push(redirect);
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Unable to sign in.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <form class="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8" @submit.prevent="onSubmit">
      <h1 class="text-2xl font-semibold text-brand-600 mb-1">PayFlow</h1>
      <p class="text-sm text-slate-500 mb-6">Sign in to your account</p>

      <label class="block text-sm font-medium text-slate-700 mb-1" for="email">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        autocomplete="username"
        class="w-full mb-4 px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
      />

      <label class="block text-sm font-medium text-slate-700 mb-1" for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        required
        autocomplete="current-password"
        class="w-full mb-2 px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
      />
      <p class="text-xs text-slate-400 mb-4">Demo password: password123</p>

      <p v-if="error" class="mb-4 text-sm text-red-600" role="alert">{{ error }}</p>

      <button
        type="submit"
        class="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        :disabled="submitting"
      >
        {{ submitting ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>
  </div>
</template>
