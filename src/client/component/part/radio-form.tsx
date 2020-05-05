import * as React from "react"
import { useRef, useCallback } from "react"

import uniqueId from "../../lib/uniqueId"

type RadioFormProps = {
  className?: string,
  labels?   : Array<string>,
  disabled? : boolean,
  onChange? : (value: string) => void
}

const RadioForm = React.memo<RadioFormProps>(({
  className = "",
  labels    = [],
  disabled  = false,
  onChange  = undefined
}) => {
  const id = useRef({
    radio: "radio-" + uniqueId()
  })

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.currentTarget.value)
    }
  }, [onChange])

  return (
    <div className={ `${ className }` }>
      {
        labels.map((label: string, index: number) => (
          <div key={ label } className="form-check">
            <input
              id={ id.current.radio + index }
              className="form-check-input"
              type="radio"
              name={ id.current.radio }
              value={ label }
              defaultChecked={ index === 0 }
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
