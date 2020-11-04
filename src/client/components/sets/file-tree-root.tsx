import * as React from "react"

import { Icon, Folder, Folder2Open, FileEarmarkText } from "react-bootstrap-icons"

import FileTreeNode from "../sets/file-tree-node"
import FileTreeLeaf from "../sets/file-tree-leaf"

import * as Path from "path"

type FileTreeRootProps = {
  root        : NodeType,
  NIconOpen?  : Icon,
  NIconClose? : Icon,
  LIcon?      : Icon,
  path?       : string,
  filter?     : string,
  actions?    : Array<JSX.Element>
}

const FileTreeRoot: React.FC<FileTreeRootProps> = ({
  root        = undefined,
  NIconOpen   = Folder2Open,
  NIconClose  = Folder,
  LIcon       = FileEarmarkText,
  path        = "/",
  filter      = "",
  actions     = []
}) => {
  const render = () => {
    if (root.file) {
      const leaf: FileType = (root as FileType)
      return (
        <FileTreeLeaf
          leaf={ leaf }
          LIcon={ LIcon }
          path={ (leaf.link) || Path.join(path, leaf.name) }
          depth={ 0 }
          filter={ filter }
          actions={ actions }
        />
      )
    } else {
      const node: DirectoryType = (root as DirectoryType)
      return (
        <FileTreeNode
          node={ node }
          NIconOpen={ NIconOpen }
          NIconClose={ NIconClose }
          LIcon={ LIcon }
          path={ path }
          depth={ 0 }
          filter={ filter }
          actions={ actions }
        />
      )
    }
  }

  return (
    <>
      { render() }
    </>
  )
}

export default FileTreeRoot
