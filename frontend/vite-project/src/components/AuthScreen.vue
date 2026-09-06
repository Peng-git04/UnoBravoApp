<script setup>
import { reactive } from 'vue';
import api from '../api.js';

const emit = defineEmits(['authenticated']);

const state = reactive({
  mode: 'login', // 'login' | 'register'
  form: { nome: '', email: '', password: '' },
  error: '',
  loading: false,
  socialNotice: false,
});

function switchMode(mode) {
  state.mode = mode;
  state.error = '';
}

async function submit() {
  state.error = '';
  state.loading = true;
  try {
    const endpoint = state.mode === 'login' ? '/auth/login' : '/auth/register';
    const payload =
      state.mode === 'login'
        ? { email: state.form.email, password: state.form.password }
        : state.form;

    const { data } = await api.post(endpoint, payload);
    localStorage.setItem('unobravo_token', data.token);
    emit('authenticated', data.user);
  } catch (err) {
    state.error = err.response?.data?.error || 'Qualcosa è andato storto. Riprova.';
  } finally {
    state.loading = false;
  }
}

// I pulsanti social sono decorativi: questo progetto didattico
// implementa solo l'autenticazione via email/password con le API create.
function showSocialNotice() {
  state.socialNotice = true;
  setTimeout(() => (state.socialNotice = false), 3000);
}
</script>

<template>
  <div class="auth-screen">
    <div class="auth-card">
      <div class="auth-logo">
        <svg class="mark" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="markGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#f0a56a" />
              <stop offset="1" stop-color="#c8451c" />
            </linearGradient>
          </defs>
          <circle cx="13" cy="9" r="4.5" fill="#f6cba4" />
          <circle cx="21" cy="7" r="2.4" fill="#e8785b" />
          <path
            d="M20 13c7.2 0 12.6 5.7 12.6 13S27.2 39 20 39 7.4 33.3 7.4 26 12.8 13 20 13Z"
            fill="url(#markGrad)"
          />
        </svg>
        <span class="wordmark">unobravo</span>
      </div>

      <h1 class="auth-title">
        {{ state.mode === 'login' ? 'Accedi al tuo account' : 'Crea il tuo account' }}
      </h1>

      <div v-if="state.error" class="alert alert-error">{{ state.error }}</div>

      <form @submit.prevent="submit">
        <div class="field" v-if="state.mode === 'register'">
          <label for="nome">Nome</label>
          <input id="nome" v-model="state.form.nome" type="text" placeholder="Come ti chiami?" required />
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="state.form.email" type="email" placeholder="Inserisci email" required />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="state.form.password"
            type="password"
            placeholder="Inserisci password"
            required
            minlength="6"
          />
        </div>
        <button class="btn-primary" type="submit" :disabled="state.loading">
          <span v-if="state.loading" class="spinner"></span>
          <span v-else>{{ state.mode === 'login' ? 'Accedi' : 'Registrati' }}</span>
        </button>
      </form>

      <div class="auth-divider"><span>OPPURE</span></div>

      <button class="btn-social" type="button" @click="showSocialNotice">
        <svg viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62Z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z"/><path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.82.95 4.03l3-2.33Z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z"/></svg>
        Continua con Google
      </button>
      <button class="btn-social" type="button" @click="showSocialNotice">
        <svg viewBox="0 0 18 18"><path fill="#000" d="M13.06 9.55c-.02-1.65 1.35-2.44 1.41-2.48-.77-1.12-1.97-1.28-2.4-1.3-1.02-.1-1.99.6-2.51.6-.52 0-1.32-.59-2.17-.57-1.12.02-2.15.65-2.72 1.65-1.16 2.02-.3 5 .83 6.63.56.8 1.22 1.7 2.08 1.67.84-.03 1.15-.54 2.16-.54 1 0 1.28.54 2.16.53.9-.02 1.46-.81 2-1.62.63-.93.89-1.83.9-1.88-.02-.01-1.72-.66-1.74-2.69Z"/><path fill="#000" d="M11.4 4.36c.45-.55.76-1.3.68-2.06-.65.03-1.46.44-1.93.98-.42.48-.79 1.26-.69 2 .73.06 1.48-.37 1.94-.92Z"/></svg>
        Continua con Apple
      </button>

      <p v-if="state.socialNotice" class="social-notice">
        Il login social non è implementato in questo progetto didattico.
      </p>

      <div class="switch-mode">
        <template v-if="state.mode === 'login'">
          Non hai un account?
          <button @click="switchMode('register')">Inizia da qui</button>
        </template>
        <template v-else>
          Hai già un account?
          <button @click="switchMode('login')">Accedi</button>
        </template>
      </div>
    </div>
  </div>
</template>
