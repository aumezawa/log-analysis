import * as React from "react"
import { useRef, useCallback } from "react"

import * as Path from "path"

import UniqueId from "../../lib/unique-id"

type FileFormProps = {
  className?: string,
  label?    : string,
  filename? : string,
  valid     : boolean,
  disabled? : boolean,
  onChange  : (name: string, obj: any) => void
}

const FileForm = React.memo(React.forwardRef<HTMLInputElement, FileFormProps>(({
  className = "mb-3",
  label     = "File",
  filename  = "",
  valid     = undefined,
  disabled  = false,
  onChange  = undefined
}, ref) => {
  const id = useRef({
    form: UniqueId()
  })

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(Path.basename(e.currentTarget.value.replace(/\\/g, "/")), e.currentTarget.files[0])
    }
  }, [onChange])

  return (
    <div className={ className }>
      <div className="input-group">
        <div className="input-group-prepend">
          <span className="input-group-text">{ label }</span>
        </div>
        <div className="custom-file">
          <input
            ref={ ref }
            className={ `custom-file-input ${ !valid && "is-invalid" }` }
            type="file"
            id={ id.current.form }
            disabled={ disabled }
            onChange={ handleChange }
          />
          <label className="custom-file-label" htmlFor={ id.current.form }>{ filename }</label>
        </div>
      </div>
    </div>
  )
}))

export default FileForm
