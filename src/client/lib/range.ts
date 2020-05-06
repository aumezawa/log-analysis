export default (from: number, to: number) => (
  Array.from({ length: (to - from + 1) }, (value: number, index: number) => index + from)
)
