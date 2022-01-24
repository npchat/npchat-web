import { esbuildPlugin } from "@web/dev-server-esbuild";
import { mainBuildConfig, qrBuildConfig } from "./esbuild.js";

const devMainBuildConfig = {}
Object.assign(devMainBuildConfig, mainBuildConfig)
devMainBuildConfig.minify = false

console.log(devMainBuildConfig  )

export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  rootDir: "www",
  port: 8001,
  open: "/",
  watch: true,
  nodeResolve: {
    exportConditions: ["browser", "development"],
  },

  /** Set appIndex to enable SPA routing */
  appIndex: "index.html",

  plugins: [
    [esbuildPlugin(devMainBuildConfig)],
    [esbuildPlugin(qrBuildConfig)],
  ],
});
