import * as React from "react"
import { useCallback } from "react"

import { Icon } from "react-bootstrap-icons"

type TabLabelProps = {
  label?  : string,
  LIcon?  : Icon,
  labelId : string,
  itemId  : string,
  hidden? : boolean,
  active? : boolean,
  onClick?: () => void
}

const TabLabel = React.forwardRef<HTMLAnchorElement, TabLabelProps>(({
  label   = "label",
  LIcon   = null,
  labelId = undefined,
  itemId  = undefined,
  hidden  = false,
  active  = false,
  onClick = undefined
}, ref) => {

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick()
    }
  }, [onClick])

  return (
    <li className={ `nav-item ${ hidden && "d-none" }` }>
      <a
        ref={ ref }
        className={ `nav-link ${ active && "active" }` }
        id={ labelId }
        data-toggle="tab"
        href={ "#" + itemId }
        role="tab"
        aria-controls={ itemId }
        aria-selected="true"
        onClick={ handleClick }
      >
        { LIcon && <LIcon className="mr-2" /> }{ label }
      </a>
    </li>
  )
})

export default TabLabel
