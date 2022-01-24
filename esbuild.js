import { build } from "esbuild"

export const mainBuildConfig = {
	platform: "neutral",
	bundle: true,
	minify: true,
	entryPoints: ["src/main.js"],
	outdir: "www/dist"
}

export const qrBuildConfig = {
	platform: "neutral",
	bundle: false,
	minify: true,
	minifyIdentifiers: false,
	entryPoints: ["node_modules/qrcode/build/qrcode.js"],
	outfile: "www/dist/qrlib.js"
}

const builds = []

builds.push(build(mainBuildConfig))

builds.push(build(qrBuildConfig))


Promise.all(builds)
	.then(() => console.log("esbuild done"))

