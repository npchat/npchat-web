import { css } from "lit"

export const appStyles = css`
:host {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

main {
  transition: filter 300ms;
}

main.blur {
  filter: blur(10px);
  max-height: 100vh;
  overflow: hidden;
}

header {
  width: 100vw;
  height: 60px;
  display: flex;
  position: sticky;
  top: 0;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-darkwhite);
}

.logo {
  height: 100%;
  width: auto;
  margin: 0 5px;
}

.avatar {
  height: 40px;
  width: 40px;
  background-size: cover;
  border-radius: 50%;
  border: 2px solid var(--color-grey);
  transition: border-color 300ms;
}

.buttonRound {
  margin: 0 5px;
  outline: none;
  border: none;
}

.buttonRound:hover .avatar,
.buttonRound:focus .avatar {
  border-color: var(--color-primary);
}
`