import { css } from "lit"

export const preferencesStyles = css`
  .flex {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }

  .row {
    flex-direction: row;
  }

  img {
    max-width: 100%;
  }

  #avatar-file {
    margin-left: 5px;
    max-width: calc(100vw - 100px);
  }

  .exportRow {
    margin-top: 20px;
  }

  .exportDesc {
    margin-left: 10px;
  }

  .exportHeader {
    margin-left: 10px;
  }
`
