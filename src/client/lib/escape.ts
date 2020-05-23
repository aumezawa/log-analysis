export default {
  regex : (str: string) => str && str.replace(/[-\/\\^$*+?.()|\[\]{}]/g, "\\$&"),
  root  : (str: string) => str && str.charAt(0) === "/" && str.slice(1) || str
}
