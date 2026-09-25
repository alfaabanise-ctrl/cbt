<script setup lang="ts">
const software = useSoftwareSecurity();

const token = ref("");

const loading = ref(false);

const error = ref("");

const success = ref("");

async function activate() {
  error.value = "";
  success.value = "";

  const cleanToken = token.value.trim();

  if (!cleanToken) {
    error.value = "Please enter your activation token.";

    return;
  }

  loading.value = true;

  try {
    const result = await software.activate(cleanToken);

    success.value = "Abanise CBT has been activated successfully.";

    console.log("Software activated:", result);

    await navigateTo("/");
  } catch (err: any) {
    console.error("Activation error:", err);

    error.value = err?.data?.message || err?.message || "Activation failed.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#f6f3ec] flex items-center justify-center p-6">
    <div class="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-[#24304a]">Activate Abanise CBT</h1>

        <p class="mt-2 text-sm text-slate-500">
          Enter the software activation token you purchased.
        </p>
      </div>

      <form class="space-y-5" @submit.prevent="activate">
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">
            Activation Token
          </label>

          <input
            v-model="token"
            type="text"
            autocomplete="off"
            placeholder="ABANISE-XXXX-XXXX-XXXX"
            class="w-full rounded-2xl border border-slate-200 px-4 py-4 font-mono text-sm uppercase outline-none transition focus:border-[#b9873b] focus:ring-2 focus:ring-[#b9873b]/20"
          />
        </div>

        <div v-if="error" class="rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {{ error }}
        </div>

        <div
          v-if="success"
          class="rounded-xl bg-green-50 p-3 text-sm text-green-600"
        >
          {{ success }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-2xl bg-[#24304a] px-5 py-4 font-semibold text-white transition hover:bg-[#1c263c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ loading ? "Activating..." : "Activate Software" }}
        </button>
      </form>
    </div>
  </div>
</template>