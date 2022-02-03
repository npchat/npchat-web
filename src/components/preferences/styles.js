import { css } from "lit"

export const preferencesStyles = css`
  .flex {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }

  .row {
    margin: 20px 0;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .row p {
    margin-left: 20px;
  }

  img {
    max-width: 100%;
  }

  #avatar-file {
    margin-left: 5px;
    max-width: calc(100vw - 100px);
  }

  .exportHeader {
    margin-left: 10px;
  }
`
