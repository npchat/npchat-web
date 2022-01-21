import {css} from "lit"

export const generalStyles = css`
	.border-gradient {
		border-image: linear-gradient(45deg, var(--color-primary), var(--color-secondary)) 1;
	}

	.color-light {
		color: var(--color-grey);
	}

	h1, h2, h3, h4 {
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
`