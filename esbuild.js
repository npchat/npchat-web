import { build } from "esbuild"

function isDev() {
	return process.argv.indexOf("--dev") >= 0
}

const builds = []

// main
builds.push(build({
	platform: "neutral",
	bundle: true,
	minify: !isDev(),
	watch: isDev(),
	entryPoints: ["src/main.js"],
	outdir: "www/dist"
}))

// qrcode lib
builds.push(build({
	platform: "neutral",
	bundle: false,
	minify: true,
	minifyIdentifiers: false,
	entryPoints: ["node_modules/qrcode/build/qrcode.js"],
	outfile: "www/dist/qrlib.js"
}))

Promise.all(builds)
	.then(() => console.log(`esbuild: ${isDev() ? "dev" : "prod"} build done`))
