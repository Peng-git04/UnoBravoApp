<script setup>
import { reactive, onMounted } from 'vue';
import api from '../api.js';
import PostCard from './PostCard.vue';

const state = reactive({
  posts: [],
  newPostContent: '',
  loading: false,
  error: '',
});

async function loadPosts() {
  state.loading = true;
  try {
    const { data } = await api.get('/posts');
    state.posts = data.posts;
  } catch (e) {
    state.error = 'Impossibile caricare la bacheca al momento.';
  } finally {
    state.loading = false;
  }
}

async function publishPost() {
  if (!state.newPostContent.trim()) return;
  state.error = '';
  try {
    const { data } = await api.post('/posts', { content: state.newPostContent });
    state.posts.unshift(data.post);
    state.newPostContent = '';
  } catch (err) {
    state.error = err.response?.data?.error || 'Non è stato possibile pubblicare il post.';
  }
}

async function toggleLike(post) {
  try {
    const { data } = await api.post(`/posts/${post.id}/like`);
    Object.assign(post, data.post);
  } catch (e) {
    // un like fallito non richiede un blocco dell'interfaccia
  }
}

async function deletePost(post) {
  try {
    await api.delete(`/posts/${post.id}`);
    state.posts = state.posts.filter((p) => p.id !== post.id);
  } catch (e) {
    state.error = 'Non è stato possibile eliminare il post.';
  }
}

onMounted(loadPosts);
</script>

<template>
  <div class="card composer">
    <textarea
      v-model="state.newPostContent"
      maxlength="500"
      placeholder="Condividi un pensiero con la community di UnoBravo..."
    ></textarea>
    <div class="composer-footer">
      <span class="char-count">{{ state.newPostContent.length }}/500</span>
      <button class="btn-primary" @click="publishPost" :disabled="!state.newPostContent.trim()">
        Pubblica
      </button>
    </div>
  </div>

  <div v-if="state.error" class="alert alert-error" style="margin-top: 14px">{{ state.error }}</div>

  <div v-if="state.loading" class="empty-state">Caricamento...</div>

  <div v-else-if="state.posts.length === 0" class="card empty-state">
    <div class="display">La bacheca è ancora silenziosa</div>
    <p>Sii la prima persona a condividere un pensiero.</p>
  </div>

  <PostCard
    v-else
    v-for="post in state.posts"
    :key="post.id"
    :post="post"
    @toggle-like="toggleLike"
    @delete="deletePost"
  />
</template>
