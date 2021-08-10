import * as React from "react"
import { useRef, useCallback, useReducer, useImperativeHandle } from "react"

import UniqueId from "../../lib/unique-id"
import * as LocalDate from "../../lib/local-date"

import ModalFrame from "../frames/modal-frame"
import DateFilterForm from "../sets/date-filter-form"

type MultiDateFormProps = {
  className?    : string,
  label?        : string | JSX.Element,
  button?       : string | JSX.Element,
  valid         : boolean,
  disabled?     : boolean,
  defaultFrom?  : string,
  defaultTo?    : string,
  onChange?     : (from: string, to: string) => void,
  onSubmit?     : () => void,
  onSubChange?  : () => void
}

const MultiDateForm = React.memo(React.forwardRef<MultiDateFormReference, MultiDateFormProps>(({
  className     = "",
  label         = "Date",
  button        = null,
  valid         = undefined,
  disabled      = false,
  defaultFrom   = "2019-01-01T00:00:00Z",
  defaultTo     = "2020-01-01T00:00:00Z",
  onChange      = undefined,
  onSubmit      = undefined,
  onSubChange   = undefined
}, ref) => {
  const [ignored, forceUpdate]  = useReducer(x => x + 1, 0)

  const refs = useRef({
    from: React.createRef<HTMLInputElement>(),
    to  : React.createRef<HTMLInputElement>()
  })

  const id = useRef({
    date: "modal-" + UniqueId()
  })

  useImperativeHandle(ref, () => ({
    set: (from: string, to: string) => {
      refs.current.from.current.value = from ? from : refs.current.from.current.value
      refs.current.to.current.value   = to   ? to   : refs.current.to.current.value
    },
    now: (from: boolean, to: boolean) => {
      refs.current.from.current.value = from ? LocalDate.toInputFormat(new Date(), true) : refs.current.from.current.value
      refs.current.to.current.value   = to   ? LocalDate.toInputFormat(new Date(), true) : refs.current.to.current.value
    }
  }), [true])

  const handleSubmit = useCallback((from: string, to: string) => {
    if (onChange) {
      onChange(from, to)
    }
  }, [onChange])

  const handleClickButton = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onSubmit) {
      onSubmit()
    }
  }, [onSubmit])

  const handleClickLabel = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onSubChange) {
      onSubChange()
    }
  }, [onSubChange])

  return (
    <div className={ className }>
      <ModalFrame
        id={ id.current.date }
        title="Date Filter"
        message="Input a condition."
        body={
          <DateFilterForm
            from={ defaultFrom }
            to={ defaultTo }
            labelSubmit="Set"
            labelCancel={ null }
            dismiss="modal"
            onSubmit={ handleSubmit }
          />
        }
      />
      <div className="input-group">
        { label &&
          <div className="input-group-prepend">
            { !onSubChange &&
              <span className="input-group-text">
                { label }
              </span>
            }
            { onSubChange &&
              <button
                className="btn btn-outline-success"
                disabled={ disabled }
                onClick={ handleClickLabel }
              >
                { label }
              </button>
            }
          </div>
        }
        <button
          className={ `form-control ${ !valid && "is-invalid" }` }
          disabled={ disabled }
          data-toggle="modal"
          data-target={ "#" + id.current.date }
        >
          { !valid ? "Click here to set" : "Click search button -->" }
        </button>
        { button &&
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              disabled={ !valid || disabled }
              onClick={ handleClickButton }
            >
              { button }
            </button>
          </div>
        }
      </div>
    </div>
  )
}))

export default MultiDateForm
