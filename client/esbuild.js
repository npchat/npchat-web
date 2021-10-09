import { build } from "esbuild"

export const buildOptions = {
	platform: "neutral",
	format: 'esm',
	bundle: true,
	minify: !isDev(),
	watch: watch(),
	entryPoints: ["src/index.js"],
	outdir: "www/dist"
}

build(buildOptions).then(() => console.log(`ESBuild: ${isDev()?'dev':'prod'} build done.`))

function watch() {
	if (shouldWatch()) {
		return {
			onRebuild(e) {
				if (e) {
					console.error('ESBuild: watch build failed', e)
				} else {
					console.log('ESBuild: watch build succeeded')
				}
			}
		}
	}
	return false;
}

function shouldWatch() {
	return isDev() && process.argv.indexOf('--watch') >= 0;
}

function isDev() {
	return process.argv.indexOf('--dev') >= 0;
}

