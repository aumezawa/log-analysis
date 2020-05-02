export default (digit: number = 16, sep: number = 4) => {
  const HEX: number = 16
  const padding = (str: string, len: number) => ("0".repeat(digit) + str).slice(-len)
  return padding(Date.now().toString(digit), digit - sep) + padding(Math.floor(Math.pow(HEX, sep) * Math.random()).toString(HEX), sep)
}
