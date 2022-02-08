export async function registerServiceWorker() {
  try {
    return await navigator.serviceWorker.register("sw.js", {
      type: "module",
    })
  } catch (e) {
    return Promise.reject(e)
  }
}
