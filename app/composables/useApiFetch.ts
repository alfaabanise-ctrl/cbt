// ~/composables/useApiFetch.ts

export async function useApiFetch<T = any>(
  url: string,
  options: Parameters<typeof $fetch<T>>[1] = {}
) {
  const config = useRuntimeConfig()

  const headers = process.server
    ? useRequestHeaders(["cookie"])
    : {}


    console.log("🔥 useApiFetch called")
  console.log("➡️ URL:", url)
  console.log("➡️ API URL:", config.public.apiUrl)

  try {
    const data = await $fetch<T>(url, {
      baseURL: config.public.apiUrl,

      credentials: "include",

      headers: {
        ...headers,
        ...(options.headers || {}),
      },

      timeout: 30000,
      retry: 0,

      ...options,
    })
    console.log(data,'fdgsfgfgsdfgsdfgsdf asdfasdfasdfasdv efsdfsfs');
    
    return {
      success: true,
      data,
      message: null,
      status: 200,
      error: null,
    }
  } catch (error: any) {
    console.error("🔥 API ERROR:", error)

    return {
      success: false,
      data: null,
      status:
        error?.status ||
        error?.statusCode ||
        500,

      message:
        error?.data?.message ||
        error?.statusMessage ||
        error?.message ||
        "Request failed",

      error,
    }
  }
}