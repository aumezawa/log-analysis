import * as React from "react"
import { useState, useRef, useCallback } from "react"

import FileTreeLeaf from "../set/file-tree-leaf"

import * as Path from "path"

import uniqueId from "../../lib/uniqueId"

type FileTreeNodeProps = {
  node    : DirectoryType,
  path?   : string,
  depth?  : number,
  actions?: Array<JSX.Element>
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  node    = undefined,
  path    = "/",
  depth   = 0,
  actions = []
}) => {
  const [open, setOpen] = useState<boolean>(false)

  const id = useRef({
    collapse: "collapse-" + uniqueId()
  })

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(!open)
  }, [open])

  const renderChildren = () => {
    return node.children.map((child: NodeType) => {
      if (child.file) {
        const childLeaf: FileType = (child as FileType)
        return (
          <FileTreeLeaf
            key={ childLeaf.name }
            leaf={ childLeaf }
            path={ (childLeaf.link) || Path.join(path, childLeaf.name) }
            depth={ depth + 1 }
            actions={ actions }
          />
        )
      } else {
        const childNode: DirectoryType = (child as DirectoryType)
        return (
          <FileTreeNode
            key={ childNode.name }
            node={ childNode }
            path={ Path.join(path, childNode.name) }
            depth={ depth + 1 }
            actions={ actions }
          />
        )
      }
    })
  }

  return (
    <ul className="list-group">
      <button
        className="list-group-item list-group-item-action list-group-item-info list-group-item-container flex-container-row"
        type="button"
        data-toggle="collapse"
        data-target={ "#" + id.current.collapse }
        aria-expanded="false"
        aria-controls={ id.current.collapse }
        onClick={ handleClick }
      >
        <div className="list-group-item-inner-left text-nowrap">
          { "-".repeat(depth) }
        </div>
        <div className="list-group-item-inner-center text-nowrap">
          { open ? "[-]" : "[+]" }
        </div>
        <div className="list-group-item-inner-right flex-main-area text-break">
          { node && node.name }
        </div>
      </button>
      <ul className="list-group collapse" id={ id.current.collapse }>
        { renderChildren() }
      </ul>
    </ul>
  )
}

export default FileTreeNode
