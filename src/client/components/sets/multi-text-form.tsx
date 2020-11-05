import * as React from "react"
import { useState, useRef, useCallback } from "react"

import TextForm from "../parts/text-form"
import ButtonSet from "../sets/button-set"

type MultiTextFormProps = {
  className?: string,
  label?    : string,
  auxiliary?: string,
  button?   : string,
  disabled? : boolean,
  accept?   : RegExp,
  onSubmit? : (name: string, description: string) => void,
  onCancel? : () => void
}

const MultiTextForm = React.memo<MultiTextFormProps>(({
  className = "",
  label     = "No label",
  auxiliary = null,
  button    = "Sumbit",
  disabled  = false,
  accept    = null,
  onSubmit  = undefined,
  onCancel  = undefined
}) => {
  const [valid, setValid] = useState<boolean>(false)

  const ref = useRef({
    name: React.createRef<HTMLInputElement>(),
    aux : React.createRef<HTMLInputElement>()
  })

  const data = useRef({
    name: "",
    aux : ""
  })

  const handleChangeName = useCallback((value: string) => {
    data.current.name = value
    setValid(!!value.match(accept))
  }, [true])

  const handleChangeDescription = useCallback((value: string) => {
    data.current.aux = value
  }, [true])

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(data.current.name, data.current.aux)
    }
  }, [onSubmit])

  const handleCancel = useCallback(() => {
    data.current.name = ref.current.name.current.value = ""
    data.current.aux  = ref.current.aux.current.value  = ""
    setValid(false)
    if (onCancel) {
      onCancel()
    }
  }, [onCancel])

  return (
    <div className={ className }>
      <TextForm
        ref={ ref.current.name }
        className="mb-3"
        valid={ valid }
        label={ label }
        disabled={ disabled }
        onChange={ handleChangeName }
      />
      { auxiliary &&
        <TextForm
          ref={ ref.current.aux }
          className="mb-3"
          valid={ true }
          label={ auxiliary }
          disabled={ disabled }
          onChange={ handleChangeDescription }
        />
      }
      <ButtonSet
        submit={ button }
        cancel="Clear"
        valid={ valid }
        disabled={ disabled }
        onSubmit={ handleSubmit }
        onCancel={ handleCancel }
      />
    </div>
  )
})

export default MultiTextForm
