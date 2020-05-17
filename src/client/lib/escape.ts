export default {
  regex: (str: string) => str.replace(/[-\/\\^$*+?.()|\[\]{}]/g, "\\$&")
}
