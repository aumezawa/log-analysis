import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import Cookies from "js-cookie"

import Environment from "../../lib/environment"

import ModalFrame from "../frames/modal-frame"
import MarkdownViewer from "../parts/markdown-viewer"
import ButtonSet from "../sets/button-set"

type WhatsNewModalProps = {
  id  : string
}

const WhatsNewModal = React.memo<WhatsNewModalProps>(({
  id  = ""
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const data = useRef({
    content: ""
  })

  useEffect(() => {
    const uri = `${ Environment.getBaseUrl() }/api/v1/whatsnew`
    Axios.get(uri, {
      headers : { "X-Access-Token": Cookies.get("token") || "" },
      data    : {}
    })
    .then((res: AxiosResponse) => {
      data.current.content = res.data
      forceUpdate()
      return
    })
    .catch((err: Error | AxiosError) => {
      if (Axios.isAxiosError(err)) {
        alert(err.response!.data.msg)
      } else {
        console.log(err)
      }
      return
    })
  }, [true])

  const handleSubmit = useCallback(() => {
    Cookies.remove("whatsnew")
  }, [true])

  const handleCancel = useCallback(() => {
    Cookies.set("whatsnew", "false")
  }, [true])

  return (
    <ModalFrame
      id={ id }
      title="What's New!"
      message="New functions and bug fixes are here."
      size="modal-xl"
      body={
        <MarkdownViewer
          className="px-2"
          content={ data.current.content }
        />
      }
      foot={
        <ButtonSet
          submit="Close (Show again)"
          cancel="Close (Don't show again)"
          valid={ true }
          dismiss="modal"
          onSubmit={ handleSubmit }
          onCancel={ handleCancel }
        />
      }
    />
  )
})

export default WhatsNewModal
