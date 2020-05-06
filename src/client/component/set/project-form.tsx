import * as React from "react"
import { useState, useRef, useCallback } from "react"

import ButtonSet from "../set/button-set"

import TextForm from "../part/text-form"

type ProjectFormProps = {
  className?: string,
  disabled? : boolean,
  onSubmit? : (name: string, description: string) => void,
  onCancel? : () => void
}

const ProjectForm = React.memo<ProjectFormProps>(({
  className = "",
  disabled  = false,
  onSubmit  = undefined,
  onCancel  = undefined
}) => {
  const [valid, setValid] = useState<boolean>(false)

  const refs = useRef({
    name: React.createRef<HTMLInputElement>(),
    desc: React.createRef<HTMLInputElement>()
  })

  const data = useRef({
    name: "",
    desc: ""
  })

  const handleChangeName = useCallback((value: string) => {
    data.current.name = value
    setValid(!!value.match(/^[0-9a-zA-Z#@_+-]{1,}$/))
  }, [true])

  const handleChangeDescription = useCallback((value: string) => {
    data.current.desc = value
  }, [true])

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(data.current.name, data.current.desc)
    }
  }, [onSubmit])

  const handleCancel = useCallback(() => {
    data.current.name = refs.current.name.current.value = ""
    data.current.desc = refs.current.desc.current.value = ""
    setValid(false)
    if (onCancel) {
      onCancel()
    }
  }, [onCancel])

  return (
    <div className={ className }>
      <TextForm
        ref={ refs.current.name }
        valid={ valid }
        label="project name"
        disabled={ disabled }
        onChange={ handleChangeName }
      />
      <TextForm
        ref={ refs.current.desc }
        valid={ true }
        label="description"
        disabled={ disabled }
        onChange={ handleChangeDescription }
      />
      <ButtonSet
        submit="Create"
        cancel="Clear"
        disabled={ disabled || !valid }
        onSubmit={ handleSubmit }
        onCancel={ handleCancel }
      />
    </div>
  )
})

export default ProjectForm
