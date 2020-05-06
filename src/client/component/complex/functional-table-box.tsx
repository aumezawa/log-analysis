import * as React from "react"
import { useEffect, useRef, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import FunctionalTable from "../set/functional-table"

type FunctionalTableBoxProps = {
  className?: string,
  path?     : string
}

const FunctionalTableBox = React.memo<FunctionalTableBoxProps>(({
  className = "",
  path      = null
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const data = useRef({
    content: null
  })

  useEffect(() => {
    if (path) {
      const uri = `${ location.protocol }//${ location.host }/api/v1${ path }?mode=json`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.content = res.data.content
        forceUpdate()
        return
      })
      .catch((err: AxiosError) => {
        return
      })
    } else {
      data.current.content = null
      forceUpdate()
    }
  }, [path])

  return (
    <>
      <FunctionalTable
        className={ className }
        content={ data.current.content }
      />
    </>
  )
})

export default FunctionalTableBox
