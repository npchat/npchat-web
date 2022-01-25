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
    font-size: 1.4rem;
    padding: 10px 20px;
    margin: 10px;
    cursor: pointer;
    border: 2px solid var(--color-primary);
    transition: all 300ms;
    outline: none;
  }

  button:hover,
  button:focus {
    background-color: var(--color-lightgrey);
    border-color: var(--color-secondary);
  }

  input {
    padding: 10px;
    font-size: 1.4rem;
    border: 2px solid var(--color-lightgrey);
    color: var(--color-darkgrey);
    transition: background-color 300ms;
  }

  input:focus {
    outline: 0;
    border: 2px solid var(--color-secondary);
  }

  button.success, input.success {
    background-color: var(--color-green);
  }
`
