import { css } from "lit"

export const preferencesStyles = css`
form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.exportData {
  display: flex;
  align-items: center;
}

img {
  max-width: 100%;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.row {
  display: flex;
  align-items: center;
}

#avatar-file {
  margin-left: 5px;
  max-width: calc(100vw - 100px);
}
`