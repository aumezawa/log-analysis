import * as React from "react"
import { useState, useRef, useCallback } from "react"

import FileForm from "../parts/file-form"
import TextForm from "../parts/text-form"
import ButtonSet from "../sets/button-set"

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
  const [valid, setValid] = useState<boolean>(false)

  const ref = useRef({
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
    setValid(!!name.match(/^.+[.]tgz$/))
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
    data.current.name = ref.current.file.current.value = ""
    data.current.obj  = null
    data.current.desc = ref.current.desc.current.value = ""
    setValid(false)
    if (onCancel) {
      onCancel()
    }
  }, [onCancel])

  return (
    <div className={ className }>
      <FileForm
        ref={ ref.current.file }
        className="mb-3"
        valid={ valid }
        filename={ data.current.name }
        disabled={ disabled }
        accept=".tgz"
        onChange={ handleChangeFile }
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
        submit="Upload"
        cancel="Clear"
        valid={ valid }
        disabled={ disabled }
        onSubmit={ handleSubmit }
        onCancel={ handleCancel }
      />
    </div>
  )
})

export default BundleUploadForm
