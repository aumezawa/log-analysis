import * as React from "react"
import { useCallback } from "react"

import LocalDate from "../../lib/local-date"

type DateFormProps = {
  className?    : string,
  label?        : string,
  valid         : boolean,
  disabled?     : boolean,
  defaultValue? : string,
  onChange?     : (value: Date) => void
}

const DateForm = React.memo<DateFormProps>(({
  className     = "",
  label         = "Date",
  valid         = undefined,
  disabled      = false,
  defaultValue  = LocalDate.toISOString(LocalDate.now()),
  onChange      = undefined
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(LocalDate.newDate(e.currentTarget.value))
    }
  }, [onChange])

  return (
    <div className={ className }>
      <div className="input-group">
        <div className="input-group-prepend">
          <span className="input-group-text">{ label }</span>
        </div>
        <input
          className={ `form-control ${ !valid && "is-invalid" }` }
          type="datetime-local"
          step="1"
          disabled={ disabled }
          defaultValue={ defaultValue }
          onChange={ handleChange }
        />
      </div>
    </div>
  )
})

export default DateForm