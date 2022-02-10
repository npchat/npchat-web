export const avatarSize = 250
// TODO: secure with ephemeral token
const apiKey = "gXVqOrNeZvjx3OnVSjcXmvVcKNNY4SwLpOJpyTA"
const endpoint = "https://npchat-media.dr-useless.workers.dev"

export async function putMedia(data, mimeType) {
  const resp = await fetch(`${endpoint}/${mimeType}`, {
    method: "PUT",
    body: data,
    headers: {
      authorization: apiKey,
    },
  })
  if (resp.status !== 200) return
  return resp.text()
}
