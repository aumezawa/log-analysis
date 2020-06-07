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

type BundleDeleteModalProps = {
  id        : string,
  className?: string,
  domain?   : string,
  project?  : string,
  onSubmit? : (value: string) => void
}

const BundleDeleteModal = React.memo<BundleDeleteModalProps>(({
  id        = null,
  className = "",
  domain    = null,
  project   = null,
  onSubmit  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const data = useRef({
    doing     : false,
    filter    : "",
    bundleId  : null,
    bundleName: null,
    bundles   : []
  })

  useEffect(() => {
    reloadProject()
  }, [domain, project])

  const reloadProject = () => {
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
        data.current.bundles = []
        forceUpdate()
        alert(err.response.data.msg)
        return
      })
    }
  }

  const handleChangeFilter = useCallback((value: string) => {
    data.current.filter = value
    forceUpdate()
  }, [true])

  const handleSelectBundle = useCallback((value: string) => {
    data.current.bundleId = data.current.bundles.find((bundle: BundleInfo) => (bundle.name === value)).id.toString()
    data.current.bundleName = value
    forceUpdate()
  }, [true])

  const handleSubmit = useCallback(() => {
    data.current.doing = true
    forceUpdate()
    const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, data.current.bundleId) }`
    Axios.delete(uri, {
      headers : { "X-Access-Token": Cookie.get("token") || "" },
      data    : {}
    })
    .then((res: AxiosResponse) => {
      if (onSubmit) {
        onSubmit(data.current.bundleId)
      }
      data.current.bundleId = null
      data.current.bundleName = null
      data.current.doing = false
      reloadProject()
      return
    })
    .catch((err: AxiosError) => {
      data.current.doing = false
      forceUpdate()
      alert(err.response.data.msg)
      return
    })
  }, [domain, project, onSubmit])

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
    <ModalFrame
      id={ id }
      title="Log Bundle"
      message="Select to delete a log bundle."
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
          submit="Delete"
          cancel="Close"
          valid={ !!data.current.bundleId && !data.current.doing }
          dismiss="modal"
          keep={ true }
          onSubmit={ handleSubmit }
        />
      }
    />
  )
})

export default BundleDeleteModal
