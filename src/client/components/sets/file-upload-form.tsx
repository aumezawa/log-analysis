import * as React from "react"
import { useState, useRef, useCallback, useImperativeHandle } from "react"

import FileForm from "../parts/file-form"
import TextForm from "../parts/text-form"
import ButtonSet from "../sets/button-set"

type FileUploadFormProps = {
  className?: string,
  auxiliary?: string,
  disabled? : boolean,
  button?   : string,
  accept?   : string,
  onSubmit? : (name: string, obj: any, description: string) => void,
  onCancel? : () => void
}

const FileUploadForm = React.memo<FileUploadFormProps>(({
  className = "",
  auxiliary = null,
  disabled  = false,
  button    = "Upload",
  accept    = null,
  onSubmit  = undefined,
  onCancel  = undefined
}) => {
  const [valid, setValid] = useState<boolean>(false)

  const refs = useRef({
    file: React.createRef<HTMLInputElement>(),
    aux : React.createRef<HTMLInputElement>()
  })

  const data = useRef({
    name: "",
    obj : null,
    aux : ""
  })

  const handleChangeFile = useCallback((name: string, obj: any) => {
    data.current.name = name
    data.current.obj  = obj
    setValid(!!name.match(new RegExp(`^.+${ accept }$`)))
  }, [accept])

  const handleChangeDescription = useCallback((value: string) => {
    data.current.aux = value
  }, [true])

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(data.current.name, data.current.obj, data.current.aux)
    }
  }, [onSubmit])

  const handleCancel = useCallback(() => {
    data.current.name = refs.current.file.current.value = ""
    data.current.obj  = null
    data.current.aux  = refs.current.aux.current.value  = ""
    setValid(false)
    if (onCancel) {
      onCancel()
    }
  }, [onCancel])

  return (
    <div className={ className }>
      <FileForm
        ref={ refs.current.file }
        className="mb-3"
        valid={ valid }
        filename={ data.current.name }
        disabled={ disabled }
        accept={ accept }
        onChange={ handleChangeFile }
      />
      { auxiliary &&
        <TextForm
          ref={ refs.current.aux }
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

export default FileUploadForm
