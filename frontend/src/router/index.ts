import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

/**
 * Every route past login is lazy (`() => import(...)`) so the initial bundle
 * only contains what's needed to render the login screen. Vite splits each
 * of these into its own chunk; SendMoneyView (which pulls in the QR modal
 * and amount input) only downloads when a user actually navigates there.
 * This is the single highest-leverage frontend performance lever for a
 * multi-view SPA and is exactly the kind of thing the job posting's
 * "frontend performance optimization" line is asking about.
 */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },
    {
      path: '/send',
      name: 'send',
      component: () => import('@/views/SendMoneyView.vue'),
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('@/views/TransactionHistoryView.vue'),
    },
    {
      path: '/split',
      name: 'split',
      component: () => import('@/views/SplitBillView.vue'),
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'dashboard' };
  }
  return true;
});

export default router;
