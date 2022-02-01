import { css } from "lit"

export const callStyles = css`
.call {
  width: 100vw;
  height: 100vh;
  height: -webkit-fill-available;
  position: fixed;
  top: 0;
  left: 0;
  background-color: var(--color-darkgrey);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--color-offwhite);
}

.buttonGroup {
  margin: 10px;
}

button.endCall {
  background-color: var(--color-red);
}

video {
  max-width: 100%;
  flex-grow: 1;
}

video.local {
  max-height: 20vh;
}

video.remote {
  max-height: 60vh;
}

.avatar {
  border-radius: 50%;
}
`