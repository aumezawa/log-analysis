import * as React from "react"
import { useCallback } from "react"

import * as LocalDate from "../../lib/local-date"

type DateFormProps = {
  className?    : string,
  label?        : string | JSX.Element,
  valid         : boolean,
  disabled?     : boolean,
  defaultValue? : string,
  onChange?     : (value: string) => void
}

const DateForm = React.memo(React.forwardRef<HTMLInputElement, DateFormProps>(({
  className     = "",
  label         = "Date",
  valid         = undefined,
  disabled      = false,
  defaultValue  = LocalDate.toInputFormat(new Date(), true),
  onChange      = undefined
}, ref) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.currentTarget.value)
    }
  }, [onChange])

  return (
    <div className={ className }>
      <div className="input-group">
        { label &&
          <div className="input-group-prepend">
            <span className="input-group-text">{ label }</span>
          </div>
        }
        <input
          ref={ ref }
          className={ `form-control ${ valid ? "" : "is-invalid" }` }
          type="datetime-local"
          step="1"
          disabled={ disabled }
          defaultValue={ defaultValue }
          onChange={ handleChange }
        />
      </div>
    </div>
  )
}))

export default DateForm
