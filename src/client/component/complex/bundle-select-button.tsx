import * as React from "react"
import { useState, useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import uniqueId from "../../lib/uniqueId"

import ModalFrame from "../frame/modal-frame"

import ButtonSet from "../set/button-set"

import ListForm from "../part/list-form"

type ProjectSelectButtonProps = {
  className?: string,
  domain?   : string,
  project?  : string,
  onSubmit? : (value: string) => void
}

const ProjectSelectButton = React.memo<ProjectSelectButtonProps>(({
  className = "",
  domain    = null,
  project   = null,
  onSubmit  = undefined
}) => {
  const [bundle, setBundle] = useState<string>(null)
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const id = useRef({
    modal: "modal-" + uniqueId()
  })

  const data = useRef({
    bundleId  : null,
    bundleName: null,
    bundles   : []
  })

  useEffect(() => {
    data.current.bundleId = null
    data.current.bundleName = null
    setBundle(null)
  }, [domain, project])

  const handleClick = useCallback(() => {
    const uri = `${ location.protocol }//${ location.host }/api/v1/log/${ domain }/projects/${ project }/bundles`
    Axios.get(uri, {
      headers : { "X-Access-Token": Cookie.get("token") || "" },
      data    : {}
    })
    .then((res: AxiosResponse) => {
      data.current.bundles = res.data.bundles
      forceUpdate()
      return
    })
    .catch((err: AxiosError) => {
      return
    })
  }, [domain, project])

  const handleChange = useCallback((value: string) => {
    data.current.bundleId = data.current.bundles.find((bundle: any) => (bundle.name === value)).id.toString()
    data.current.bundleName = value
  }, [true])

  const handleSubmit = useCallback(() => {
    if (onSubmit && data.current.bundleId) {
      onSubmit(data.current.bundleId)
    }
    setBundle(data.current.bundleName)
  }, [onSubmit])

  return (
    <>
      <ModalFrame
        id={ id.current.modal }
        title="Log Bundle"
        message="Select a log bundle."
        body={
          <ListForm
            labels={ data.current.bundles.map((bundle: any) => (bundle.name)) }
            onChange={ handleChange }
          />
        }
        foot={
          <ButtonSet
            cancel="Close"
            dismiss="modal"
            onSubmit={ handleSubmit }
          />
        }
      />
      <button
        className={ `btn ${ (bundle && "btn-success") || "btn-secondary" }` }
        type="button"
        disabled={ !["public", "private"].includes(domain) || !project }
        data-toggle="modal"
        data-target={ "#" + id.current.modal }
        onClick={ handleClick }
      >
        { bundle || "Select Bundle" }
      </button>
    </>
  )
})

export default ProjectSelectButton
