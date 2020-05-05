type FileType = {
  name  : string,
  file  : boolean,
  link? : string,
  type? : "txt" | "bin"
}

type DirectoryType = {
  name      : string,
  file      : boolean,
  children  : Array<NodeType>
}

type NodeType = FileType | DirectoryType
