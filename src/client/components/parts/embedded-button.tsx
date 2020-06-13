import * as React from "react"
import { useCallback } from "react"

type EmbeddedButtonProps= {
  label?  : string,
  title?  : string,
  on?     : boolean,
  toggle? : string,
  target? : string,
  onClick?: (targetValue: string, parentValue: string) => void
}

const EmbeddedButton = React.memo<EmbeddedButtonProps>(({
  label   = "button",
  title   = "",
  on      = false,
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
      className={ `badge badge-btn ${ on ? "badge-success" : "badge-light" }` }
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
