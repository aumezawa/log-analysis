import * as React from "react"
import { useRef } from "react"

import uniqueId from "../../lib/uniqueId"

type DropdownButtonProps = {
  label?: string,
  align?: "left" | "right",
  items?: Array<JSX.Element>,
}

const DropdownButton: React.FC<DropdownButtonProps> = ({
  label = "Dropdown",
  align = "left",
  items = []
}) => {
  const id = useRef({
    drop: "dropdown-" + uniqueId()
  })

  return (
    <div className="dropdown">
      <button
        className="btn btn-secondary dropdown-toggle"
        type="button"
        id={ id.current.drop }
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        { label }
      </button>
      <div
        className={ `dropdown-menu dropdown-menu-${ align }` }
        aria-labelledby={ id.current.drop }
      >
        { items }
      </div>
    </div>
  )
}

export default DropdownButton
