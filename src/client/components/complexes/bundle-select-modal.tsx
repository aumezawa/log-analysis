import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import { Search } from "react-bootstrap-icons"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import Cookies from "js-cookie"

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
  action?   : string,   // NOTE: "open" | "delete" | "download"
  reload?   : number,
  onSubmit? : (bundleId: string, bundleName: string, bundleType: string) => void,
  onUpdate? : (bundleName: string) => void
}

const BundleSelectModal = React.memo<BundleSelectModalProps>(({
  id        = "",
  domain    = "",
  project   = "",
  bundle    = "",
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
    bundleId    : "",
    bundleName  : "",
    bundleType  : "",
    bundles     : []
  })

  const status = useRef({
    processing  : false
  })

  useEffect(() => {
    reloadBundle()
    data.current.filter = refs.current.text.current!.value = ""
    data.current.bundleId = ""
    data.current.bundleName = ""
    refs.current.list.current.clear()
  }, [domain, project, reload])

  useEffect(() => {
    if (domain && project && bundle) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        if (onUpdate) {
          onUpdate(res.data.name)
        }
        return
      })
      .catch((err: Error | AxiosError) => {
        if (onSubmit) {
          onSubmit("", "", "")
        }
        if (Axios.isAxiosError(err)) {
          // nop
        } else {
          console.log(err)
        }
        return
      })
    }
  }, [domain, project, bundle, onSubmit, onUpdate])

  const reloadBundle = useCallback(() => {
    if (domain && project) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project) }/bundles`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.bundles = res.data.bundles
        forceUpdate()
        return
      })
      .catch((err: Error | AxiosError) => {
        data.current.bundles = []
        forceUpdate()
        if (Axios.isAxiosError(err)) {
          alert(err.response!.data.msg)
        } else {
          console.log(err)
        }
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
    data.current.bundleId = (data.current.bundles.find((bundle: BundleInfo) => (bundle.name === value.split(" ")[0])) as BundleInfo).id.toString()
    data.current.bundleName = value.split(" ")[0]
    data.current.bundleType = (data.current.bundles.find((bundle: BundleInfo) => (bundle.name === value.split(" ")[0])) as BundleInfo).type
    forceUpdate()
  }, [true])

  const handleSubmit = useCallback(() => {
    if (action === "open") {
      if (onSubmit) {
        onSubmit(data.current.bundleId, data.current.bundleName, data.current.bundleType)
      }
      return
    }

    let uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, data.current.bundleId) }`
    status.current.processing = true
    forceUpdate()

    if (action === "delete") {
      Axios.delete(uri, {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        if (onSubmit) {
          onSubmit(data.current.bundleId, data.current.bundleName, data.current.bundleType)
        }
        data.current.bundleId = ""
        data.current.bundleName = ""
        status.current.processing = false
        reloadBundle()
        return
      })
      .catch((err: Error | AxiosError) => {
        if (Axios.isAxiosError(err)) {
          alert(err.response!.data.msg)
        } else {
          console.log(err)
        }
        status.current.processing = false
        forceUpdate()
        return
      })
    }

    if (action === "download") {
      Axios.get(uri + "?mode=download", {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {},
        responseType: "blob"
      })
      .then((res: AxiosResponse) => {
        const blob = new Blob([res.data], { type: res.data.type })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")

        let filename: string
        const match = res.headers["content-disposition"].match(/filename="(.*)"(;|$)/)
        if (match) {
          filename = match[1]
          const matchUTF8 = res.headers["content-disposition"].match(/filename[*]=UTF-8''(.*)(;|$)/)
          if (matchUTF8) {
            filename = decodeURIComponent(matchUTF8[1])
          }
          link.href = url
          link.setAttribute("download", filename)
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.URL.revokeObjectURL(url)
        } else {
          alert("Could not get file information...")
          console.log(res.headers["content-disposition"])
        }
        status.current.processing = false
        forceUpdate()
        return
      })
      .catch((err: Error | AxiosError) => {
        if (Axios.isAxiosError(err)) {
          alert(err.response!.data.msg)
        } else {
          console.log(err)
        }
        status.current.processing = false
        forceUpdate()
        return
      })
    }
  }, [domain, project, action, onSubmit])

  const listLabel = () => (
    data.current.bundles.filter((bundle: BundleInfo) => (
      (action === "open" && bundle.available)
      || (action === "delete" && bundle.available)
      || (action === "download" && bundle.available && bundle.preserved)
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
            label={ <Search /> }
            valid={ true }
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
          valid={ data.current.bundleId ? !status.current.processing : false }
          dismiss="modal"
          keep={ action !== "open" }
          onSubmit={ handleSubmit }
        />
      }
    />
  )
})

export default BundleSelectModal
