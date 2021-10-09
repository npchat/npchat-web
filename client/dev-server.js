import { serve } from "esbuild"
import { buildOptions } from './esbuild.js'

const serveOptions = { servedir: "www" }

const serveBuildOptions = {}
Object.assign(serveBuildOptions, buildOptions)
serveBuildOptions.minify = false

serve(serveOptions, serveBuildOptions).then(server => {
	console.log(`Dev server running on localhost:${server.port} ${JSON.stringify(serveBuildOptions)}`)
})