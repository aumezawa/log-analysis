export default {
  isErrnoException: (arg: any): arg is NodeJS.ErrnoException => (arg.code !== undefined)
}
