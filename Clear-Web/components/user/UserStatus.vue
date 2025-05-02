<template>
    <UCard class="mx-auto mt-4 max-w-sm">
        <!-- 用户信息 -->
        <UCard class="mb-4">
            <UIcon name="i-fluent-emoji-flat-waving-hand"/> <span class="font-bold text-2xl">关于：</span>
            <div class="p-1" style="color: #333;">
                <span >您一共完成了</span> <span class="text-3xl underline font-bold italic">{{ userStore.numOfDone }}</span> 个任务。
                当前还剩下的任务有 <span class="text-3xl underline font-bold italic">{{ userStore.numOfUndone }}</span> 个。
            </div>
        </UCard>

        <!-- 关于本项目 -->
        <UCard>
            <UIcon name="i-fluent-emoji-flat-upside-down-face" /> <span class="font-bold text-2xl">设计理念：</span>
            <div class="p-1" style="color: #333;">
                <span>
                    这个小程序的设计理念旨在帮助用户有效地减轻<span class="italic font-bold">认知负担</span>，通过提供一个简单、直观的方式来记录需要完成的<span class="italic font-bold">紧急</span>和<span class="italic font-bold">短期任务</span>。
                    它的目标是帮助用户避免因琐事堆积而产生过多的精神压力，让用户能够更加专注于重要的事务，提升工作效率和生活质量。
                </span>
            </div>
        </UCard>
    </UCard>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUser } from '~/composables/useUser';
const { getUserStatus} = useUser();
const userStore = useUserStore();

onMounted(() => {
    getUserStatus();
})
</script>