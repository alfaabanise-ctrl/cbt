import { Client, Stronghold } from "@tauri-apps/plugin-stronghold";
import { appDataDir } from "@tauri-apps/api/path";
import { Store } from "@tauri-apps/plugin-store";

const STRONGHOLD_FILE = "abanise-security.hold";
const STRONGHOLD_CLIENT = "abanise-security";

const PRIVATE_KEY_RECORD = "software_private_key";
const SYSTEM_ID_KEY = "software_system_id";
const INSTALLATION_ID_KEY = "software_installation_id";
const LICENSE_INFO_KEY = "software_license_info";
const STRONGHOLD_PASSWORD_KEY = "stronghold_password";

let strongholdInstance: Stronghold | null = null;
let strongholdClient: Client | null = null;

let systemIdCache: string | null = null;
let privateKeyCache: CryptoKey | null = null;

/* =========================================================
   STORE
========================================================= */

async function getAppStore() {
  return await Store.load("abanise-security.json", {
    autoSave: true,
    defaults: {},
  });
}

/* =========================================================
   RANDOM VALUES
========================================================= */

function randomHex(bytes = 32): string {
  const array = new Uint8Array(bytes);

  crypto.getRandomValues(array);

  return Array.from(array)
    .map((byte) =>
      byte.toString(16).padStart(2, "0"),
    )
    .join("");
}

function generateSystemId(): string {
  return `AB-${crypto.randomUUID()}-${randomHex(8)}`;
}

/* =========================================================
   BASE64
========================================================= */

function arrayBufferToBase64(
  buffer: ArrayBuffer,
): string {
  const bytes = new Uint8Array(buffer);

  let binary = "";

  const chunkSize = 0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += chunkSize
  ) {
    binary += String.fromCharCode(
      ...bytes.subarray(
        i,
        Math.min(i + chunkSize, bytes.length),
      ),
    );
  }

  return btoa(binary);
}

/* =========================================================
   PEM
========================================================= */

function arrayBufferToPem(
  buffer: ArrayBuffer,
): string {
  const base64 =
    arrayBufferToBase64(buffer);

  const lines =
    base64.match(/.{1,64}/g)?.join("\n") ||
    "";

  return [
    "-----BEGIN PUBLIC KEY-----",
    lines,
    "-----END PUBLIC KEY-----",
  ].join("\n");
}

/* =========================================================
   STRONGHOLD PASSWORD
========================================================= */

async function getStrongholdPassword(): Promise<string> {
  const store = await getAppStore();

  let password =
    await store.get<string>(
      STRONGHOLD_PASSWORD_KEY,
    );

  if (!password) {
    password =
      `${crypto.randomUUID()}-${randomHex(32)}`;

    await store.set(
      STRONGHOLD_PASSWORD_KEY,
      password,
    );

    await store.save();
  }

  return password;
}

/* =========================================================
   INITIALIZE STRONGHOLD
========================================================= */

async function initStronghold() {
  if (
    strongholdInstance &&
    strongholdClient
  ) {
    return {
      stronghold: strongholdInstance,
      client: strongholdClient,
    };
  }

  const dataDir =
    await appDataDir();

  const vaultPath =
    `${dataDir}/${STRONGHOLD_FILE}`;

  const password =
    await getStrongholdPassword();

  const stronghold =
    await Stronghold.load(
      vaultPath,
      password,
    );

  let client: Client;

  try {
    client =
      await stronghold.loadClient(
        STRONGHOLD_CLIENT,
      );
  } catch {
    client =
      await stronghold.createClient(
        STRONGHOLD_CLIENT,
      );
  }

  strongholdInstance =
    stronghold;

  strongholdClient =
    client;

  return {
    stronghold,
    client,
  };
}

/* =========================================================
   SYSTEM ID
========================================================= */

export async function getSystemId(): Promise<string> {
  if (systemIdCache) {
    return systemIdCache;
  }

  const store =
    await getAppStore();

  let systemId =
    await store.get<string>(
      SYSTEM_ID_KEY,
    );

  if (!systemId) {
    systemId =
      generateSystemId();

    await store.set(
      SYSTEM_ID_KEY,
      systemId,
    );

    await store.save();
  }

  systemIdCache =
    systemId;

  return systemId;
}

/* =========================================================
   GENERATE ED25519 KEYS
========================================================= */

async function generateKeyPair() {
  if (
    !crypto?.subtle
  ) {
    throw new Error(
      "Web Crypto API is not available.",
    );
  }

  return await crypto.subtle.generateKey(
    {
      name: "Ed25519",
    },
    true,
    ["sign", "verify"],
  );
}

/* =========================================================
   GET OR CREATE KEY PAIR
========================================================= */

export async function getSoftwareKeys() {
  const {
    stronghold,
    client,
  } = await initStronghold();

  const store =
    client.getStore();

  /*
   * Private JWK is stored in Stronghold.
   */
  const storedPrivate =
    await store.get(
      PRIVATE_KEY_RECORD,
    );

  if (storedPrivate) {
    const privateJwkText =
      new TextDecoder().decode(
        new Uint8Array(
          storedPrivate,
        ),
      );

    const privateJwk =
      JSON.parse(
        privateJwkText,
      );

    const privateKey =
      await crypto.subtle.importKey(
        "jwk",
        privateJwk,
        {
          name: "Ed25519",
        },
        false,
        ["sign"],
      );

    privateKeyCache =
      privateKey;

    /*
     * Public key is regenerated from stored
     * public JWK if we have it.
     */
    const storedPublic =
      await store.get(
        "software_public_key",
      );

    if (!storedPublic) {
      throw new Error(
        "Software public key is missing.",
      );
    }

    const publicJwkText =
      new TextDecoder().decode(
        new Uint8Array(
          storedPublic,
        ),
      );

    const publicJwk =
      JSON.parse(
        publicJwkText,
      );

    const publicKey =
      await crypto.subtle.importKey(
        "jwk",
        publicJwk,
        {
          name: "Ed25519",
        },
        true,
        ["verify"],
      );

    const publicSpki =
      await crypto.subtle.exportKey(
        "spki",
        publicKey,
      );

    const publicKeyPem =
      arrayBufferToPem(
        publicSpki,
      );

    return {
      privateKey,
      publicKey,
      publicKeyPem,
    };
  }

  /*
   * First installation.
   */
  const keyPair =
    await generateKeyPair();

  /*
   * Export private key as JWK ONLY
   * so it can be stored encrypted in Stronghold.
   */
  const privateJwk =
    await crypto.subtle.exportKey(
      "jwk",
      keyPair.privateKey,
    );

  /*
   * Public key.
   */
  const publicJwk =
    await crypto.subtle.exportKey(
      "jwk",
      keyPair.publicKey,
    );

  const publicSpki =
    await crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey,
    );

  const publicKeyPem =
    arrayBufferToPem(
      publicSpki,
    );

  /*
   * Save PRIVATE key in Stronghold.
   */
  await store.insert(
    PRIVATE_KEY_RECORD,
    Array.from(
      new TextEncoder().encode(
        JSON.stringify(
          privateJwk,
        ),
      ),
    ),
  );

  /*
   * Save public key too.
   */
  await store.insert(
    "software_public_key",
    Array.from(
      new TextEncoder().encode(
        JSON.stringify(
          publicJwk,
        ),
      ),
    ),
  );

  await stronghold.save();

  privateKeyCache =
    keyPair.privateKey;

  return {
    privateKey:
      keyPair.privateKey,

    publicKey:
      keyPair.publicKey,

    publicKeyPem,
  };
}

/* =========================================================
   SAVE INSTALLATION ID
========================================================= */

export async function saveInstallationId(
  installationId: string,
) {
  const store =
    await getAppStore();

  await store.set(
    INSTALLATION_ID_KEY,
    installationId,
  );

  await store.save();
}

/* =========================================================
   GET INSTALLATION ID
========================================================= */

export async function getInstallationId() {
  const store =
    await getAppStore();

  return await store.get<string>(
    INSTALLATION_ID_KEY,
  );
}

/* =========================================================
   SAVE LICENSE
========================================================= */

export async function saveLicenseInfo(
  license: unknown,
) {
  const store =
    await getAppStore();

  await store.set(
    LICENSE_INFO_KEY,
    license,
  );

  await store.save();
}

/* =========================================================
   GET LICENSE
========================================================= */

export async function getLicenseInfo() {
  const store =
    await getAppStore();

  return await store.get(
    LICENSE_INFO_KEY,
  );
}

/* =========================================================
   ACTIVATE SOFTWARE
========================================================= */

export async function activateSoftware(
  token: string,
) {
  const systemId =
    await getSystemId();

  const {
    publicKeyPem,
  } =
    await getSoftwareKeys();

  const config =
    useRuntimeConfig();

  const apiUrl =
    String(
      config.public.apiUrl || "",
    ).replace(/\/$/, "");

  const response =
    await $fetch<any>(
      `${apiUrl}/api/software/activate`,
      {
        method: "POST",

        body: {
          token:
            token.trim().toUpperCase(),

          systemId,

          publicKey:
            publicKeyPem,

          platform:
            "windows",

          appVersion:
            "1.0.0",
        },

        timeout: 30000,
      },
    );

  if (
    !response?.success
  ) {
    throw new Error(
      response?.message ||
        "Software activation failed.",
    );
  }

  const installationId =
    response.data?.installationId;

  if (installationId) {
    await saveInstallationId(
      String(
        installationId,
      ),
    );
  }

  if (response.data?.license) {
    await saveLicenseInfo(
      response.data.license,
    );
  }

  return response.data;
}

/* =========================================================
   SIGN REQUEST
========================================================= */

export async function signRequest({
  timestamp,
  nonce,
  method,
  path,
  bodyHash,
}: {
  timestamp: string;
  nonce: string;
  method: string;
  path: string;
  bodyHash: string;
}) {
  if (!privateKeyCache) {
    await getSoftwareKeys();
  }

  if (!privateKeyCache) {
    throw new Error(
      "Software private key is unavailable.",
    );
  }

  const message = [
    String(timestamp),
    String(nonce),
    String(method).toUpperCase(),
    String(path),
    String(bodyHash),
  ].join("\n");

  const signature =
    await crypto.subtle.sign(
      {
        name: "Ed25519",
      },
      privateKeyCache,
      new TextEncoder().encode(
        message,
      ),
    );

  return arrayBufferToBase64(
    signature,
  );
}

/* =========================================================
   HASH REQUEST BODY
========================================================= */

export async function hashRequestBody(
  body: unknown,
) {
  const raw =
    body === undefined ||
    body === null
      ? ""
      : JSON.stringify(body);

  const digest =
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(raw),
    );

  return Array.from(
    new Uint8Array(digest),
  )
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
}

/* =========================================================
   RANDOM NONCE
========================================================= */

export function generateNonce() {
  return `${crypto.randomUUID()}-${randomHex(16)}`;
}

/* =========================================================
   SIGNED API REQUEST
========================================================= */

export async function softwareFetch<T = any>(
  path: string,
  options: {
    method?: string;
    body?: any;
    query?: Record<
      string,
      string | number | boolean | undefined | null
    >;
    headers?: Record<string, string>;
  } = {},
): Promise<T> {
  const method =
    (
      options.method ||
      "GET"
    ).toUpperCase();

  const systemId =
    await getSystemId();

  /*
   * Build URL.
   */
  const config =
    useRuntimeConfig();

  const apiUrl =
    String(
      config.public.apiUrl || "",
    ).replace(/\/$/, "");

  const cleanPath =
    path.startsWith("/")
      ? path
      : `/${path}`;

  const url =
    new URL(
      `${apiUrl}${cleanPath}`,
    );

  if (options.query) {
    for (
      const [
        key,
        value,
      ] of Object.entries(
        options.query,
      )
    ) {
      if (
        value !== undefined &&
        value !== null
      ) {
        url.searchParams.set(
          key,
          String(value),
        );
      }
    }
  }

  /*
   * Backend signs only pathname,
   * not query string.
   */
  const requestPath =
    url.pathname;

  const body =
    options.body;

  const bodyHash =
    await hashRequestBody(
      body,
    );

  const timestamp =
    String(
      Date.now(),
    );

  const nonce =
    generateNonce();

  const signature =
    await signRequest({
      timestamp,
      nonce,
      method,
      path: requestPath,
      bodyHash,
    });

  const headers: Record<
    string,
    string
  > = {
    ...(options.headers || {}),

    "X-Device-ID":
      systemId,

    "X-Timestamp":
      timestamp,

    "X-Nonce":
      nonce,

    "X-Signature":
      signature,

    "Content-Type":
      "application/json",
  };

  /*
   * If your application has its own
   * authentication token, you can add it
   * here later. It is NOT required for
   * software license authentication.
   */

  return await $fetch<T>(
    url.toString(),
    {
      method: method as any,
      headers,
      body,
      timeout: 30000,
    } as any,
  );
}