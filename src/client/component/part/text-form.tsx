import * as React from "react"
import { useCallback } from "react"

type TextFormProps = {
  className?: string,
  valid     : boolean,
  label?    : string,
  type?     : string,
  disabled? : boolean,
  hidden?   : boolean,
  onChange? : (value: string) => void
}

const TextForm = React.memo(React.forwardRef<HTMLInputElement, TextFormProps>(({
  className = "mb-3",
  valid     = undefined,
  label     = "Text",
  type      = "text",
  disabled  = false,
  hidden    = false,
  onChange  = undefined
}, ref) => {
  const handleChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.currentTarget.value)
    }
  }, [onChange])

  return (
    <div className={ `${ className} ${ hidden && "d-none" }` }>
      <div className="input-group">
        <div className="input-group-prepend">
          <span className="input-group-text">{ label }</span>
        </div>
        <input
          ref={ ref }
          className={ `form-control text-monospace ${ !valid && "is-invalid" }` }
          type={ type }
          disabled={ disabled }
          onChange={ handleChange }
        />
      </div>
    </div>
  )
}))

export default TextForm
