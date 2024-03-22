import * as React from "react"

import { Icon } from "react-bootstrap-icons"

type DropdownHeaderProrps = {
  label?: string,
  LIcon?: Icon,
}

const DropdownHeader: React.FC<DropdownHeaderProrps> = ({
  label = "No label",
  LIcon = undefined
}) => (
  <h6 className="dropdown-header">
    { LIcon && <LIcon className="mr-2" size="1rem" /> }{ label }
  </h6>
)

export default DropdownHeader
