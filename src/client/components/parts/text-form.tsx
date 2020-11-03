import * as React from "react"
import { useCallback } from "react"

type TextFormProps = {
  className?  : string,
  label?      : string,
  auxiliary?  : string,
  button?     : string,
  type?       : string,
  size?       : number,
  valid       : boolean,
  validation? : boolean,
  disabled?   : boolean,
  onChange?   : (value: string) => void,
  onSubmit?   : () => void
}

const TextForm = React.memo(React.forwardRef<HTMLInputElement, TextFormProps>(({
  className   = "",
  label       = "Text",
  auxiliary   = null,
  button      = null,
  type        = "text",
  size        = null,
  valid       = undefined,
  validation  = true,
  disabled    = false,
  onChange    = undefined,
  onSubmit    = undefined
}, ref) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.currentTarget.value)
    }
  }, [onChange])

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onSubmit) {
      onSubmit()
    }
  }, [onSubmit])

  return (
    <div className={ className }>
      <div className="input-group">
        <div className="input-group-prepend">
          <span className="input-group-text">{ label }</span>
        </div>
        {
          auxiliary &&
          <div className="input-group-prepend">
            <span className="input-group-text">{ auxiliary }</span>
          </div>
        }
        <input
          ref={ ref }
          className={ `form-control text-monospace ${ validation && !valid && "is-invalid" }` }
          type={ type }
          size={ size }
          disabled={ disabled }
          onChange={ handleChange }
        />
        {
          button &&
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              disabled={ !valid || disabled }
              onClick={ handleClick }
            >
              { button }
            </button>
          </div>
        }
      </div>
    </div>
  )
}))

export default TextForm
