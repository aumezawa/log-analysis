import * as React from "react"
import { useCallback } from "react"

import { Icon, Dot } from "react-bootstrap-icons"

type EmbeddedIconButtonProps= {
  LIcon?    : Icon,
  color?    : "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "light" | "dark",
  title?    : string,
  disabled? : boolean,
  toggle?   : string,
  target?   : string,
  onClick?  : (targetValue: string, parentValue: string) => void
}

const EmbeddedIconButton = React.memo<EmbeddedIconButtonProps>(({
  LIcon     = Dot,
  color     = "primary",
  title     = "",
  disabled  = false,
  toggle    = "",
  target    = "",
  onClick   = undefined
}) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && onClick) {
      onClick((e.currentTarget as HTMLElement).title, (e.currentTarget.parentNode as HTMLElement).title)
    }
  }, [disabled, onClick])

  return (
    <span
      className={ `embedded-button ${ disabled ? "embedded-button-disabled" : "" }` }
      title={ title }
      data-toggle={ toggle }
      data-target={ "#" + target }
      onClick={ handleClick }
    >
      <LIcon
        className={ `text-${ color }` }
      />
    </span>
  )
})

export default EmbeddedIconButton
