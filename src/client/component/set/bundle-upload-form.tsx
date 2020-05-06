import * as React from "react"
import { useState, useRef, useCallback } from "react"

import ButtonSet from "../set/button-set"

import FileForm from "../part/file-form"
import TextForm from "../part/text-form"

type BundleUploadFormProps = {
  className?: string,
  disabled? : boolean,
  onSubmit? : (name: string, obj: any, description: string) => void,
  onCancel? : () => void
}

const BundleUploadForm = React.memo<BundleUploadFormProps>(({
  className = "",
  disabled  = false,
  onSubmit  = undefined,
  onCancel  = undefined
}) => {
  const [valid, setValid] = useState(false)

  const refs = useRef({
    file: React.createRef<HTMLInputElement>(),
    desc: React.createRef<HTMLInputElement>()
  })

  const data = useRef({
    name: "",
    obj : null,
    desc: ""
  })

  const handleChangeFile = useCallback((name: string, obj: any) => {
    data.current.name = name
    data.current.obj  = obj
    setValid(name !== "")
  }, [true])

  const handleChangeDescription = useCallback((value: string) => {
    data.current.desc = value
  }, [true])

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(data.current.name, data.current.obj, data.current.desc)
    }
  }, [onSubmit])

  const handleCancel = useCallback(() => {
    data.current.name = refs.current.file.current.value = ""
    data.current.obj  = undefined
    data.current.desc = refs.current.desc.current.value = ""
    setValid(false)
    if (onCancel) {
      onCancel()
    }
  }, [onCancel])

  return (
    <div className={ className }>
      <FileForm
        ref={ refs.current.file }
        valid={ valid }
        filename={ data.current.name }
        disabled={ disabled }
        onChange={ handleChangeFile }
      />
      <TextForm
        ref={ refs.current.desc }
        valid={ true }
        label="description"
        disabled={ disabled }
        onChange={ handleChangeDescription }
      />
      <ButtonSet
        submit="Upload"
        cancel="Cancel"
        disabled={ !valid }
        onSubmit={ handleSubmit }
        onCancel={ handleCancel }
      />
    </div>
  )
})

export default BundleUploadForm
