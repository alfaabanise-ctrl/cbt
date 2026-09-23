<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import SecondAuth from "~/components/SecondAuth.vue";
import { useExamTipsAuth } from "~/composables/useExamTipsAuth";

definePageMeta({
  layout: false,
});

const router = useRouter();

const auth = useExamTipsAuth();

const token = ref("");
const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const config = useRuntimeConfig();

const activate = async () => {
  errorMessage.value = "";
  successMessage.value = "";



  loading.value = true;

  try {
    const deviceId = await auth.getDeviceId();

    const response = await $fetch<any>(
      `${config.public.apiUrl}/register`,
      {
        method: "POST",

        credentials: "include",

        body: {
          token: token.value.trim(),
          deviceId,
          deviceName: "ExamTips Desktop",
          platform: "windows",
        },
      }
    );

    if (!response.success) {
      throw new Error(
        response.message || "Activation failed."
      );
    }

    await auth.saveLicense({
      activationId: response.data.activationId,
      tokenId: response.data.tokenId,
      deviceId: response.data.deviceId,
      expiresAt: response.data.expiresAt,
      status: response.data.status,
    });

    successMessage.value =
      "ExamTips activated successfully.";

    await router.push("/dashboard");

  } catch (error: any) {
    errorMessage.value =
      error?.data?.message ||
      error?.message ||
      "Unable to activate this token.";

  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <main
   
  >
  
   <SecondAuth/>
  </main>
</template>