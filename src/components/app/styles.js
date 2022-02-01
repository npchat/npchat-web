import { css } from "lit"

export const appStyles = css`
:host {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
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

header > *{
  margin: 0 5px;
}

.logo {
  width: 80px;
}

.avatar {
  height: 40px;
  width: 40px;
  background-size: cover;
  border-radius: 50%;
  border: 2px solid var(--color-grey);
  transition: border-color 300ms;
}
`