<template>
  <UCard class="mx-auto mt-4 max-w-sm">
    <div class="flex justify-between items-center">
      <!-- 返回首页按钮 -->
      <div>
        <UButton
          to="/"
          variant="solid"
          color="gray"
          size="sm"
          icon="i-fluent-home-12-regular"
        />
      </div>
      <!-- github项目地址 -->
      <div>
        <UButton
          to="https://github.com/WindyDante/Clear"
          target="_blank"
          variant="solid"
          color="gray"
          size="md"
          icon="i-line-md-github"
        />
      </div>
    </div>
  </UCard>
</template>