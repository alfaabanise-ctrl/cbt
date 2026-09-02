```vue
<template>
  <div
    class="min-h-full bg-[#f6f3ec]  flex flex-col   font-sans text-[#201f22]"
  >
    <!-- =========================================================
         HEADER
    ========================================================== -->
    <header
      class="flex flex flext-1 min-h-[4.25rem] items-center justify-between bg-[#24304a] px-5 text-[#f4efe2]"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl"
        >
          <Icon name="lucide:shield-check" />
        </div>

        <div>
          <h1 class="font-serif text-lg font-semibold">
            Product Activation
          </h1>

          <p class="mt-0.5 text-xs text-[#f4efe2]/65">
            Activate premium features on this device
          </p>
        </div>
      </div>

      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-xl text-white transition hover:bg-white/10"
        @click="goHome"
        aria-label="Go home"
      >
        <Icon name="lucide:house" class="text-lg" />
      </button>
    </header>

    <!-- =========================================================
         PAGE NAVIGATION
    ========================================================== -->
    <nav
      class="mx-auto grid max-w-[900px] grid-cols-1 gap-2.5 px-4 py-2 sm:grid-cols-3"
    >
      <button
        v-for="item in pages"
        :key="item.id"
        type="button"
        class="flex  min-h-10 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition"
        :class="
          selectedPage === item.id
            ? 'border-[#24304a] bg-[#24304a] text-white shadow-sm'
            : 'border-[#e6e0d2] bg-[#fffdf8] text-[#6b665c] hover:border-[#3c4c6e] hover:text-[#24304a]'
        "
        @click="selectedPage = item.id"
      >
        <Icon :name="item.icon" class="h-4 w-4" />
        <span>{{ item.name }}</span>
      </button>
    </nav>

    <!-- =========================================================
         MAIN
    ========================================================== -->
    <main
      class="mx-auto w-[calc(100%-2rem)] max-w-[900px] pb-16"
    >
    

      <!-- =======================================================
           ACTIVATE WITH KEY
      ======================================================== -->
      <section
        v-if="selectedPage === 1"
        class="rounded-xl  flex items-center justify-center border border-[#e6e0d2] bg-[#fffdf8] p-5 shadow-[0_5px_20px_rgba(36,48,74,0.04)] sm:p-6"
      >
       

        <form class="w-3/5" @submit.prevent="activateWithKey">
         

          <!-- LICENSE KEY -->
          <div class="mb-5 w-">
            <label
              for="licenseKey"
              class="mb-1.5 block text-xs font-semibold"
            >
              License / Activation Key
              <span class="text-[#ab5137]">*</span>
            </label>

            <div
              class="flex min-h-12 items-center gap-2.5 rounded-xl border bg-white px-3 transition focus-within:border-[#3c4c6e] focus-within:ring-4 focus-within:ring-[#3c4c6e]/10"
              :class="
                errors.licenseKey
                  ? 'border-[#ab5137]'
                  : 'border-[#e6e0d2]'
              "
            >
              <Icon
                name="lucide:key-round"
                class="shrink-0 text-[#6b665c]"
              />

              <input
                id="licenseKey"
                v-model.trim="form.licenseKey"
                type="text"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                autocomplete="off"
                class="w-full border-0 bg-transparent font-mono text-sm tracking-widest text-[#201f22] uppercase outline-none placeholder:tracking-normal placeholder:text-[#aaa59b]"
                @input="formatLicenseKey"
              />

              <button
                v-if="form.licenseKey"
                type="button"
                class="flex shrink-0 items-center justify-center text-[#6b665c] hover:text-[#24304a]"
                @click="form.licenseKey = ''"
                aria-label="Clear license key"
              >
                <Icon name="lucide:x" />
              </button>
            </div>

            <small
              v-if="errors.licenseKey"
              class="mt-1 block text-[11px] text-[#ab5137]"
            >
              {{ errors.licenseKey }}
            </small>

            <p class="mt-1.5 text-[11px] text-[#6b665c]">
              Your activation key normally contains letters and numbers.
            </p>
          </div>

          <!-- DEVICE ID -->
          <div class="mb-5 hidden">
            <label class="mb-1.5 block text-xs font-semibold">
              Device ID
            </label>

            <div
              class="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-dashed border-[#e6e0d2] bg-[#f6f3ec] p-2 pl-3"
            >
              <div class="flex min-w-0 items-center gap-2.5">
                <Icon
                  name="lucide:monitor-smartphone"
                  class="shrink-0 text-[#6b665c]"
                />

                <span
                  class="truncate font-mono text-[11px] text-[#201f22]"
                >
                  {{ deviceId || 'Detecting device...' }}
                </span>
              </div>

              <button
                type="button"
                class="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#e6e0d2] bg-[#fffdf8] px-2.5 py-2 text-[11px] font-medium text-[#24304a] transition hover:bg-[#eee9dc] disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="!deviceId"
                @click="copyDeviceId"
              >
                <Icon name="lucide:copy" />
                Copy
              </button>
            </div>

            <p class="mt-1.5 text-[11px] text-[#6b665c]">
              Your license may be linked to this device.
            </p>
          </div>

          <!-- TERMS -->
          <label
            class="mt-5 flex cursor-pointer items-start gap-2 text-xs leading-5 text-[#6b665c]"
          >
            <input
              v-model="form.acceptTerms"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-[#e6e0d2] accent-[#24304a]"
            />

            <span>
              I agree to the

              <button
                type="button"
                class="font-medium text-[#24304a] underline underline-offset-2 hover:text-[#3c4c6e]"
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
            class="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#24304a] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#3c4c6e] disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="loading"
          >
            <Icon
              :name="
                loading
                  ? 'lucide:loader-circle'
                  : 'lucide:shield-check'
              "
              :class="{ 'animate-spin': loading }"
            />

            {{ loading ? 'Activating...' : 'Activate Product' }}
          </button>
        </form>
      </section>

      <!-- =======================================================
           PURCHASE ACTIVATION
      ======================================================== -->
      <section
        v-if="selectedPage === 2"
        class="rounded-2xl border border-[#e6e0d2] bg-[#fffdf8] p-5 shadow-[0_5px_20px_rgba(36,48,74,0.04)] sm:p-6"
      >
        <PurchaseActivation @activated="isActivated = true" />
      </section>

      <!-- =======================================================
           TERMS
      ======================================================== -->
      <section
        v-if="selectedPage === 3"
        class="rounded-sm border border-[#e6e0d2] bg-[#fffdf8] p-3 shadow-[0_5px_20px_rgba(36,48,74,0.04)] sm:p-6"
      >
        <div class="mb-2 flex items-center gap-1">
          

          <div>
            <h2 class="font-serif text-lg font-semibold text-[#24304a]">
              License Terms & Conditions
            </h2>

            
          </div>
        </div>

        <div class="flex flex-col g">
          <article v-for="term in licenseTerms" :key="term.number" class=" border-[#e6e0d2] ">
           

            <p class="text-md leading-6 text-[#6b665c]">
              {{ term.number }}. {{ term.text }}</p>
          </article>

         

        </div>

        <button
          type="button"
          class="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#24304a] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#3c4c6e]"
          @click="selectedPage = 1"
        >
          <Icon name="lucide:key-round" />
          Activate with Key
        </button>
      </section>

      <!-- =======================================================
           FEATURES
      ======================================================== -->
      <section
        class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <div
          class="flex gap-3 rounded-xl border border-[#e6e0d2] bg-[#fffdf8] p-4"
        >
          <Icon
            name="lucide:book-open-check"
            class="shrink-0 text-[#b9873b]"
          />

          <div>
            <h3 class="text-xs font-semibold">
              Premium Lessons
            </h3>

            <p class="mt-1 text-[11px] leading-4 text-[#6b665c]">
              Access protected curriculum content.
            </p>
          </div>
        </div>

        <div
          class="flex gap-3 rounded-xl border border-[#e6e0d2] bg-[#fffdf8] p-4"
        >
          <Icon
            name="lucide:bar-chart-3"
            class="shrink-0 text-[#b9873b]"
          />

          <div>
            <h3 class="text-xs font-semibold">
              Advanced Results
            </h3>

            <p class="mt-1 text-[11px] leading-4 text-[#6b665c]">
              Unlock detailed performance analysis.
            </p>
          </div>
        </div>

        <div
          class="flex gap-3 rounded-xl border border-[#e6e0d2] bg-[#fffdf8] p-4"
        >
          <Icon
            name="lucide:database"
            class="shrink-0 text-[#b9873b]"
          />

          <div>
            <h3 class="text-xs font-semibold">
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
        class="fixed bottom-5 right-5 z-[100] flex max-w-[400px] items-center gap-2.5 rounded-xl bg-[#24304a] px-4 py-3 text-xs text-white shadow-2xl"
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
          class="shrink-0"
        />

        <span>{{ message }}</span>

        <button
          type="button"
          class="ml-auto flex shrink-0 text-white/80 hover:text-white"
          @click="message = ''"
          aria-label="Close message"
        >
          <Icon name="lucide:x" />
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

