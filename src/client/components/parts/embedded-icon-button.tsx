import * as React from "react"
import { useCallback } from "react"

import { Icon, Dot } from "react-bootstrap-icons"

type EmbeddedIconButtonProps= {
  LIcon?  : Icon,
  color?  : "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "light" | "dark",
  title?  : string,
  toggle? : string,
  target? : string,
  onClick?: (targetValue: string, parentValue: string) => void
}

const EmbeddedIconButton = React.memo<EmbeddedIconButtonProps>(({
  LIcon   = Dot,
  color   = "primary",
  title   = "",
  toggle  = "",
  target  = "",
  onClick = undefined
}) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick((e.currentTarget as HTMLElement).title, (e.currentTarget.parentNode as HTMLElement).title)
    }
  }, [onClick])

  return (
    <span
      className="embedded-button"
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
