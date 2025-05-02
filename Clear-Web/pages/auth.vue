<template>
  <UContainer class="py-2 pb-4">
    <AuthHeader />
    <AuthTabs />
  </UContainer>

  <Notification />
</template>

<script setup lang="ts">
import AuthHeader from '~/components/auth/AuthHeader.vue';
import AuthTabs from '~/components/auth/AuthTabs.vue';
import Notification from '~/components/widgets/Notification.vue';
</script>