<script setup>
defineProps({
  unreadCount: { type: Number, default: 0 },
});

defineEmits(['toggle-notifications', 'logout']);
</script>

<template>
  <div class="topbar">
    <div class="brand"><span class="brand-mark"></span><h1>UnoBravo</h1></div>
    <div class="topbar-actions">
      <button class="icon-btn" @click="$emit('toggle-notifications')" aria-label="Notifiche">
        🔔
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </button>
      <button class="btn-ghost" @click="$emit('logout')">Esci</button>
    </div>
  </div>
</template>