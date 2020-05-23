import * as React from "react"
import { useState, useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../lib/environment"
import ProjectPath from "../../lib/project-path"
import UniqueId from "../../lib/unique-id"

import ModalFrame from "../frames/modal-frame"
import ListForm from "../parts/list-form"
import ButtonSet from "../sets/button-set"

type ProjectSelectButtonProps = {
  className?    : string,
  domain?       : string,
  project?      : string,
  defaultValue? : string,
  onSubmit?     : (value: string) => void
}

const ProjectSelectButton = React.memo<ProjectSelectButtonProps>(({
  className     = "",
  domain        = null,
  project       = null,
  defaultValue  = null,
  onSubmit      = undefined
}) => {
  const [bundle, setBundle] = useState<string>(null)
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const id = useRef({
    modal: "modal-" + UniqueId()
  })

  const data = useRef({
    bundleId  : null,
    bundleName: null,
    bundles   : []
  })

  useEffect(() => {
    if (domain && project && defaultValue) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, defaultValue) }`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.bundleId = defaultValue
        data.current.bundleName = res.data.name
        setBundle(res.data.name)
        return
      })
      .catch((err: AxiosError) => {
        data.current.bundleId = null
        data.current.bundleName = null
        setBundle(null)
        return
      })
    } else {
      data.current.bundleId = null
      data.current.bundleName = null
      setBundle(null)
    }
  }, [domain, project, defaultValue])

  const handleClick = useCallback(() => {
    const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project) }/bundles`
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
      data.current.bundles = []
      forceUpdate()
      alert(err.response.data.msg)
      return
    })
  }, [domain, project])

  const handleChange = useCallback((value: string) => {
    data.current.bundleId = data.current.bundles.find((bundle: any) => (bundle.name === value)).id.toString()
    data.current.bundleName = value
    forceUpdate()
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
            labels={ data.current.bundles.filter((bundle: any) => (bundle.available)).map((bundle: any) => (bundle.name)) }
            titles={ data.current.bundles.filter((bundle: any) => (bundle.available)).map((bundle: any) => (bundle.description)) }
            onChange={ handleChange }
          />
        }
        foot={
          <ButtonSet
            cancel="Close"
            valid={ !!data.current.bundleId }
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
