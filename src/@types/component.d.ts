interface RedioFormReference {
  checked : (target: number) => void
}

interface ListFormReference {
  active  : (target: number) => void,
  clear   : () => void
}

interface MultiSelectFormReference {
  active  : (targets: Array<number>) => void,
  clear   : () => void
}

interface MultiDateFormReference {
  set     : (from: string, to: string) => void,
  now     : (from: boolean, to: boolean) => void
}
