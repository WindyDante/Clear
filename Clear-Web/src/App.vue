<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppToast from './components/common/AppToast.vue'; // Import AppToast
</script>

<template>
  <div class="app-container">
    <RouterView />
    <AppToast /> <!-- Add AppToast component here -->
  </div>
</template>

<style>
:root {
  --primary-color: #42b883;
  --primary-light: #b8e6d4;
  --primary-dark: #34495e;
  --accent-color: #ff7043;
  --background-color: #f5f7fa;
  --card-color: #ffffff;
  --text-color: #333333;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --danger-color: #ff5252;
  --success-color: #4caf50;
  --warning-color: #ffc107;
  --border-radius: 8px;
  --transition-speed: 0.3s;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', 'PingFang SC', 'Helvetica Neue', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  background-color: var(--background-color);
}

a {
  text-decoration: none;
  color: var(--primary-color);
  transition: color var(--transition-speed);
}

a:hover {
  color: var(--primary-dark);
}

button, 
.btn {
  cursor: pointer;
  border: none;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-speed);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:hover {
  background-color: var(--primary-light);
}

.card {
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  font-size: 14px;
  transition: border-color var(--transition-speed);
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
}

.text-danger {
  color: var(--danger-color);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-speed);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>