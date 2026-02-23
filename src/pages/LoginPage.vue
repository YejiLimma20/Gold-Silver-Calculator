<script setup>
import { computed, inject } from 'vue'
import { useRouter } from 'vue-router'

const auth = inject('auth')

const router = useRouter()

const authMode = auth.authMode
const authEmail = auth.authEmail
const authPassword = auth.authPassword
const authPasswordConfirm = auth.authPasswordConfirm
const authError = auth.authError

const toggleAuthMode = auth.toggleAuthMode
const handleAuthSubmit = auth.handleAuthSubmit

const isAuthenticated = computed(
  () => auth.currentUser && !!auth.currentUser.value,
)

function onSubmit() {
  handleAuthSubmit()
  if (isAuthenticated.value) {
    router.push({ name: 'calculator' })
  }
}
</script>

<template>
  <div class="login-layout">
    <section class="login-card">
      <div class="login-left">
        <div class="eyebrow">Romero Jewelry Studio</div>
        <h2 class="title">
          {{ authMode === 'login' ? 'Welcome back' : 'Create your account' }}
        </h2>
        <p class="subtitle">
          {{ authMode === 'login'
            ? 'Log in to save your calculator preferences on this device.'
            : 'Sign up to keep your latest jewelry pricing settings ready to use.' }}
        </p>

        <div class="highlights">
          <span class="chip">Gold &amp; silver pricing</span>
          <span class="chip">Philippine VAT ready</span>
          <span class="chip">Local only, secure</span>
        </div>
      </div>

      <div class="login-right">
        <div class="mode-toggle">
          <button
            type="button"
            class="mode-pill"
            :class="{ 'mode-pill-active': authMode === 'login' }"
            @click="authMode = 'login'"
          >
            Log in
          </button>
          <button
            type="button"
            class="mode-pill"
            :class="{ 'mode-pill-active': authMode === 'signup' }"
            @click="authMode = 'signup'"
          >
            Sign up
          </button>
        </div>

        <form class="auth-form" @submit.prevent="onSubmit">
          <label class="field">
            <span class="field-label">Email</span>
            <input
              v-model="authEmail"
              type="email"
              required
              class="field-input"
              placeholder="you@example.com"
            />
          </label>

          <label class="field">
            <span class="field-label">Password</span>
            <input
              v-model="authPassword"
              type="password"
              required
              minlength="6"
              class="field-input"
              placeholder="Minimum 6 characters"
            />
          </label>

          <label v-if="authMode === 'signup'" class="field">
            <span class="field-label">Confirm password</span>
            <input
              v-model="authPasswordConfirm"
              type="password"
              required
              minlength="6"
              class="field-input"
              placeholder="Repeat your password"
            />
          </label>

          <p v-if="authError" class="auth-error">
            {{ authError }}
          </p>

          <button type="submit" class="primary-button wide">
            {{ authMode === 'login' ? 'Log in' : 'Create account' }}
          </button>

          <button
            type="button"
            class="link-button switch-auth"
            @click="toggleAuthMode"
          >
            {{ authMode === 'login'
              ? 'Need an account? Sign up'
              : 'Already have an account? Log in' }}
          </button>
        </form>
      </div>
    </section>
  </div>
</template>

<style scoped>
.login-layout {
  width: 100%;
  display: flex;
  justify-content: center;
}

.login-card {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 2rem;
  align-items: stretch;
  border-radius: 1.75rem;
  padding: 2rem 2.2rem;
  background: radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.9), transparent 70%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(254, 243, 199, 0.9));
  border: 1px solid rgba(250, 204, 21, 0.32);
  box-shadow:
    0 32px 70px rgba(15, 23, 42, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.4);
}

.login-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #92400e;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  box-shadow:
    0 8px 18px rgba(251, 191, 36, 0.45),
    0 0 0 1px rgba(251, 191, 36, 0.6);
}

.title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: #6b7280;
  max-width: 25rem;
}

.highlights {
  margin-top: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  background-color: rgba(15, 23, 42, 0.04);
  color: #4b5563;
  border: 1px solid rgba(148, 163, 184, 0.4);
}

.login-right {
  padding: 1.1rem 1.3rem;
  border-radius: 1.25rem;
  background: rgba(15, 23, 42, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mode-toggle {
  display: inline-flex;
  align-self: center;
  padding: 0.2rem;
  border-radius: 999px;
  background-color: rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.7);
  gap: 0.15rem;
}

.mode-pill {
  border: none;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  background: transparent;
  color: #6b7280;
  transition:
    background-color 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease;
}

.mode-pill-active {
  background: linear-gradient(135deg, #facc15, #f97316);
  color: #111827;
  box-shadow:
    0 10px 18px rgba(15, 23, 42, 0.35),
    0 0 0 1px rgba(234, 179, 8, 0.6);
}

.auth-form {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}

.field-input {
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.8);
  padding: 0.55rem 0.9rem;
  font-size: 0.9rem;
  font-family: inherit;
  background-color: rgba(15, 23, 42, 0.01);
  color: inherit;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.field-input::placeholder {
  color: rgba(148, 163, 184, 0.8);
}

.field-input:focus-visible {
  border-color: #facc15;
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.1),
    0 0 0 3px rgba(250, 204, 21, 0.55);
  background-color: rgba(15, 23, 42, 0.02);
}

.auth-error {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  color: #f97373;
}

.primary-button {
  border-radius: 999px;
  border: none;
  padding: 0.6rem 1.2rem;
  font-size: 0.92rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  color: #111827;
  background: linear-gradient(135deg, #facc15, #f97316);
  box-shadow:
    0 12px 28px rgba(250, 204, 21, 0.45),
    0 0 0 1px rgba(234, 179, 8, 0.6);
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    filter 0.1s ease;
}

.primary-button.wide {
  width: 100%;
}

.primary-button:hover {
  transform: translateY(-1px);
  filter: brightness(1.03);
  box-shadow:
    0 16px 34px rgba(250, 204, 21, 0.55),
    0 0 0 1px rgba(234, 179, 8, 0.8);
}

.primary-button:active {
  transform: translateY(0);
  box-shadow:
    0 8px 16px rgba(250, 204, 21, 0.4),
    0 0 0 1px rgba(234, 179, 8, 0.7);
}

.link-button {
  border: none;
  padding: 0;
  margin: 0;
  background: none;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 500;
  color: #92400e;
  text-decoration: none;
}

.link-button:hover {
  text-decoration: underline;
}

.switch-auth {
  align-self: flex-start;
}

@media (max-width: 900px) {
  .login-card {
    grid-template-columns: minmax(0, 1fr);
    padding: 1.8rem 1.6rem;
  }

  .login-right {
    margin-top: 0.25rem;
  }
}

@media (max-width: 640px) {
  .login-card {
    padding: 1.6rem 1.3rem;
  }
}
</style>
