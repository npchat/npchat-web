export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  rootDir: "www",
  port: 8001,
  open: "/",
  watch: true,
  nodeResolve: {
    exportConditions: ["browser", "development"]
  }
})
