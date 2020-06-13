import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import UniqueId from "../../lib/unique-id"

import ModalFrame from "../frames/modal-frame"
import RadioForm from "../parts/radio-form"
import ButtonSet from "../sets/button-set"

type DomainSelectButtonProps = {
  className?: string,
  domain?   : string,
  onSubmit? : (value: string) => void
}

const DOMAIN = ["public", "private"]
const defaultValue = "public"

const DomainSelectButton = React.memo<DomainSelectButtonProps>(({
  className = "",
  domain    = defaultValue,
  onSubmit  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const id = useRef({
    modal: "modal-" + UniqueId()
  })

  const data = useRef({
    domain: defaultValue
  })

  useEffect(() => {
    if (DOMAIN.includes(domain)) {
      data.current.domain = domain
      forceUpdate()
    } else {
      data.current.domain = defaultValue
      forceUpdate()
    }
  }, [domain])

  const handleChange = useCallback((value: string) => {
    data.current.domain = value
  }, [true])

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(data.current.domain)
    }
    forceUpdate()
  }, [onSubmit])

  return (
    <>
      <ModalFrame
        id={ id.current.modal }
        title="Domain"
        message="Select access domain."
        body={
          <RadioForm
            labels={ DOMAIN }
            defaultChecked={ DOMAIN.indexOf(defaultValue) }
            onChange={ handleChange }
          />
        }
        foot={
          <ButtonSet
            submit="Select"
            cancel="Close"
            valid={ true }
            dismiss="modal"
            onSubmit={ handleSubmit }
          />
        }
      />
      <button
        className={ `btn ${ data.current.domain === "public" ? "btn-success" : "btn-warning" }` }
        type="button"
        data-toggle="modal"
        data-target={ "#" + id.current.modal }
      >
        { data.current.domain }
      </button>
    </>
  )
})

export default DomainSelectButton
