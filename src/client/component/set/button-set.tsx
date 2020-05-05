import * as React from "react"
import { useCallback } from "react"

type ButtonSetProps = {
  className?: string,
  submit?   : string,
  cancel?   : string,
  disabled? : boolean,
  dismiss?  : string,
  onSubmit? : () => void,
  onCancel? : () => void
}

const ButtonSet = React.memo<ButtonSetProps>(({
  className = "",
  submit    = "Submit",
  cancel    = "Cancel",
  disabled  = false,
  dismiss   = "",
  onSubmit  = undefined,
  onCancel  = undefined
}) => {
  const handleSubmit = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onSubmit) {
      onSubmit()
    }
  }, [onSubmit])

  const handleCancel = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onCancel) {
      onCancel()
    }
  }, [onCancel])

  return (
    <div className={ className }>
      <div className="form-row justify-content-center">
        <div className="col-auto">
          <button
            className="btn btn-primary"
            type="button"
            disabled={ disabled }
            data-dismiss={ dismiss }
            onClick={ handleSubmit }
          >
            { submit }
          </button>
        </div>
        <div className={ `col-auto ${ (cancel === "") && "d-none" }` }>
          <button
            className="btn btn-secondary"
            type="button"
            data-dismiss={ dismiss }
            onClick={ handleCancel }
          >
            { cancel }
          </button>
        </div>
      </div>
    </div>
  )
})

export default ButtonSet
