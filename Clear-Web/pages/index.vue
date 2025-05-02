<template>
  <UContainer class="py-2 pb-4">
    <HeaderBar />
    <AddTodoForm />
    <TodoList />
  </UContainer>

  <Notification />
</template>

<script setup lang="ts">
import HeaderBar from '@/components/index/HeaderBar.vue'
import AddTodoForm from '@/components/index/AddTodoForm.vue'
import TodoList from '@/components/index/TodoList.vue'
import Notification from '~/components/widgets/Notification.vue';
</script>