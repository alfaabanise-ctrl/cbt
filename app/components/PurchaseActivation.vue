<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

const emit = defineEmits([
  'payment-success',
  'bank-payment-submitted'
])

const props = defineProps({
  amount: {
    type: Number,
    default: 4000
  },

  currency: {
    type: String,
    default: 'NGN'
  },

  paystackPublicKey: {
    type: String,
    default: ''
  },

  accounts: {
    type: Array,
    default: () => [
      {
        bankName: 'GTBank',
        accountNumber: '0227300274',
        accountName: 'Your Company Name'
      },
      {
        bankName: 'Zenith Bank',
        accountNumber: '1014381194',
        accountName: 'Your Company Name'
      }
    ]
  }
})

const paymentMethod = ref('paystack')

const paymentLoading = ref(false)
const bankLoading = ref(false)

const paystackReady = ref(false)

const payment = reactive({
  email: '',
  name: '',
  phone: ''
})

const bankPayment = reactive({
  name: '',
  phone: '',
  bank: '',
  reference: ''
})

const formattedAmount = computed(() => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: props.currency,
    minimumFractionDigits: 2
  }).format(props.amount)
})


/* =========================================================
   LOAD PAYSTACK SCRIPT
========================================================= */

const loadPaystack = () => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      paystackReady.value = true
      resolve()
      return
    }

    const script = document.createElement('script')

    script.src = 'https://js.paystack.co/v1/inline.js'

    script.onload = () => {
      paystackReady.value = true
      resolve()
    }

    script.onerror = () => {
      reject(new Error('Unable to load Paystack'))
    }

    document.head.appendChild(script)
  })
}


onMounted(async () => {
  try {
    await loadPaystack()
  } catch (error) {
    console.error('Paystack failed to load:', error)
  }
})


/* =========================================================
   PAYSTACK PAYMENT
========================================================= */

const payWithPaystack = async () => {
  if (!payment.name) {
    alert('Please enter your full name.')
    return
  }

  if (!payment.email) {
    alert('Please enter your email address.')
    return
  }

  if (!props.paystackPublicKey) {
    alert('Paystack public key is not configured.')
    return
  }

  paymentLoading.value = true

  try {
    await loadPaystack()

    const handler = window.PaystackPop.setup({
      key: props.paystackPublicKey,

      email: payment.email,

      amount: props.amount * 100,

      currency: props.currency,

      metadata: {
        custom_fields: [
          {
            display_name: 'Full Name',
            variable_name: 'full_name',
            value: payment.name
          },
          {
            display_name: 'Phone Number',
            variable_name: 'phone_number',
            value: payment.phone
          }
        ]
      },

      callback: async (response) => {
        try {
          paymentLoading.value = true

          /*
           IMPORTANT:
           Verify this reference from your backend.
           Never trust the frontend alone.
          */

          const result = await $fetch(
            '/api/payment/verify',
            {
              method: 'POST',

              body: {
                reference: response.reference,
                email: payment.email,
                name: payment.name,
                amount: props.amount
              }
            }
          )

          emit('payment-success', result)

          alert(
            result?.message ||
            'Payment successful. Your activation will now be processed.'
          )

        } catch (error) {
          console.error(error)

          alert(
            error?.data?.message ||
            'Payment verification failed. Please contact support.'
          )

        } finally {
          paymentLoading.value = false
        }
      },

      onClose: () => {
        paymentLoading.value = false
      }
    })

    handler.openIframe()

  } catch (error) {
    console.error(error)

    alert('Unable to start payment. Please try again.')

    paymentLoading.value = false
  }
}


/* =========================================================
   BANK PAYMENT
========================================================= */

const submitBankPayment = async () => {
  if (!bankPayment.name) {
    alert('Please enter the depositor name.')
    return
  }

  if (!bankPayment.reference) {
    alert('Please enter the transaction reference.')
    return
  }

  if (!bankPayment.bank) {
    alert('Please select the bank account you paid into.')
    return
  }

  bankLoading.value = true

  try {
    const result = await $fetch(
      '/api/payment/bank-transfer',
      {
        method: 'POST',

        body: {
          depositorName: bankPayment.name,
          phone: bankPayment.phone,
          bank: bankPayment.bank,
          reference: bankPayment.reference,
          amount: props.amount
        }
      }
    )

    emit('bank-payment-submitted', result)

    alert(
      result?.message ||
      'Payment details submitted successfully.'
    )

    bankPayment.name = ''
    bankPayment.phone = ''
    bankPayment.bank = ''
    bankPayment.reference = ''

  } catch (error) {
    console.error(error)

    alert(
      error?.data?.message ||
      'Unable to submit payment details.'
    )

  } finally {
    bankLoading.value = false
  }
}
</script>


<template>
  <section
    class="overflow-hidden rounded-2xl border border-[#e6e0d2] bg-[#fffdf8] shadow-[0_5px_20px_rgba(36,48,74,0.04)]"
  >

    <!-- =========================
         HEADER
    ========================== -->

    <div
      class=""
    >
      <h2
        class="text-lg font-semibold text-[#24304a]"
      >
        Buy Activation
      </h2>

      
    </div>


    <div
      class="grid lg:grid-cols-[230px_1fr]"
    >

      <!-- =========================
           PAYMENT METHODS
      ========================== -->

      <div
        class="border-b border-[#e6e0d2] bg-[#f8f6f0] lg:border-b-0 lg:border-r"
      >

        <button
          type="button"
          class="w-full border-b border-[#e6e0d2] px-5 py-4 text-left text-sm font-medium transition"
          :class="
            paymentMethod === 'paystack'
              ? 'bg-white text-[#24304a]'
              : 'text-[#6b665c] hover:bg-white'
          "
          @click="paymentMethod = 'paystack'"
        >
          Pay with Card
        </button>


        <button
          type="button"
          class="w-full px-5 py-4 text-left text-sm font-medium transition"
          :class="
            paymentMethod === 'bank'
              ? 'bg-white text-[#24304a]'
              : 'text-[#6b665c] hover:bg-white'
          "
          @click="paymentMethod = 'bank'"
        >
          Transfer / Bank Deposit
        </button>

      </div>


      <!-- =========================
           PAYMENT CONTENT
      ========================== -->

      <div
        class="p-5 sm:p-3"
      >


        <!-- =====================================
             PAYSTACK PAYMENT
        ====================================== -->

        <div
          v-if="paymentMethod === 'paystack'"
        >

          <h3
            class="text-base font-semibold text-[#24304a]"
          >
            Pay Online
          </h3>

          <p
            class="mt-1 text-sm text-[#6b665c]"
          >
            Pay securely using Paystack.
          </p>


          <!-- PRICE -->

          <div
            class="mt-5 flex items-center justify-between rounded-xl border border-[#e6e0d2] bg-[#faf8f3] px-4 py-3"
          >
            <span
              class="text-sm text-[#6b665c]"
            >
              Activation Price
            </span>

            <strong
              class="text-base text-[#24304a]"
            >
              {{ formattedAmount }}
            </strong>
          </div>


          <!-- FULL NAME -->

        


          <!-- EMAIL -->

         


          <!-- PHONE -->

         

          <!-- PAY BUTTON -->

          <button
            type="button"
            :disabled="paymentLoading"
            class="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#24304a] px-4 text-sm font-semibold text-white transition hover:bg-[#3c4c6e] disabled:cursor-not-allowed disabled:opacity-60"
            @click="payWithPaystack"
          >
            {{
              paymentLoading
                ? 'Opening Payment...'
                : `Pay ${formattedAmount}`
            }}
          </button>


          <!-- INFO -->

          <p
            class="mt-4 text-xs leading-5 text-[#6b665c]"
          >
            Your payment will be verified before your activation
            is completed.
          </p>

        </div>


        <!-- =====================================
             BANK TRANSFER
        ====================================== -->

      <div v-else>

        <h3
          class="text-base font-semibold text-[#24304a]"
        >
          Transfer / Bank Deposit
        </h3>

        <!-- AMOUNT -->

        <div
          class="mt-5 hidden items-center justify-between rounded-xl border border-[#e6e0d2] px-4 py-3"
        >
          <span
            class="text-sm text-[#6b665c]"
          >
            Amount to Pay
          </span>

          <strong
            class="text-base text-[#24304a]"
          >
            {{ formattedAmount }}
          </strong>
        </div>


        <!-- BANK ACCOUNTS -->

        <div
          class="mt-5 space-y-3"
        >

          <div
            v-for="account in accounts"
            :key="account.accountNumber"
            class="rounded-xl border border-[#e6e0d2] bg-[#faf8f3] p-3"
          >

            <p class="text-sm text-[#6b665c]">
              Bank Name:
              <span class="font-semibold text-[#24304a]">
                {{ account.bankName }}
              </span>
            </p>

            <p class="text-sm text-[#6b665c]">
              Account Number:
              <span class="font-semibold text-[#24304a]">
                {{ account.accountNumber }}
              </span>
            </p>

            <p class="text-sm text-[#6b665c]">
              Account Name:
              <span class="font-semibold text-[#24304a]">
                {{ account.accountName }}
              </span>
            </p>

          </div>

        </div>


      


        <!-- WHATSAPP PAYMENT NOTICE -->

        <div
          class="mt-6 rounded-xl border border-[#e6e0d2] bg-[#faf8f3] p-4"
        >

          <h4
            class="text-sm font-semibold text-[#24304a]"
          >
            Payment Confirmation
          </h4>

          <p
            class="mt-2 text-sm leading-6 text-[#6b665c]"
          >
            After making your transfer or bank deposit, please contact us
            on WhatsApp and send your payment details. Your payment will
            be verified before your activation code is issued.
          </p>

          <a
            :href="`https://wa.me/2348012345678?text=${encodeURIComponent(
              `Hello, I have made a bank transfer/payment and I would like to confirm my payment and receive my activation code.

      Phone Number: ${bankPayment.phone || 'Not provided'}
      Amount: ${formattedAmount}`
            )}`"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Contact Us on WhatsApp
          </a>

        </div>


        <!-- INFO -->

        <p
          class="mt-4 text-xs leading-5 text-[#6b665c]"
        >
          Please send your payment receipt or transaction reference on
          WhatsApp so we can verify your payment and issue your activation
          code.
        </p>

      </div>



      </div>

    </div>

  </section>
</template>