import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../lib/environment"
import ProjectPath from "../../lib/project-path"
import UniqueId from "../../lib/unique-id"

import ModalFrame from "../frames/modal-frame"
import TextForm from "../parts/text-form"
import ListForm from "../parts/list-form"
import ButtonSet from "../sets/button-set"

type BundleSelectButtonProps = {
  className?: string,
  domain?   : string,
  project?  : string,
  bundle?   : string,
  onSubmit? : (value: string) => void
}

const BundleSelectButton = React.memo<BundleSelectButtonProps>(({
  className = "",
  domain    = null,
  project   = null,
  bundle    = null,
  onSubmit  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const id = useRef({
    modal: "modal-" + UniqueId()
  })

  const data = useRef({
    filter    : "",
    bundleId  : null,
    bundleName: null,
    bundles   : []
  })

  useEffect(() => {
    if (domain && project && bundle) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.bundleId = bundle
        data.current.bundleName = res.data.name
        forceUpdate()
        return
      })
      .catch((err: AxiosError) => {
        data.current.bundleId = null
        data.current.bundleName = null
        forceUpdate()
        return
      })
    } else {
      data.current.bundleId = null
      data.current.bundleName = null
      forceUpdate()
    }
  }, [domain, project, bundle])

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

  const handleChangeFilter = useCallback((value: string) => {
    data.current.filter = value
    forceUpdate()
  }, [true])

  const handleSelectBundle = useCallback((value: string) => {
    data.current.bundleId = data.current.bundles.find((bundle: BundleInfo) => (bundle.name === value)).id.toString()
    forceUpdate()
  }, [true])

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(data.current.bundleId)
    }
    data.current.bundleName = data.current.bundles.find((bundle: BundleInfo) => (bundle.id.toString() === data.current.bundleId)).name
    forceUpdate()
  }, [onSubmit])

  const listLabel = () => (
    data.current.bundles.filter((bundle: BundleInfo) => (
      bundle.available && (bundle.name.includes(data.current.filter) || bundle.description.includes(data.current.filter))
    )).map((bundle: BundleInfo) => (
      bundle.name
    ))
  )

  const listTitle = () => (
    data.current.bundles.filter((bundle: BundleInfo) => (
      bundle.available && (bundle.name.includes(data.current.filter) || bundle.description.includes(data.current.filter))
    )).map((bundle: BundleInfo) => (
      bundle.description
    ))
  )

  return (
    <>
      <ModalFrame
        id={ id.current.modal }
        title="Log Bundle"
        message="Select a log bundle."
        center={ false }
        body={
          <>
            <TextForm
              className="mb-3"
              valid={ true }
              label="Filter"
              onChange={ handleChangeFilter }
            />
            <ListForm
              labels={ listLabel() }
              titles={ listTitle() }
              onChange={ handleSelectBundle }
            />
          </>
        }
        foot={
          <ButtonSet
            submit="Select"
            cancel="Close"
            valid={ !!data.current.bundleId }
            dismiss="modal"
            onSubmit={ handleSubmit }
          />
        }
      />
      <button
        className={ `btn ${ className } ${ data.current.bundleName ? "btn-success" : "btn-secondary" }` }
        type="button"
        disabled={ !["public", "private"].includes(domain) || !project }
        data-toggle="modal"
        data-target={ "#" + id.current.modal }
        onClick={ handleClick }
      >
        { data.current.bundleName || "Select Bundle" }
      </button>
    </>
  )
})

export default BundleSelectButton
