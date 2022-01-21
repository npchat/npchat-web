import {css} from "lit"

export const formStyles = css`
	label {
		display: flex;
		flex-direction: column;
		font-size: 1.4rem;
		color: var(--color-darkgrey);
		margin: 10px 0;
	}

	button {
		padding: 10px 20px;
		margin: 10px;
		cursor: pointer;
		border: 2px solid var(--color-primary);
		transition: all 300ms;
	}

	button:hover {
		background-color: var(--color-lightgrey);
		border-color: var(--color-secondary);
	}

	input {
		padding: 10px;
		font-size: 1.4rem;
		border: 2px solid var(--color-lightgrey);
		color: var(--color-darkgrey);
	}

	input:focus {
		outline: 0;
		border: 2px solid var(--color-secondary)
	}
`