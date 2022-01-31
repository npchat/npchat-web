import { css } from "lit"

export const formStyles = css`
  label {
    display: flex;
    flex-direction: column;
    color: var(--color-darkgrey);
    margin: 10px 0;
    width: 100%;
  }

  label.no-flex {
    display: block;
  }

  label span {
    font-size: 1.4rem;
  }

  button {
    border: 0;
    outline: 0;
    background-color: transparent;
    color: var(--color-black);
    cursor: pointer;
    user-select: none;
    transition: all 300ms;
  }

  button.normal {
    font-size: 1.4rem;
    padding: 10px 20px;
    margin: 10px;
    border: 2px solid var(--color-primary);
  }

  button.normal:hover,
  button.normal:focus {
    background-color: var(--color-lightgrey);
    border-color: var(--color-secondary);
  }

  button.secondary {
    padding: 5px 10px;
    font-size: 1.2rem;
    border-color: var(--color-lightgrey);
  }

  button.icon {
    background: transparent;
    border: 2px solid var(--color-lightgrey);
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  button.icon img {
    width: 30px;
    height: 30px;
  }

  button.icon:hover,
  button.icon:focus {
    border: 2px solid var(--color-primary);
  }

  input {
    padding: 10px;
    font-size: 1.4rem;
    border: 2px solid var(--color-lightgrey);
    color: var(--color-darkgrey);
    transition: all 300ms;
  }

  input:focus {
    outline: 0;
    border: 2px solid var(--color-secondary);
  }

  button.normal.success,
  input.success {
    background-color: var(--color-green);
  }

  p.error {
    color: var(--color-red);
  }
`
