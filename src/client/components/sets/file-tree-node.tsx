import * as React from "react"
import { useState, useRef, useCallback } from "react"

import { Icon, Folder, Folder2Open, FileEarmarkText } from "react-bootstrap-icons"

import FileTreeLeaf from "../sets/file-tree-leaf"

import * as Path from "path"

import UniqueId from "../../lib/unique-id"

type FileTreeNodeProps = {
  node        : DirectoryType,
  NIconOpen?  : Icon,
  NIconClose? : Icon,
  LIcon?      : Icon,
  path?       : string,
  depth?      : number,
  filter?     : string,
  actions?    : Array<JSX.Element>
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  node        = undefined,
  NIconOpen   = Folder2Open,
  NIconClose  = Folder,
  LIcon       = FileEarmarkText,
  path        = "/",
  depth       = 0,
  filter      = "",
  actions     = []
}) => {
  const [open, setOpen] = useState<boolean>(false)

  const id = useRef({
    collapse: "collapse-" + UniqueId()
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
            LIcon={ LIcon }
            path={ (childLeaf.link) || Path.join(path, childLeaf.name) }
            depth={ depth + 1 }
            filter={ filter }
            actions={ actions }
          />
        )
      } else {
        const childNode: DirectoryType = (child as DirectoryType)
        return (
          <FileTreeNode
            key={ childNode.name }
            NIconOpen={ NIconOpen }
            NIconClose={ NIconClose }
            LIcon={ LIcon }
            node={ childNode }
            path={ Path.join(path, childNode.name) }
            depth={ depth + 1 }
            filter={ filter }
            actions={ actions }
          />
        )
      }
    })
  }

  return (
    <ul className="list-group">
      {
        !filter &&
        <>
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
              { open ? <NIconOpen /> : <NIconClose /> }
            </div>
            <div className="list-group-item-inner-right flex-main-area text-break">
              { node && node.name }
            </div>
          </button>
          <ul className="list-group collapse" id={ id.current.collapse }>
            { renderChildren() }
          </ul>
        </>
      }
      {
        filter &&
        <>
          <ul className="list-group">
            { renderChildren() }
          </ul>
        </>
      }
    </ul>
  )
}

export default FileTreeNode
