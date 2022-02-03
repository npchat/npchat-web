import { css } from "lit"

export const chatsStyles = css`
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100vw;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: center;
    position: sticky;
    top: 0;
    background-color: var(--color-offwhite);
    filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.2));
    width: 100vw;
  }

  input {
    margin: 5px;
    width: 100%;
    max-width: 390px;
  }

  .list {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 5px;
    width: 100vw;
  }

  .contact {
    display: flex;
    align-items: center;
    cursor: pointer;
    background-color: var(--color-offwhite);
    transition: background-color 300ms;
    padding: 5px;
    width: calc(100vw - 10px);
    max-width: 400px;
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
