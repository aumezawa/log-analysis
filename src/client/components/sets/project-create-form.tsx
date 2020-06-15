import * as React from "react"
import { useState, useRef, useCallback } from "react"

import TextForm from "../parts/text-form"
import ButtonSet from "../sets/button-set"

type ProjectCreateFormProps = {
  className?: string,
  disabled? : boolean,
  onSubmit? : (name: string, description: string) => void,
  onCancel? : () => void
}

const ProjectCreateForm = React.memo<ProjectCreateFormProps>(({
  className = "",
  disabled  = false,
  onSubmit  = undefined,
  onCancel  = undefined
}) => {
  const [valid, setValid] = useState<boolean>(false)

  const ref = useRef({
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
    data.current.name = ref.current.name.current.value = ""
    data.current.desc = ref.current.desc.current.value = ""
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
        label="project name"
        disabled={ disabled }
        onChange={ handleChangeName }
      />
      <TextForm
        ref={ ref.current.desc }
        className="mb-3"
        valid={ true }
        label="description"
        disabled={ disabled }
        onChange={ handleChangeDescription }
      />
      <ButtonSet
        submit="Create"
        cancel="Clear"
        valid={ valid }
        disabled={ disabled }
        onSubmit={ handleSubmit }
        onCancel={ handleCancel }
      />
    </div>
  )
})

export default ProjectCreateForm
