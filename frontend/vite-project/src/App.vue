<script setup>
import { reactive, computed, onMounted } from 'vue';
import api from './api.js';
import AuthScreen from './components/AuthScreen.vue';
import TopBar from './components/TopBar.vue';
import NotificationsPanel from './components/NotificationsPanel.vue';
import BachecaTab from './components/BachecaTab.vue';
import ProfiloTab from './components/ProfiloTab.vue';

const state = reactive({
  booting: true,
  user: null,
  activeTab: 'bacheca',
  notifOpen: false,
  notifications: [],
});

const unreadCount = computed(() => state.notifications.filter((n) => !n.read).length);

async function checkSession() {
  const token = localStorage.getItem('unobravo_token');
  if (!token) {
    state.booting = false;
    return;
  }
  try {
    const { data } = await api.get('/auth/me');
    state.user = data.user;
    await loadNotifications();
  } catch (e) {
    localStorage.removeItem('unobravo_token');
  } finally {
    state.booting = false;
  }
}

async function onAuthenticated(user) {
  state.user = user;
  await loadNotifications();
}

async function logout() {
  try {
    await api.post('/auth/logout');
  } catch (e) {
    // la sessione lato client va comunque chiusa anche se la chiamata fallisce
  }
  localStorage.removeItem('unobravo_token');
  state.user = null;
  state.notifications = [];
  state.activeTab = 'bacheca';
}

async function loadNotifications() {
  try {
    const { data } = await api.get('/notifications');
    state.notifications = data.notifications;
  } catch (e) {
    /* no-op */
  }
}

function toggleNotifPanel() {
  state.notifOpen = !state.notifOpen;
}

async function markNotifRead(notif) {
  if (notif.read) return;
  notif.read = true;
  try {
    await api.put(`/notifications/${notif.id}/read`);
  } catch (e) {
    /* no-op */
  }
}

async function markAllRead() {
  state.notifications.forEach((n) => (n.read = true));
  try {
    await api.put('/notifications/read-all');
  } catch (e) {
    /* no-op */
  }
}

function onProfileUpdated(user) {
  state.user = user;
}

onMounted(checkSession);
</script>

<template>
  <div v-if="state.booting"></div>

  <AuthScreen v-else-if="!state.user" @authenticated="onAuthenticated" />

  <div v-else>
    <TopBar :unread-count="unreadCount" @toggle-notifications="toggleNotifPanel" @logout="logout" />

    <NotificationsPanel
      v-if="state.notifOpen"
      :notifications="state.notifications"
      @close="toggleNotifPanel"
      @mark-read="markNotifRead"
      @mark-all-read="markAllRead"
    />

    <div class="welcome-banner">
      <span class="eyebrow">Il tuo spazio</span>
      <h2>Ciao, {{ state.user.nome }} 👋</h2>
      <p>Siamo felici di averti qui. Prenditi un momento per te.</p>
    </div>

    <div class="tabs">
      <button class="tab" :class="{ active: state.activeTab === 'bacheca' }" @click="state.activeTab = 'bacheca'">
        Bacheca
      </button>
      <button class="tab" :class="{ active: state.activeTab === 'profilo' }" @click="state.activeTab = 'profilo'">
        Profilo
      </button>
    </div>

    <div class="content">
      <BachecaTab v-if="state.activeTab === 'bacheca'" />
      <ProfiloTab v-else-if="state.activeTab === 'profilo'" :user="state.user" @profile-updated="onProfileUpdated" />
    </div>
  </div>
</template>