import * as React from "react"
import { useCallback } from "react"

type ButtonProps = {
  className?: string,
  label?    : string,
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
      className={ `btn btn-${ color } ${ noAction && "btn-no-action" } ${ className } ` }
      type="button"
      disabled={ disabled }
      data-toggle={ toggle }
      data-target={ "#" + target }
      onClick={ handleClick }
    >
      { label }
    </button>
  )
})

export default Button
