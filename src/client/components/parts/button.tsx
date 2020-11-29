import * as React from "react"
import { useCallback } from "react"

import { Icon } from "react-bootstrap-icons"

type ButtonProps = {
  className?: string,
  label?    : string,
  LIcon?    : Icon,
  type?     : "btn" | "btn-outline",
  color?    : "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "light" | "dark",
  noAction? : boolean,
  disabled? : boolean,
  toggle?   : string,
  target?   : string,
  onClick?  : () => void
}

const Button = React.memo<ButtonProps>(({
  className = "",
  label     = "no label",
  LIcon     = null,
  type      = "btn",
  color     = "primary",
  noAction  = false,
  disabled  = false,
  toggle    = "",
  target    = "",
  onClick   = undefined
}) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick()
    }
  }, [true])

  return (
    <button
      className={ `btn ${ type }-${ color } ${ noAction && "btn-no-action" } ${ className } ` }
      type="button"
      disabled={ disabled }
      data-toggle={ toggle }
      data-target={ "#" + target }
      onClick={ handleClick }
    >
      { LIcon && <LIcon className="mr-2" /> }{ label }
    </button>
  )
})

export default Button
