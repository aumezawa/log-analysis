import * as React from "react"

import { Icon } from "react-bootstrap-icons"

type TabLabelProps = {
  label?  : string,
  LIcon?  : Icon,
  labelId : string,
  itemId  : string,
  active? : boolean
}

const TabLabel = React.forwardRef<HTMLAnchorElement, TabLabelProps>(({
  label   = "label",
  LIcon   = null,
  labelId = undefined,
  itemId  = undefined,
  active  = false
}, ref) => (
  <li className="nav-item">
    <a
      ref={ ref }
      className={ `nav-link ${ active && "active" }` }
      id={ labelId }
      data-toggle="tab"
      href={ "#" + itemId }
      role="tab"
      aria-controls={ itemId }
      aria-selected="true"
    >
      { LIcon && <LIcon className="mr-2" /> }{ label }
    </a>
  </li>
))

export default TabLabel
