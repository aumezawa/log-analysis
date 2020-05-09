import * as React from "react"
import { useState, useRef, useCallback } from "react"

import UniqueId from "../../lib/unique-id"

import ModalFrame from "../frames/modal-frame"
import RadioForm from "../parts/radio-form"
import ButtonSet from "../sets/button-set"

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
    modal: "modal-" + UniqueId()
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
