import { css } from "lit"

export const chatStyles = css`
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

  .list {
    padding: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 1;
    min-height: 100px;
  }

  .message {
    background-color: var(--color-primary);
    color: var(--color-offwhite);
    padding: 10px;
    font-size: 1.1rem;
    border-radius: 10px;
  }

  .message p {
    margin: 0;
  }

  .messageContainer {
    display: flex;
    margin: 5px 0;
    justify-content: flex-end;
    width: calc(100vw - 10px);
    max-width: 400px;
  }

  .messageContainer.in {
    justify-content: flex-start;
  }

  .messageContainer.in .message {
    background-color: var(--color-darkwhite);
    color: var(--color-offblack);
  }

  .compose {
    position: sticky;
    bottom: 0;
    padding: 5px;
    display: flex;
    background-color: var(--color-offwhite);
    filter: drop-shadow(0 -5px 5px rgba(0, 0, 0, 0.1));
  }

  input {
    flex-grow: 1;
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

  .detailsRouteLink {
    flex-grow: 1;
  }

  .avatarNameGroup {
    flex-grow: 1;
    display: flex;
    align-items: center;
    border-radius: 5px;
    margin: 0 5px;
    padding: 3px 0;
    cursor: pointer;
  }

  .avatarNameGroup:hover {
    background-color: var(--color-darkwhite);
  }

  .call:not(:last-of-type) {
    margin-right: 10px;
  }
`