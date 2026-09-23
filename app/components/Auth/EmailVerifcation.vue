<script setup>
import { ref, nextTick } from 'vue'
import { useRuntimeConfig } from '#app'
import { useRouter } from 'vue-router'

const { $toast } = useNuxtApp()
const router = useRouter()
const auth = useExamTipsAuth()

const props = defineProps({
  email: {
    type: String,
    required: true
  },

  redirect: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const config = useRuntimeConfig()

const loading = ref(false)
const code = ref(['', '', '', '', '', ''])
const message = ref('')

/* =============================
   Back Button
============================= */
const goBack = () => {
  emit('close')

  if (props.redirect) {
    router.back()
  }
}

/* =============================
   OTP Input Handling
============================= */
const moveNext = (index, event) => {
  const value = event.target.value.replace(/\D/g, '')

  code.value[index] = value.slice(-1)

  if (code.value[index] && index < 5) {
    nextTick(() => {
      document.querySelectorAll('.otp-input')[index + 1]?.focus()
    })
  }
}

const handleKeydown = (index, event) => {
  if (
    event.key === 'Backspace' &&
    !code.value[index] &&
    index > 0
  ) {
    nextTick(() => {
      document.querySelectorAll('.otp-input')[index - 1]?.focus()
    })
  }
}

/* =============================
   Paste Full OTP
============================= */
const handlePaste = (event) => {
  const paste = event.clipboardData
    .getData('text')
    .replace(/\D/g, '')
    .slice(0, 6)

  if (!paste) return

  code.value = ['', '', '', '', '', '']

  paste.split('').forEach((digit, index) => {
    code.value[index] = digit
  })

  nextTick(() => {
    const inputs = document.querySelectorAll('.otp-input')
    inputs[Math.min(paste.length, 6) - 1]?.focus()
  })
}

/* =============================
   Clear OTP
============================= */
const clearCode = () => {
  code.value = ['', '', '', '', '', '']
}

/* =============================
   Verify Email
============================= */
const verifyCode = async () => {
  const otp = code.value.join('')

  if (otp.length !== 6) {
    message.value = 'Please enter the 6 digit code'
    $toast.error('Please enter the 6 digit code')
    return
  }

  loading.value = true
  message.value = ''

  try {
    const response = await fetch(
      `${config.public.apiUrl}/auth/verify-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: props.email,
          code: otp
        })
      }
    )

    const data = await response.json()
      console.log(data);
      
    if (!response.ok) {
      console.log(response);
      
      $toast.error(data.message || 'Email verification failed')
      message.value = data.message || 'Email verification failed'
      return
    }
    console.log(data?.data);
    

    $toast.success(data.message || 'Email verified successfully')
      await auth.saveUser(data?.data || null)

    clearCode()

    if (props.redirect) {
      setTimeout(() => {
        router.push('/')
      }, 800)
    } else {
      emit('close')
    }
  } catch (error) {
    console.error(error)

    message.value = 'Verification failed. Please try again'
    $toast.error('Verification failed. Please try again')
  } finally {
    loading.value = false
  }
}

/* =============================
   Resend OTP
============================= */
const resendCode = async () => {
  if (loading.value) return

  loading.value = true
  message.value = ''

  try {
    const response = await fetch(
      `${config.public.api_url}/auth/resend-otp`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: props.email
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      $toast.error(data.message || 'Failed to resend OTP')
      return
    }

    clearCode()

    message.value = 'A new verification code has been sent'
    $toast.success(data.message || 'OTP sent successfully')

    await nextTick()
    document.querySelector('.otp-input')?.focus()
  } catch (error) {
    console.error(error)

    message.value = 'Failed to resend OTP. Try again'
    $toast.error('Failed to resend OTP. Try again')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section
    class="relative flex min-h-scren w-full items-center justify-center bg-slate-50 px- py-6 sm:px-6 lg:px-0"
  >
    <!-- Back Button -->
    

    <!-- Verification Card -->
    <div
      class="w-full max-w-md rounded-sm border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
    >
    <button
      type="button"
      aria-label="Go back"
      @click="goBack()"
      class="absol inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 sm:left-6 sm:top-6"
    >
      <Icon name="lucide:arrow-left" size="15" />
    </button>
      <!-- Header -->
      <div class="mb- text-center">
       

        <h1
          class="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
        >
          Confirm your email
        </h1>

        <p class="mt-2 text-sm leading-6 text-slate-500">
          Enter the 6-digit verification code sent to your email address.
        </p>

        <p
          class="mt-2 break-all text-sm font-semibold text-slate-800"
        >
          {{ email }}
        </p>
      </div>

      <!-- Verification Form -->
      <form
        @submit.prevent="verifyCode"
        class=" mt-6 space-y-6"
      >
        <!-- OTP Inputs -->
        <div
          class="flex justify-center gap-1.5 xs:gap-2 sm:gap-3"
          @paste.prevent="handlePaste"
        >
          <input
            v-for="(digit, index) in code"
            :key="index"
            v-model="code[index]"
            :ref="`otpInput${index}`"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="1"
            :aria-label="`Verification digit ${index + 1}`"
            class="otp-input h-11 w-10 rounded-lg border border-slate-300 bg-white text-center text-lg font-bold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-slate-700 focus:ring-2 focus:ring-slate-200 sm:h-14 sm:w-12 sm:text-xl"
            @input="moveNext(index, $event)"
            @keydown="handleKeydown(index, $event)"
          />
        </div>

        <!-- Message -->
        <p
          v-if="message"
          class="text-center text-sm leading-5 text-red-600"
        >
          {{ message }}
        </p>

        <!-- Verify Button -->
        <button
          type="submit"
          :disabled="loading"
          class="flex w-full items-center justify-center rounded-lg bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon
            v-if="loading"
            name="lucide:loader-circle"
            size="18"
            class="mr-2 animate-spin"
          />

          {{ loading ? 'Processing...' : 'Verify Email' }}
        </button>
      </form>

      <!-- Resend Section -->
      <div
        class="mt-6 flex flex-col items-center justify-center gap-2 text-center text-sm text-slate-500 sm:flex-row"
      >
        <span>Didn't receive the code?</span>

        <button
          type="button"
          :disabled="loading"
          @click="resendCode"
          class="font-semibold text-slate-800 underline underline-offset-4 transition hover:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Resend code
        </button>
      </div>
    </div>
  </section>
</template>