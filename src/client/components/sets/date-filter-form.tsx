import * as React from "react"
import { useRef, useCallback, useReducer } from "react"

import CheckForm from "../parts/check-form"
import DateForm from "../parts/date-form"
import ButtonSet from "../sets/button-set"

import LocalDate from "../../lib/local-date"

type TextFilterFormProps = {
  className?: string,
  disabled? : boolean,
  onSubmit? : (from: Date, to: Date) => void,
  onCancel? : () => void
}

const TextFilterForm = React.memo<TextFilterFormProps>(({
  className = "",
  disabled  = false,
  onSubmit  = undefined,
  onCancel  = undefined
}) => {
  const [ignored, forceUpdate]  = useReducer(x => x + 1, 0)

  const data = useRef({
    from: {
      enable: true,
      date  : LocalDate.now()
    },
    to: {
      enable: true,
      date  : LocalDate.now()
    }
  })

  const isValid = (at: { enable: boolean, date: Date }) => {
    if (at.enable && at.date.toString() === "Invalid Date") {
      return false
    }
   return true
  }

  const handleChangeCheckFrom = useCallback((value: boolean) => {
    data.current.from.enable = value
    forceUpdate()
  }, [true])

  const handleChangeCheckTo = useCallback((value: boolean) => {
    data.current.to.enable = value
    forceUpdate()
  }, [true])

  const handleChangeDateFrom = useCallback((value: Date) => {
    data.current.from.date = value
    forceUpdate()
  }, [true])

  const handleChangeDateTo = useCallback((value: Date) => {
    data.current.to.date = value
    forceUpdate()
  }, [true])

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      const from = data.current.from.enable ? data.current.from.date : null
      const to   = data.current.to.enable   ? data.current.to.date   : null
      onSubmit(from, to)
    }
  }, [onSubmit])

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel()
    }
  }, [onCancel])

  return (
    <div className={ className }>
      <div className="form-row align-items-center mb-3">
        <CheckForm
          className="col-4"
          label="Enable"
          defaultChecked={ data.current.from.enable }
          disabled={ disabled }
          onChange={ handleChangeCheckFrom }
        />
        <DateForm
          className="col-8"
          label="From"
          valid={ isValid(data.current.from) }
          disabled={ disabled || !data.current.from.enable }
          defaultValue={ LocalDate.toISOString(data.current.from.date) }
          onChange={ handleChangeDateFrom }
        />
      </div>
      <div className="form-row align-items-center mb-3">
        <CheckForm
          className="col-4"
          label="Enable"
          defaultChecked={ data.current.to.enable }
          disabled={ disabled }
          onChange={ handleChangeCheckTo }
        />
        <DateForm
          className="col-8"
          label="To"
          valid={ isValid(data.current.to) }
          disabled={ disabled || !data.current.to.enable }
          defaultValue={ LocalDate.toISOString(data.current.to.date) }
          onChange={ handleChangeDateTo }
        />
      </div>
      <ButtonSet
        submit="Filter"
        cancel="Clear"
        valid={ isValid(data.current.from) && isValid(data.current.to) }
        disabled={ disabled }
        onSubmit={ handleSubmit }
        onCancel={ handleCancel }
      />
    </div>
  )
})

export default TextFilterForm
