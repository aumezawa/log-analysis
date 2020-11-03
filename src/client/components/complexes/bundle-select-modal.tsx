import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../lib/environment"
import ProjectPath from "../../lib/project-path"

import ModalFrame from "../frames/modal-frame"
import TextForm from "../parts/text-form"
import ListForm from "../parts/list-form"
import ButtonSet from "../sets/button-set"

type BundleSelectModalProps = {
  id        : string,
  domain?   : string,
  project?  : string,
  bundle?   : string,
  action?   : string,   // NOTE: "open" | "delete"
  reload?   : number,
  onSubmit? : (bundleId: string, bundleName: string) => void,
  onUpdate? : (bundleName: string) => void
}

const BundleSelectModal = React.memo<BundleSelectModalProps>(({
  id        = null,
  domain    = null,
  project   = null,
  bundle    = null,
  action    = "open",
  reload    = 0,
  onSubmit  = undefined,
  onUpdate  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const refs = useRef({
    text  : React.createRef<HTMLInputElement>(),
    list  : useRef({} as ListFormReference)
  })

  const data = useRef({
    filter      : "",
    bundleId    : null,
    bundleName  : null,
    bundles     : []
  })

  const status = useRef({
    processing  : false
  })

  useEffect(() => {
    data.current.filter = refs.current.text.current.value = ""
    data.current.bundleId = null
    data.current.bundleName = null
    refs.current.list.current.clear()
    reloadBundle()
  }, [domain, project, reload])

  useEffect(() => {
    if (domain && project && bundle) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        onUpdate(res.data.name)
        return
      })
      .catch((err: AxiosError) => {
        onSubmit(null, null)
        return
      })
    }
  }, [domain, project, bundle, onSubmit, onUpdate])

  const reloadBundle = useCallback(() => {
    if (domain && project) {
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
        forceUpdate()
        alert(err.response.data.msg)
        return
      })
    } else {
      data.current.bundles = []
      forceUpdate()
    }
  }, [domain, project])

  const handleChangeFilter = useCallback((value: string) => {
    if (value.length !== 1) {
      data.current.filter = value
      forceUpdate()
    }
  }, [true])

  const handleSelectBundle = useCallback((value: string) => {
    data.current.bundleId = data.current.bundles.find((bundle: BundleInfo) => (bundle.name === value.split(" ")[0])).id.toString()
    data.current.bundleName = value.split(" ")[0]
    forceUpdate()
  }, [true])

  const handleSubmit = useCallback(() => {
    if (action === "open") {
      if (onSubmit) {
        onSubmit(data.current.bundleId, data.current.bundleName)
      }
      return
    }

    const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, data.current.bundleId) }`
    status.current.processing = true
    forceUpdate()

    if (action === "delete") {
      Axios.delete(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        if (onSubmit) {
          onSubmit(data.current.bundleId, data.current.bundleName)
        }
        data.current.bundleId = null
        data.current.bundleName = null
        status.current.processing = false
        reloadBundle()
        return
      })
      .catch((err: AxiosError) => {
        status.current.processing = false
        forceUpdate()
        alert(err.response.data.msg)
        return
      })
    }
  }, [domain, project, onSubmit])

  const listLabel = () => (
    data.current.bundles.filter((bundle: BundleInfo) => (
      (action === "open" && bundle.available)
      || (action === "delete" && bundle.available)
    )).filter((bundle: BundleInfo) => (
      (bundle.name.includes(data.current.filter) || bundle.description.includes(data.current.filter))
    )).map((bundle: BundleInfo) => (
      bundle.name + ((!!bundle.description) ? ` [ ${ bundle.description } ]` : "")
    ))
  )

  return (
    <ModalFrame
      id={ id }
      title="Log Bundle"
      message={ `Select to ${ action } a log bundle.` }
      size="modal-lg"
      center={ false }
      body={
        <>
          <TextForm
            ref={ refs.current.text }
            className="mb-3"
            valid={ true }
            label="Filter"
            onChange={ handleChangeFilter }
          />
          <ListForm
            ref={ refs.current.list }
            labels={ listLabel() }
            onChange={ handleSelectBundle }
          />
        </>
      }
      foot={
        <ButtonSet
          submit={ `${ action.charAt(0).toUpperCase() + action.slice(1) } Bundle` }
          cancel="Close"
          valid={ data.current.bundleId && !status.current.processing }
          dismiss="modal"
          keep={ action !== "open" }
          onSubmit={ handleSubmit }
        />
      }
    />
  )
})

export default BundleSelectModal
