import { useAuthStore } from '@/stores/Auth';

export default defineNuxtPlugin(() => {
  const auth = useAuthStore();
  auth.loadUser();
});