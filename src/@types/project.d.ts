type ProjectInfo = {
  name        : string,
  status?     : string,  // open or close
  opened?     : string,  // opened date
  closed?     : string,  // closed date
  description : string,
  index       : number,
  bundles     : Array<BundleInfo>
}

type BundleInfo = {
  id          : number,
  name        : string,
  description : string,
  date?       : string,  // collected date
  available   : boolean
}

type FileInfo = {
  name        : string,
  directory   : string,
  path        : string,
  isDirectory : boolean,
  children    : Array<string>,
  size        : number,
  mtime       : string
}
