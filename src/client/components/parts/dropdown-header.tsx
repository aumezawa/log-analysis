import * as React from "react"

type DropdownHeaderProrps = {
  label?: string
}

const DropdownHeader: React.FC<DropdownHeaderProrps> = ({
  label = "No label"
}) => (
  <h6 className="dropdown-header">
    { label }
  </h6>
)

export default DropdownHeader
