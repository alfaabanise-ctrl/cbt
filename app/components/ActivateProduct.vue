<template>
  <div
    class="flex min-h-screen flex-col bg-[#f6f3ec] font-sans text-[#201f22]"
  >
    <!-- =========================================================
         HEADER
    ========================================================== -->
    <header class="bg-[#24304a] text-[#f4efe2]">
      <div
        class="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8"
      >
        <!-- BRAND -->
        <div class="flex min-w-0 items-center gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#f4efe2] sm:h-11 sm:w-11"
          >
            <Icon name="lucide:shield-check" size="21" />
          </div>

          <div class="min-w-0">
            <h1 class="truncate text-base font-medium sm:text-lg">
              Product Activation
            </h1>

            <p class="mt-0.5 text-[10px] leading-4 text-[#f4efe2]/65 sm:text-xs">
              Activate premium features on this device
            </p>
          </div>
        </div>

        <!-- HOME BUTTON -->
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white transition hover:bg-white/10 sm:h-10 sm:w-10"
          @click="goHome"
          aria-label="Go home"
        >
          <Icon name="lucide:house" size="18" />
        </button>
      </div>
    </header>

    <!-- =========================================================
         PAGE NAVIGATION
    ========================================================== -->
    <nav
      class="mx-auto w-full max-w-6xl overflow-x-auto px-3 py-3 sm:px-6 lg:px-8"
    >
      <div
        class="mx-auto grid min-w-[480px] max-w-[900px] grid-cols-3 gap-2 sm:min-w-0 sm:gap-3"
      >
        <button
          v-for="item in pages"
          :key="item.id"
          type="button"
          class="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-[11px] font-medium transition sm:gap-2 sm:px-4 sm:text-sm"
          :class="
            selectedPage === item.id
              ? 'border-[#24304a] bg-[#24304a] text-white shadow-sm'
              : 'border-[#e6e0d2] bg-[#fffdf8] text-[#6b665c] hover:border-[#b9873b] hover:text-[#24304a]'
          "
          @click="selectedPage = item.id"
        >
          <Icon :name="item.icon" class="h-4 w-4 shrink-0" />
          <span class="truncate">{{ item.name }}</span>
        </button>
      </div>
    </nav>

    <!-- =========================================================
         MAIN CONTENT
    ========================================================== -->
    <main
      class="mx-auto w-full max-w-6xl flex-1 px-3 pb-10 sm:px-6 lg:px-8 lg:pb-16"
    >
      <!-- =======================================================
           ACTIVATE WITH KEY
      ======================================================== -->
      <section
        v-if="selectedPage === 1"
        class="rounded-2xl border border-[#e6e0d2] bg-[#fffdf8] p-4 shadow-[0_5px_20px_rgba(36,48,74,0.04)] sm:p-6 md:p-8"
      >
        <div class="mx-auto w-full max-w-xl">
          <!-- SECTION INTRO -->
          <div class="mb-6 text-center sm:mb-7">
            <div
              class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#24304a]/10 text-[#24304a]"
            >
              <Icon name="lucide:key-round" size="24" />
            </div>

            <h2 class="text-lg font-medium text-[#24304a] sm:text-xl">
              Activate with License Key
            </h2>

            <p class="mt-1 text-xs leading-5 text-[#6b665c] sm:text-sm">
              Enter your activation key to unlock premium features.
            </p>
          </div>

          <form @submit.prevent="activateWithKey">
            <!-- LICENSE KEY -->
            <div class="mb-5">
              <label
                for="licenseKey"
                class="mb-1.5 block text-xs font-medium text-[#201f22] sm:text-sm"
              >
                License / Activation Key
                <span class="text-[#ab5137]">*</span>
              </label>

              <div
                class="flex min-h-12 w-full items-center gap-2 rounded-xl border bg-white px-3 transition focus-within:border-[#24304a] focus-within:ring-4 focus-within:ring-[#24304a]/10"
                :class="
                  errors.licenseKey
                    ? 'border-[#ab5137]'
                    : 'border-[#e6e0d2]'
                "
              >
                <Icon
                  name="lucide:key-round"
                  class="shrink-0 text-[#6b665c]"
                  size="18"
                />

                <input
                  id="licenseKey"
                  v-model.trim="form.licenseKey"
                  type="text"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  autocomplete="off"
                  class="min-w-0 w-full border-0 bg-transparent font-mono text-xs tracking-wider text-[#201f22] uppercase outline-none placeholder:tracking-normal placeholder:text-[#aaa59b] sm:text-sm"
                  @input="formatLicenseKey"
                />

                <button
                  v-if="form.licenseKey"
                  type="button"
                  class="flex shrink-0 items-center justify-center text-[#6b665c] transition hover:text-[#24304a]"
                  @click="form.licenseKey = ''"
                  aria-label="Clear license key"
                >
                  <Icon name="lucide:x" size="17" />
                </button>
              </div>

              <small
                v-if="errors.licenseKey"
                class="mt-1 block text-[11px] text-[#ab5137]"
              >
                {{ errors.licenseKey }}
              </small>

              <p class="mt-1.5 text-[11px] leading-4 text-[#6b665c]">
                Your activation key normally contains letters and numbers.
              </p>
            </div>

            <!-- DEVICE ID -->
            <div class="mb-5 hidden">
              <label
                class="mb-1.5 block text-xs font-medium text-[#201f22]"
              >
                Device ID
              </label>

              <div
                class="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-dashed border-[#e6e0d2] bg-[#f6f3ec] p-2 pl-3"
              >
                <div class="flex min-w-0 items-center gap-2">
                  <Icon
                    name="lucide:monitor-smartphone"
                    class="shrink-0 text-[#6b665c]"
                  />

                  <span
                    class="truncate font-mono text-[10px] text-[#201f22] sm:text-[11px]"
                  >
                    {{ deviceId || "Detecting device..." }}
                  </span>
                </div>

                <button
                  type="button"
                  class="flex shrink-0 items-center gap-1 rounded-lg border border-[#e6e0d2] bg-[#fffdf8] px-2.5 py-2 text-[11px] font-medium text-[#24304a] transition hover:bg-[#eee9dc] disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="!deviceId"
                  @click="copyDeviceId"
                >
                  <Icon name="lucide:copy" size="14" />
                  Copy
                </button>
              </div>

              <p class="mt-1.5 text-[11px] text-[#6b665c]">
                Your license may be linked to this device.
              </p>
            </div>

            <!-- TERMS -->
            <label
              class="mt-5 flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-[#6b665c]"
            >
              <input
                v-model="form.acceptTerms"
                type="checkbox"
                class="mt-1 h-4 w-4 shrink-0 rounded border-[#e6e0d2] accent-[#24304a]"
              />

              <span>
                I agree to the
                <button
                  type="button"
                  class="font-medium text-[#24304a] underline underline-offset-2 transition hover:text-[#b9873b]"
                  @click="selectedPage = 3"
                >
                  License Terms & Conditions
                </button>
              </span>
            </label>

            <p
              v-if="errors.terms"
              class="mt-1 text-[11px] text-[#ab5137]"
            >
              {{ errors.terms }}
            </p>

            <!-- SUBMIT -->
            <button
              type="submit"
              class="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#24304a] px-4 text-sm font-medium text-white transition hover:bg-[#3c4c6e] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="loading"
            >
              <Icon
                :name="
                  loading
                    ? 'lucide:loader-circle'
                    : 'lucide:shield-check'
                "
                :class="{ 'animate-spin': loading }"
                size="18"
              />

              {{ loading ? "Activating..." : "Activate Product" }}
            </button>
          </form>
        </div>
      </section>

      <!-- =======================================================
           PURCHASE ACTIVATION
      ======================================================== -->
      <section
        v-if="selectedPage === 2"
        class="rounded-2xl border border-[#e6e0d2] bg-[#fffdf8] p-4 shadow-[0_5px_20px_rgba(36,48,74,0.04)] sm:p-6 md:p-8"
      >
        <PurchaseActivation
          @activated="isActivated = true"
        />
      </section>

      <!-- =======================================================
           LICENSE TERMS
      ======================================================== -->
      <section
        v-if="selectedPage === 3"
        class="rounded-2xl border border-[#e6e0d2] bg-[#fffdf8] p-4 shadow-[0_5px_20px_rgba(36,48,74,0.04)] sm:p-6 md:p-8"
      >
        <div class="mb-5 flex items-start gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#24304a]/10 text-[#24304a]"
          >
            <Icon name="lucide:file-text" size="20" />
          </div>

          <div>
            <h2 class="text-lg font-medium text-[#24304a] sm:text-xl">
              License Terms & Conditions
            </h2>

            <p class="mt-1 text-xs leading-5 text-[#6b665c]">
              Please read the terms before activating the application.
            </p>
          </div>
        </div>

        <div class="space-y-4">
          <article
            v-for="term in licenseTerms"
            :key="term.number"
            class="flex items-start gap-3 border-b border-[#eee8dc] pb-4 last:border-0 last:pb-0"
          >
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#24304a] text-[11px] font-medium text-white"
            >
              {{ term.number }}
            </span>

            <p class="text-xs leading-6 text-[#6b665c] sm:text-sm">
              {{ term.text }}
            </p>
          </article>
        </div>

        <button
          type="button"
          class="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#24304a] px-4 text-sm font-medium text-white transition hover:bg-[#3c4c6e]"
          @click="selectedPage = 1"
        >
          <Icon name="lucide:key-round" size="18" />
          Activate with Key
        </button>
      </section>

      <!-- =======================================================
           FEATURES
      ======================================================== -->
      <section class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div
          class="flex items-start gap-3 rounded-xl border border-[#e6e0d2] bg-[#fffdf8] p-4"
        >
          <Icon
            name="lucide:book-open-check"
            class="mt-0.5 shrink-0 text-[#b9873b]"
            size="20"
          />

          <div>
            <h3 class="text-xs font-medium text-[#24304a]">
              Premium Lessons
            </h3>

            <p class="mt-1 text-[11px] leading-4 text-[#6b665c]">
              Access protected curriculum content.
            </p>
          </div>
        </div>

        <div
          class="flex items-start gap-3 rounded-xl border border-[#e6e0d2] bg-[#fffdf8] p-4"
        >
          <Icon
            name="lucide:bar-chart-3"
            class="mt-0.5 shrink-0 text-[#b9873b]"
            size="20"
          />

          <div>
            <h3 class="text-xs font-medium text-[#24304a]">
              Advanced Results
            </h3>

            <p class="mt-1 text-[11px] leading-4 text-[#6b665c]">
              Unlock detailed performance analysis.
            </p>
          </div>
        </div>

        <div
          class="flex items-start gap-3 rounded-xl border border-[#e6e0d2] bg-[#fffdf8] p-4"
        >
          <Icon
            name="lucide:database"
            class="mt-0.5 shrink-0 text-[#b9873b]"
            size="20"
          />

          <div>
            <h3 class="text-xs font-medium text-[#24304a]">
              Full Question Bank
            </h3>

            <p class="mt-1 text-[11px] leading-4 text-[#6b665c]">
              Access the complete available question bank.
            </p>
          </div>
        </div>
      </section>
    </main>

    <!-- =========================================================
         TOAST
    ========================================================== -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="message"
        class="fixed bottom-4 left-3 right-3 z-[100] flex items-start gap-2.5 rounded-xl bg-[#24304a] px-4 py-3 text-xs text-white shadow-2xl sm:bottom-5 sm:left-auto sm:right-5 sm:max-w-[400px]"
        :class="
          messageType === 'success'
            ? 'border-l-4 border-[#3f7a5c]'
            : 'border-l-4 border-[#ab5137]'
        "
      >
        <Icon
          :name="
            messageType === 'success'
              ? 'lucide:circle-check'
              : 'lucide:circle-alert'
          "
          class="mt-0.5 shrink-0"
          size="17"
        />

        <span class="flex-1 leading-5">
          {{ message }}
        </span>

        <button
          type="button"
          class="flex shrink-0 text-white/80 hover:text-white"
          @click="message = ''"
          aria-label="Close message"
        >
          <Icon name="lucide:x" size="16" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'

const emit = defineEmits(['gohome'])

/* =========================================================
   STATE
========================================================= */

const selectedPage = ref(1)

const loading = ref(false)
const purchaseLoading = ref(false)

const deviceId = ref('')

const message = ref('')
const messageType = ref('success')

const isActivated = ref(false)

/* =========================================================
   FORM
========================================================= */

const form = reactive({
  name: '',
  email: '',
  licenseKey: '',
  acceptTerms: false
})

const purchase = reactive({
  email: '',
  orderNumber: '',
  phone: ''
})

const errors = reactive({
  name: '',
  email: '',
  licenseKey: '',
  terms: ''
})

/* =========================================================
   NAVIGATION
========================================================= */

const pages = [
  {
    id: 1,
    name: 'Activate with Key',
    icon: 'lucide:key-round'
  },
  {
    id: 2,
    name: 'Activate with Purchase',
    icon: 'lucide:credit-card'
  },
  {
    id: 3,
    name: 'License Terms',
    icon: 'lucide:file-text'
  }
]

const licenseTerms = [
{
number: 1,
text: 'To activate the application, you can either enter a valid Scratch Card Code or make payment through the approved payment method.'
},
{
number: 2,
text: 'After your payment or Scratch Card Code is successfully verified, a unique Activation Code will be issued for your computer.'
},
{
number: 3,
text: 'Your Activation Code unlocks the full features of the application and is valid for one computer only.'
},
{
number: 4,
text: 'Your license cannot be transferred to another computer. Changing major hardware components may affect your activation and license.'
},
{
number: 5,
text: 'Reinstalling the application or formatting your computer will not affect your license, provided your major computer hardware remains unchanged.'
},
{
number: 6,
text: 'This license is valid for version 2026 and does not expire while the supported hardware remains unchanged. Keep your Activation Code safe for future use.'
}
]

/* =========================================================
   DEVICE ID
========================================================= */

const loadDeviceId = async () => {
  try {
    if (
      import.meta.client &&
      window.__TAURI__
    ) {
      const { invoke } =
        await import('@tauri-apps/api/core')

      deviceId.value =
        await invoke('get_device_id')
    }
  } catch (error) {
    console.error(
      'Failed to get device ID:',
      error
    )

    deviceId.value = ''
  }
}

/* =========================================================
   VALIDATION
========================================================= */

const clearErrors = () => {
  errors.name = ''
  errors.email = ''
  errors.licenseKey = ''
  errors.terms = ''
}

const validateKeyForm = () => {
  clearErrors()

  let valid = true

  if (!form.name) {
    errors.name =
      'Please enter your full name.'

    valid = false
  }

  if (!form.email) {
    errors.email =
      'Please enter your email address.'

    valid = false
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      form.email
    )
  ) {
    errors.email =
      'Please enter a valid email address.'

    valid = false
  }

  if (!form.licenseKey) {
    errors.licenseKey =
      'Please enter your license key.'

    valid = false
  } else if (
    form.licenseKey
      .replace(/-/g, '')
      .length < 8
  ) {
    errors.licenseKey =
      'The license key appears to be invalid.'

    valid = false
  }

  if (!form.acceptTerms) {
    errors.terms =
      'You must accept the license terms.'

    valid = false
  }

  return valid
}

/* =========================================================
   LICENSE KEY FORMAT
========================================================= */

const formatLicenseKey = () => {
  let value = form.licenseKey
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')

  value =
    value.match(/.{1,4}/g)?.join('-') || ''

  form.licenseKey =
    value.slice(0, 19)
}

/* =========================================================
   ACTIVATE WITH KEY
========================================================= */

const activateWithKey = async () => {
  if (!validateKeyForm()) {
    return
  }

  loading.value = true
  message.value = ''

  try {
    /*
     * Replace this with your real activation API.
     */

    await new Promise(resolve =>
      setTimeout(resolve, 1000)
    )

    isActivated.value = true

    showMessage(
      'Product activated successfully.',
      'success'
    )
  } catch (error) {
    console.error(
      'Activation failed:',
      error
    )

    showMessage(
      error?.data?.message ||
        'Activation failed. Please check your license key and try again.',
      'error'
    )
  } finally {
    loading.value = false
  }
}

/* =========================================================
   PURCHASE ACTIVATION
========================================================= */

const activateWithPurchase = async () => {
  if (!purchase.email) {
    showMessage(
      'Please enter your purchase email.',
      'error'
    )

    return
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      purchase.email
    )
  ) {
    showMessage(
      'Please enter a valid email address.',
      'error'
    )

    return
  }

  if (!purchase.orderNumber) {
    showMessage(
      'Please enter your order or transaction number.',
      'error'
    )

    return
  }

  purchaseLoading.value = true

  try {
    /*
     * Connect your purchase verification
     * API here.
     */

    await new Promise(resolve =>
      setTimeout(resolve, 1000)
    )

    isActivated.value = true

    showMessage(
      'Purchase verified and product activated successfully.',
      'success'
    )
  } catch (error) {
    console.error(
      'Purchase verification failed:',
      error
    )

    showMessage(
      'We could not verify your purchase. Please check your details.',
      'error'
    )
  } finally {
    purchaseLoading.value = false
  }
}

/* =========================================================
   COPY DEVICE ID
========================================================= */

const copyDeviceId = async () => {
  if (!deviceId.value) {
    return
  }

  try {
    await navigator.clipboard.writeText(
      deviceId.value
    )

    showMessage(
      'Device ID copied.',
      'success'
    )
  } catch (error) {
    console.error(
      'Copy failed:',
      error
    )

    showMessage(
      'Unable to copy Device ID.',
      'error'
    )
  }
}

/* =========================================================
   MESSAGE
========================================================= */

let messageTimer = null

const showMessage = (
  text,
  type = 'success'
) => {
  message.value = text
  messageType.value = type

  if (messageTimer) {
    clearTimeout(messageTimer)
  }

  messageTimer = setTimeout(() => {
    message.value = ''
  }, 4000)
}

/* =========================================================
   HOME
========================================================= */

const goHome = () => {
  emit('gohome')
}

/* =========================================================
   INITIALIZATION
========================================================= */

onMounted(async () => {
  await loadDeviceId()
})
</script>

