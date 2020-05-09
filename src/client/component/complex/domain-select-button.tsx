import * as React from "react"
import { useState, useRef, useCallback } from "react"

import uniqueId from "../../lib/uniqueId"

import ModalFrame from "../frame/modal-frame"

import ButtonSet from "../set/button-set"

import RadioForm from "../part/radio-form"

type DomainSelectButtonProps = {
  className?    : string,
  defaultValue? : string,
  onSubmit?     : (value: string) => void
}

const DomainSelectButton = React.memo<DomainSelectButtonProps>(({
  className     = "",
  defaultValue  = "private",
  onSubmit      = undefined
}) => {
  const [domain, setDomain] = useState<string>(defaultValue)

  const id = useRef({
    modal: "modal-" + uniqueId()
  })

  const data = useRef({
    domain: defaultValue
  })

  const handleChange = useCallback((value: string) => {
    data.current.domain = value
  }, [true])

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(data.current.domain)
    }
    setDomain(data.current.domain)
  }, [onSubmit])

  return (
    <>
      <ModalFrame
        id={ id.current.modal }
        title="Domain"
        message="Select access domain."
        body={
          <RadioForm
            labels={ ["public", "private"] }
            onChange={ handleChange }
          />
        }
        foot={
          <ButtonSet
            cancel="Close"
            valid={ true }
            dismiss="modal"
            onSubmit={ handleSubmit }
          />
        }
      />
      <button
        className={ `btn ${ domain === "public" ? "btn-success" : "btn-warning" }` }
        type="button"
        data-toggle="modal"
        data-target={ "#" + id.current.modal }
      >
        { domain }
      </button>
    </>
  )
})

export default DomainSelectButton
