import { css } from "lit"

export const logoURL = "assets/npchat-logo.svg"
export const avatarFallbackURL = "assets/avatar.svg"

export const generalStyles = css`
  .logo {
    width: 80px;
    margin-left: 5px;
  }

  .border-gradient {
    border-image: linear-gradient(
        45deg,
        var(--color-primary),
        var(--color-secondary)
      )
      1;
  }

  .color-light {
    color: var(--color-grey);
  }

  h1,
  h2,
  h3,
  h4 {
    font-weight: 300;
  }

  h1 {
    font-size: 3rem;
  }

  h2 {
    font-size: 2.2rem;
  }

  h3 {
    font-size: 1.8rem;
  }

  a.link {
    text-decoration: underline;
    color: inherit;
  }

  a.link:hover {
    color: var(--color-primary);
  }

  .monospace {
    font-family: monospace;
    font-size: 1.2rem;
    overflow-wrap: anywhere;
    word-break: break-all;
  }

  .error {
    color: var(--color-red);
  }

  .button {
    border: 0;
    outline: 0;
    background-color: transparent;
    color: var(--color-black);
    cursor: pointer;
    user-select: none;
    font-size: 1.4rem;
    padding: 10px 20px;
    margin: 10px;
    border: 2px solid var(--color-primary);
    transition: all 300ms;
  }

  .button.small {
    padding: 5px 10px;
    font-size: 1.2rem;
    border-color: var(--color-lightgrey);
  }

  .button:hover,
  .button:focus {
    background-color: var(--color-lightgrey);
    border-color: var(--color-secondary);
  }

  
  .button.icon {
    border: 2px solid var(--color-lightgrey);
    border-radius: 50%;
    padding: 0;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .button.icon img {
    margin-top: 3px;
    margin-right: 1px;
    width: 35px;
    height: 35px;
  }

  .button.icon:hover,
  .button.icon:focus {
    border: 2px solid var(--color-primary);
  }

  .button.success,
  input.success {
    background-color: var(--color-green);
  }
`
