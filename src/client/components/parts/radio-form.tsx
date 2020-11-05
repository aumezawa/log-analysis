import * as React from "react"
import { useRef, useEffect, useCallback, useReducer, useImperativeHandle } from "react"

import UniqueId from "../../lib/unique-id"

type RadioFormProps = {
  className?: string,
  labels?   : Array<string>,
  onChange? : (value: string) => void
}

const RadioForm = React.memo(React.forwardRef<RedioFormReference, RadioFormProps>(({
  className = "",
  labels    = [],
  onChange  = undefined
}, ref) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const refs = useRef(labels.map(() => React.createRef<HTMLInputElement>()))

  const id = useRef({
    radio: "radio-" + UniqueId()
  })

  useEffect(() => {
    refs.current = labels.map(() => React.createRef<HTMLInputElement>())
    forceUpdate()
  }, [labels.toString()])

  useImperativeHandle(ref, () => ({
    checked: (target: number) => {
      refs.current.forEach((ref: React.RefObject<HTMLInputElement>, index: number) => {
        if (ref.current) {
          ref.current.checked = (index === target)
        }
      })
    }
  }), [labels.toString()])

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
}), (prevProps: RadioFormProps, nextProps: RadioFormProps) => (
  (prevProps.className === nextProps.className)
  && (prevProps.labels.toString() === nextProps.labels.toString())
  && (prevProps.onChange === nextProps.onChange)
))

export default RadioForm
