type TableLabel = {
  [label: string]: string
}

type TableData = {
  [label: string]: string
}

type TableContent = {
  format: {
    title?      : string,
    label       : TableLabel,
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
  type?         : string,
  mode?         : string,
  sensitive?    : boolean,
  display?      : string,
  condition?    : string,
  from?         : Date,
  to?           : Date,
  head?         : number,
  tail?         : number
}
