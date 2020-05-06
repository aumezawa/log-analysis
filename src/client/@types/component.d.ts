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
