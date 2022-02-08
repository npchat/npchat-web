import { build } from "esbuild"

// new PWA cache name will include last commit ID
// esbuild wants a string literal with escaped quotes
const CACHE_VERSION = `"${process.env.CF_PAGES_COMMIT_SHA}"` || "\"v1\""

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

// service worker
builds.push(build({
	platform: "neutral",
	bundle: true,
	minify: !isDev(),
	watch: isDev(),
	entryPoints: ["src/service-worker.js"],
	outfile: "www/sw.js",
	define: { CACHE_VERSION }
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
