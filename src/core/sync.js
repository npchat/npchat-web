import { pack, unpack } from "msgpackr"
import { openDBConn } from "./db.js"
import { loadUser, storeUser } from "./storage.js"
import { push } from "./websocket.js"

export async function buildDataToSync() {
  const db = await openDBConn()
  const contacts = await db.getAll("contacts")
  db.close()
  const contactsToPush = contacts.map(c => ({
    originURL: c.originURL,
    pubKeyHash: c.keys.pubKeyHash,
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
  push({ data })
}

export async function handleReceivedData(authResp) {
  if (!authResp.data) {
    return
  }
  const unpacked = unpack(authResp.data)
  const { displayName, avatarURL, contacts } = unpacked
  if (displayName) {
    storeUser({ displayName, avatarURL })
    Object.assign(this, { displayName, avatarURL })
  }
  const db = await openDBConn()
  let contactsChanged = false
  await Promise.all(
    contacts.map(async c => {
      if (!(await db.get("contacts", c.pubKeyHash))) {
        // fetch data from shareable
        const resp = await fetch(
          `${c.originURL}/${c.pubKeyHash}/shareable`
        )
        if (resp.status !== 200) return
        contactsChanged = true
        const data = await resp.json()
        return db.put("contacts", data, c.pubKeyHash)
      }
    })
  )
  db.close()
  if (contactsChanged) {
    window.dispatchEvent(new CustomEvent("contactsChanged"))
  }
}