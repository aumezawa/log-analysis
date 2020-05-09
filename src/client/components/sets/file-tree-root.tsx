import * as React from "react"

import FileTreeNode from "../sets/file-tree-node"
import FileTreeLeaf from "../sets/file-tree-leaf"

import * as Path from "path"

type FileTreeRootProps = {
  root    : NodeType,
  path?   : string,
  actions?: Array<JSX.Element>
}

const FileTreeRoot: React.FC<FileTreeRootProps> = ({
  root    = undefined,
  path    = "/",
  actions = []
}) => {
  const render = () => {
    if (root.file) {
      const leaf: FileType = (root as FileType)
      return (
        <FileTreeLeaf
          leaf={ leaf }
          path={ (leaf.link) || Path.join(path, leaf.name) }
          depth={ 0 }
          actions={ actions }
        />
      )
    } else {
      const node: DirectoryType = (root as DirectoryType)
      return (
        <FileTreeNode
          node={ node }
          path={ path }
          depth={ 0 }
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
