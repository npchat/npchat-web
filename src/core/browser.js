export function browserSupportsProtocolHandlers() {
  return typeof navigator.registerProtocolHandler === "function"
}

export function browserUsesChromium() {
  if (!navigator.userAgentData) return false
  return (
    navigator.userAgentData.brands.filter(
      b =>
        b.brand.toLowerCase() === "chromium" && parseInt(b.version, 10) >= 97
    ).length > 0
  )
}