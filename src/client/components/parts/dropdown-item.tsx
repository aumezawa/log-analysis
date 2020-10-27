import * as React from "react"
import { useCallback } from "react"

type DropdownItemProps = {
  className?: string,
  label?    : string,
  title?    : string,
  disabled? : boolean,
  toggle?   : string,
  target?   : string,
  onClick?  : (targetValue: string, parentValue: string) => void
}

const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(({
  className = "",
  label     = "action",
  title     = "",
  disabled  = false,
  toggle    = "",
  target    = "",
  onClick   = undefined
}, ref) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick((e.currentTarget as HTMLElement).title, (e.currentTarget.parentNode as HTMLElement).title)
    }
  }, [onClick])

  return (
    <button
      ref={ ref }
      className={ `dropdown-item text-monospace ${ className }` }
      type="button"
      title={ title }
      disabled={ disabled }
      data-toggle={ toggle }
      data-target={ "#" + target }
      onClick={ handleClick }
    >
      { label }
    </button>
  )
})

export default DropdownItem
