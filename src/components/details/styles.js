import { css } from "lit"

export const detailsStyles = css`
.container {
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  padding: 3px;
  position: sticky;
  top: 0;
  min-height: 50px;
  background-color: var(--color-offwhite);
  filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.2));
}

.avatar {
  width: 40px;
  height: 40px;
  margin-left: 5px;
  border-radius: 50%;
  border: 2px solid var(--color-secondary);
}

.name {
  margin-left: 10px;
  font-size: 1.4rem;
  user-select: none;
}

.avatarNameGroup {
  flex-grow: 1;
  display: flex;
  align-items: center;
  border-radius: 5px;
  margin: 0 5px;
  padding: 3px 0;
}
`