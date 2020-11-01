import * as React from "react"
import { useRef, useCallback } from "react"

import UniqueId from "../../lib/unique-id"

type SwitchFormProps = {
  className?      : string,
  label?          : string,
  disabled?       : boolean,
  defaultChecked? : boolean,
  onChange?       : (value: boolean) => void
}

const SwitchForm = React.memo(React.forwardRef<HTMLInputElement, SwitchFormProps>(({
  className       = "",
  label           = "Switch",
  disabled        = false,
  defaultChecked  = true,
  onChange        = undefined
}, ref) => {
  const id = useRef({
    switch: "switch-" + UniqueId()
  })

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.currentTarget.checked)
    }
  }, [onChange])

  return (
    <div className={ className }>
      <div className="custom-control custom-switch">
        <input
          ref={ ref }
          id={ id.current.switch }
          className="custom-control-input"
          type="checkbox"
          disabled={ disabled }
          defaultChecked={ defaultChecked }
          onChange={ handleChange }
        />
        <label
          className="custom-control-label"
          htmlFor={ id.current.switch }
        >
          { label }
        </label>
      </div>
    </div>
  )
}))

export default SwitchForm
