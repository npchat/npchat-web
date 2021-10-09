import { serve } from "esbuild"
import { buildOptions } from './esbuild.js'

const serveOptions = { servedir: "www" }

serve(serveOptions, buildOptions).then(server => {
	console.log(`Dev server running on localhost:${server.port}`)
})