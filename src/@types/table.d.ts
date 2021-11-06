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
  condition?    : string,
  from?         : Date,
  to?           : Date,
  head?         : number,
  tail?         : number
}

type SearchSettings = {
  [label: string]: SearchSetting
}

type SearchSetting = {
  type?         : string,
  mode?         : string,
  sensitive?    : boolean,
  condition?    : string,
  founds?       : Array<number>
}
