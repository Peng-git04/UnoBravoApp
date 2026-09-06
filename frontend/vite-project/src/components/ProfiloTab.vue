<script setup>
import { reactive, watch } from 'vue';
import api from '../api.js';
import { initials } from '../utils.js';

const props = defineProps({
  user: { type: Object, required: true },
});

const emit = defineEmits(['profile-updated']);

const state = reactive({
  form: {
    nome: props.user.nome,
    bio: props.user.bio || '',
    areaInteresse: props.user.areaInteresse || '',
  },
  saving: false,
  saved: false,
});

// tiene il form allineato se l'utente viene aggiornato dall'esterno
watch(
  () => props.user,
  (u) => {
    state.form = { nome: u.nome, bio: u.bio || '', areaInteresse: u.areaInteresse || '' };
  }
);

async function saveProfile() {
  state.saving = true;
  state.saved = false;
  try {
    const { data } = await api.put('/profile', state.form);
    emit('profile-updated', data.user);
    state.saved = true;
    setTimeout(() => (state.saved = false), 2500);
  } catch (e) {
    // errore silenzioso, gestibile in futuro con un alert dedicato
  } finally {
    state.saving = false;
  }
}
</script>

<template>
  <div class="card">
    <div class="profile-header">
      <div class="avatar">{{ initials(user.nome) }}</div>
      <div>
        <h3 style="font-size: 18px">{{ user.nome }}</h3>
        <span style="font-size: 13px; color: var(--text-muted)">{{ user.email }}</span>
      </div>
    </div>

    <div class="field">
      <label>Nome</label>
      <input v-model="state.form.nome" type="text" />
    </div>
    <div class="field">
      <label>Area di interesse</label>
      <input
        v-model="state.form.areaInteresse"
        type="text"
        placeholder="Es. gestione dell'ansia, stress, autostima..."
      />
    </div>
    <div class="field">
      <label>Qualche parola su di te</label>
      <textarea
        v-model="state.form.bio"
        rows="4"
        placeholder="Racconta ciò che ti fa stare bene, o cosa ti porta qui."
      ></textarea>
    </div>

    <button class="btn-primary" style="width: auto; padding: 11px 24px" @click="saveProfile" :disabled="state.saving">
      <span v-if="state.saving" class="spinner"></span>
      <span v-else>Salva modifiche</span>
    </button>
    <div class="save-hint">{{ state.saved ? '✓ Profilo aggiornato' : '' }}</div>
  </div>
</template>
