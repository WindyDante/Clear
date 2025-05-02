<template>
  <client-only>
    <UCard class="mx-auto mt-4 max-w-sm">
      <div class="flex justify-between items-center">
        <div class="flex justify-start items-center gap-4">
          <UButton icon="i-heroicons-inbox" color="gray" size="sm" to="/user" />
        </div>
        <div>
          <!-- 如果已登录则显示退出按钮，否则显示登录按钮 -->
          <template v-if="auth.user">
            <UButton
              color="gray"
              variant="solid"
              size="sm"
              icon="i-fluent-arrow-exit-20-filled"
              @click="logout"
            />
          </template>

          <template v-else>
            <UButton color="gray" variant="solid" size="md" icon="i-fluent-cloud-16-regular">
              <NuxtLink to="/auth" class="flex items-center gap-2"> 登录 </NuxtLink>
            </UButton>
          </template>
        </div>
      </div>
    </UCard>
  </client-only>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/Auth';
import { UButton } from '#components';

const auth = useAuthStore();
const router = useRouter();
const logout = () => {
  auth.clearUser();
  // 可选：退出后跳转到登录页面
  router.push('/auth')
}
</script>
