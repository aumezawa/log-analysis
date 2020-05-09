import * as React from "react"

type TabLabelProps = {
  label?  : string,
  labelId : string,
  itemId  : string,
  active? : boolean
}

const TabLabel = React.forwardRef<HTMLAnchorElement, TabLabelProps>(({
  label   = "label",
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
      { label }
    </a>
  </li>
))

export default TabLabel
