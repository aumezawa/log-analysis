import * as React from "react"
import { useCallback } from "react"

type TextFormProps = {
  className?  : string,
  label?      : string | JSX.Element,
  auxiliary?  : string,
  button?     : string | JSX.Element,
  type?       : string,
  size?       : number,
  valid       : boolean,
  validation? : boolean,
  disabled?   : boolean,
  onChange?   : (value: string) => void,
  onSubmit?   : () => void,
  onSubChange?: () => void
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
  onSubmit    = undefined,
  onSubChange = undefined
}, ref) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.currentTarget.value)
    }
  }, [onChange])

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (valid && onSubmit) {
        onSubmit()
      }
    }
  }, [valid, onSubmit])

  const handleClickButton = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onSubmit) {
      onSubmit()
    }
  }, [onSubmit])

  const handleClickLabel = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onSubChange) {
      onSubChange()
    }
  }, [onSubChange])

  return (
    <div className={ className }>
      <div className="input-group">
        { label &&
          <div className="input-group-prepend">
            { !onSubChange &&
              <span className="input-group-text">
                { label }
              </span>
            }
            { onSubChange &&
              <button
                className="btn btn-outline-success"
                disabled={ disabled }
                onClick={ handleClickLabel }
              >
                { label }
              </button>
            }
          </div>
        }
        { auxiliary &&
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
          onKeyPress={ handleKeyPress }
        />
        { button &&
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              disabled={ !valid || disabled }
              onClick={ handleClickButton }
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
