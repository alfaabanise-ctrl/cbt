import { ref, computed } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { Store } from "@tauri-apps/plugin-store";

type OfflineLicense = {
  activationId: string;
  tokenId: string;
  deviceId: string;
  expiresAt: string;
  status: "active" | "expired" | "revoked";
};

type LocalUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

const user = ref<LocalUser | null>(null);
const license = ref<OfflineLicense | null>(null);
const initialized = ref(false);

let store: Store | null = null;

export const useExamTipsAuth = () => {
  const isLoggedIn = computed(() => !!user.value);

  const isActivated = computed(() => {
    if (!license.value) return false;

    if (license.value.status !== "active") {
      return false;
    }

    return (
      new Date(license.value.expiresAt).getTime() >
      Date.now()
    );
  });

  const initialize = async () => {
    if (initialized.value) return;

    store = await Store.load("exam-tips-session.json");

    user.value =
      await store.get<LocalUser>("user");

    license.value =
      await store.get<OfflineLicense>("license");

    initialized.value = true;
  };

  const saveUser = async (newUser: LocalUser) => {
    if (!store) await initialize();

    user.value = newUser;

    await store!.set("user", newUser);
    await store!.save();
  };

  const saveLicense = async (
    newLicense: OfflineLicense
  ) => {
    if (!store) await initialize();

    license.value = newLicense;

    await store!.set("license", newLicense);
    await store!.save();
  };

  const getDeviceId = async () => {
    return await invoke<string>("get_device_id");
  };

  const clearSession = async () => {
    if (!store) await initialize();

    user.value = null;
    license.value = null;

    await store!.delete("user");
    await store!.delete("license");
    await store!.save();
  };

  return {
    user,
    license,
    isLoggedIn,
    isActivated,
    initialized,
    initialize,
    saveUser,
    saveLicense,
    getDeviceId,
    clearSession,
  };
};