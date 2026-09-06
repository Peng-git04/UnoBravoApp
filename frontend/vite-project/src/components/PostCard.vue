<script setup>
import { timeAgo, initials } from '../utils.js';

defineProps({
  post: { type: Object, required: true },
});

defineEmits(['toggle-like', 'delete']);
</script>

<template>
  <div class="card">
    <div class="post">
      <div class="avatar">{{ initials(post.authorName) }}</div>
      <div class="post-body">
        <div class="post-head">
          <span class="post-author">{{ post.authorName }}</span>
          <span class="post-time">{{ timeAgo(post.createdAt) }}</span>
        </div>
        <p class="post-content">{{ post.content }}</p>
        <div class="post-actions">
          <button class="like-btn" :class="{ liked: post.likedByMe }" @click="$emit('toggle-like', post)">
            {{ post.likedByMe ? '❤️' : '🤍' }} {{ post.likesCount }}
          </button>
          <button v-if="post.isMine" class="delete-btn" @click="$emit('delete', post)">Elimina</button>
        </div>
      </div>
    </div>
  </div>
</template>