interface RedioFormReference {
  checked : (target: number) => void
}

interface ListFormReference {
  active  : (target: number) => void,
  clear   : () => void
}

interface MultiSelectFromReference {
  active  : (targets: Array<number>) => void,
  clear   : () => void
}
