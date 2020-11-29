import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import SwitchForm from "../parts/switch-form"
import DateForm from "../parts/date-form"
import ButtonSet from "../sets/button-set"

import * as LocalDate from "../../lib/local-date"

type DateFilterFormProps = {
  className?: string,
  from?     : string,
  to?       : string,
  local?    : boolean,
  disabled? : boolean,
  dismiss?  : string,
  onSubmit? : (from: string, to: string) => void,
  onCancel? : () => void
}

const DateFilterForm = React.memo<DateFilterFormProps>(({
  className = "",
  from      = null,
  to        = null,
  local     = false,
  disabled  = false,
  dismiss   = "",
  onSubmit  = undefined,
  onCancel  = undefined
}) => {
  const [ignored, forceUpdate]  = useReducer(x => x + 1, 0)

  const ref = useRef({
    from: {
      enable: React.createRef<HTMLInputElement>(),
      date  : React.createRef<HTMLInputElement>()
    },
    to: {
      enable: React.createRef<HTMLInputElement>(),
      date  : React.createRef<HTMLInputElement>()
    }
  })

  const data = useRef({
    from: {
      valid : true,
      enable: true,
      date  : LocalDate.now()
    },
    to: {
      valid : true,
      enable: true,
      date  : LocalDate.now()
    }
  })

  useEffect(() => {
    if (LocalDate.isDate(from)) {
      data.current.from.valid = true
      data.current.from.enable = true
      data.current.from.date = LocalDate.localize(from, 0)
      ref.current.from.enable.current.checked = true
      ref.current.from.date.current.value = LocalDate.toInputFormat(from, local)
    } else {
      data.current.from.valid = false
      data.current.from.enable = false
      data.current.from.date = null
      ref.current.from.enable.current.checked = false
      ref.current.from.date.current.value = ""
    }

    if (LocalDate.isDate(to)) {
      data.current.to.valid = true
      data.current.to.enable = true
      data.current.to.date = LocalDate.localize(to, 0)
      ref.current.to.enable.current.checked = true
      ref.current.to.date.current.value = LocalDate.toInputFormat(to, local)
    } else {
      data.current.to.valid = false
      data.current.to.enable = false
      data.current.to.date = null
      ref.current.to.enable.current.checked = false
      ref.current.to.date.current.value = ""
    }

    forceUpdate()
  }, [from, to, local])

  const handleChangeCheckFrom = useCallback((value: boolean) => {
    data.current.from.enable = value
    forceUpdate()
  }, [true])

  const handleChangeCheckTo = useCallback((value: boolean) => {
    data.current.to.enable = value
    forceUpdate()
  }, [true])

  const handleChangeDateFrom = useCallback((value: string) => {
    data.current.from.valid = LocalDate.isDate(value)
    data.current.from.date = LocalDate.fromInputFormat(value, local)
    forceUpdate()
  }, [local])

  const handleChangeDateTo = useCallback((value: string) => {
    data.current.to.valid = LocalDate.isDate(value)
    data.current.to.date = LocalDate.fromInputFormat(value, local)
    forceUpdate()
  }, [local])

  const handleSubmit = useCallback(() => {
    const from = data.current.from.enable ? data.current.from.date : null
    const to   = data.current.to.enable   ? data.current.to.date   : null
    if (onSubmit) {
      onSubmit(from, to)
    }
  }, [local, onSubmit])

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel()
    }
  }, [onCancel])

  return (
    <div className={ className }>
      <div className="form-row align-items-center mb-3">
        <SwitchForm
          ref={ ref.current.from.enable }
          className="col-2"
          label="From"
          defaultChecked={ data.current.from.enable }
          disabled={ disabled }
          onChange={ handleChangeCheckFrom }
        />
        <DateForm
          ref={ ref.current.from.date }
          className="col-10"
          label=""
          valid={ data.current.from.valid }
          disabled={ disabled || !data.current.from.enable }
          defaultValue={ LocalDate.toInputFormat(data.current.from.date) }
          onChange={ handleChangeDateFrom }
        />
      </div>
      <div className="form-row align-items-center mb-3">
        <SwitchForm
          ref={ ref.current.to.enable }
          className="col-2"
          label="To"
          defaultChecked={ data.current.to.enable }
          disabled={ disabled }
          onChange={ handleChangeCheckTo }
        />
        <DateForm
          ref={ ref.current.to.date }
          className="col-10"
          label=""
          valid={ data.current.to.valid }
          disabled={ disabled || !data.current.to.enable }
          defaultValue={ LocalDate.toInputFormat(data.current.to.date) }
          onChange={ handleChangeDateTo }
        />
      </div>
      <ButtonSet
        submit="Filter"
        cancel="Clear"
        valid={ (!data.current.from.enable || data.current.from.valid) && (!data.current.to.enable || data.current.to.valid) }
        disabled={ disabled || (!data.current.from.enable && !data.current.to.enable) }
        dismiss={ dismiss }
        onSubmit={ handleSubmit }
        onCancel={ handleCancel }
      />
    </div>
  )
})

export default DateFilterForm
