<script setup lang="ts">
import { UContainer } from '#components';

</script>

<template>
    <UContainer class="py-2 pb-4">
        <UCard class="mx-auto mt-4 max-w-sm">
            <p class="text-xl text-center font-extrabold">404 Not Found!</p>
            <br>
            <div class="flex justify-center items-center">
                <UButton size="xl" color="gray" icon="i-fluent-emoji-flat-back-arrow" to="/">返回首页</UButton>
            </div>
        </UCard>
    </UContainer>
</template>