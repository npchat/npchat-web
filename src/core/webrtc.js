export const iceConfig = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    },
    {
        urls: "turn:dev.npchat.org:3478",
        username: "npchat",
        credential: "npchatturn"
    }
]
}

async function getConnectedDevices(type) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === type)
}

async function openCamera(cameraId, minWidth, minHeight) {
  const constraints = {
      //'audio': {'echoCancellation': true},
      'video': {
          'deviceId': cameraId,
          'width': {'min': minWidth},
          'height': {'min': minHeight}
          }
      }

  return navigator.mediaDevices.getUserMedia(constraints);
}

export async function getMediaStream(minWidth, minHeight) {
  const cameras = await getConnectedDevices('videoinput');
  if (cameras && cameras.length > 0) {
    return openCamera(cameras[0].deviceId, minWidth, minHeight);
  }
}