import * as React from "react"
import { useState, useEffect, useRef, useCallback } from "react"

import UniqueId from "../../lib/unique-id"

import ModalFrame from "../frames/modal-frame"
import RadioForm from "../parts/radio-form"
import ButtonSet from "../sets/button-set"

type DomainSelectButtonProps = {
  className?    : string,
  defaultValue? : string,
  onSubmit?     : (value: string) => void
}

const DOMAIN = ["public", "private"]

const DomainSelectButton = React.memo<DomainSelectButtonProps>(({
  className     = "",
  defaultValue  = "public",
  onSubmit      = undefined
}) => {
  const [domain, setDomain] = useState<string>(null)

  const id = useRef({
    modal: "modal-" + UniqueId()
  })

  const data = useRef({
    domain: defaultValue
  })

  useEffect(() => {
    if (DOMAIN.includes(defaultValue)) {
      data.current.domain = defaultValue
      setDomain(defaultValue)
    } else {
      data.current.domain = "public"
      setDomain("public")
    }
  }, [defaultValue])

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
            key={ domain }
            labels={ DOMAIN }
            defaultChecked={ DOMAIN.indexOf(domain) }
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
