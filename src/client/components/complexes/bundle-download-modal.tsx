import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../lib/environment"
import ProjectPath from "../../lib/project-path"

import ModalFrame from "../frames/modal-frame"
import Message from "../parts/message"
import ButtonSet from "../sets/button-set"

type BundleDownloadBoxProps = {
  id        : string,
  domain?   : string
  project?  : string,
  bundle?   : string
}

const message_true  = `You can download the original log bundle.`
const message_false = `The original log bundle is not existed...`

const BundleDownloadBox = React.memo<BundleDownloadBoxProps>(({
  id        = null,
  domain    = null,
  project   = null,
  bundle    = null
}) => {
  const [ignored, forceUpdate]  = useReducer(x => x + 1, 0)

  const status = useRef({
    preserved : false,
    done      : true
  })

  useEffect(() => {
    if (domain && project && bundle) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        status.current.preserved = res.data.preserved
        status.current.done = true
        forceUpdate()
        return
      })
      .catch((err: Error | AxiosError) => {
        if (Axios.isAxiosError(err)) {
          // nop
        } else {
          console.log(err)
        }
        status.current.preserved = false
        status.current.done = true
        forceUpdate()
        return
      })
    } else {
      status.current.preserved = false
      status.current.done = true
      forceUpdate()
    }
  }, [domain, project, bundle])

  const handleSubmitDownload = useCallback(() => {
    const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }?mode=download`

    status.current.done = false
    forceUpdate()
    Axios.get(uri, {
      headers : { "X-Access-Token": Cookie.get("token") || "" },
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
      status.current.done = true
      forceUpdate()
      return
    })
    .catch((err: Error | AxiosError) => {
      if (Axios.isAxiosError(err)) {
        alert(err.response.data.msg)
      } else {
        console.log(err)
      }
      status.current.done = true
      forceUpdate()
      return
    })
  }, [domain, project, bundle])

  return (
    <ModalFrame
      id={ id }
      title="Log Bundle"
      message="Download the original log bundle."
      body={
        <>
          <Message
            className="mb-3"
            message={ status.current.preserved ? message_true : message_false }
            success={ status.current.preserved }
            failure={ !status.current.preserved }
          />
          <ButtonSet
            submit="Download"
            valid={ status.current.preserved && status.current.done }
            dismiss="modal"
            onSubmit={ handleSubmitDownload }
          />
        </>
      }
    />
  )
})

export default BundleDownloadBox
