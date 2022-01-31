export const iceConfig = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "turn:dev.npchat.org:3478",
      username: "npchat",
      credential: "npchatturn",
    },
  ],
}

/*
export function amIPolitePeer(myPubKeyHash, peerPubKeyHash) {
  const myPkh = fromBase64(myPubKeyHash)
  const peerPhk = fromBase64(peerPubKeyHash)
  for (let i = 0; i < myPkh.length; i++) {
    if (myPkh[i] > peerPhk[i]) return false
    if (peerPhk[i] > myPkh[i]) return true
  }
}
*/
