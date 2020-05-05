import * as React from "react"

import DropdownButton from "../part/dropdown-button"

type FileTreeLeafProps = {
  leaf    : FileType,
  path?   : string,
  depth?  : number,
  actions?: Array<JSX.Element>
}

const TreeLeaf: React.FC<FileTreeLeafProps> = ({
  leaf    = undefined,
  path    = "/",
  depth   = 0,
  actions = []
}) => (
  <div className="list-group-item list-group-item-action list-group-item-light list-group-item-container flex-container-row">
    <div className="list-group-item-inner-left text-nowrap">
      { "-".repeat(depth) }
    </div>
    <div className="list-group-item-inner-right flex-main-area text-break">
      { leaf.name }
    </div>
    <DropdownButton
      className="list-group-item-inner"
      label=""
      title={ path }
      items={ actions }
      shape="square"
    />
  </div>
)

export default TreeLeaf
