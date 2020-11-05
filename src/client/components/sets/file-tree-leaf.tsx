import * as React from "react"

import { Icon, FileEarmarkText } from "react-bootstrap-icons"

import DropdownButton from "../parts/dropdown-button"

type FileTreeLeafProps = {
  leaf    : FileType,
  LIcon?  : Icon,
  path?   : string,
  depth?  : number,
  filter? : string,
  actions?: Array<JSX.Element>
}

const TreeLeaf: React.FC<FileTreeLeafProps> = ({
  leaf    = undefined,
  LIcon   = FileEarmarkText,
  path    = "/",
  depth   = 0,
  filter  = "",
  actions = []
}) => (
  (filter === "FILEONLY" || leaf.name.includes(filter)) &&
  <div className="list-group-item list-group-item-action list-group-item-light list-group-item-container flex-container-row">
    {
      !filter &&
      <>
        <div className="list-group-item-inner-left text-nowrap">
          { "-".repeat(depth) }
        </div>
        <div className="list-group-item-inner-center text-nowrap">
          <LIcon />
        </div>
        <div className="list-group-item-inner-right flex-main-area text-break">
          { leaf.name }
        </div>
      </>
    }
    {
      filter &&
      <>
        <div className="list-group-item-inner-left text-nowrap">
          <LIcon />
        </div>
        <div className="list-group-item-inner-right flex-main-area text-break">
          { leaf.name }
        </div>
      </>
    }
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
