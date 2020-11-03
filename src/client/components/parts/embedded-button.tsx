import * as React from "react"
import { useCallback } from "react"

type EmbeddedButtonProps= {
  label?  : string,
  color?  : "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "light" | "dark",
  title?  : string,
  toggle? : string,
  target? : string,
  onClick?: (targetValue: string, parentValue: string) => void
}

const EmbeddedButton = React.memo<EmbeddedButtonProps>(({
  label   = "button",
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
      className={ `badge badge-btn badge-${ color }` }
      title={ title }
      data-toggle={ toggle }
      data-target={ "#" + target }
      onClick={ handleClick }
    >
      { label }
    </span>
  )
})

export default EmbeddedButton
