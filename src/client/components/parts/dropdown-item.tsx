import * as React from "react"
import { useCallback } from "react"

type DropdownItemProps = {
  className?: string,
  label?    : string,
  title?    : string,
  disabled? : boolean,
  display?  : boolean,
  toggle?   : string,
  target?   : string,
  onClick?  : (targetValue: string, parentValue: string) => void
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  className = "",
  label     = "action",
  title     = "",
  disabled  = false,
  display   = true,
  toggle    = "",
  target    = "",
  onClick   = undefined
}) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick((e.currentTarget as HTMLElement).title, (e.currentTarget.parentNode as HTMLElement).title)
    }
  }, [onClick])

  return (
    <button
      className={ `dropdown-item text-monospace ${ className } ${ !display && "d-none" }` }
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
}

export default DropdownItem
