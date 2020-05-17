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

type FilterSettings = {
  [label: string]: FilterSetting
}

type FilterSetting = {
  type?     : string,
  mode?     : string,
  sensitive?: boolean,
  condition?: string
}
