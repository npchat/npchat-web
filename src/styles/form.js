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
    margin: 5px 0;
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
`
