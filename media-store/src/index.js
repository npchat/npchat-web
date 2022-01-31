import { clientCacheTtl, kvCacheTtl, refreshThreshold } from "./constants.js"
import {
  getKeyFromRequestUrl,
  getMimeTypeFromRequest,
  getMimeTypeFromKey,
  store,
  validateAuth,
} from "./util.js"

addEventListener("fetch", event => {
  event.respondWith(handle(event.request))
})

/**
 * Each key has the following structure:
 * {mimeType}/{hash}
 */

async function handle(request) {
  if (request.method === "GET") {
    const key = getKeyFromRequestUrl(request.url)
    if (!key) {
      return Promise.resolve(new Response("Not found", { status: 404 }))
    }
    return NPCHAT_MEDIA.getWithMetadata(key, {
      type: "arrayBuffer",
      cacheTtl: kvCacheTtl,
    }).then(valueWithMetadata => {
      const { value, metadata } = valueWithMetadata
      if (!value) {
        return Promise.resolve(new Response("Not found", { status: 404 }))
      }

      let refreshPromise
      if (metadata && metadata.expires < Date.now() + refreshThreshold) {
        refreshPromise = store(value, getMimeTypeFromKey(key), true)
      } else {
        refreshPromise = Promise.resolve()
      }

      return refreshPromise.then(() => {
        const response = new Response(value, {
          status: 200,
          headers: {
            "content-type": getMimeTypeFromKey(key),
            "content-length": value.byteLength,
            "cache-control": `public, max-age=${clientCacheTtl}, immutable`,
          },
        })
        return Promise.resolve(response)
      })
    })
  }

  if (request.method === "PUT") {
    if (!validateAuth(request)) {
      return Promise.resolve(new Response("Unauthorized", { status: 401 }))
    }
    return request
      .arrayBuffer()
      .then(value => store(value, getMimeTypeFromRequest(request)))
      .then(key => {
        const requestUrl = new URL(request.url)
        const fetchUrl = `${requestUrl.protocol}//${requestUrl.host}/${key}`
        return Promise.resolve(
          new Response(fetchUrl, {
            headers: {
              "access-control-allow-origin": "*",
              "content-type": "text/plain",
            },
          })
        )
      })
  }

  if (request.method === "DELETE") {
    if (!validateAuth(request)) {
      return Promise.resolve(new Response("Unauthorized", { status: 401 }))
    }
    const key = getKeyFromRequestUrl(request.url)
    if (!key) {
      return Promise.resolve(new Response("Not found", { status: 404 }))
    }
    return NPCHAT_MEDIA.delete(key).then(() =>
      Promise.resolve(new Response("Done", { status: 200 }))
    )
  }

  if (request.method === "OPTIONS") {
    const response = new Response(null, {
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, PUT, DELETE, OPTIONS",
        "access-control-allow-headers": "*",
        "access-control-max-age": 1728185,
      },
    })
    return Promise.resolve(response)
  }

  return Promise.resolve(new Response("Bad request", { status: 400 }))
}
