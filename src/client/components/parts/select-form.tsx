import * as React from "react"
import { useCallback } from "react"

type SelectFormProps = {
  className?: string,
  label?    : string,
  options?  : Array<string>,
  disabled? : boolean,
  onChange? : (value: string) => void
}

const SelectForm = React.memo(React.forwardRef<HTMLSelectElement, SelectFormProps>(({
  className = "",
  label     = "Select",
  options   = [],
  disabled  = false,
  onChange  = undefined
}, ref) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.currentTarget.value)
    }
  }, [onChange])

  return (
    <div className={ className }>
      <div className="input-group">
        <div className="input-group-prepend">
          <span className="input-group-text">{ label }</span>
        </div>
        <select
          ref={ ref }
          className="form-control"
          disabled={ disabled }
          defaultValue={ options[0] }
          onChange={ handleChange }
        >
          { options.map((value: string) => <option key={ value } value={ value }>{ value }</option>) }
        </select>
      </div>
    </div>
  )
}))

export default SelectForm
