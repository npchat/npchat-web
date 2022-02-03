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

  .avatar.fullsize {
    width: min-content;
    max-width: 100%;
    height: auto;
  }

  .name {
    font-size: 1.4rem;
    user-select: none;
  }

  .button.icon.back {
    margin: 4px 0;
  }
`
