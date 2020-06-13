import * as React from "react"

type InformationButtonProps = {
  className?    : string,
  label?        : string,
  hide?         : boolean,
  defaultValue? : string
}

const InformationButton = React.memo<InformationButtonProps>(({
  className     = "",
  label         = null,
  hide          = false,
  defaultValue  = "n/a"
}) => (
  <button
    className={ `btn btn-no-action ${ className } ${ !!label ? "btn-success" : "btn-secondary" } ${ hide && !label && "d-none" }` }
    type="button"
    disabled={ !label }
  >
    { label || defaultValue }
  </button>
))

export default InformationButton
