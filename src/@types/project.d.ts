type ProjectInfo = {
  name        : string,
  status?     : string,  // open or close
  opened?     : string,  // opened date
  closed?     : string,  // closed date
  description : string,
  index       : number,
  bundles     : Array<BundleInfo>,
  stats?      : Array<StatsInfo>
}

type BundleInfo = {
  id          : number,
  name        : string,
  description : string,
  type?       : string,
  date?       : string,  // collected date
  available   : boolean,
  preserved?  : boolean
}

type FileInfo = {
  name        : string,
  directory   : string,
  path        : string,
  isDirectory : boolean,
  children    : Array<string>,
  type        : string,
  size        : number,
  mtime       : string
}

type StatsInfo = {
  id          : number,
  name        : string,
  description : string,
  type        : string,
  available   : boolean
}

type CounterInfo = {
  [label: string]: CounterSubInfo
}

type CounterSubInfo = {
  [label: string]: Array<string>
}

type CounterData = {
  [label: string]: string | number
}
