import { css } from "lit"

export const chatsStyles = css`
.container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100vw;
}

.import {
  display: flex;
  position: sticky;
  top: 0;
  min-height: 60px;
  background-color: var(--color-offwhite);
}

input {
  margin: 5px;
  flex-grow: 1;
}

.list {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.contact {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  text-decoration: none;
  color: var(--color-offblack);
  background-color: var(--color-offwhite);
  transition: background-color 300ms;
  padding: 5px;
  margin: 0;
  border: none;
}

.contact:hover {
  background-color: var(--color-darkwhite);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--color-primary);
}

.name {
  margin-left: 10px;
  font-size: 1.4rem;
  user-select: none;
}
`