<script setup>
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({
  metalType: {
    type: String,
    default: 'gold',
  },
  darkMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:metalType'])

const internalMetalType = ref(
  props.metalType === 'silver' ? 'silver' : 'gold',
)

watch(
  () => props.metalType,
  value => {
    internalMetalType.value = value === 'silver' ? 'silver' : 'gold'
  },
)

watch(internalMetalType, value => {
  emit('update:metalType', value)
})

const ratePerGram = ref('')
const weightGrams = ref('')
const designCharge = ref('')

const STORAGE_KEY = 'jewelryCalc.inputs'

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return

  try {
    const parsed = JSON.parse(saved)
    if (parsed && typeof parsed === 'object') {
      if (typeof parsed.metalType === 'string') {
        internalMetalType.value =
          parsed.metalType === 'silver' ? 'silver' : 'gold'
      }
      if (typeof parsed.ratePerGram === 'string') {
        ratePerGram.value = parsed.ratePerGram
      }
      if (typeof parsed.weightGrams === 'string') {
        weightGrams.value = parsed.weightGrams
      }
      if (typeof parsed.designCharge === 'string') {
        designCharge.value = parsed.designCharge
      }
    }
  } catch {}
})

watch(
  [internalMetalType, ratePerGram, weightGrams, designCharge],
  ([metal, rate, weight, design]) => {
    const payload = {
      metalType: metal,
      ratePerGram: rate,
      weightGrams: weight,
      designCharge: design,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  },
)

function parseAmount(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) {
    return 0
  }
  return n
}

const numericRate = computed(() => parseAmount(ratePerGram.value))
const numericWeight = computed(() => parseAmount(weightGrams.value))
const numericDesign = computed(() => parseAmount(designCharge.value))

const rateError = computed(() => {
  if (!ratePerGram.value) {
    return 'Current rate per gram is required.'
  }
  if (numericRate.value < 0) {
    return 'Rate per gram cannot be negative.'
  }
  return ''
})

const weightError = computed(() => {
  if (!weightGrams.value) {
    return 'Weight in grams is required.'
  }
  if (numericWeight.value < 0) {
    return 'Weight cannot be negative.'
  }
  return ''
})

const designError = computed(() => {
  if (!designCharge.value && designCharge.value !== '0') {
    return 'Design charge is required.'
  }
  if (numericDesign.value < 0) {
    return 'Design charge cannot be negative.'
  }
  return ''
})

const hasErrors = computed(
  () => !!rateError.value || !!weightError.value || !!designError.value,
)

const metalValue = computed(() => {
  if (hasErrors.value) return 0
  return numericRate.value * numericWeight.value
})

const subtotalForVat = computed(() => {
  if (hasErrors.value) return 0
  return metalValue.value + numericDesign.value
})

const vat = computed(() => subtotalForVat.value * 0.12)
const grandTotal = computed(() => subtotalForVat.value + vat.value)

const formatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
})

function formatCurrency(amount) {
  if (!Number.isFinite(amount)) {
    return '₱0.00'
  }
  return formatter.format(amount)
}

const formattedMetalValue = computed(() => formatCurrency(metalValue.value))
const formattedDesignCharge = computed(() => formatCurrency(numericDesign.value))
const formattedVat = computed(() => formatCurrency(vat.value))
const formattedGrandTotal = computed(() => formatCurrency(grandTotal.value))

const metalLabel = computed(() =>
  internalMetalType.value === 'gold' ? 'Gold' : 'Silver',
)

function setMetalType(type) {
  internalMetalType.value = type === 'silver' ? 'silver' : 'gold'
}
</script>

<template>
  <div class="calculator">
    <div class="calc-header">
      <h2>Jewelry price calculator</h2>
      <p>
        Compute the live price of
        <span class="metal-label">{{ metalLabel }}</span>
        jewelry in Philippine pesos.
      </p>
    </div>

    <div class="calc-grid">
      <section class="calc-inputs">
        <div class="field metal-selector">
          <span class="field-label">Metal type</span>
          <div class="metal-toggle">
            <button
              type="button"
              class="pill"
              :class="{ 'pill-active': internalMetalType === 'gold' }"
              @click="setMetalType('gold')"
            >
              Gold
            </button>
            <button
              type="button"
              class="pill"
              :class="{ 'pill-active': internalMetalType === 'silver' }"
              @click="setMetalType('silver')"
            >
              Silver
            </button>
          </div>
        </div>

        <label class="field">
          <span class="field-label">Current rate per gram</span>
          <div class="field-input-wrapper">
            <span class="field-prefix">₱</span>
            <input
              v-model="ratePerGram"
              type="number"
              min="0"
              step="0.01"
              class="field-input number-input"
              placeholder="0.00"
            />
          </div>
          <p v-if="rateError" class="field-error">
            {{ rateError }}
          </p>
        </label>

        <label class="field">
          <span class="field-label">Weight in grams</span>
          <div class="field-input-wrapper">
            <input
              v-model="weightGrams"
              type="number"
              min="0"
              step="0.01"
              class="field-input number-input"
              placeholder="0.00"
            />
            <span class="field-suffix">g</span>
          </div>
          <p v-if="weightError" class="field-error">
            {{ weightError }}
          </p>
        </label>

        <label class="field">
          <span class="field-label">Design charge</span>
          <div class="field-input-wrapper">
            <span class="field-prefix">₱</span>
            <input
              v-model="designCharge"
              type="number"
              min="0"
              step="0.01"
              class="field-input number-input"
              placeholder="0.00"
            />
          </div>
          <p v-if="designError" class="field-error">
            {{ designError }}
          </p>
        </label>
      </section>

      <section class="calc-output">
        <h3>Price breakdown</h3>
        <ul class="breakdown-list">
          <li class="breakdown-row">
            <div class="breakdown-meta">
              <span class="label">Metal value</span>
              <span class="hint">
                {{ metalLabel }} rate × weight
              </span>
            </div>
            <span class="value">
              {{ formattedMetalValue }}
            </span>
          </li>
          <li class="breakdown-row">
            <div class="breakdown-meta">
              <span class="label">Design charge</span>
              <span class="hint">Custom craftsmanship and design</span>
            </div>
            <span class="value">
              {{ formattedDesignCharge }}
            </span>
          </li>
          <li class="breakdown-row">
            <div class="breakdown-meta">
              <span class="label">VAT (12%)</span>
              <span class="hint">Philippine value-added tax</span>
            </div>
            <span class="value">
              {{ formattedVat }}
            </span>
          </li>
        </ul>

        <div class="grand-total">
          <div class="grand-total-label">Grand total</div>
          <div class="grand-total-value" :class="{ 'shine-effect': !hasErrors }">
            {{ formattedGrandTotal }}
          </div>
          <p v-if="hasErrors" class="total-hint">
            Enter all required values above to see the complete total.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.calculator {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  height: 100%;
}

.calc-header h2 {
  margin: 0 0 0.3rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.calc-header p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.metal-label {
  font-weight: 600;
  color: var(--accent);
}

.calc-grid {
  margin-top: 1.1rem;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.2fr);
  gap: 1.5rem;
  align-items: start;
}

.calc-inputs,
.calc-output {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.field-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.field-input {
  flex: 1;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  padding: 0.6rem 0.9rem;
  font-size: 0.92rem;
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
  color: rgba(148, 163, 184, 0.85);
}

.field-input:focus-visible {
  border-color: var(--accent-strong);
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.15),
    0 0 0 3px rgba(250, 204, 21, 0.4);
  background-color: rgba(15, 23, 42, 0.04);
}

.field-prefix,
.field-suffix {
  position: absolute;
  font-size: 0.85rem;
  color: var(--text-muted);
  pointer-events: none;
}

.field-prefix {
  left: 0.85rem;
}

.field-suffix {
  right: 0.85rem;
}

.number-input {
  padding-left: 2.1rem;
}

.number-input + .field-suffix {
  padding-left: 0;
}

.field-error {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  color: #f97373;
}

.metal-selector {
  margin-bottom: 0.25rem;
}

.metal-toggle {
  display: inline-flex;
  padding: 0.2rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.6);
  gap: 0.15rem;
}

.pill {
  border: none;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  background: transparent;
  color: var(--text-muted);
  transition:
    background-color 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease;
}

.pill-active {
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: #111827;
  box-shadow:
    0 10px 18px rgba(15, 23, 42, 0.35),
    0 0 0 1px rgba(234, 179, 8, 0.6);
}

.calc-output h3 {
  margin: 0 0 0.6rem;
  font-size: 1rem;
  font-weight: 600;
}

.breakdown-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.breakdown-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px dashed rgba(148, 163, 184, 0.6);
}

.breakdown-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.breakdown-row .label {
  font-size: 0.9rem;
  font-weight: 500;
}

.breakdown-row .hint {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.breakdown-row .value {
  font-size: 0.95rem;
  font-weight: 600;
}

.grand-total {
  margin-top: 0.9rem;
  padding-top: 0.9rem;
  border-top: 1px solid rgba(148, 163, 184, 0.85);
}

.grand-total-label {
  font-size: 0.83rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.grand-total-value {
  position: relative;
  margin-top: 0.25rem;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--accent);
  text-shadow:
    0 0 12px rgba(250, 204, 21, 0.45),
    0 0 32px rgba(245, 158, 11, 0.55);
  overflow: hidden;
}

.grand-total-value.shine-effect::after {
  content: '';
  position: absolute;
  top: -20%;
  left: -150%;
  width: 60%;
  height: 140%;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0.7),
    rgba(255, 255, 255, 0)
  );
  transform: skewX(-20deg);
  animation: shine 2.4s ease-in-out infinite;
  opacity: 0.85;
}

.total-hint {
  margin: 0.45rem 0 0;
  font-size: 0.82rem;
  color: var(--text-muted);
}

@keyframes shine {
  0% {
    transform: translateX(0) skewX(-20deg);
  }
  100% {
    transform: translateX(260%) skewX(-20deg);
  }
}

@media (max-width: 960px) {
  .calc-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 640px) {
  .calc-grid {
    gap: 1.15rem;
  }
}
</style>

