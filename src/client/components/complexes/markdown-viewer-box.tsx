import * as React from "react"
import { useEffect, useRef, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../lib/environment"

import MarkdownViewer from "../parts/markdown-viewer"

type MarkdownViewerBoxProps = {
  className?: string
}

const MarkdownViewerBox = React.memo<MarkdownViewerBoxProps>(({
  className = ""
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const data = useRef({
    content: ""
  })

  useEffect(() => {
    const uri = `${ Environment.getBaseUrl() }/api/v1/whatsnew`
    Axios.get(uri, {
      headers : { "X-Access-Token": Cookie.get("token") || "" },
      data    : {}
    })
    .then((res: AxiosResponse) => {
      data.current.content = res.data
      forceUpdate()
      return
    })
    .catch((err: AxiosError) => {
      alert(err.response.data.msg)
      return
    })
  }, [true])

  return (
    <MarkdownViewer
      className={ className }
      content={ data.current.content }
    />
  )
})

export default MarkdownViewerBox
