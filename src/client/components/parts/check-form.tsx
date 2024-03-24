import * as React from "react"
import { useCallback } from "react"

type CheckFormProps = {
  className?      : string,
  label?          : string,
  disabled?       : boolean,
  defaultChecked? : boolean,
  onChange?       : (value: boolean) => void
}

const CheckForm = React.memo(React.forwardRef<HTMLInputElement, CheckFormProps>(({
  className       = "",
  label           = "Check",
  disabled        = false,
  defaultChecked  = true,
  onChange        = undefined
}, ref) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.currentTarget.checked)
    }
  }, [onChange])

  const handleClick = useCallback(() => {
    (ref as React.RefObject<HTMLInputElement>).current?.click()
  }, [true])

  return (
    <div className={ className }>
      <div className="input-group">
        <div className="input-group-prepend">
          <div className="input-group-text">
            <input
              ref={ ref }
              type="checkbox"
              disabled={ disabled }
              defaultChecked={ defaultChecked }
              onChange={ handleChange }
            />
          </div>
        </div>
        <input
          className="form-control text-monospace"
          type="text"
          value={ label }
          readOnly={ true }
          onClick={ handleClick }
        />
      </div>
    </div>
  )
}))

export default CheckForm
