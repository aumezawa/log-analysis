import * as React from "react"

type InformationButtonProps = {
  className?    : string,
  label?        : string,
  display?      : boolean,
  defaultValue? : string
}

const InformationButton = React.memo<InformationButtonProps>(({
  className     = "",
  label         = null,
  display       = true,
  defaultValue  = "n/a"
}) => (
  <button
    className={ `btn btn-no-action ${ className } ${ !!label ? "btn-success" : "btn-secondary" } ${ !display && "d-none" }` }
    type="button"
    disabled={ !label }
  >
    { label || defaultValue }
  </button>
))

export default InformationButton
