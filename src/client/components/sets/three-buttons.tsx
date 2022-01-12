import * as React from "react"
import { useCallback } from "react"

import { Icon } from "react-bootstrap-icons"
import { CaretUpFill, CaretDownFill, CaretLeftFill, CaretRightFill } from "react-bootstrap-icons"

type ThreeButtonsProps = {
  className?    : string,
  label?        : string,
  LIcon?        : Icon,
  type?         : "btn" | "btn-outline",
  color?        : "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "light" | "dark",
  direction?    : "vertical" | "horizontal",
  disabled?     : boolean,
  onClickCenter?: () => void,
  onClickLeft?  : () => void,
  onClickRight? : () => void
}

const ThreeButtons = React.memo<ThreeButtonsProps>(({
  className     = "",
  label         = "no label",
  LIcon         = null,
  type          = "btn",
  color         = "primary",
  direction     = "horizontal",
  disabled      = false,
  onClickCenter = undefined,
  onClickLeft   = undefined,
  onClickRight  = undefined
}) => {
  const handleClickCenter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClickCenter) {
      onClickCenter()
    }
  }, [onClickCenter])

  const handleClickLeft = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClickLeft) {
      onClickLeft()
    }
  }, [onClickLeft])

  const handleClickRight = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClickRight) {
      onClickRight()
    }
  }, [onClickRight])

  return (
    <div className={ `btn-group ${ className }` } role="group">
      <button
        className={ `btn ${ type }-${ color }` }
        type="button"
        disabled={ disabled }
        onClick={ handleClickLeft }
      >
        { (direction === "vertical")   && <CaretUpFill />   }
        { (direction === "horizontal") && <CaretLeftFill /> }
      </button>
      <button
        className={ `btn ${ type }-${ color }` }
        type="button"
        disabled={ disabled }
        onClick={ handleClickCenter }
      >
        { LIcon && <LIcon className="mr-2" /> }{ label }
      </button>
      <button
        className={ `btn ${ type }-${ color }` }
        type="button"
        disabled={ disabled }
        onClick={ onClickRight }
      >
        { (direction === "vertical")   && <CaretDownFill />  }
        { (direction === "horizontal") && <CaretRightFill /> }
      </button>
    </div>
  )
})

export default ThreeButtons
