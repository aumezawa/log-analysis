import * as React from "react"
import { useRef, useCallback, useImperativeHandle } from "react"

import UniqueId from "../../lib/unique-id"

type RadioFormProps = {
  className?      : string,
  labels?         : Array<string>,
  disabled?       : boolean,
  checked?        : number,
  onChange?       : (value: string) => void
}

const RadioForm = React.memo(React.forwardRef<RedioFromReference, RadioFormProps>(({
  className       = "",
  labels          = [],
  disabled        = false,
  checked         = 0,
  onChange        = undefined
}, ref) => {
  const refs = useRef(labels.map(() => React.createRef<HTMLInputElement>()))

  const id = useRef({
    radio: "radio-" + UniqueId()
  })

  useImperativeHandle(ref, () => ({
    checked(target: number) {
      labels.forEach((label: string, index: number) => {
        if (!!refs.current[index].current) {
          refs.current[index].current.checked = (index === target)
        }
      })
    }
  }))

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
              ref={ refs.current[index] }
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
}))

export default RadioForm
