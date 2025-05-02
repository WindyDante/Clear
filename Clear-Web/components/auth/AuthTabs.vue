<template>
  <UCard class="mx-auto mt-4 max-w-sm">
    <UTabs :items="items" class="w-full">
      <template #item="{ item }">
        <UCard @submit.prevent="submitAuth(item.key)">
          <template #header>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ item.description }}
            </p>
          </template>

          <!-- 登录表单 -->
          <div v-if="item.key === 'login'" class="space-y-3">
            <UFormGroup label="用户名" required>
              <UInput
                v-model="loginForm.username"
                type="text"
                placeholder="输入用户名"
                color="gray"
              />
            </UFormGroup>
            <UFormGroup label="密码" required>
              <UInput
                v-model="loginForm.password"
                type="password"
                placeholder="输入密码"
                color="gray"
              />
            </UFormGroup>

            <div class="flex justify-center">
              <UButton
                type="submit"
                variant="solid"
                color="gray"
                icon="i-fluent-drink-24-regular"
                class="w-28 flex justify-center items-center"
              >
                登录
              </UButton>
            </div>
          </div>

          <!-- 注册表单 -->
          <div v-else-if="item.key === 'register'" class="space-y-3">
            <UFormGroup label="用户名" required>
              <UInput
                v-model="registerForm.username"
                type="text"
                placeholder="输入用户名"
                color="gray"
              />
            </UFormGroup>
            <UFormGroup label="密码" required>
              <UInput
                v-model="registerForm.password"
                type="password"
                placeholder="输入密码"
                color="gray"
              />
            </UFormGroup>

            <div class="flex justify-center">
              <UButton
                type="submit"
                variant="solid"
                color="gray"
                class="w-28 flex justify-center items-center"
                icon="i-fluent-person-add-16-regular"
              >
                注册
              </UButton>
            </div>
          </div>
        </UCard>
      </template>
    </UTabs>
  </UCard>

</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';
import type { UserToLogin, UserToRegister } from '~/types/models';
import { reactive } from 'vue';
const { login, register } = useAuth();

// 登录表单
const loginForm = reactive<UserToLogin>({
  username: "",
  password: "",
});

// 注册表单
const registerForm = reactive<UserToRegister>({
  username: "",
  password: "",
});

// 选项卡内容
const items = [
  { key: "login", label: "登录", description: "请输入账号密码登录" },
  { key: "register", label: "注册", description: "创建一个新账户" },
];

// 清空表单
const clearForm = (type: string) => {
  if (type === "login") {
    loginForm.username = "";
    loginForm.password = "";
  } else if (type === "register") {
    registerForm.username = "";
    registerForm.password = "";
  }
};

// 提交表单
const submitAuth = async (type: string) => {
  try {
    if (type === "login") { // 登录
      await login(loginForm)
    } else if (type === "register") { // 注册
      const response = await register(registerForm)
      if (response) {
        clearForm("register");
      }
    }
  } catch (error) {
    console.error(error);
  }
}


</script>
