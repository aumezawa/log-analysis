import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../../lib/environment"
import ProjectPath from "../../../lib/project-path"

import ModalFrame from "../../frames/modal-frame"
import MultiSelectFrom from "../../parts/multi-select-form"
import ButtonSet from "../../sets/button-set"

type MultiSelectModalProps = {
  id        : string,
  domain?   : string,
  project?  : string,
  mode?     : string,  // "hosts" | "vms"
  reload?   : number,
  onSubmit? : (value: string) => void
}

const MultiSelectModal = React.memo<MultiSelectModalProps>(({
  id        = null,
  domain    = null,
  project   = null,
  mode      = "hosts",
  reload    = 0,
  onSubmit  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const refs = useRef({
    select      : useRef({} as MultiSelectFormReference)
  })

  const data = useRef({
    list        : [],
    select      : []
  })

  useEffect(() => {
    reloadHost()
    data.current.select = []
    refs.current.select.current.clear()
  }, [domain, project, reload])

  const reloadHost = useCallback(() => {
    if (domain && project) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project) }/${ mode }`

      data.current.list = []
      forceUpdate()
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.list = (mode === "hosts") ? res.data.hosts : res.data.vms
        forceUpdate()
        return
      })
      .catch((err: AxiosError) => {
        data.current.list = []
        forceUpdate()
        alert(err.response.data.msg)
        return
      })
    } else {
      data.current.list = []
      forceUpdate()
    }
  }, [domain, project, mode])

  const handleSelect = useCallback((values: Array<string>) => {
    data.current.select = values.map((value: string) => value.split(" ")[0])
    forceUpdate()
  }, [true])

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(data.current.select.join(","))
    }
  }, [onSubmit])

  const listLabel = () => (
    data.current.list.map((basename: VmlogBaseInfo) => `${ basename.bundleInfo.id }:${ basename.name } [ ${ basename.bundleInfo.name }, ${ basename.bundleInfo.description } ]`)
  )

  return (
    <ModalFrame
      id={ id }
      title={ `${ mode.charAt(0).toUpperCase() + mode.slice(1) }` }
      message={ `Select up to 3 ${ mode }` }
      size="modal-lg"
      center={ false }
      body={
        <MultiSelectFrom
          ref={ refs.current.select }
          labels={ listLabel() }
          limit={ 3 }
          onChange={ handleSelect }
        />
      }
      foot={
        <ButtonSet
          submit={ `Select ${ mode.charAt(0).toUpperCase() + mode.slice(1) }` }
          cancel="Close"
          valid={ data.current.select.length !== 0 }
          dismiss="modal"
          onSubmit={ handleSubmit }
        />
      }
    />
  )
})

export default MultiSelectModal
