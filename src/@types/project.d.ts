type BundleInfo = {
  id          : number,
  name        : string,
  description : string,
  available   : boolean
}

type ProjectInfo = {
  name        : string,
  description : string,
  index       : number,
  bundles     : Array<BundleInfo>
}

type ProjectSummary = {
  name        : string,
  description : string
}
