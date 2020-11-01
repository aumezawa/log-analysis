import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import UniqueId from "../../lib/unique-id"

import ModalFrame from "../frames/modal-frame"
import RadioForm from "../parts/radio-form"
import ButtonSet from "../sets/button-set"

type DomainSelectButtonProps = {
  className?: string,
  domains?  : string,
  domain?   : string,
  onSubmit? : (value: string) => void
}

const DomainSelectButton = React.memo<DomainSelectButtonProps>(({
  className = "",
  domains   = "public,private",
  domain    = null,
  onSubmit  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const ref = useRef({} as RedioFromReference)

  const id = useRef({
    modal: "modal-" + UniqueId()
  })

  const data = useRef({
    domain: domains.split(",")[0]
  })

  useEffect(() => {
    data.current.domain = domains.split(",").includes(domain) ? domain : domains.split(",")[0]
    ref.current.checked(domains.split(",").indexOf(domain))
    forceUpdate()
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
            ref={ ref }
            labels={ domains.split(",") }
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
        className={ `btn ${ data.current.domain !== "private" ? "btn-success" : "btn-warning" }` }
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
