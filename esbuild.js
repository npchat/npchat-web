import { build } from "esbuild"

build({
	platform: "neutral",
	format: "esm",
	bundle: true,
	minify: true,
	entryPoints: ["src/main.js"],
	outdir: "www/dist"
}).then(() => console.log(`esbuild done`))

