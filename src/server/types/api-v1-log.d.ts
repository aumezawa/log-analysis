declare namespace Express {
  export interface Request {
    resPath?        : string,
    projectInfoPath?: string
  }
}

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

type NodeType = FileType | DirectoryType

type FileType = {
  name: string,
  file: boolean
}

type DirectoryType = {
  name    : string,
  file    : boolean,
  children: Array<Node>
}
