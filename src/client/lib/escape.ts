export default {
  regex: (str: string): string => (str.replace(/[-\/\\^$*+?.()|\[\]{}]/g, "\\$&")),
  root: (str: string): string => ((str.charAt(0) === "/") ? str.slice(1) : str),
}
