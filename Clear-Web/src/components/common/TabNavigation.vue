<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  tabs: { id: string; name: string; icon?: string }[] // Add icon property
  activeTab?: string
}>()

const emit = defineEmits<{
  (e: 'change', tabId: string): void
}>()

const currentTab = ref(props.activeTab || props.tabs[0].id)

function setActiveTab(tabId: string) {
  currentTab.value = tabId
  emit('change', tabId)
}
</script>

<template>
  <div class="tab-navigation">
    <button v-for="tab in tabs" :key="tab.id" class="tab-button" :class="{ active: currentTab === tab.id }"
      @click="setActiveTab(tab.id)">
      <img v-if="tab.icon" :src="tab.icon" :alt="tab.name" class="tab-icon" />
      <span v-else>{{ tab.name }}</span>
    </button>
  </div>
</template>

<style scoped>
.tab-navigation {
  display: flex;
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: var(--background-color);
  margin-bottom: 16px;
}

.tab-button {
  flex: 1;
  padding: 12px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all var(--transition-speed);
  position: relative;
}

.tab-button.active {
  color: var(--text-on-primary);
  /* 将文字颜色调整为 --text-on-primary */
  background-color: var(--primary-light);
  font-weight: 600;
}

.tab-icon {
  width: 16px;
  /* Adjust as needed */
  height: 16px;
  /* Adjust as needed */
  margin-right: 5px;
  /* Adjust as needed */
}

.tab-button:hover:not(.active) {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>