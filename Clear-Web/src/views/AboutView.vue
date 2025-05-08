<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../store/task'
import AppHeader from '../components/common/AppHeader.vue'

const taskStore = useTaskStore()

const totalCompleted = computed(() => taskStore.totalCompletedTasks)
const totalPending = computed(() => taskStore.totalPendingTasks)

onMounted(() => {
  taskStore.fetchTasks()
})
</script>

<template>
  <div class="about-view">
    <AppHeader title="关于" :show-home-icon="true" :show-logout-icon="true" />
    
    <div class="about-content">
      <div class="stats-card card">
        <h2 class="card-title">
          <span class="emoji">✨</span> 关于:
        </h2>
        
        <p class="stats-text">
          您一共完成了 <span class="highlight">{{ totalCompleted }}</span> 个任务。
          当前还剩下 <span class="highlight">{{ totalPending }}</span> 个未完成的任务。
        </p>
      </div>
      
      <div class="info-card card">
        <h2 class="card-title">
          <span class="emoji">💡</span> 设计理念:
        </h2>
        
        <p class="info-text">
          这个小程序的设计理念旨在帮助用户有效地减轻认知负担，通过提供一个简单、直观的界面来降低的复杂性和趣味任务。它的目标是帮助用户避免因现代生活中生过多的精神压力，让用户能够更加专注于重要的事务，提升工作效率和生活质量。
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.about-content {
  flex: 1;
  padding: 16px;
}

.card {
  margin-bottom: 16px;
  padding: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.emoji {
  margin-right: 8px;
  font-size: 20px;
}

.stats-text {
  font-size: 16px;
  line-height: 1.6;
}

.info-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.highlight {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 18px;
}

@media (min-width: 768px) {
  .about-content {
    padding: 24px;
  }
  
  .card {
    padding: 24px;
  }
}
</style>