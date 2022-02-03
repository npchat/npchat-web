import { css } from "lit"

export const detailsStyles = css`
  .container {
    display: flex;
    flex-direction: column;
  }

  .main {
    align-self: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .main > * {
    margin: 10px 0;
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

  .avatar.fullsize {
    width: min-content;
    max-width: 100%;
    height: auto;
  }

  .name {
    margin-left: 10px;
    font-size: 1.4rem;
    user-select: none;
  }
`
