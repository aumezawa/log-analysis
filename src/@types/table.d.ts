type TableLabel = {
  name: string,
  type: string
}

type TableData = {
  [name: string]: string
}

type TableContent = {
  format: {
    title?: string,
    labels: Array<TableLabel>,
    hasHeader?  : boolean,
    hasIndex?   : boolean,
    contentKey? : string
  },
  data: Array<TableData>
}
