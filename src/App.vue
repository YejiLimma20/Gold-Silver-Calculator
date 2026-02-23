<script setup>
import { computed, onMounted, provide, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const metalType = ref('gold')
const darkMode = ref(false)
const authMode = ref('login')
const users = ref([])
const currentUser = ref(null)
const authEmail = ref('')
const authPassword = ref('')
const authPasswordConfirm = ref('')
const authError = ref('')

const router = useRouter()

const themeLabel = computed(() =>
  metalType.value === 'gold' ? 'Gold' : 'Silver',
)

const appThemeClass = computed(() =>
  metalType.value === 'gold' ? 'theme-gold' : 'theme-silver',
)

const isAuthenticated = computed(() => !!currentUser.value)

const currentUserEmail = computed(() =>
  currentUser.value ? currentUser.value.email : '',
)

const STORAGE_PREFIX = 'jewelryCalc.'
const THEME_KEY = STORAGE_PREFIX + 'theme'
const DARK_KEY = STORAGE_PREFIX + 'darkMode'
const USERS_KEY = STORAGE_PREFIX + 'users'
const CURRENT_USER_KEY = STORAGE_PREFIX + 'currentUser'

onMounted(() => {
  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme === 'gold' || savedTheme === 'silver') {
    metalType.value = savedTheme
  }

  const savedDark = localStorage.getItem(DARK_KEY)
  if (savedDark === 'true') {
    darkMode.value = true
  }

  const savedUsers = localStorage.getItem(USERS_KEY)
  if (savedUsers) {
    try {
      const parsed = JSON.parse(savedUsers)
      if (Array.isArray(parsed)) {
        users.value = parsed
      }
    } catch {}
  }

  const savedCurrent = localStorage.getItem(CURRENT_USER_KEY)
  if (savedCurrent) {
    try {
      const parsed = JSON.parse(savedCurrent)
      if (parsed && typeof parsed.email === 'string') {
        currentUser.value = parsed
      }
    } catch {}
  }
})

watch(metalType, value => {
  localStorage.setItem(THEME_KEY, value)
})

watch(darkMode, value => {
  localStorage.setItem(DARK_KEY, value ? 'true' : 'false')
})

watch(
  users,
  value => {
    localStorage.setItem(USERS_KEY, JSON.stringify(value))
  },
  { deep: true },
)

watch(currentUser, value => {
  if (value) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(value))
  } else {
    localStorage.removeItem(CURRENT_USER_KEY)
  }
})

function toggleAuthMode() {
  authMode.value = authMode.value === 'login' ? 'signup' : 'login'
  authError.value = ''
  authPasswordConfirm.value = ''
}

function clearAuthFields() {
  authEmail.value = ''
  authPassword.value = ''
  authPasswordConfirm.value = ''
}

function handleAuthSubmit() {
  if (authMode.value === 'signup') {
    signup()
  } else {
    login()
  }
}

function signup() {
  const email = authEmail.value.trim()
  const password = authPassword.value

  if (!email || !password) {
    authError.value = 'Email and password are required.'
    return
  }

  if (password.length < 6) {
    authError.value = 'Password must be at least 6 characters.'
    return
  }

  if (authPasswordConfirm.value !== password) {
    authError.value = 'Passwords do not match.'
    return
  }

  const existing = users.value.find(
    user => user.email.toLowerCase() === email.toLowerCase(),
  )

  if (existing) {
    authError.value = 'An account with this email already exists.'
    return
  }

  const newUser = { email, password }
  users.value = [...users.value, newUser]
  currentUser.value = { email }
  authError.value = ''
  clearAuthFields()
}

function login() {
  const email = authEmail.value.trim()
  const password = authPassword.value

  if (!email || !password) {
    authError.value = 'Email and password are required.'
    return
  }

  const user = users.value.find(
    item => item.email.toLowerCase() === email.toLowerCase(),
  )

  if (!user || user.password !== password) {
    authError.value = 'Invalid email or password.'
    return
  }

  currentUser.value = { email }
  authError.value = ''
  clearAuthFields()
}

function logout() {
  currentUser.value = null
  router.push({ name: 'login' })
}

provide('auth', {
  authMode,
  users,
  currentUser,
  authEmail,
  authPassword,
  authPasswordConfirm,
  authError,
  toggleAuthMode,
  handleAuthSubmit,
  logout,
})

provide('theme', {
  metalType,
  darkMode,
  themeLabel,
  appThemeClass,
})
</script>

<template>
  <div :class="['app-root', appThemeClass, { 'is-dark': darkMode }]">
    <header class="app-header">
      <div class="brand">
        <div class="brand-mark">RG</div>
        <div class="brand-text">
          <h1>Romero Jewelry Calculator</h1>
          <p>Gold and silver jewelry pricing with live calculations</p>
        </div>
      </div>

      <div class="header-controls">
        <div class="toggle-group">
          <span class="toggle-label">Metal theme</span>
          <button
            type="button"
            class="toggle-switch theme-toggle"
            @click="metalType = metalType === 'gold' ? 'silver' : 'gold'"
          >
            <span class="toggle-track">
              <span
                class="toggle-thumb"
                :class="metalType === 'gold' ? 'thumb-gold' : 'thumb-silver'"
              />
            </span>
            <span class="toggle-text">
              {{ themeLabel }}
            </span>
          </button>
        </div>

        <div class="toggle-group">
          <span class="toggle-label">Dark mode</span>
          <button
            type="button"
            class="toggle-switch dark-toggle"
            @click="darkMode = !darkMode"
          >
            <span class="toggle-track">
              <span class="toggle-thumb" :class="{ 'thumb-on': darkMode }" />
            </span>
            <span class="toggle-text">
              {{ darkMode ? 'On' : 'Off' }}
            </span>
          </button>
        </div>

        <div v-if="isAuthenticated" class="user-pill">
          <span class="user-avatar">
            {{ currentUserEmail.charAt(0).toUpperCase() }}
          </span>
          <span class="user-email">{{ currentUserEmail }}</span>
          <button type="button" class="link-button" @click="logout">
            Log out
          </button>
        </div>
      </div>
    </header>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-root {
  --accent: #d4af37;
  --accent-soft: rgba(212, 175, 55, 0.15);
  --accent-strong: #fbbf24;
  --bg-elevated: rgba(255, 255, 255, 0.9);
  --bg-muted: rgba(255, 255, 255, 0.4);
  --border-subtle: rgba(15, 23, 42, 0.08);
  --text-color: #0b1020;
  --text-muted: #6b7280;
  --chip-bg: rgba(15, 23, 42, 0.04);
  min-height: 100vh;
  padding: 2.5rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  color: var(--text-color);
  background:
    radial-gradient(circle at top left, rgba(252, 211, 77, 0.35), transparent 60%),
    linear-gradient(180deg, #fffbeb, #fef3c7);
  transition:
    background 0.4s ease,
    color 0.35s ease;
}

.app-root.theme-silver {
  --accent: #c0c0c0;
  --accent-soft: rgba(192, 192, 192, 0.24);
  --accent-strong: #e5e5e5;
  --bg-elevated: rgba(248, 250, 252, 0.9);
  --bg-muted: rgba(15, 23, 42, 0.06);
  --border-subtle: rgba(15, 23, 42, 0.12);
  --text-color: #020617;
  --text-muted: #6b7280;
  --chip-bg: rgba(15, 23, 42, 0.03);
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.9), transparent 60%),
    linear-gradient(180deg, #f9fafb, #e5e7eb);
}

.app-root.is-dark {
  --bg-elevated: rgba(15, 23, 42, 0.92);
  --bg-muted: rgba(15, 23, 42, 0.86);
  --border-subtle: rgba(148, 163, 184, 0.35);
  --text-color: #e5e7eb;
  --text-muted: #9ca3af;
  --chip-bg: rgba(15, 23, 42, 0.6);
  color-scheme: dark;
  background:
    radial-gradient(circle at top left, rgba(248, 250, 252, 0.05), transparent 60%),
    radial-gradient(circle at bottom right, #020617, #020617);
}

.app-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.75rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  letter-spacing: 0.08em;
  font-size: 0.9rem;
  text-transform: uppercase;
  color: #0f172a;
  background: radial-gradient(circle at 20% 0%, #fff7cc, #fbbf24, #b45309);
  box-shadow:
    0 10px 25px rgba(15, 23, 42, 0.45),
    inset 0 0 0 1px rgba(255, 255, 255, 0.35);
}

.brand-text h1 {
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  margin: 0 0 0.15rem;
}

.brand-text p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.header-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 1.25rem;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.toggle-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--text-muted);
}

.toggle-switch {
  position: relative;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  padding: 0.1rem 0.55rem 0.1rem 0.2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.22), transparent),
    linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.94));
  cursor: pointer;
  color: #e5e7eb;
  font-size: 0.75rem;
  line-height: 1.2;
  font-weight: 500;
  box-shadow: 0 12px 25px rgba(15, 23, 42, 0.6);
}

.toggle-switch.dark-toggle {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.9));
}

.toggle-track {
  position: relative;
  width: 40px;
  height: 22px;
  border-radius: 999px;
  background: radial-gradient(circle at 0% 0%, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.7));
  box-shadow:
    inset 0 0 0 0.5px rgba(148, 163, 184, 0.8),
    inset 0 4px 8px rgba(15, 23, 42, 0.75);
  overflow: hidden;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: linear-gradient(145deg, #fbbf24, #b45309);
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(248, 250, 252, 0.25);
  transition:
    transform 0.22s ease,
    background 0.22s ease;
}

.toggle-thumb.thumb-gold {
  background: linear-gradient(145deg, #facc15, #b45309);
}

.toggle-thumb.thumb-silver {
  background: linear-gradient(145deg, #f9fafb, #9ca3af);
  box-shadow:
    0 4px 8px rgba(15, 23, 42, 0.5),
    0 0 0 1px rgba(148, 163, 184, 0.7);
  transform: translateX(18px);
}

.toggle-thumb.thumb-on {
  transform: translateX(18px);
}

.toggle-text {
  padding-right: 0.25rem;
}

.user-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem 0.25rem 0.25rem;
  border-radius: 999px;
  background-color: var(--chip-bg);
  border: 1px solid rgba(148, 163, 184, 0.5);
  backdrop-filter: blur(18px);
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #0f172a;
  background: radial-gradient(circle at 30% 0%, #fef9c3, #facc15, #b45309);
  box-shadow:
    0 6px 16px rgba(15, 23, 42, 0.65),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
}

.user-email {
  font-size: 0.8rem;
}

.link-button {
  border: none;
  padding: 0;
  margin: 0;
  background: none;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--accent-strong);
  text-decoration: none;
}

.link-button:hover {
  text-decoration: underline;
}

.app-main {
  margin-top: 1.75rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.card {
  border-radius: 1.5rem;
  padding: 1.75rem 1.75rem 1.9rem;
  background: radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.9), transparent 70%),
    linear-gradient(145deg, var(--bg-elevated), var(--bg-muted));
  border: 1px solid var(--border-subtle);
  backdrop-filter: blur(18px);
  box-shadow:
    0 26px 60px rgba(15, 23, 42, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.08);
}

.auth-card {
  max-width: 420px;
}

.calc-card {
  min-height: 360px;
}

.calc-locked {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.4rem;
  color: var(--text-color);
}

.calc-locked h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
}

.calc-locked p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.card-header h2 {
  margin: 0 0 0.3rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.card-header p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.auth-form {
  margin-top: 1.25rem;
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
  color: var(--text-muted);
}

.field-input {
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.6);
  padding: 0.55rem 0.9rem;
  font-size: 0.9rem;
  font-family: inherit;
  background-color: rgba(15, 23, 42, 0.02);
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
  border-color: var(--accent-strong);
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.15),
    0 0 0 3px rgba(250, 204, 21, 0.4);
  background-color: rgba(15, 23, 42, 0.04);
}

.primary-button {
  border-radius: 999px;
  border: none;
  padding: 0.6rem 1.2rem;
  margin-top: 0.25rem;
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

.switch-auth {
  align-self: flex-start;
}

.auth-error {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  color: #f97373;
}

.auth-summary {
  margin-top: 1.4rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.auth-email {
  font-weight: 600;
  color: var(--text-color);
}

.auth-message {
  margin: 0 0 0.4rem;
}

.auth-note {
  margin: 0;
}

@media (max-width: 960px) {
  .app-main {
    grid-template-columns: minmax(0, 1fr);
  }

  .auth-card {
    max-width: 100%;
  }
}

@media (max-width: 720px) {
  .app-root {
    padding: 1.75rem 1.25rem 2.25rem;
  }

  .app-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-controls {
    align-self: stretch;
    justify-content: space-between;
  }

  .card {
    padding: 1.5rem 1.35rem 1.6rem;
  }
}

@media (max-width: 480px) {
  .header-controls {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-pill {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
