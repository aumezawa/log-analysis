import * as React from "react"
import { useState, useEffect, useRef, useCallback } from "react"

import TextForm from "../parts/text-form"
import SelectForm from "../parts/select-form"
import CheckForm from "../parts/check-form"
import ButtonSet from "../sets/button-set"

type TextFilterFormProps = {
  className?: string,
  operation?: string,
  mode?     : string,
  sensitive?: boolean,
  condition?: string,
  disabled? : boolean,
  dismiss?  : string,
  onSubmit? : (mode: string, sensitive: boolean, condition: string) => void,
  onCancel? : () => void
}

export const operations: Array<string> = ["filter", "search"]
export const options: Array<string> = ["Be included", "Not be included", "Regex (unstable)"]

const TextFilterForm = React.memo<TextFilterFormProps>(({
  className = "",
  operation = operations[0],
  mode      = options[0],
  sensitive = true,
  condition = null,
  disabled  = false,
  dismiss   = "",
  onSubmit  = undefined,
  onCancel  = undefined
}) => {
  const [valid, setValid] = useState<boolean>(false)

  useEffect(() => {
    if (mode && typeof(sensitive) === "boolean" && condition) {
      data.current.mode       = ref.current.mode.current.value         = mode
      data.current.sensitive  = ref.current.sensitive.current.checked  = sensitive
      data.current.condition  = ref.current.condition.current.value    = condition
      setValid(data.current.condition !== "")
    } else {
      data.current.mode       = ref.current.mode.current.value         = options[0]
      data.current.sensitive  = ref.current.sensitive.current.checked  = true
      data.current.condition  = ref.current.condition.current.value    = ""
      setValid(false)
    }
  }, [mode, sensitive, condition])

  const ref = useRef({
    mode      : React.createRef<HTMLSelectElement>(),
    sensitive : React.createRef<HTMLInputElement>(),
    condition : React.createRef<HTMLInputElement>()
  })

  const data = useRef({
    mode      : options[0],
    sensitive : true,
    condition : ""
  })

  const toUpperCase = (value: string) => (
    value.charAt(0).toUpperCase() + value.slice(1)
  )

  const handleChangeMode = useCallback((value: string) => {
    data.current.mode = value
  }, [true])

  const handleChangeSensitive = useCallback((value: boolean) => {
    data.current.sensitive = value
  }, [true])

  const handleChangeCondition = useCallback((value: string) => {
    data.current.condition = value
    setValid(data.current.condition !== "")
  }, [true])

  const handleSubmit = useCallback(() => {
    if (operation === "search") {
      data.current.mode = options[0]
    }
    if (onSubmit) {
      onSubmit(data.current.mode, data.current.sensitive, data.current.condition)
    }
  }, [onSubmit])

  const handleCancel = useCallback(() => {
    data.current.mode       = ref.current.mode.current.value         = options[0]
    data.current.sensitive  = ref.current.sensitive.current.checked  = true
    data.current.condition  = ref.current.condition.current.value    = ""
    setValid(false)
    if (onCancel) {
      onCancel()
    }
  }, [onCancel])

  return (
    <div className={ className }>
      <SelectForm
        ref={ ref.current.mode }
        className="mb-3"
        label="Mode"
        options={ options }
        disabled={ disabled || operation === "search" }
        onChange={ handleChangeMode }
      />
      <CheckForm
        ref={ ref.current.sensitive }
        className="mb-3"
        label="Case-Sensitive"
        disabled={ disabled }
        onChange={ handleChangeSensitive }
      />
      <TextForm
        ref={ ref.current.condition }
        className="mb-3"
        valid={ valid }
        label="Condition"
        disabled={ disabled }
        onChange={ handleChangeCondition }
      />
      <ButtonSet
        submit={ operation ? toUpperCase(operation) : toUpperCase(operations[0]) }
        cancel="Clear"
        valid={ valid }
        disabled={ disabled }
        dismiss={ dismiss }
        onSubmit={ handleSubmit }
        onCancel={ handleCancel }
      />
    </div>
  )
})

export default TextFilterForm
