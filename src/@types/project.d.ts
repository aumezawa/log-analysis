type ProjectInfo = {
  name        : string,
  status?     : string,  // open or close
  description : string,
  index       : number,
  bundles     : Array<BundleInfo>
}

type BundleInfo = {
  id          : number,
  name        : string,
  description : string,
  available   : boolean
}

type FileInfo = {
  name        : string,
  directory   : string,
  path        : string,
  isDirectory : boolean,
  children    : Array<string>,
  size        : number,
  modifiedAt  : Date
}
