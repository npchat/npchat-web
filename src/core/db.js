import { openDB } from "idb/with-async-ittr"

const dbName = "npchat"
const dbVersion = 1

export async function openDBConn() {
  return openDB(dbName, dbVersion, {
    upgrade(db) {
      db.createObjectStore("contacts")
      const messages = db.createObjectStore("messages")
      messages.createIndex("with", "with")
    },
  })
}

export async function emptyDB() {
  const db = await openDBConn()
  await db.clear("contacts")
  await db.clear("messages")
  db.close()
}
