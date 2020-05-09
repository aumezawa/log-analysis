import * as React from "react"

type InformationButtonProps = {
  className?    : string,
  label?        : string,
  defaultValue? : string
}

const InformationButton = React.memo<InformationButtonProps>(({
  className     = "",
  label         = null,
  defaultValue  = "n/a"
}) => (
  <button
    className={ `btn btn-no-action ${ className } ${ !!label ? "btn-success" : "btn-secondary" }` }
    type="button"
    disabled={ !label }
  >
    { label || defaultValue }
  </button>
))

export default InformationButton
