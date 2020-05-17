import * as React from "react"
import { useCallback } from "react"

type CheckFormProps = {
  className?: string,
  label?    : string,
  dafault?  : boolean,
  disabled? : boolean,
  onChange? : (value: boolean) => void
}

const CheckForm = React.memo(React.forwardRef<HTMLInputElement, CheckFormProps>(({
  className = "",
  label     = "Check",
  dafault   = true,
  disabled  = false,
  onChange  = undefined
}, ref) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.currentTarget.checked)
    }
  }, [onChange])

  return (
    <div className={ className }>
      <div className="input-group">
        <div className="input-group-prepend">
          <div className="input-group-text">
            <input
              ref={ ref }
              type="checkbox"
              disabled={ disabled }
              defaultChecked={ dafault }
              onChange={ handleChange }
            />
          </div>
        </div>
        <input
          className="form-control text-monospace"
          type="text"
          value={ label }
          disabled={ true }
        />
      </div>
    </div>
  )
}))

export default CheckForm
