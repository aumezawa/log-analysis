import * as React from "react"
import { useRef } from "react"

import UniqueId from "../../lib/unique-id"

type DropdownButtonProps = {
  className?: string,
  label?    : string,
  title?    : string,
  align?    : "left" | "right",
  items?    : Array<JSX.Element>,
  shape?    : "normal" | "square"
}

const DropdownButton: React.FC<DropdownButtonProps> = ({
  className = "",
  label     = "Dropdown",
  title     = "",
  align     = "left",
  items     = [],
  shape     = "normal"
}) => {
  const id = useRef({
    dropdown: "dropdown-" + UniqueId()
  })

  return (
    <div className={ `dropdown ${ className }` }>
      <button
        className={ `btn btn-secondary dropdown-toggle flex-item-${ shape }` }
        type="button"
        id={ id.current.dropdown }
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        { label }
      </button>
      <div
        className={ `dropdown-menu dropdown-menu-${ align }` }
        title={ title }
        aria-labelledby={ id.current.dropdown }
      >
        { items }
      </div>
    </div>
  )
}

export default DropdownButton
