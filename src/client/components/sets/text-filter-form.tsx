import * as React from "react"
import { useState, useRef, useCallback } from "react"

import TextForm from "../parts/text-form"
import SelectForm from "../parts/select-form"
import CheckForm from "../parts/check-form"
import ButtonSet from "../sets/button-set"

type TextFilterFormProps = {
  className?: string,
  disabled? : boolean,
  onSubmit? : (mode: string, sensitive: boolean, condition: string) => void,
  onCancel? : () => void
}

export const options: Array<string> = ["Be included", "Not be included", "Regex (unstable)"]

const TextFilterForm = React.memo<TextFilterFormProps>(({
  className = "",
  disabled  = false,
  onSubmit  = undefined,
  onCancel  = undefined
}) => {
  const [valid, setValid] = useState(false)

  const refs = useRef({
    mode      : React.createRef<HTMLSelectElement>(),
    sensitive : React.createRef<HTMLInputElement>(),
    condition : React.createRef<HTMLInputElement>()
  })

  const data = useRef({
    mode      : options[0],
    sensitive : true,
    condition : ""
  })

  const handleChangeMode = useCallback(value => {
    data.current.mode = value
  }, [true])

  const handleChangeCheck = useCallback(value => {
    data.current.sensitive = value
  }, [true])

  const handleChangeText = useCallback(value => {
    data.current.condition = value
    setValid(data.current.condition !== "")
  }, [true])

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(data.current.mode, data.current.sensitive, data.current.condition)
    }
  }, [onSubmit])

  const handleCancel = useCallback(() => {
    data.current.mode       = refs.current.mode.current.value         = options[0]
    data.current.sensitive  = refs.current.sensitive.current.checked  = true
    data.current.condition  = refs.current.condition.current.value    = ""
    setValid(false)
    if (onCancel) {
      onCancel()
    }
  }, [onCancel])

  return (
    <div className={ className }>
      <SelectForm
        ref={ refs.current.mode }
        className="mb-3"
        label="Mode"
        options={ options }
        disabled={ disabled }
        onChange={ handleChangeMode }
      />
      <CheckForm
        ref={ refs.current.sensitive }
        className="mb-3"
        label="Case-Sensitive"
        disabled={ disabled }
        onChange={ handleChangeCheck }
      />
      <TextForm
        ref={ refs.current.condition }
        className="mb-3"
        valid={ valid }
        label="Condition"
        disabled={ disabled }
        onChange={ handleChangeText }
      />
      <ButtonSet
        submit="Filter"
        cancel="Clear"
        valid={ valid }
        disabled={ disabled }
        onSubmit={ handleSubmit }
        onCancel={ handleCancel }
      />
    </div>
  )
})

export default TextFilterForm
