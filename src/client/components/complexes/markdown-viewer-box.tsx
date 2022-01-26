import * as React from "react"
import { useEffect, useRef, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import Cookies from "js-cookie"

import Environment from "../../lib/environment"

import MarkdownViewer from "../parts/markdown-viewer"

type MarkdownViewerBoxProps = {
  className?: string,
  path      : string
}

const MarkdownViewerBox = React.memo<MarkdownViewerBoxProps>(({
  className = "p-2",
  path      = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const data = useRef({
    content: ""
  })

  useEffect(() => {
    const uri = `${ Environment.getBaseUrl() }/api/v1/${ path }`
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
        alert(err.response.data.msg)
      } else {
        console.log(err)
      }
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
