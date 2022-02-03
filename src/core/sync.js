import { pack } from "msgpackr"
import { openDBConn } from "./db"
import { loadUser } from "./storage"
import { push } from "./websocket"

export async function buildDataToSync() {
  const db = await openDBConn()
  const contacts = await db.getAll("contacts")
  db.close()
  const contactsToPush = contacts.map(c => ({
    originURL: c.originURL,
    pubKeyHash: c.keys.pubKeyHash
  }))
  const user = loadUser()
  return pack({
    displayName: user.displayName,
    avatarURL: user.avatarURL,
    contacts: contactsToPush,
  })
}

export async function pushUserData() {
  const data = await buildDataToSync()
  push({data})
}