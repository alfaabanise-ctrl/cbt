import {
  activateSoftware,
  getSystemId,
  getInstallationId,
  getLicenseInfo,
  softwareFetch,
} from "~/utils/softwareSecurity";

export const useSoftwareSecurity =
  () => {
    const systemId =
      useState<string | null>(
        "software-system-id",
        () => null,
      );

    const installationId =
      useState<string | null>(
        "software-installation-id",
        () => null,
      );

    const license =
      useState<any>(
        "software-license",
        () => null,
      );

    const activated =
      computed(
        () =>
          Boolean(
            installationId.value,
          ),
      );

    async function initialize() {
      systemId.value =
        await getSystemId();

      installationId.value =
        await getInstallationId();

      license.value =
        await getLicenseInfo();

      return {
        systemId:
          systemId.value,

        installationId:
          installationId.value,

        license:
          license.value,
      };
    }

    async function activate(
      token: string,
    ) {
      const data =
        await activateSoftware(
          token,
        );

      installationId.value =
        data?.installationId ||
        null;

      license.value =
        data?.license ||
        null;

      systemId.value =
        await getSystemId();

      return data;
    }

    async function api<T = any>(
      path: string,
      options: any = {},
    ) {
      return await softwareFetch<T>(
        path,
        options,
      );
    }

    return {
      systemId,
      installationId,
      license,
      activated,

      initialize,
      activate,
      api,
    };
  };