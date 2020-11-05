import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import SwitchForm from "../parts/switch-form"
import DateForm from "../parts/date-form"
import ButtonSet from "../sets/button-set"

import LocalDate from "../../lib/local-date"

type DateFilterFormProps = {
  className?: string,
  from?     : Date,
  to?       : Date,
  disabled? : boolean,
  dismiss?  : string,
  onSubmit? : (from: Date, to: Date) => void,
  onCancel? : () => void
}

const DateFilterForm = React.memo<DateFilterFormProps>(({
  className = "",
  from      = null,
  to        = null,
  disabled  = false,
  dismiss   = "",
  onSubmit  = undefined,
  onCancel  = undefined
}) => {
  const [ignored, forceUpdate]  = useReducer(x => x + 1, 0)

  useEffect(() => {
    if (!from && !to) {
      return
    }

    if (from && from.toString() !== "Invalid Date") {
      data.current.from.enable = true
      data.current.from.date = from
      ref.current.from.enable.current.checked = true
      ref.current.from.date.current.value = from.toISOString().slice(0, 19)
    } else {
      data.current.from.enable = false
      ref.current.from.enable.current.checked = false
    }

    if (to && to.toString() !== "Invalid Date") {
      data.current.to.enable = true
      data.current.to.date = to
      ref.current.to.enable.current.checked = true
      ref.current.to.date.current.value = to.toISOString().slice(0, 19)
    } else {
      data.current.to.enable = false
      ref.current.to.enable.current.checked = false
    }

    forceUpdate()
  }, [from, to])

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
          valid={ isValid(data.current.from) }
          disabled={ disabled || !data.current.from.enable }
          defaultValue={ LocalDate.toISOString(data.current.from.date) }
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
        disabled={ disabled || (!data.current.to.enable && !data.current.from.enable) }
        dismiss={ dismiss }
        onSubmit={ handleSubmit }
        onCancel={ handleCancel }
      />
    </div>
  )
})

export default DateFilterForm
