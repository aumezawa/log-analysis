import * as React from "react"
import { useRef, useCallback } from "react"

import UniqueId from "../../lib/unique-id"

type RadioFormProps = {
  className?      : string,
  labels?         : Array<string>,
  disabled?       : boolean,
  defaultChecked? : number,
  onChange?       : (value: string) => void
}

const RadioForm = React.memo<RadioFormProps>(({
  className       = "",
  labels          = [],
  disabled        = false,
  defaultChecked  = 0,
  onChange        = undefined
}) => {
  const id = useRef({
    radio: "radio-" + UniqueId()
  })

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.currentTarget.value)
    }
  }, [onChange])

  return (
    <div className={ className }>
      {
        labels.map((label: string, index: number) => (
          <div key={ label } className="form-check">
            <input
              id={ id.current.radio + index }
              className="form-check-input"
              type="radio"
              name={ id.current.radio }
              value={ label }
              defaultChecked={ index === defaultChecked }
              disabled={ disabled }
              onChange={ handleChange }
            />
            <label
              className="form-check-label"
              htmlFor={ id.current.radio + index }
            >
              { label }
            </label>
          </div>
        ))
      }
    </div>
  )
})

export default RadioForm
