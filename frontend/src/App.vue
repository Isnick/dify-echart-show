<template>
  <router-view />
</template>

<style>
@import './styles/tech-theme.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--tech-font-ui);
  background: var(--tech-bg-deep);
  color: var(--tech-text-primary);
  min-height: 100vh;
  overflow-x: hidden;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
