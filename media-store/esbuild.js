import esbuild from "esbuild"

esbuild.build({
	entryPoints: ["./src/index.js"],
	bundle: true,
	minify: false,
	minifyIdentifiers: false,
	outfile: "./dist/index.js",
}).then(() => console.log("esbuild: done"))
	.catch(() => process.exit(1))