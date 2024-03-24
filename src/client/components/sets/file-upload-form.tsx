import * as React from "react"
import { useState, useRef, useCallback, useImperativeHandle } from "react"

import FileForm from "../parts/file-form"
import TextForm from "../parts/text-form"
import CheckForm from "../parts/check-form"
import ButtonSet from "../sets/button-set"

type FileUploadFormProps = {
  className?  : string,
  auxiliary?  : string,
  disabled?   : boolean,
  button?     : string,
  accept?     : string,
  preservable?: boolean,
  onSubmit?   : (name: string, obj: any, description: string, preserve?: boolean) => void,
  onCancel?   : () => void
}

const FileUploadForm = React.memo<FileUploadFormProps>(({
  className   = "",
  auxiliary   = "",
  disabled    = false,
  button      = "Upload",
  accept      = undefined,
  preservable = false,
  onSubmit    = undefined,
  onCancel    = undefined
}) => {
  const [valid, setValid] = useState<boolean>(false)

  const refs = useRef({
    file: React.createRef<HTMLInputElement>(),
    aux : React.createRef<HTMLInputElement>(),
    prs : React.createRef<HTMLInputElement>()
  })

  const data = useRef({
    name: "",
    obj : null,
    aux : "",
    prs : false
  })

  const handleChangeFile = useCallback((name: string, obj: any) => {
    data.current.name = name
    data.current.obj  = obj

    if (accept) {
      setValid(false)
      accept.split(",").forEach((ext: string) => {
        if (!!name.match(new RegExp(`^.+${ ext }$`))) {
          setValid(true)
        }
      })
    } else {
      setValid(true)
    }
  }, [accept])

  const handleChangeDescription = useCallback((value: string) => {
    data.current.aux = value
  }, [true])

  const handleChangePreserved = useCallback((value: boolean) => {
    data.current.prs = value
  }, [true])

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(data.current.name, data.current.obj, data.current.aux, data.current.prs)
    }
  }, [onSubmit])

  const handleCancel = useCallback(() => {
    data.current.name = refs.current.file.current!.value  = ""
    data.current.obj  = null
    data.current.aux  = refs.current.aux.current!.value   = ""
    data.current.prs  = refs.current.prs.current!.checked = false
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
      {
        preservable &&
        <CheckForm
          ref={ refs.current.prs }
          className="mb-3"
          label="Preserve the original file"
          disabled={ disabled }
          defaultChecked={ false }
          onChange={ handleChangePreserved }
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
