import { openDB } from "idb"

const dbName = "npchat"
const dbVersion = 1

export async function openDBConn() {
  return openDB(dbName, dbVersion, {
    upgrade(db) {
      db.createObjectStore("contacts")
    }
  })
}



