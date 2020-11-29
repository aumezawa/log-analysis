export default (array: Array<any>): boolean => {
  for (let index = 0; index < array.length - 1; index++) {
    if (array[index] !== array[index + 1]) {
      return false
    }
  }
  return true
}
