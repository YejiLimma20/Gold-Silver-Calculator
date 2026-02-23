<script setup>
import { computed, inject } from 'vue'
import Calculator from '../components/Calculator.vue'

const auth = inject('auth', null)
const theme = inject('theme', null)

const metalType = theme ? theme.metalType : null
const darkMode = theme ? theme.darkMode : null

const isAuthenticated = computed(
  () => auth && auth.currentUser && !!auth.currentUser.value,
)
</script>

<template>
  <section class="card calc-card">
    <Calculator
      v-if="isAuthenticated && metalType && darkMode !== null"
      v-model:metalType="metalType"
      :dark-mode="darkMode"
    />
    <div v-else class="calc-locked">
      <h2>Sign in to access the calculator</h2>
      <p>
        Create an account or log in to start computing live jewelry prices.
      </p>
    </div>
  </section>
</template>

