<template>
    <UContainer class="py-2 pb-4">
      <UserHeader />
      <UserStatus />
    </UContainer>
</template>

<script lang="ts" setup>
import UserHeader from '~/components/user/UserHeader.vue';
import UserStatus from '~/components/user/UserStatus.vue';
</script>