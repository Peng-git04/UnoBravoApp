<script setup>
import { timeAgo } from '../utils.js';

const props = defineProps({
  notifications: { type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'mark-read', 'mark-all-read']);

function unreadCount() {
  return props.notifications.filter((n) => !n.read).length;
}
</script>

<template>
  <div class="overlay-click-catcher" @click="$emit('close')"></div>
  <div class="notif-panel">
    <div class="notif-panel-head">
      <h3>Notifiche</h3>
      <button class="mark-all" v-if="unreadCount() > 0" @click="$emit('mark-all-read')">
        Segna tutte come lette
      </button>
    </div>

    <div v-if="notifications.length === 0" class="empty-state">
      <p style="font-size: 13px">Nessuna notifica per ora.</p>
    </div>

    <div
      v-for="n in notifications"
      :key="n.id"
      class="notif-item"
      :class="{ unread: !n.read }"
      @click="$emit('mark-read', n)"
    >
      {{ n.message }}
      <span class="notif-time">{{ timeAgo(n.createdAt) }}</span>
    </div>
  </div>
</template>
