import * as React from "react"
import { useCallback } from "react"

type EmbeddedButtonProps= {
  label   : string,
  on      : boolean,
  toggle  : string,
  target  : string,
  onClick : (value: string) => void
}

const EmbeddedButton = React.memo<EmbeddedButtonProps>(({
  label   = "button",
  on      = false,
  toggle  = "",
  target  = "",
  onClick = undefined
}) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick((e.currentTarget.parentNode as HTMLElement).title)
    }
  }, [onClick])

  return (
    <span
      className={ `badge badge-btn ${ on ? "badge-success" : "badge-light" }` }
      data-toggle={ toggle }
      data-target={ "#" + target }
      onClick={ handleClick }
    >
      { label }
    </span>
  )
})

export default EmbeddedButton
