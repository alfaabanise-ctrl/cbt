<template>
  <div class="splash-page">
    <div class="glow glow-top"></div>
    <div class="glow glow-bottom"></div>

    <main class="splash-content">
      <img
        src="/images/logo.png"
        alt="ExamTips"
        class="logo"
      />

      <p class="tagline">
        Preparing you for success...
      </p>

      <div class="loading-wrapper">
        <div class="loading-bar">
          <span class="loading-segment active"></span>
          <span class="loading-segment"></span>
          <span class="loading-segment"></span>
        </div>

        <p class="loading-text">
          Loading your learning experience
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});
</script>

<style scoped>
.splash-page {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  font-family: "Segoe UI", Arial, sans-serif;
}

.glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.glow-top {
  width: 480px;
  height: 350px;
  top: -190px;
  left: -180px;
  background: #eaf6ff;
}

.glow-bottom {
  width: 520px;
  height: 380px;
  right: -200px;
  bottom: -200px;
  background: #edf8ff;
}

.splash-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 650px;
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: fade-in 0.6s ease-out;
}

.logo {
  display: block;
  width: min(82%, 500px);
  max-height: 170px;
  object-fit: contain;
  margin-bottom: 25px;
}

.tagline {
  margin: 0 0 28px;
  color: #64748b;
  font-size: 18px;
  font-weight: 400;
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-bar {
  display: flex;
  align-items: center;
  gap: 9px;
}

.loading-segment {
  position: relative;
  display: block;
  width: 68px;
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: #dceafa;
}

.loading-segment.active {
  background: #08a9e8;
}

.loading-segment.active::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.8),
    transparent
  );
  animation: shimmer 1.4s infinite;
}

.loading-text {
  margin: 0;
  color: #94a3b8;
  font-size: 12px;
  letter-spacing: 0.3px;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(100%);
  }
}

@media (max-width: 600px) {
  .logo {
    width: 90%;
    max-height: 130px;
    margin-bottom: 20px;
  }

  .tagline {
    font-size: 15px;
    margin-bottom: 24px;
  }

  .loading-segment {
    width: 48px;
    height: 6px;
  }

  .loading-text {
    font-size: 11px;
  }
}
</style>