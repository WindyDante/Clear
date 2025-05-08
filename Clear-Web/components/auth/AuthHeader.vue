<template>
  <UCard class="mx-auto mt-4 max-w-sm">
    <div class="flex justify-between items-center">
      <!-- 页面标题 -->
      <div class="text-2xl text">
        欢迎使用
        <span style="color: rgb(0 193 106)" class="text-2xl italic font-bold">
          Clear
        </span>
      </div>

      <!-- 返回首页按钮 -->
      <div>
        <UButton
          to="/"
          variant="solid"
          color="gray"
          size="md"
          icon="i-fluent-home-12-regular"
        >
          首页
        </UButton>
      </div>
    </div>
  </UCard>
</template>
