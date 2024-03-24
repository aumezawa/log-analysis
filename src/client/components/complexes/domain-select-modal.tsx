import * as React from "react"
import { useEffect, useRef, useCallback } from "react"

import ModalFrame from "../frames/modal-frame"
import RadioForm from "../parts/radio-form"
import ButtonSet from "../sets/button-set"

type DomainSelectModalProps = {
  id        : string,
  domains?  : string,
  domain?   : string,
  onSubmit? : (domainName: string) => void
}

const DomainSelectModal = React.memo<DomainSelectModalProps>(({
  id        = "",
  domains   = "public,private",
  domain    = "public",
  onSubmit  = undefined
}) => {
  const refs = useRef({
    radio : useRef({} as RedioFormReference)
  })

  const data = useRef({
    domain: domains.split(",")[0]
  })

  useEffect(() => {
    data.current.domain = domains.split(",").includes(domain) ? domain : domains.split(",")[0]
    refs.current.radio.current.checked(domains.split(",").indexOf(domain))
  }, [domain])

  const handleChange = useCallback((value: string) => {
    data.current.domain = value
  }, [true])

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(data.current.domain)
    }
  }, [onSubmit])

  return (
    <ModalFrame
      id={ id }
      title="Domain"
      message="Select access domain."
      center={ false }
      body={
        <RadioForm
          ref={ refs.current.radio }
          labels={ domains.split(",") }
          onChange={ handleChange }
        />
      }
      foot={
        <ButtonSet
          submit="Select Domain"
          cancel="Close"
          valid={ true }
          dismiss="modal"
          onSubmit={ handleSubmit }
        />
      }
    />
  )
})

export default DomainSelectModal
